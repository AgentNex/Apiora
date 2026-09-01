import { validateTargetUrl } from '../lib/api/ssrf';
import { estimateTokens, extractTextFromChunk, feedStreamChunk, createStreamParsingState } from '../lib/api/stream-parser';
import { buildStructuredBody, generateCurlCommand, prepareRequest } from '../lib/api/request-builder';
import { ApiRequestConfig } from '../lib/api/types';

function runSuite() {
  console.log('🧪 Running Apiora Test Suite...');
  let passed = 0;
  let failed = 0;

  function it(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(msg);
  }

  // 1. SSRF Shield Tests
  it('SSRF Validator accepts legitimate external AI endpoints', () => {
    assert(validateTargetUrl('https://api.openai.com/v1/chat/completions').valid, 'OpenAI URL should be valid');
    assert(validateTargetUrl('https://api.anthropic.com/v1/messages').valid, 'Anthropic URL should be valid');
    assert(validateTargetUrl('https://api.deepseek.com/chat/completions').valid, 'DeepSeek URL should be valid');
    assert(validateTargetUrl('https://generativelanguage.googleapis.com/v1beta/models').valid, 'Gemini URL should be valid');
  });

  it('SSRF Validator blocks internal and private addresses', () => {
    assert(!validateTargetUrl('http://127.0.0.1:8000').valid, 'Localhost 127.0.0.1 must be blocked');
    assert(!validateTargetUrl('http://localhost:3000').valid, 'Localhost domain must be blocked');
    assert(!validateTargetUrl('http://192.168.0.1').valid, 'Private IP 192.168.0.1 must be blocked');
    assert(!validateTargetUrl('http://10.0.0.5').valid, 'Private IP 10.0.0.5 must be blocked');
    assert(!validateTargetUrl('http://169.254.169.254/latest/meta-data/').valid, 'AWS metadata endpoint must be blocked');
  });

  // 2. Request Builder & Body Tests
  const sampleConfig: ApiRequestConfig = {
    id: 'test_1',
    method: 'POST',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    modelId: 'gpt-4o',
    authType: 'bearer',
    apiKey: 'sk-test-secret',
    headers: [],
    queryParams: [],
    bodyMode: 'builder',
    messages: [
      { id: 'm1', role: 'system', content: 'You are a test assistant' },
      { id: 'm2', role: 'user', content: 'Hello World' }
    ],
    parameters: {
      temperature: 0.7,
      max_tokens: 1000
    },
    customParameters: [],
    rawBody: '{}',
    isStreaming: true,
    timeoutSeconds: 60,
    presetId: 'openai-chat'
  };

  it('buildStructuredBody formats OpenAI payload correctly', () => {
    const body = buildStructuredBody(sampleConfig, 'gpt-4o');
    assert(body.model === 'gpt-4o', 'Model should match');
    assert(body.messages.length === 2, 'Should contain 2 messages');
    assert(body.messages[0].role === 'system', 'Role should be system');
    assert(body.messages[1].content === 'Hello World', 'User content should match');
    assert(body.temperature === 0.7, 'Temperature should be 0.7');
    assert(body.stream === true, 'Stream flag should be true');
  });

  it('prepareRequest generates Bearer authorization header', () => {
    const prepared = prepareRequest(sampleConfig, null);
    assert(prepared.headers['Authorization'] === 'Bearer sk-test-secret', 'Bearer auth header must match');
    assert(prepared.headers['Content-Type'] === 'application/json', 'Content-Type must be application/json');
    assert(prepared.url === 'https://api.openai.com/v1/chat/completions', 'URL must match');
  });

  it('generateCurlCommand generates correct command syntax', () => {
    const prepared = prepareRequest(sampleConfig, null);
    const curl = generateCurlCommand(prepared, true);
    assert(curl.includes('curl -X POST "https://api.openai.com/v1/chat/completions"'), 'cURL command format');
    assert(curl.includes('Authorization: Bearer'), 'Header in cURL');
    assert(curl.includes('"model": "gpt-4o"'), 'Body in cURL');
  });

  // 3. SSE Stream Parser Tests
  it('extractTextFromChunk extracts delta text correctly', () => {
    const chunkJson = { choices: [{ delta: { content: 'Hello' } }] };
    const text = extractTextFromChunk(chunkJson, 'openai');
    assert(text === 'Hello', 'Should extract "Hello"');
  });

  it('feedStreamChunk extracts delta text from OpenAI SSE stream', () => {
    const state = createStreamParsingState();
    const chunk = 'data: {"choices":[{"delta":{"content":"Hi "}}]}\n\ndata: {"choices":[{"delta":{"content":"there!"}}]}\n\n';
    const { newEvents } = feedStreamChunk(state, chunk, 'openai');
    assert(newEvents.length === 2, 'Should emit 2 parsed events');
    assert(state.accumulatedText === 'Hi there!', 'Accumulated text should concatenate chunks');
  });

  it('estimateTokens approximates tokens accurately', () => {
    assert(estimateTokens('') === 0, 'Empty string is 0 tokens');
    assert(estimateTokens('Hello world') === 3, 'Short phrase token estimation');
    assert(estimateTokens('A'.repeat(400)) === 100, '400 chars ~ 100 tokens');
  });

  console.log(`\n🏁 Test Suite Summary: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

runSuite();
