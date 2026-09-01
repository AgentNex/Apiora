import { NextRequest, NextResponse } from 'next/server';
import { validateTargetUrl } from '@/lib/api/ssrf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory token bucket rate limiter (Phase 2 Hardening)
const ipRateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = ipRateLimits.get(ip);

  if (!record || now > record.resetTime) {
    ipRateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInSec: 60 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetInSec = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetInSec: Math.ceil((record.resetTime - now) / 1000) };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // 0. Rate Limiting Check
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimit = checkRateLimit(clientIp);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Please wait ${rateLimit.resetInSec}s before making more requests through the proxy gateway.`,
        status: 429,
        timestamp: Date.now()
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetInSec),
          'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
          'X-RateLimit-Remaining': '0'
        }
      }
    );
  }

  try {
    const payload = await req.json();
    const {
      url,
      method = 'POST',
      headers = {},
      body = null,
      isStreaming = false,
      timeoutSeconds = 60
    } = payload;

    // 1. SSRF Validation
    const validation = validateTargetUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'SSRF Protection: Request Blocked',
          message: validation.reason,
          targetUrl: url,
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    const sanitizedUrl = validation.sanitizedUrl || url;

    // 2. Prepare Outbound Headers
    const outboundHeaders: Record<string, string> = {};
    const forbiddenHeaders = new Set([
      'host',
      'connection',
      'keep-alive',
      'transfer-encoding',
      'te',
      'upgrade',
      'expect'
    ]);

    for (const [k, v] of Object.entries(headers)) {
      if (typeof v === 'string' && !forbiddenHeaders.has(k.toLowerCase())) {
        outboundHeaders[k] = v;
      }
    }

    if (!outboundHeaders['User-Agent'] && !outboundHeaders['user-agent']) {
      outboundHeaders['User-Agent'] = 'Apiora-AI-Lab/1.0.0 (https://apiforge.ai)';
    }

    // 3. Setup Timeout Controller
    const controller = new AbortController();
    const timeoutMs = Math.min(Math.max(Number(timeoutSeconds) || 60, 1), 300) * 1000;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // 4. Execute Outbound Fetch
    let upstreamResponse: Response;
    try {
      const fetchOptions: RequestInit = {
        method: method.toUpperCase(),
        headers: outboundHeaders,
        signal: controller.signal
      };

      if (method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD' && body !== null) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      upstreamResponse = await fetch(sanitizedUrl, fetchOptions);
    } catch (err: any) {
      clearTimeout(timeoutId);
      const elapsedMs = Date.now() - startTime;

      if (err.name === 'AbortError') {
        return NextResponse.json(
          {
            error: 'Gateway Timeout',
            message: `The target API failed to respond within the ${timeoutSeconds}s timeout period.`,
            status: 504,
            durationMs: elapsedMs,
            targetUrl: sanitizedUrl
          },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          error: 'Bad Gateway / Network Failure',
          message: err.message || 'Failed to connect to upstream server',
          status: 502,
          durationMs: elapsedMs,
          targetUrl: sanitizedUrl
        },
        { status: 502 }
      );
    }

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;
    const contentType = upstreamResponse.headers.get('content-type') || '';

    // 5. Handle Streaming Responses (SSE / text/event-stream / NDJSON)
    if (isStreaming && (contentType.includes('text/event-stream') || contentType.includes('application/x-ndjson'))) {
      const responseStream = new ReadableStream({
        async start(controllerStream) {
          if (!upstreamResponse.body) {
            controllerStream.close();
            return;
          }
          const reader = upstreamResponse.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) controllerStream.enqueue(value);
            }
          } catch (streamErr) {
            controllerStream.error(streamErr);
          } finally {
            controllerStream.close();
          }
        }
      });

      return new Response(responseStream, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'X-Apiora-Proxy': 'true',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 6. Handle Standard Non-Streaming Responses
    const rawText = await upstreamResponse.text();
    const responseHeaders: Record<string, string> = {};
    upstreamResponse.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }

    return NextResponse.json(
      {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
        data,
        rawText,
        sizeBytes: new Blob([rawText]).size,
        durationMs,
        targetUrl: sanitizedUrl,
        timestamp: Date.now()
      },
      {
        status: upstreamResponse.status >= 200 && upstreamResponse.status < 300 ? 200 : upstreamResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-Apiora-Proxy': 'true'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Proxy Internal Server Error',
        message: err.message || 'An unhandled exception occurred in the proxy route handler',
        status: 500,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}
