import { ProviderPreset } from './types';

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'generic-rest',
    name: 'Generic REST JSON',
    category: 'Custom',
    description: 'Fully custom HTTP request. Configure all parameters, headers, and payload manually.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.example.com/v1/chat',
    defaultModel: 'custom-model',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'Accept', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Hello! Please introduce yourself.' }
    ],
    defaultParameters: {
      temperature: 0.7,
      max_tokens: 1000,
      stream: false
    },
    isStreaming: false,
    streamExtractor: 'generic'
  },
  {
    id: 'openai-chat',
    name: 'OpenAI Chat Completions',
    category: 'Major Providers',
    description: 'Standard /v1/chat/completions endpoint used by OpenAI, Groq, DeepSeek, Together, and many others.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'system', content: 'You are an expert AI assistant providing concise, high-quality answers.' },
      { id: '2', role: 'user', content: 'Write a quick summary of modern streaming API design.' }
    ],
    defaultParameters: {
      temperature: 0.7,
      top_p: 1.0,
      max_tokens: 2048,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'openai'
  },
  {
    id: 'anthropic-messages',
    name: 'Anthropic Messages',
    category: 'Major Providers',
    description: 'Claude Messages API with system prompt separation, versioning, and x-api-key authentication.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    authType: 'x-api-key',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'anthropic-version', value: '2023-06-01', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'system', content: 'You are Claude, a helpful and precise AI engineer.' },
      { id: '2', role: 'user', content: 'Explain how Server-Sent Events work with HTTP/2.' }
    ],
    defaultParameters: {
      max_tokens: 1024,
      temperature: 0.7,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'anthropic'
  },
  {
    id: 'gemini-generate-content',
    name: 'Google Gemini Generate Content',
    category: 'Major Providers',
    description: 'Google AI Gemini v1beta API with content parts and generationConfig parameter structure.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?alt=sse',
    defaultModel: 'gemini-1.5-pro',
    authType: 'custom-header',
    customAuthHeaderKey: 'x-goog-api-key',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Give me 3 core principles for robust API architecture.' }
    ],
    defaultParameters: {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 2048,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'gemini'
  },
  {
    id: 'openrouter-gateway',
    name: 'OpenRouter Gateway',
    category: 'OpenAI Compatible',
    description: 'Unified OpenRouter endpoint with access to 200+ models from Claude, OpenAI, DeepSeek, Meta, and Mistral.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'deepseek/deepseek-chat',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'HTTP-Referer', value: 'https://apiforge.ai', enabled: true },
      { key: 'X-Title', value: 'API Forge AI', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'system', content: 'You are a helpful coding assistant.' },
      { id: '2', role: 'user', content: 'Write a TypeScript function to parse Server-Sent Events.' }
    ],
    defaultParameters: {
      temperature: 0.6,
      max_tokens: 1500,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'openai'
  },
  {
    id: 'groq-cloud',
    name: 'Groq Cloud LPU',
    category: 'OpenAI Compatible',
    description: 'Ultra-fast inference on Llama 3, Mixtral, and Gemma models using Groq LPU chips.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Benchmark comparison between synchronous REST and SSE streaming.' }
    ],
    defaultParameters: {
      temperature: 0.5,
      max_tokens: 2048,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'openai'
  },
  {
    id: 'deepseek-api',
    name: 'DeepSeek API',
    category: 'OpenAI Compatible',
    description: 'DeepSeek-V3 and DeepSeek-R1 reasoning models with standard OpenAI-compatible format.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.deepseek.com/v1/chat/completions',
    defaultModel: 'deepseek-chat',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Explain how chain-of-thought distillation works.' }
    ],
    defaultParameters: {
      temperature: 0.7,
      max_tokens: 2048,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'openai'
  },
  {
    id: 'mistral-ai',
    name: 'Mistral AI',
    category: 'Major Providers',
    description: 'Mistral Large, Codestral, and Pixtral models via official Mistral API.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-large-latest',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Provide a concise overview of modern web architecture patterns.' }
    ],
    defaultParameters: {
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'openai'
  },
  {
    id: 'together-ai',
    name: 'Together AI',
    category: 'OpenAI Compatible',
    description: 'Fast open-source model inference on Llama 3, Qwen 2.5, DeepSeek, and custom fine-tunes.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.together.xyz/v1/chat/completions',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'How to build high-concurrency event loops in Node.js?' }
    ],
    defaultParameters: {
      temperature: 0.7,
      max_tokens: 1500,
      stream: true
    },
    isStreaming: true,
    streamExtractor: 'openai'
  },
  {
    id: 'cohere-chat',
    name: 'Cohere Chat v2',
    category: 'Major Providers',
    description: 'Cohere Command R+ enterprise model with citation, search grounding, and tool use support.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.cohere.com/v2/chat',
    defaultModel: 'command-r-plus-08-2024',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'builder',
    defaultMessages: [
      { id: '1', role: 'user', content: 'What are the key advantages of RAG over model fine-tuning?' }
    ],
    defaultParameters: {
      temperature: 0.3,
      max_tokens: 1500,
      stream: false
    },
    isStreaming: false,
    streamExtractor: 'generic'
  }
];
