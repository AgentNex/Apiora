import { ApiResponseData, ApiRequestConfig, Environment, StreamEvent, StreamExtractorType } from './types';
import { prepareRequest } from './request-builder';
import { createStreamParsingState, feedStreamChunk, flushStreamBuffer, estimateTokens } from './stream-parser';

export interface ExecuteRequestOptions {
  config: ApiRequestConfig;
  environment?: Environment | null;
  signal?: AbortSignal;
  onStreamEvent?: (event: StreamEvent, fullText: string, chunkCount: number, elapsedMs: number) => void;
  onStreamProgress?: (accumulatedText: string, chunkCount: number) => void;
}

export function getHttpStatusExplanation(status: number): string {
  switch (status) {
    case 400:
      return 'Bad Request: The payload structure, parameter type, or JSON syntax was rejected by the provider.';
    case 401:
      return 'Unauthorized: Invalid or missing API key. Verify that your authentication header or Bearer token is correct.';
    case 403:
      return 'Forbidden: Your API key lacks permissions for this model or feature, or your account balance is depleted.';
    case 404:
      return 'Not Found: The endpoint URL path or model ID does not exist on this provider.';
    case 422:
      return 'Unprocessable Entity: The request body was well-formed JSON, but contains invalid parameters or unsupported fields.';
    case 429:
      return 'Rate Limit Exceeded: You have exceeded the provider requests per minute (RPM) or tokens per minute (TPM) quota.';
    case 500:
      return 'Internal Server Error: The upstream provider encountered an unexpected failure during model inference.';
    case 502:
      return 'Bad Gateway: Upstream provider or gateway proxy is unreachable or returned an invalid network response.';
    case 503:
      return 'Service Unavailable: The upstream AI model is currently overloaded, undergoing maintenance, or experiencing high traffic.';
    case 504:
      return 'Gateway Timeout: The model took too long to begin generating output, exceeding the request timeout.';
    default:
      if (status >= 200 && status < 300) return 'Success: Request completed successfully.';
      if (status >= 400 && status < 500) return 'Client Error: Check your request parameters, authentication, and endpoint.';
      if (status >= 500) return 'Server Error: Upstream AI provider returned an internal error.';
      return 'Response received from target API.';
  }
}

export async function executeApiRequest(options: ExecuteRequestOptions): Promise<ApiResponseData> {
  const { config, environment, signal, onStreamEvent, onStreamProgress } = options;
  const maxRetries = config.retryOnFailure ? 2 : 0;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff wait (500ms, 1500ms)
        const backoffMs = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
      return await executeSingleRequest(options);
    } catch (err: any) {
      lastError = err;
      if (err.name === 'AbortError' || signal?.aborted) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

async function executeSingleRequest(options: ExecuteRequestOptions): Promise<ApiResponseData> {
  const { config, environment, signal, onStreamEvent, onStreamProgress } = options;
  const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
  const startTime = Date.now();
  const isDirectMode = config.executionMode === 'direct';

  const prepared = prepareRequest(config, environment);

  try {
    let response: Response;

    if (isDirectMode) {
      // Direct client-side fetch (Local-Only Mode)
      response = await fetch(prepared.url, {
        method: prepared.method,
        headers: prepared.headers,
        body: prepared.body,
        signal
      });
    } else {
      // Proxy Mode (via SSRF-hardened serverless route)
      const proxyPayload = {
        url: prepared.url,
        method: prepared.method,
        headers: prepared.headers,
        body: prepared.body,
        isStreaming: prepared.isStreaming,
        timeoutSeconds: prepared.timeoutSeconds
      };

      response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(proxyPayload),
        signal
      });
    }

    const ttfbMs = Date.now() - startTime;
    const isStream = prepared.isStreaming && response.headers.get('content-type')?.includes('text/event-stream');

    if (isStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      const parsingState = createStreamParsingState();
      let totalBytes = 0;
      const extractor: StreamExtractorType =
        config.presetId === 'anthropic-messages'
          ? 'anthropic'
          : config.presetId === 'gemini-generate-content'
          ? 'gemini'
          : config.presetId === 'openai-chat' || config.presetId === 'deepseek-api' || config.presetId === 'groq-cloud' || config.presetId === 'openrouter-gateway' || config.presetId === 'mistral-ai' || config.presetId === 'together-ai'
          ? 'openai'
          : 'generic';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          totalBytes += value.byteLength;
          const chunkStr = decoder.decode(value, { stream: true });
          const { newEvents } = feedStreamChunk(parsingState, chunkStr, extractor);

          for (const ev of newEvents) {
            if (onStreamEvent) {
              onStreamEvent(ev, parsingState.accumulatedText, parsingState.events.length, Date.now() - startTime);
            }
          }
          if (onStreamProgress) {
            onStreamProgress(parsingState.accumulatedText, parsingState.events.length);
          }
        }
      }

      // Flush remaining
      const { newEvents: flushedEvents } = flushStreamBuffer(parsingState, extractor);
      for (const ev of flushedEvents) {
        if (onStreamEvent) {
          onStreamEvent(ev, parsingState.accumulatedText, parsingState.events.length, Date.now() - startTime);
        }
      }

      const durationMs = Date.now() - startTime;
      const responseHeadersRecord: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeadersRecord[key] = val;
      });

      const rawAccumulated = parsingState.events.map((e) => e.raw).join('\n');
      const parsedText = parsingState.accumulatedText || rawAccumulated;

      return {
        requestId,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: responseHeadersRecord,
        data: parsedText,
        rawText: rawAccumulated,
        sizeBytes: totalBytes,
        durationMs,
        ttfbMs,
        streamDurationMs: durationMs - ttfbMs,
        chunkCount: parsingState.events.length,
        estimatedTokens: estimateTokens(parsedText),
        isStream: true,
        streamEvents: parsingState.events,
        error: !response.ok ? `HTTP ${response.status}: ${getHttpStatusExplanation(response.status)}` : undefined,
        timestamp: Date.now()
      };
    }

    // Non-streaming response
    let jsonResult: any;
    const responseHeadersRecord: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      responseHeadersRecord[key] = val;
    });

    if (isDirectMode) {
      const rawText = await response.text();
      try {
        jsonResult = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeadersRecord,
          rawText,
          data: JSON.parse(rawText)
        };
      } catch {
        jsonResult = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeadersRecord,
          rawText,
          data: rawText
        };
      }
    } else {
      jsonResult = await response.json();
    }

    const durationMs = Date.now() - startTime;
    let parsedData: any = null;
    if (jsonResult.rawText) {
      try {
        parsedData = JSON.parse(jsonResult.rawText);
      } catch {
        parsedData = jsonResult.rawText;
      }
    } else {
      parsedData = jsonResult;
    }

    const status = jsonResult.status || response.status;
    const isOk = status >= 200 && status < 300;

    return {
      requestId,
      status,
      statusText: jsonResult.statusText || response.statusText,
      ok: isOk,
      headers: jsonResult.headers || responseHeadersRecord,
      data: parsedData,
      rawText: jsonResult.rawText || JSON.stringify(jsonResult, null, 2),
      sizeBytes: jsonResult.sizeBytes || new Blob([jsonResult.rawText || '']).size,
      durationMs: jsonResult.durationMs || durationMs,
      ttfbMs,
      isStream: false,
      error: !isOk ? (jsonResult.error || jsonResult.message || `HTTP ${status}: ${getHttpStatusExplanation(status)}`) : undefined,
      errorDetails: jsonResult.message || (!isOk ? getHttpStatusExplanation(status) : undefined),
      timestamp: Date.now()
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    if (err.name === 'AbortError') {
      return {
        requestId,
        status: 499,
        statusText: 'Client Closed Request',
        ok: false,
        headers: {},
        data: null,
        rawText: 'Request was cancelled by user.',
        sizeBytes: 0,
        durationMs,
        isStream: false,
        error: 'Request Aborted',
        errorDetails: 'The request was terminated by user action.',
        timestamp: Date.now()
      };
    }

    const isCors = isDirectMode && (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'));

    return {
      requestId,
      status: 0,
      statusText: 'Network Error',
      ok: false,
      headers: {},
      data: null,
      rawText: err.message || 'Failed to fetch',
      sizeBytes: 0,
      durationMs,
      isStream: false,
      error: isCors ? 'CORS Error (Local-Only Mode)' : 'Network Error',
      errorDetails: isCors
        ? 'Direct request blocked by browser CORS policy. Switch to Proxy Mode in Auth settings to route through the SSRF-hardened server gateway.'
        : err.message || 'Check your internet connection or server availability.',
      timestamp: Date.now()
    };
  }
}
