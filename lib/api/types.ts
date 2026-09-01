export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AuthType = 'bearer' | 'x-api-key' | 'custom-header' | 'query-param' | 'none';

export type MessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'custom';

export interface Message {
  id: string;
  role: MessageRole;
  customRole?: string;
  content: string;
}

export interface HeaderEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface CustomParameter {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  enabled: boolean;
}

export type BodyMode = 'builder' | 'raw';

export interface ApiRequestConfig {
  id: string;
  name?: string;
  method: HttpMethod;
  endpoint: string;
  modelId: string;
  authType: AuthType;
  apiKey: string;
  customAuthHeaderKey?: string;
  customAuthHeaderValue?: string;
  customAuthQueryKey?: string;
  customAuthQueryValue?: string;
  headers: HeaderEntry[];
  queryParams: QueryParam[];
  bodyMode: BodyMode;
  messages: Message[];
  parameters: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    max_completion_tokens?: number;
    stream?: boolean;
    frequency_penalty?: number;
    presence_penalty?: number;
    stop?: string;
    [key: string]: any;
  };
  customParameters: CustomParameter[];
  rawBody: string;
  isStreaming: boolean;
  timeoutSeconds: number;
  presetId?: string;
}

export interface StreamEvent {
  index: number;
  timestamp: number;
  raw: string;
  parsedDelta?: string;
  fullAccumulatedText?: string;
  eventType?: string;
  dataJson?: any;
}

export interface ApiResponseData {
  requestId: string;
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
  data: any;
  rawText: string;
  sizeBytes: number;
  durationMs: number;
  ttfbMs?: number;
  streamDurationMs?: number;
  chunkCount?: number;
  estimatedTokens?: number;
  isStream: boolean;
  streamEvents?: StreamEvent[];
  error?: string;
  errorDetails?: string;
  timestamp: number;
}

export type StreamExtractorType = 'openai' | 'anthropic' | 'gemini' | 'generic';

export interface ProviderPreset {
  id: string;
  name: string;
  category: 'Major Providers' | 'OpenAI Compatible' | 'Local & Gateways' | 'Custom';
  description: string;
  defaultMethod: HttpMethod;
  endpointTemplate: string;
  defaultModel: string;
  authType: AuthType;
  customAuthHeaderKey?: string;
  defaultHeaders: { key: string; value: string; enabled: boolean }[];
  defaultBodyMode: BodyMode;
  defaultMessages: Message[];
  defaultParameters: Record<string, any>;
  isStreaming: boolean;
  streamExtractor: StreamExtractorType;
}

export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  enabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
}

export interface SavedRequest {
  id: string;
  name: string;
  collection: string;
  config: Omit<ApiRequestConfig, 'apiKey'> & { apiKey?: string; apiKeySaved?: boolean };
  createdAt: number;
  updatedAt: number;
}

export interface RequestHistoryItem {
  id: string;
  timestamp: number;
  method: HttpMethod;
  endpoint: string;
  modelId: string;
  status: number;
  durationMs: number;
  sizeBytes: number;
  isStream: boolean;
  config: Omit<ApiRequestConfig, 'apiKey'>;
  responseSummary: {
    status: number;
    statusText: string;
    durationMs: number;
    sizeBytes: number;
    error?: string;
  };
}

export type AnimationLevel = 'full' | 'reduced' | 'disabled';

export interface DeviceProfile {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  prefersReducedMotion: boolean;
  isLowPower: boolean;
  animationLevel: AnimationLevel;
}

export type UIState = 'idle' | 'requesting' | 'streaming' | 'success' | 'error';
