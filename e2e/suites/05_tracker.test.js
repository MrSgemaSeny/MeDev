import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import { generateUser, generateJobApplication } from '../client/fixtures.js';

export async function runTrackerSuite() {
  const clientOwner = new ApiClient();
  const clientAttacker = new ApiClient();

  const ownerUser = generateUser('own');
  const attackerUser = generateUser('atk');

  console.log(`\n--- [Suite 05: Job Tracker & IDOR Protection] Starting tests ---`);

  // Register Owner
  const regOwner = await clientOwner.post('/v1/auth/register', {
    email: ownerUser.email,
    username: ownerUser.username,
    password: ownerUser.password
  }, { expectedStatus: 201 });
  clientOwner.setToken(regOwner.data.accessToken);

  // Register Attacker
  const regAtk = await clientAttacker.post('/v1/auth/register', {
    email: attackerUser.email,
    username: attackerUser.username,
    password: attackerUser.password
  }, { expectedStatus: 201 });
  clientAttacker.setToken(regAtk.data.accessToken);

  // 1. POST /v1/tracker/applications (201 Created)
  const appData = generateJobApplication();
  const createRes = await clientOwner.post('/v1/tracker/applications', appData, { expectedStatus: 201 });
  assert.equal(createRes.status, 201);
  const appId = createRes.data?.id;
  assert.ok(appId, 'Application ID must be generated');
  assert.equal(createRes.data?.companyName, appData.companyName);
  console.log(`  [PASS] POST /v1/tracker/applications -> 201 Created (ID: ${appId})`);

  // 2. GET /v1/tracker/applications (200 OK)
  const listRes = await clientOwner.get('/v1/tracker/applications', { expectedStatus: 200 });
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(listRes.data), 'Applications response must be an array');
  assert.ok(listRes.data.some(a => a.id === appId), 'Created application must be present in list');
  console.log('  [PASS] GET /v1/tracker/applications -> 200 OK');

  // 3. IDOR CHECK: Attacker tries to update Owner application (403 Forbidden)
  const idorPutRes = await clientAttacker.put(`/v1/tracker/applications/${appId}`, {
    companyName: 'Hacked Company',
    role: 'Hacked Role',
    status: 'REJECTED'
  }, { expectedStatus: 403 });
  assert.equal(idorPutRes.status, 403, 'IDOR PUT attempt must be blocked with 403');
  console.log('  [PASS] IDOR PUT /v1/tracker/applications/{id} by stranger -> 403 Forbidden');

  // 4. IDOR CHECK: Attacker tries to delete Owner application (403 Forbidden)
  const idorDelRes = await clientAttacker.delete(`/v1/tracker/applications/${appId}`, { expectedStatus: 403 });
  assert.equal(idorDelRes.status, 403, 'IDOR DELETE attempt must be blocked with 403');
  console.log('  [PASS] IDOR DELETE /v1/tracker/applications/{id} by stranger -> 403 Forbidden');

  // 5. PUT /v1/tracker/applications/{id} by legitimate owner (200 OK)
  const updateRes = await clientOwner.put(`/v1/tracker/applications/${appId}`, {
    companyName: `${appData.companyName} International`,
    role: 'Staff Platform Architect',
    status: 'INTERVIEW'
  }, { expectedStatus: 200 });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.data?.role, 'Staff Platform Architect');
  assert.equal(updateRes.data?.status, 'INTERVIEW');
  console.log('  [PASS] PUT /v1/tracker/applications/{id} -> 200 OK (status INTERVIEW)');

  // 6. DELETE /v1/tracker/applications/{id} by legitimate owner (204 No Content)
  const delRes = await clientOwner.delete(`/v1/tracker/applications/${appId}`, { expectedStatus: 204 });
  assert.equal(delRes.status, 204);
  console.log('  [PASS] DELETE /v1/tracker/applications/{id} -> 204 No Content');

  // 7. Verification: trying to delete already deleted app returns 404
  const notFoundDel = await clientOwner.delete(`/v1/tracker/applications/${appId}`, { expectedStatus: 404 });
  assert.equal(notFoundDel.status, 404);
  console.log('  [PASS] DELETE /v1/tracker/applications/{deletedId} -> 404 Not Found');

  return [...clientOwner.getMetrics(), ...clientAttacker.getMetrics()];
}
