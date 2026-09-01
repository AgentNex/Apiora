import { StreamEvent, StreamExtractorType } from './types';

/**
 * Extracts AI completion text from a parsed JSON chunk based on provider schema.
 */
export function extractTextFromChunk(
  json: any,
  extractor: StreamExtractorType = 'generic'
): string | undefined {
  if (!json || typeof json !== 'object') return undefined;

  // 1. OpenAI, Groq, DeepSeek, Together, OpenRouter, Mistral format
  if (extractor === 'openai' || json.choices) {
    if (Array.isArray(json.choices) && json.choices.length > 0) {
      const choice = json.choices[0];
      if (choice.delta?.content) {
        return choice.delta.content;
      }
      if (choice.delta?.reasoning_content) {
        return `[Thinking: ${choice.delta.reasoning_content}]`;
      }
      if (choice.text) {
        return choice.text;
      }
      if (choice.message?.content) {
        return choice.message.content;
      }
    }
  }

  // 2. Anthropic format
  if (extractor === 'anthropic' || json.type?.startsWith('content_block') || json.type === 'message_delta') {
    if (json.type === 'content_block_delta' && json.delta?.text) {
      return json.delta.text;
    }
    if (json.delta?.text) {
      return json.delta.text;
    }
    if (json.content_block?.text) {
      return json.content_block.text;
    }
  }

  // 3. Google Gemini format
  if (extractor === 'gemini' || json.candidates) {
    if (Array.isArray(json.candidates) && json.candidates.length > 0) {
      const candidate = json.candidates[0];
      const parts = candidate.content?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        return parts.map((p: any) => p.text || '').join('');
      }
    }
  }

  // 4. Cohere format
  if (json.delta?.message?.content?.text) {
    return json.delta.message.content.text;
  }
  if (json.text) {
    return json.text;
  }

  // 5. Generic fallback searches
  if (typeof json.response === 'string') return json.response;
  if (typeof json.output === 'string') return json.output;
  if (typeof json.content === 'string') return json.content;
  if (typeof json.message === 'string') return json.message;

  return undefined;
}

export interface StreamParsingState {
  buffer: string;
  accumulatedText: string;
  events: StreamEvent[];
  eventCounter: number;
}

export function createStreamParsingState(): StreamParsingState {
  return {
    buffer: '',
    accumulatedText: '',
    events: [],
    eventCounter: 0
  };
}

/**
 * Feeds a new text chunk to the parser, returning newly extracted text and events.
 */
export function feedStreamChunk(
  state: StreamParsingState,
  chunk: string,
  extractor: StreamExtractorType = 'generic'
): {
  newDeltaText: string;
  newEvents: StreamEvent[];
} {
  state.buffer += chunk;
  const newEvents: StreamEvent[] = [];
  let newDeltaText = '';

  // Process complete lines separated by newlines
  const lines = state.buffer.split(/\r?\n/);
  // Keep the last partial line in the buffer
  state.buffer = lines.pop() || '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    state.eventCounter++;
    let dataPayload = trimmed;
    let eventType: string | undefined = undefined;

    // Detect SSE "data: ..."
    if (trimmed.startsWith('data:')) {
      dataPayload = trimmed.slice(5).trim();
      eventType = 'sse-data';
    } else if (trimmed.startsWith('event:')) {
      eventType = trimmed.slice(6).trim();
      continue;
    }

    if (dataPayload === '[DONE]') {
      const event: StreamEvent = {
        index: state.eventCounter,
        timestamp: Date.now(),
        raw: line,
        eventType: 'DONE',
        fullAccumulatedText: state.accumulatedText
      };
      state.events.push(event);
      newEvents.push(event);
      continue;
    }

    let parsedJson: any = null;
    let extractedText: string | undefined = undefined;

    try {
      parsedJson = JSON.parse(dataPayload);
      extractedText = extractTextFromChunk(parsedJson, extractor);
    } catch {
      // If not JSON, but has content, treat as raw text chunk
      if (!trimmed.startsWith('data:')) {
        extractedText = trimmed;
      }
    }

    if (extractedText) {
      newDeltaText += extractedText;
      state.accumulatedText += extractedText;
    }

    const event: StreamEvent = {
      index: state.eventCounter,
      timestamp: Date.now(),
      raw: line,
      parsedDelta: extractedText,
      fullAccumulatedText: state.accumulatedText,
      eventType: eventType || (parsedJson ? 'json' : 'text'),
      dataJson: parsedJson
    };

    state.events.push(event);
    newEvents.push(event);
  }

  return {
    newDeltaText,
    newEvents
  };
}

/**
 * Flush any remaining buffer when stream finishes
 */
export function flushStreamBuffer(
  state: StreamParsingState,
  extractor: StreamExtractorType = 'generic'
): {
  newDeltaText: string;
  newEvents: StreamEvent[];
} {
  if (!state.buffer.trim()) return { newDeltaText: '', newEvents: [] };
  const chunk = state.buffer;
  state.buffer = '';
  return feedStreamChunk(state, chunk + '\n', extractor);
}

/**
 * Estimates token count from text using standard word/subword heuristic ~4 chars per token.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}
