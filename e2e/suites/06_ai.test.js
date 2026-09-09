import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser } from '../client/fixtures.js';

export async function runAiSuite() {
  const client = new ApiClient();
  const testUser = generateUser('ai');

  console.log(`\n--- [Suite 06: AI Integration] Starting tests with user ${testUser.username} ---`);

  // Register user and seed profile
  const regRes = await client.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  client.setToken(regRes.data.accessToken);

  await client.put('/v1/profile', {
    fullName: 'AI Test User',
    headline: 'Senior Cloud Engineer',
    summary: 'Testing Groq AI generation proxy.'
  }, { expectedStatus: 200 });

  // 1. GET /v1/ai/quota (200 OK)
  const quotaRes = await client.get('/v1/ai/quota', { expectedStatus: 200 });
  assert.equal(quotaRes.status, 200);
  assert.ok(typeof quotaRes.data?.remaining === 'number');
  assert.equal(quotaRes.data?.limit, 10, 'Free daily limit must be 10');
  console.log(`  [PASS] GET /v1/ai/quota -> 200 OK (Remaining: ${quotaRes.data.remaining}/${quotaRes.data.limit})`);

  // 2. POST /v1/ai/generate/summary (200 OK)
  const sumRes = await client.post('/v1/ai/generate/summary', { language: 'en' }, { expectedStatus: 200 });
  assert.equal(sumRes.status, 200);
  assert.ok(sumRes.data, 'AI Summary response must not be empty');
  console.log('  [PASS] POST /v1/ai/generate/summary -> 200 OK (Groq proxy generated response)');

  // 3. POST /v1/ai/chat/stream (200 OK, text/event-stream)
  console.log('  Testing SSE stream connection to /v1/ai/chat/stream...');
  const sseResult = await client.streamSse('/v1/ai/chat/stream', {
    prompt: 'Respond with short confirmation: Ready.',
    history: []
  }, { maxChunks: 5 });

  assert.equal(sseResult.status, 200, 'SSE endpoint must return 200 OK');
  assert.ok(sseResult.chunks.length > 0, 'Must receive at least one SSE stream chunk');
  assert.ok(sseResult.rawText.includes('data:'), 'Stream data must follow text/event-stream spec');
  console.log(`  [PASS] POST /v1/ai/chat/stream -> 200 OK (Received ${sseResult.chunks.length} SSE chunks)`);

  return client.getMetrics();
}
