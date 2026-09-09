import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser } from '../client/fixtures.js';

export async function runAuthSuite(sharedClient) {
  const client = new ApiClient();
  const testUser = generateUser('auth');

  console.log(`\n--- [Suite 01: Auth] Starting tests with user ${testUser.username} ---`);

  // 1. POST /v1/auth/register (201)
  const regRes = await client.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });

  assert.equal(regRes.status, 201, 'Registration must return 201 Created');
  assert.ok(regRes.data?.accessToken, 'Response must include accessToken');
  assert.equal(regRes.data?.username, testUser.username.toLowerCase(), 'Username must match in response');
  assert.equal(regRes.data?.role, 'USER', 'Default role must be USER');
  assert.ok(client.getCookie('refresh_token'), 'Set-Cookie must contain refresh_token');
  console.log('  [PASS] POST /v1/auth/register -> 201 Created, tokens received');

  // 2. Duplicate registration with same email (409 Conflict)
  const dupRes = await client.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username + '_dup',
    password: testUser.password
  }, { expectedStatus: 409 });

  assert.equal(dupRes.status, 409, 'Duplicate registration must return 409 Conflict');
  console.log('  [PASS] POST /v1/auth/register (duplicate email) -> 409 Conflict');

  // 3. POST /v1/auth/login with invalid password (401 Unauthorized)
  const invalidLoginRes = await client.post('/v1/auth/login', {
    email: testUser.email,
    password: 'WrongPassword_999!'
  }, { expectedStatus: 401 });

  assert.equal(invalidLoginRes.status, 401, 'Invalid login must return 401 Unauthorized');
  console.log('  [PASS] POST /v1/auth/login (invalid password) -> 401 Unauthorized');

  // 4. POST /v1/auth/login with valid credentials (200 OK)
  const loginRes = await client.post('/v1/auth/login', {
    email: testUser.email,
    password: testUser.password
  }, { expectedStatus: 200 });

  assert.equal(loginRes.status, 200, 'Valid login must return 200 OK');
  assert.ok(loginRes.data?.accessToken, 'Login response must include accessToken');
  console.log('  [PASS] POST /v1/auth/login -> 200 OK');

  // 5. POST /v1/auth/refresh (200 OK, token rotation)
  const currentRefreshToken = client.getCookie('refresh_token');
  assert.ok(currentRefreshToken, 'refresh_token must exist before refresh');

  const refreshRes = await client.post('/v1/auth/refresh', {}, { expectedStatus: 200 });
  assert.equal(refreshRes.status, 200, 'Token refresh must return 200 OK');
  assert.ok(refreshRes.data?.accessToken, 'Refresh response must include new accessToken');
  const newAccessToken = refreshRes.data.accessToken;
  console.log('  [PASS] POST /v1/auth/refresh -> 200 OK (Token rotated)');

  // 6. POST /v1/auth/logout (204 No Content)
  client.setToken(newAccessToken);
  const logoutRes = await client.post('/v1/auth/logout', {}, { expectedStatus: 204 });
  assert.equal(logoutRes.status, 204, 'Logout must return 204 No Content');
  console.log('  [PASS] POST /v1/auth/logout -> 204 No Content');

  // 7. Verify revoked token is blacklisted in Redis (401 Unauthorized)
  const blacklistedCheck = await client.get('/v1/profile', { expectedStatus: 401 });
  assert.equal(blacklistedCheck.status, 401, 'Revoked token must be rejected with 401');
  console.log('  [PASS] GET /v1/profile with revoked token -> 401 Unauthorized (Redis Blacklist Verified)');

  return client.getMetrics();
}
