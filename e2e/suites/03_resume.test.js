import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser, generateSkill } from '../client/fixtures.js';

export async function runResumeSuite() {
  const client = new ApiClient();
  const testUser = generateUser('res');

  console.log(`\n--- [Suite 03: Resume Generation] Starting tests with user ${testUser.username} ---`);

  // Setup user and seed profile
  const regRes = await client.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  client.setToken(regRes.data.accessToken);

  await client.put('/v1/profile', {
    fullName: 'Resume Test Subject',
    headline: 'Full-Stack Developer',
    summary: 'Testing ATS resume rendering engine.',
    location: 'Almaty, KZ',
    website: 'https://example.com'
  }, { expectedStatus: 200 });

  await client.post('/v1/profile/skills', generateSkill('Languages'), { expectedStatus: 201 });

  // 1. GET /v1/resume/html/github?preview=true (200 OK, HTML)
  const htmlRes = await client.get('/v1/resume/html/github?preview=true&singlePage=true', { expectedStatus: 200 });
  assert.equal(htmlRes.status, 200);
  assert.ok(typeof htmlRes.data === 'string', 'Resume HTML must be string');
  assert.ok(htmlRes.data.includes('Resume Test Subject'), 'Rendered HTML must contain user full name');
  console.log('  [PASS] GET /v1/resume/html/github?preview=true -> 200 OK (HTML verified)');

  // 2. GET /v1/resume/generate/github?preview=true (200 OK, PDF)
  const pdfRes = await client.get('/v1/resume/generate/github?preview=true&singlePage=true', { expectedStatus: 200 });
  assert.equal(pdfRes.status, 200);
  const contentType = pdfRes.headers.get('content-type') || '';
  assert.ok(contentType.includes('application/pdf'), 'Content-Type must be application/pdf');
  console.log('  [PASS] GET /v1/resume/generate/github?preview=true -> 200 OK (PDF verified)');

  // 3. GET /v1/resume/html/clean?preview=true (200 OK)
  const cleanRes = await client.get('/v1/resume/html/clean?preview=true&singlePage=true', { expectedStatus: 200 });
  assert.equal(cleanRes.status, 200);
  console.log('  [PASS] GET /v1/resume/html/clean?preview=true -> 200 OK');

  // 4. Invalid template validation (400 Bad Request)
  const invalidTplRes = await client.get('/v1/resume/html/unknown-template-xyz?preview=true', { expectedStatus: 400 });
  assert.equal(invalidTplRes.status, 400, 'Invalid template must return 400');
  console.log('  [PASS] GET /v1/resume/html/invalid -> 400 Bad Request');

  return client.getMetrics();
}
