import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser } from '../client/fixtures.js';

export async function runActuatorSuite() {
  const publicClient = new ApiClient();
  const userClient = new ApiClient();
  const testUser = generateUser('act');

  console.log(`\n--- [Suite 09: Actuator & Observability] Starting tests ---`);

  // 1. GET /actuator/health (200 OK public)
  const healthRes = await publicClient.get('/actuator/health', { expectedStatus: 200 });
  assert.equal(healthRes.status, 200, 'Health endpoint must be public and return 200');
  assert.equal(healthRes.data?.status, 'UP', 'Health status must be UP');
  console.log('  [PASS] GET /actuator/health (public) -> 200 OK (status: UP)');

  // 2. GET /actuator/metrics anonymous (401 Unauthorized)
  const anonMetrics = await publicClient.get('/actuator/metrics', { expectedStatus: 401 });
  assert.equal(anonMetrics.status, 401, 'Anonymous metrics access must be 401');
  console.log('  [PASS] GET /actuator/metrics (anonymous) -> 401 Unauthorized');

  // Register user
  const regRes = await userClient.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  userClient.setToken(regRes.data.accessToken);

  // 3. GET /actuator/metrics with USER token (403 Forbidden)
  const userMetrics = await userClient.get('/actuator/metrics', { expectedStatus: 403 });
  assert.equal(userMetrics.status, 403, 'Regular USER must receive 403 on /actuator/metrics');
  console.log('  [PASS] GET /actuator/metrics (regular USER) -> 403 Forbidden');

  return [...publicClient.getMetrics(), ...userClient.getMetrics()];
}
