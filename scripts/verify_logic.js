// Verification suite for API Forge AI Core Logic

// 1. SSRF Test
const BLOCKED_HOSTNAMES = new Set([
  'localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', 'metadata.google.internal', '169.254.169.254'
]);

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;
  const [a, b] = parts;
  if (a === 127 || a === 0 || a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function validateUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return { valid: false, reason: 'Bad scheme' };
    const h = parsed.hostname.toLowerCase();
    if (BLOCKED_HOSTNAMES.has(h) || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) {
      return { valid: false, reason: 'Blocked host' };
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h) && isPrivateIPv4(h)) {
      return { valid: false, reason: 'Private IP' };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid format' };
  }
}

console.log('=== 1. SSRF PROTECTION CHECKS ===');
const ssrfTests = [
  { url: 'http://localhost:3000/api', expected: false },
  { url: 'http://127.0.0.1:8080', expected: false },
  { url: 'http://169.254.169.254/latest/meta-data', expected: false },
  { url: 'http://192.168.1.1/admin', expected: false },
  { url: 'http://10.0.0.5:9000', expected: false },
  { url: 'ftp://ftp.example.com', expected: false },
  { url: 'https://api.openai.com/v1/chat/completions', expected: true },
  { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', expected: true },
  { url: 'https://api.anthropic.com/v1/messages', expected: true }
];

let ssrfPass = true;
for (const t of ssrfTests) {
  const res = validateUrl(t.url);
  const pass = res.valid === t.expected;
  if (!pass) ssrfPass = false;
  console.log(`- ${t.url} => Valid: ${res.valid} (Expected: ${t.expected}) - ${pass ? 'PASS' : 'FAIL'}`);
}

// 2. Stream Parser Extraction
console.log('\n=== 2. STREAM CHUNK EXTRACTION CHECKS ===');
const openaiChunk = JSON.parse('{"choices":[{"delta":{"content":"Hello from AI!"}}]}');
const anthropicChunk = JSON.parse('{"type":"content_block_delta","delta":{"text":"Hello from Claude!"}}');
const geminiChunk = JSON.parse('{"candidates":[{"content":{"parts":[{"text":"Hello from Gemini!"}]}}]}');

function extractText(json) {
  if (json.choices && json.choices[0]?.delta?.content) return json.choices[0].delta.content;
  if (json.delta?.text) return json.delta.text;
  if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) return json.candidates[0].content.parts[0].text;
  return null;
}

console.log('OpenAI parsed:', extractText(openaiChunk) === 'Hello from AI!' ? 'PASS' : 'FAIL');
console.log('Anthropic parsed:', extractText(anthropicChunk) === 'Hello from Claude!' ? 'PASS' : 'FAIL');
console.log('Gemini parsed:', extractText(geminiChunk) === 'Hello from Gemini!' ? 'PASS' : 'FAIL');

console.log('\nAll core verifications complete!');
