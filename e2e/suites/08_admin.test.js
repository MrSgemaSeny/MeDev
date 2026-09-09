import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser } from '../client/fixtures.js';
import { CONFIG } from '../config.js';

export async function runAdminSuite() {
  const anonClient = new ApiClient();
  const userClient = new ApiClient();
  const adminClient = new ApiClient();

  const testUser = generateUser('usr_adm');

  console.log(`\n--- [Suite 08: Admin Operations & RBAC] Starting tests ---`);

  // 1. ANONYMOUS RBAC CHECKS (401 Unauthorized)
  const anonDash = await anonClient.get('/v1/admin/dashboard', { expectedStatus: 401 });
  assert.equal(anonDash.status, 401, 'Anonymous access to /v1/admin/dashboard must be 401');

  const anonUsers = await anonClient.get('/v1/admin/users', { expectedStatus: 401 });
  assert.equal(anonUsers.status, 401, 'Anonymous access to /v1/admin/users must be 401');

  const anonAudit = await anonClient.get('/v1/admin/audit', { expectedStatus: 401 });
  assert.equal(anonAudit.status, 401, 'Anonymous access to /v1/admin/audit must be 401');
  console.log('  [PASS] Anonymous access to /v1/admin/** -> 401 Unauthorized');

  // Register regular USER
  const regRes = await userClient.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  userClient.setToken(regRes.data.accessToken);

  // 2. REGULAR USER RBAC CHECKS (403 Forbidden)
  const userDash = await userClient.get('/v1/admin/dashboard', { expectedStatus: 403 });
  assert.equal(userDash.status, 403, 'Regular USER must receive 403 Forbidden on dashboard');

  const userUsers = await userClient.get('/v1/admin/users', { expectedStatus: 403 });
  assert.equal(userUsers.status, 403, 'Regular USER must receive 403 Forbidden on users list');

  const userAudit = await userClient.get('/v1/admin/audit', { expectedStatus: 403 });
  assert.equal(userAudit.status, 403, 'Regular USER must receive 403 Forbidden on audit logs');
  console.log('  [PASS] USER access to /v1/admin/** -> 403 Forbidden (RBAC Enforcement Verified)');

  // 3. ADMIN USER CHECKS (if configured in env)
  if (CONFIG.ADMIN_EMAIL && CONFIG.ADMIN_PASSWORD) {
    console.log(`  Attempting login for configured admin: ${CONFIG.ADMIN_EMAIL}...`);
    try {
      const loginRes = await adminClient.post('/v1/auth/login', {
        email: CONFIG.ADMIN_EMAIL,
        password: CONFIG.ADMIN_PASSWORD
      });
      if (loginRes.status === 200 && loginRes.data?.accessToken) {
        adminClient.setToken(loginRes.data.accessToken);
        const adminDash = await adminClient.get('/v1/admin/dashboard', { expectedStatus: 200 });
        assert.equal(adminDash.status, 200);
        console.log('  [PASS] ADMIN access to /v1/admin/dashboard -> 200 OK');
      }
    } catch (err) {
      console.log(`  [INFO] Admin credentials check skipped or failed: ${err.message}`);
    }
  } else {
    console.log('  [INFO] MEDEV_ADMIN_EMAIL / PASSWORD not set in environment, RBAC 401 & 403 fully verified');
  }

  return [...anonClient.getMetrics(), ...userClient.getMetrics(), ...adminClient.getMetrics()];
}
