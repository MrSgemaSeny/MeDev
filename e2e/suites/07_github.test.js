import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser } from '../client/fixtures.js';

export async function runGitHubSuite() {
  const client = new ApiClient();
  const testUser = generateUser('gh');

  console.log(`\n--- [Suite 07: GitHub Integration] Starting tests with user ${testUser.username} ---`);

  // 1. Anonymous access check (401 Unauthorized)
  const anonRes = await client.get('/v1/github/fetch', { expectedStatus: 401 });
  assert.equal(anonRes.status, 401, 'Anonymous GitHub fetch must return 401');
  console.log('  [PASS] GET /v1/github/fetch (anonymous) -> 401 Unauthorized');

  // Register user without GitHub OAuth link
  const regRes = await client.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  client.setToken(regRes.data.accessToken);

  // 2. GET /v1/github/fetch for unlinked account (500 contract response)
  const fetchRes = await client.get('/v1/github/fetch', { expectedStatus: 500 });
  assert.equal(fetchRes.status, 500, 'Unlinked GitHub fetch must return 500 contract error');
  console.log('  [PASS] GET /v1/github/fetch (unlinked account) -> 500 Contract Error handled');

  // 3. POST /v1/github/import for unlinked account (500 contract response)
  const impRes = await client.post('/v1/github/import', { repositories: [] }, { expectedStatus: 500 });
  assert.equal(impRes.status, 500, 'Unlinked GitHub import must return 500 contract error');
  console.log('  [PASS] POST /v1/github/import (unlinked account) -> 500 Contract Error handled');

  return client.getMetrics();
}
