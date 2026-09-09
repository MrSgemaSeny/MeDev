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

  // 1. Test Markdown (README)
  const mdRes = await client.get('/v1/profile/readme?template=full', { expectedStatus: 200 });
  assert.equal(mdRes.status, 200);
  assert.ok(typeof mdRes.data === 'string' && mdRes.data.length > 50, 'README Markdown must be valid non-empty string');
  console.log('  [PASS] GET /v1/profile/readme?template=full -> 200 OK (Markdown verified)');

  const templates = ['apple-modern', 'clean', 'github', 'grok-monolith', 'milky-soft', 'phub-orange'];
  const modes = [true, false]; // singlePage=true (1-page) vs singlePage=false (multi-page)

  // 2. Test HTML for all 6 templates in both modes
  for (const tpl of templates) {
    for (const singlePage of modes) {
      const modeName = singlePage ? 'singlePage' : 'multiPage';
      const res = await client.get(`/v1/resume/html/${tpl}?preview=true&singlePage=${singlePage}`, { expectedStatus: 200 });
      assert.equal(res.status, 200);
      assert.ok(typeof res.data === 'string', `HTML for ${tpl} must be string`);
      assert.ok(res.data.includes('Resume Test Subject'), `HTML for ${tpl} must contain user full name`);
      console.log(`  [PASS] GET /v1/resume/html/${tpl} (${modeName}) -> 200 OK`);
    }
  }

  // 3. Test PDF for all 6 templates in both modes
  for (const tpl of templates) {
    for (const singlePage of modes) {
      const modeName = singlePage ? 'singlePage' : 'multiPage';
      const res = await client.get(`/v1/resume/generate/${tpl}?preview=true&singlePage=${singlePage}`, { expectedStatus: 200 });
      assert.equal(res.status, 200);
      const ct = res.headers.get('content-type') || '';
      assert.ok(ct.includes('application/pdf'), `Content-Type for ${tpl} PDF must be application/pdf`);
      console.log(`  [PASS] GET /v1/resume/generate/${tpl} (${modeName}) -> 200 OK (PDF verified)`);
    }
  }

  // 4. Invalid template validation (400 Bad Request)
  const invalidTplRes = await client.get('/v1/resume/html/unknown-template-xyz?preview=true', { expectedStatus: 400 });
  assert.equal(invalidTplRes.status, 400, 'Invalid template must return 400');
  console.log('  [PASS] GET /v1/resume/html/invalid -> 400 Bad Request');

  return client.getMetrics();
}
