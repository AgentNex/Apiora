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
    defaultRawBody: JSON.stringify({
      model: 'custom-model',
      messages: [{ role: 'user', content: 'Hello! Please introduce yourself.' }],
      temperature: 0.7
    }, null, 2),
    isStreaming: false,
    streamExtractor: 'generic'
  },
  {
    id: 'speechmatics-stt',
    name: 'Speechmatics Speech-to-Text (Async Job)',
    category: 'Speech & Audio',
    description: 'Speechmatics batch asynchronous transcription API with language configuration, speaker diarization, and entities extraction.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://asr.api.speechmatics.com/v2/jobs/',
    defaultModel: 'enhanced',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'Accept', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'raw',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Speechmatics STT Job Request' }
    ],
    defaultParameters: {},
    defaultRawBody: JSON.stringify({
      type: "transcription",
      transcription_config: {
        language: "en",
        operating_point: "enhanced",
        enable_entities: true,
        diarization: "speaker"
      },
      fetch_data: {
        url: "https://example.com/audio-sample.mp3"
      }
    }, null, 2),
    isStreaming: false,
    streamExtractor: 'generic'
  },
  {
    id: 'deepgram-nova2',
    name: 'Deepgram Nova-2 (Sync Audio URL)',
    category: 'Speech & Audio',
    description: 'Deepgram Nova-2 ultra-fast speech-to-text API for audio URLs with smart formatting, punctuation, and speaker diarization.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&diarize=true',
    defaultModel: 'nova-2',
    authType: 'custom-header',
    customAuthHeaderKey: 'Authorization',
    customAuthHeaderValue: 'Token {{API_KEY}}',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'Accept', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'raw',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Deepgram Audio URL Transcription' }
    ],
    defaultParameters: {},
    defaultRawBody: JSON.stringify({
      url: "https://dpgr.am/bueller.wav"
    }, null, 2),
    isStreaming: false,
    streamExtractor: 'generic'
  },
  {
    id: 'groq-whisper',
    name: 'Groq Whisper (Sync Audio Transcription)',
    category: 'Speech & Audio',
    description: 'Ultra-fast speech transcription powered by Whisper Large v3 on Groq LPUs.',
    defaultMethod: 'POST',
    endpointTemplate: 'https://api.groq.com/openai/v1/audio/transcriptions',
    defaultModel: 'whisper-large-v3',
    authType: 'bearer',
    defaultHeaders: [
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    defaultBodyMode: 'raw',
    defaultMessages: [
      { id: '1', role: 'user', content: 'Groq Whisper Audio Transcription' }
    ],
    defaultParameters: {},
    defaultRawBody: JSON.stringify({
      model: "whisper-large-v3",
      temperature: 0,
      response_format: "verbose_json",
      language: "en",
      url: "https://example.com/audio-sample.mp3"
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert AI assistant providing concise, high-quality answers." },
        { role: "user", content: "Write a quick summary of modern streaming API design." }
      ],
      temperature: 0.7,
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: "You are Claude, a helpful and precise AI engineer.",
      messages: [
        { role: "user", content: "Explain how Server-Sent Events work with HTTP/2." }
      ],
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: "Give me 3 core principles for robust API architecture." }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: "Write a TypeScript function to parse Server-Sent Events." }
      ],
      temperature: 0.6,
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: "Benchmark comparison between synchronous REST and SSE streaming." }
      ],
      temperature: 0.5,
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "user", content: "Explain how chain-of-thought distillation works." }
      ],
      temperature: 0.7,
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        { role: "user", content: "Provide a concise overview of modern web architecture patterns." }
      ],
      temperature: 0.7,
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: [
        { role: "user", content: "How to build high-concurrency event loops in Node.js?" }
      ],
      temperature: 0.7,
      stream: true
    }, null, 2),
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
    defaultRawBody: JSON.stringify({
      model: "command-r-plus-08-2024",
      messages: [
        { role: "user", content: "What are the key advantages of RAG over model fine-tuning?" }
      ],
      temperature: 0.3
    }, null, 2),
    isStreaming: false,
    streamExtractor: 'generic'
  }
];
