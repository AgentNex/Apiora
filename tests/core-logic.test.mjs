import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: SSRF Validation
import { validateTargetUrl } from '../lib/api/ssrf.js';

test('SSRF Protection tests', () => {
  // Should allow valid HTTPS endpoints
  assert.equal(validateTargetUrl('https://api.openai.com/v1/chat/completions').valid, true);
  assert.equal(validateTargetUrl('https://api.anthropic.com/v1/messages').valid, true);
  assert.equal(validateTargetUrl('https://generativelanguage.googleapis.com/v1beta/models').valid, true);

  // Should block private IPs
  assert.equal(validateTargetUrl('http://127.0.0.1:8080').valid, false);
  assert.equal(validateTargetUrl('http://localhost:3000').valid, false);
  assert.equal(validateTargetUrl('http://192.168.1.1').valid, false);
  assert.equal(validateTargetUrl('http://10.0.0.1').valid, false);
  assert.equal(validateTargetUrl('http://169.254.169.254/latest/meta-data/').valid, false);

  // Should block non-HTTP/HTTPS
  assert.equal(validateTargetUrl('ftp://example.com/file').valid, false);
  assert.equal(validateTargetUrl('file:///etc/passwd').valid, false);
});

// Test 2: Token Estimation
import { estimateTokens } from '../lib/api/stream-parser.js';

test('Token estimation tests', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens('Hello world'), 3);
  assert.ok(estimateTokens('The quick brown fox jumps over the lazy dog') > 5);
});
