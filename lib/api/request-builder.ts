import { ApiRequestConfig, Environment, HeaderEntry, Message, QueryParam } from './types';

/**
 * Replace {{VARIABLE_NAME}} placeholders with active environment variables.
 */
export function interpolateVariables(
  input: string,
  environment?: Environment | null
): string {
  if (!input || !environment || !environment.variables) return input;

  let output = input;
  for (const v of environment.variables) {
    if (v.enabled && v.key.trim()) {
      const pattern = new RegExp(`{{\\s*${escapeRegex(v.key.trim())}\\s*}}`, 'g');
      output = output.replace(pattern, v.value);
    }
  }
  return output;
}

function escapeRegex(string: string): string {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Mask sensitive values in headers or previews (e.g., "Bearer sk-1234567890abcdef" -> "Bearer sk-******cdef")
 */
export function maskSensitiveValue(value: string): string {
  if (!value) return '';
  if (value.length <= 8) return '********';

  // If starts with Bearer
  if (value.startsWith('Bearer ')) {
    const token = value.slice(7);
    if (token.length <= 8) return 'Bearer ********';
    const prefix = token.slice(0, 3);
    const suffix = token.slice(-4);
    return `Bearer ${prefix}${'*'.repeat(Math.max(4, token.length - 7))}${suffix}`;
  }

  const prefix = value.slice(0, 3);
  const suffix = value.slice(-4);
  return `${prefix}${'*'.repeat(Math.max(4, value.length - 7))}${suffix}`;
}

/**
 * Construct payload from structured builder based on preset or generic conventions
 */
export function buildStructuredBody(config: ApiRequestConfig, interpolatedModelId: string): Record<string, any> {
  const { presetId, messages, parameters, customParameters, isStreaming } = config;

  // Anthropic format
  if (presetId === 'anthropic-messages') {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const systemPrompt = systemMessages.map((m) => m.content).join('\n\n');
    const nonSystemMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

    const body: Record<string, any> = {
      model: interpolatedModelId,
      messages: nonSystemMessages.length > 0 ? nonSystemMessages : [{ role: 'user', content: '' }],
      max_tokens: parameters.max_tokens ?? 1024,
      stream: isStreaming
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }
    if (parameters.temperature !== undefined) body.temperature = parameters.temperature;
    if (parameters.top_p !== undefined) body.top_p = parameters.top_p;

    // Apply custom parameters
    applyCustomParameters(body, customParameters);
    return body;
  }

  // Gemini format
  if (presetId === 'gemini-generate-content') {
    const contents = messages.map((m) => {
      const geminiRole = m.role === 'assistant' ? 'model' : 'user';
      return {
        role: geminiRole,
        parts: [{ text: m.content }]
      };
    });

    const generationConfig: Record<string, any> = {};
    if (parameters.temperature !== undefined) generationConfig.temperature = parameters.temperature;
    if (parameters.top_p !== undefined) generationConfig.topP = parameters.top_p;
    if (parameters.max_tokens !== undefined) generationConfig.maxOutputTokens = parameters.max_tokens;

    const body: Record<string, any> = {
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: '' }] }]
    };

    const systemMessages = messages.filter((m) => m.role === 'system');
    if (systemMessages.length > 0) {
      body.systemInstruction = {
        parts: [{ text: systemMessages.map((m) => m.content).join('\n\n') }]
      };
    }

    if (Object.keys(generationConfig).length > 0) {
      body.generationConfig = generationConfig;
    }

    applyCustomParameters(body, customParameters);
    return body;
  }

  // OpenAI standard chat format (OpenAI, Groq, DeepSeek, Together, OpenRouter, Mistral, Ollama)
  const formattedMessages = messages.map((m) => {
    let role = m.role as string;
    if (role === 'custom' && m.customRole) role = m.customRole;
    return {
      role,
      content: m.content
    };
  });

  const body: Record<string, any> = {
    model: interpolatedModelId,
    messages: formattedMessages
  };

  if (parameters.temperature !== undefined) body.temperature = parameters.temperature;
  if (parameters.top_p !== undefined) body.top_p = parameters.top_p;
  if (parameters.max_tokens !== undefined) body.max_tokens = parameters.max_tokens;
  if (parameters.max_completion_tokens !== undefined) body.max_completion_tokens = parameters.max_completion_tokens;
  if (parameters.frequency_penalty !== undefined) body.frequency_penalty = parameters.frequency_penalty;
  if (parameters.presence_penalty !== undefined) body.presence_penalty = parameters.presence_penalty;
  if (parameters.stop) {
    try {
      body.stop = parameters.stop.includes(',')
        ? parameters.stop.split(',').map((s: string) => s.trim())
        : parameters.stop;
    } catch {
      body.stop = parameters.stop;
    }
  }

  body.stream = isStreaming;

  applyCustomParameters(body, customParameters);
  return body;
}

function applyCustomParameters(target: Record<string, any>, customParameters: ApiRequestConfig['customParameters']) {
  if (!customParameters || !Array.isArray(customParameters)) return;

  for (const param of customParameters) {
    if (!param.enabled || !param.key.trim()) continue;
    const key = param.key.trim();
    let val: any = param.value;

    if (param.type === 'number') {
      const num = Number(val);
      val = isNaN(num) ? val : num;
    } else if (param.type === 'boolean') {
      val = val === 'true' || val === true;
    } else if (param.type === 'json') {
      try {
        val = JSON.parse(val);
      } catch {
        // Keep string if invalid JSON
      }
    }
    target[key] = val;
  }
}

export interface PreparedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  maskedHeaders: Record<string, string>;
  body: string | null;
  maskedBody: string | null;
  isStreaming: boolean;
  timeoutSeconds: number;
}

/**
 * Prepares the complete HTTP request object with variable interpolation, auth injection, and header formatting.
 */
export function prepareRequest(
  config: ApiRequestConfig,
  environment?: Environment | null
): PreparedRequest {
  // Interpolate endpoint and model
  let rawUrl = interpolateVariables(config.endpoint, environment);
  const interpolatedModelId = interpolateVariables(config.modelId, environment);

  // Replace {{MODEL_ID}} in URL if present (like Gemini endpoint)
  rawUrl = rawUrl.replace(/{{\s*MODEL_ID\s*}}/gi, interpolatedModelId);

  // Parse URL & append query parameters
  const queryParams: Record<string, string> = {};
  for (const q of config.queryParams) {
    if (q.enabled && q.key.trim()) {
      queryParams[interpolateVariables(q.key.trim(), environment)] = interpolateVariables(q.value, environment);
    }
  }

  // Handle Query Param Auth
  let apiKeyInterpolated = interpolateVariables(config.apiKey, environment);
  if (config.authType === 'query-param' && config.customAuthQueryKey && apiKeyInterpolated) {
    queryParams[config.customAuthQueryKey] = apiKeyInterpolated;
  }

  // Assemble URL with query params
  let finalUrl = rawUrl;
  const paramEntries = Object.entries(queryParams);
  if (paramEntries.length > 0) {
    try {
      const urlObj = new URL(rawUrl);
      for (const [k, v] of paramEntries) {
        urlObj.searchParams.set(k, v);
      }
      finalUrl = urlObj.toString();
    } catch {
      // Fallback for relative or template strings
      const qs = new URLSearchParams(queryParams).toString();
      finalUrl = rawUrl.includes('?') ? `${rawUrl}&${qs}` : `${rawUrl}?${qs}`;
    }
  }

  // Headers
  const headers: Record<string, string> = {};
  const maskedHeaders: Record<string, string> = {};

  for (const h of config.headers) {
    if (h.enabled && h.key.trim()) {
      const k = interpolateVariables(h.key.trim(), environment);
      const v = interpolateVariables(h.value, environment);
      headers[k] = v;
      maskedHeaders[k] = isSensitiveHeader(k) ? maskSensitiveValue(v) : v;
    }
  }

  // Authentication Headers
  if (apiKeyInterpolated) {
    if (config.authType === 'bearer') {
      const authVal = `Bearer ${apiKeyInterpolated}`;
      headers['Authorization'] = authVal;
      maskedHeaders['Authorization'] = `Bearer ${maskSensitiveValue(apiKeyInterpolated)}`;
    } else if (config.authType === 'x-api-key') {
      headers['x-api-key'] = apiKeyInterpolated;
      maskedHeaders['x-api-key'] = maskSensitiveValue(apiKeyInterpolated);
    } else if (config.authType === 'custom-header' && config.customAuthHeaderKey) {
      const headerKey = interpolateVariables(config.customAuthHeaderKey, environment);
      let headerVal = apiKeyInterpolated;
      if (config.customAuthHeaderValue) {
        headerVal = config.customAuthHeaderValue.replace(/{{\s*API_KEY\s*}}/gi, apiKeyInterpolated);
      }
      headers[headerKey] = headerVal;
      maskedHeaders[headerKey] = maskSensitiveValue(headerVal);
    }
  }

  // Request Body
  let body: string | null = null;
  let maskedBody: string | null = null;

  if (config.method !== 'GET' && config.method !== 'DELETE') {
    if (config.bodyMode === 'raw') {
      const rawInterpolated = interpolateVariables(config.rawBody, environment);
      body = rawInterpolated;
      maskedBody = rawInterpolated;
    } else {
      const structured = buildStructuredBody(config, interpolatedModelId);
      body = JSON.stringify(structured, null, 2);
      maskedBody = body;
    }

    if (!headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
      maskedHeaders['Content-Type'] = 'application/json';
    }
  }

  return {
    url: finalUrl,
    method: config.method,
    headers,
    maskedHeaders,
    body,
    maskedBody,
    isStreaming: config.isStreaming,
    timeoutSeconds: config.timeoutSeconds || 60
  };
}

function isSensitiveHeader(headerName: string): boolean {
  const lower = headerName.toLowerCase();
  return (
    lower.includes('auth') ||
    lower.includes('key') ||
    lower.includes('token') ||
    lower.includes('secret') ||
    lower.includes('credential')
  );
}

/**
 * Generate equivalent cURL command string with masked API keys for safe display/export.
 */
export function generateCurlCommand(prepared: PreparedRequest, maskKeys = true): string {
  let curl = `curl -X ${prepared.method} "${prepared.url}" \\\n`;

  const headersToUse = maskKeys ? prepared.maskedHeaders : prepared.headers;
  for (const [k, v] of Object.entries(headersToUse)) {
    curl += `  -H "${k}: ${v.replace(/"/g, '\\"')}" \\\n`;
  }

  if (prepared.body) {
    const sanitizedBody = maskKeys ? (prepared.maskedBody || prepared.body) : prepared.body;
    curl += `  -d '${sanitizedBody.replace(/'/g, "'\\''")}'`;
  } else {
    curl = curl.replace(/ \\\n$/, '');
  }

  return curl;
}
