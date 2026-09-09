import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser } from '../client/fixtures.js';

export async function runPortfolioSuite() {
  const authClient = new ApiClient();
  const publicClient = new ApiClient();
  const testUser = generateUser('port');

  console.log(`\n--- [Suite 04: Portfolio Public API] Starting tests with user ${testUser.username} ---`);

  // Register user and fill headline
  const regRes = await authClient.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  authClient.setToken(regRes.data.accessToken);

  await authClient.put('/v1/profile', {
    fullName: 'Public Portfolio Owner',
    headline: 'Principal Cloud Architect',
    summary: 'Public profile view testing.'
  }, { expectedStatus: 200 });

  // 1. GET /v1/portfolio/{username} without auth header (200 OK)
  const pubRes = await publicClient.get(`/v1/portfolio/${testUser.username}`, { expectedStatus: 200 });
  assert.equal(pubRes.status, 200, 'Public portfolio must be accessible anonymously');
  assert.equal(pubRes.data?.fullName, 'Public Portfolio Owner');
  assert.equal(pubRes.data?.headline, 'Principal Cloud Architect');
  console.log('  [PASS] GET /v1/portfolio/{username} (anonymous) -> 200 OK');

  // 2. GET /v1/portfolio/{non_existent} (404 Not Found)
  const notFoundRes = await publicClient.get(`/v1/portfolio/non_existent_dev_${Date.now()}`, { expectedStatus: 404 });
  assert.equal(notFoundRes.status, 404, 'Non-existent user portfolio must return 404');
  console.log('  [PASS] GET /v1/portfolio/{non_existent} -> 404 Not Found');

  return publicClient.getMetrics();
}
