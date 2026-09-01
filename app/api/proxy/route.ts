import { NextRequest, NextResponse } from 'next/server';
import { validateTargetUrl } from '@/lib/api/ssrf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const startTime = Date.now();

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

    // Ensure User-Agent if not set
    if (!outboundHeaders['User-Agent'] && !outboundHeaders['user-agent']) {
      outboundHeaders['User-Agent'] = 'API-Forge-AI/1.0.0 (https://apiforge.ai)';
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
          message: err.message || 'Unable to connect to target endpoint. Check DNS, SSL certificates, or host availability.',
          status: 502,
          durationMs: elapsedMs,
          targetUrl: sanitizedUrl
        },
        { status: 502 }
      );
    }

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;

    // Collect response headers
    const responseHeadersRecord: Record<string, string> = {};
    upstreamResponse.headers.forEach((val, key) => {
      responseHeadersRecord[key] = val;
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const isUpstreamStreaming =
      isStreaming ||
      contentType.includes('text/event-stream') ||
      contentType.includes('application/x-ndjson');

    // 5. Handle Streaming Response
    if (isUpstreamStreaming && upstreamResponse.body) {
      const clientHeaders = new Headers();
      clientHeaders.set('Content-Type', 'text/event-stream; charset=utf-8');
      clientHeaders.set('Cache-Control', 'no-cache, no-transform');
      clientHeaders.set('Connection', 'keep-alive');
      clientHeaders.set('X-Accel-Buffering', 'no');
      clientHeaders.set('X-Upstream-Status', upstreamResponse.status.toString());
      clientHeaders.set('X-Upstream-Status-Text', upstreamResponse.statusText || 'OK');
      clientHeaders.set('X-Upstream-Duration-Ms', durationMs.toString());

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: clientHeaders
      });
    }

    // 6. Handle Non-Streaming Response
    const responseText = await upstreamResponse.text();
    const sizeBytes = new Blob([responseText]).size;

    return NextResponse.json({
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      ok: upstreamResponse.ok,
      headers: responseHeadersRecord,
      rawText: responseText,
      sizeBytes,
      durationMs,
      timestamp: Date.now()
    });
  } catch (err: any) {
    const elapsedMs = Date.now() - startTime;
    return NextResponse.json(
      {
        error: 'Internal Proxy Error',
        message: err.message || 'An unexpected error occurred within the proxy route.',
        status: 500,
        durationMs: elapsedMs
      },
      { status: 500 }
    );
  }
}
