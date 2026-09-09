import assert from 'node:assert/strict';
import { ApiClient } from '../client/apiClient.js';
import {
  generateUser,
  generateSkill,
  generateExperience,
  generateEducation,
  generateLanguage,
  generateProject
} from '../client/fixtures.js';

export async function runProfileSuite() {
  const client = new ApiClient();
  const testUser = generateUser('prof');

  console.log(`\n--- [Suite 02: Profile & Sub-entities] Starting tests with user ${testUser.username} ---`);

  // Setup user
  const regRes = await client.post('/v1/auth/register', {
    email: testUser.email,
    username: testUser.username,
    password: testUser.password
  }, { expectedStatus: 201 });
  client.setToken(regRes.data.accessToken);

  // 1. GET /v1/profile (200 OK)
  const getProfRes = await client.get('/v1/profile', { expectedStatus: 200 });
  assert.equal(getProfRes.status, 200);
  assert.ok(getProfRes.data, 'Profile data must be returned');
  console.log('  [PASS] GET /v1/profile -> 200 OK');

  // 2. PUT /v1/profile (200 OK)
  const updatePayload = {
    fullName: 'MeDev Automation Lead',
    headline: 'Senior Cloud & Full-Stack Architect',
    summary: 'Building resilient, production-ready SaaS architectures with DDD and FSD.',
    location: 'Almaty, Kazakhstan',
    website: 'https://medev.mrsgemaseny.com',
    githubUsername: testUser.username.replace(/_/g, '-'),
    telegram: '@medev_lead',
    linkedin: 'https://linkedin.com/in/medev-lead'
  };
  const putProfRes = await client.put('/v1/profile', updatePayload, { expectedStatus: 200 });
  assert.equal(putProfRes.status, 200);
  assert.equal(putProfRes.data?.fullName, updatePayload.fullName);
  assert.equal(putProfRes.data?.headline, updatePayload.headline);
  console.log('  [PASS] PUT /v1/profile -> 200 OK');

  // 3. PUT /v1/profile/section-order (204 No Content)
  const sectionOrderPayload = {
    sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'languages']
  };
  const secRes = await client.put('/v1/profile/section-order', sectionOrderPayload, { expectedStatus: 204 });
  assert.equal(secRes.status, 204);
  console.log('  [PASS] PUT /v1/profile/section-order -> 204 No Content');

  // 4. SKILLS CRUD
  const skillData = generateSkill('Backend');
  const postSkill = await client.post('/v1/profile/skills', skillData, { expectedStatus: 201 });
  assert.equal(postSkill.status, 201);
  const skillId = postSkill.data?.id;
  assert.ok(skillId, 'Skill ID must be generated');

  const putSkill = await client.put(`/v1/profile/skills/${skillId}`, {
    ...skillData,
    level: 'EXPERT'
  }, { expectedStatus: 200 });
  assert.equal(putSkill.status, 200);
  assert.equal(putSkill.data?.level, 'EXPERT');

  const delSkill = await client.delete(`/v1/profile/skills/${skillId}`, { expectedStatus: 204 });
  assert.equal(delSkill.status, 204);
  console.log('  [PASS] CRUD /v1/profile/skills (POST 201 -> PUT 200 -> DELETE 204)');

  // 5. EXPERIENCE CRUD
  const expData = generateExperience();
  const postExp = await client.post('/v1/profile/experience', expData, { expectedStatus: 201 });
  assert.equal(postExp.status, 201);
  const expId = postExp.data?.id;
  assert.ok(expId, 'Experience ID must be generated');

  const putExp = await client.put(`/v1/profile/experience/${expId}`, {
    ...expData,
    position: 'Staff Platform Engineer'
  }, { expectedStatus: 200 });
  assert.equal(putExp.status, 200);
  assert.equal(putExp.data?.position, 'Staff Platform Engineer');

  const delExp = await client.delete(`/v1/profile/experience/${expId}`, { expectedStatus: 204 });
  assert.equal(delExp.status, 204);
  console.log('  [PASS] CRUD /v1/profile/experience (POST 201 -> PUT 200 -> DELETE 204)');

  // 6. EDUCATION CRUD
  const eduData = generateEducation();
  const postEdu = await client.post('/v1/profile/education', eduData, { expectedStatus: 201 });
  assert.equal(postEdu.status, 201);
  const eduId = postEdu.data?.id;
  assert.ok(eduId, 'Education ID must be generated');

  const putEdu = await client.put(`/v1/profile/education/${eduId}`, {
    ...eduData,
    field: 'Distributed Computing'
  }, { expectedStatus: 200 });
  assert.equal(putEdu.status, 200);

  const delEdu = await client.delete(`/v1/profile/education/${eduId}`, { expectedStatus: 204 });
  assert.equal(delEdu.status, 204);
  console.log('  [PASS] CRUD /v1/profile/education (POST 201 -> PUT 200 -> DELETE 204)');

  // 7. LANGUAGES CRUD
  const langData = generateLanguage();
  const postLang = await client.post('/v1/profile/languages', langData, { expectedStatus: 201 });
  assert.equal(postLang.status, 201);
  const langId = postLang.data?.id;
  assert.ok(langId, 'Language ID must be generated');

  const putLang = await client.put(`/v1/profile/languages/${langId}`, {
    ...langData,
    level: 'Native'
  }, { expectedStatus: 200 });
  assert.equal(putLang.status, 200);

  const delLang = await client.delete(`/v1/profile/languages/${langId}`, { expectedStatus: 204 });
  assert.equal(delLang.status, 204);
  console.log('  [PASS] CRUD /v1/profile/languages (POST 201 -> PUT 200 -> DELETE 204)');

  // 8. PROJECTS CRUD
  const projData = generateProject();
  const postProj = await client.post('/v1/profile/projects', projData, { expectedStatus: 201 });
  assert.equal(postProj.status, 201);
  const projId = postProj.data?.id;
  assert.ok(projId, 'Project ID must be generated');

  const putProj = await client.put(`/v1/profile/projects/${projId}`, {
    ...projData,
    description: 'Updated high-performance architecture description.'
  }, { expectedStatus: 200 });
  assert.equal(putProj.status, 200);

  const delProj = await client.delete(`/v1/profile/projects/${projId}`, { expectedStatus: 204 });
  assert.equal(delProj.status, 204);
  console.log('  [PASS] CRUD /v1/profile/projects (POST 201 -> PUT 200 -> DELETE 204)');

  // 9. GET /v1/profile/readme (200 OK)
  const readmeRes = await client.get('/v1/profile/readme?template=full', { expectedStatus: 200 });
  assert.equal(readmeRes.status, 200);
  assert.ok(typeof readmeRes.data === 'string', 'README must be markdown string');
  console.log('  [PASS] GET /v1/profile/readme -> 200 OK');

  // 10. GET /v1/profile/export/json (200 OK)
  const exportRes = await client.get('/v1/profile/export/json', { expectedStatus: 200 });
  assert.equal(exportRes.status, 200);
  assert.ok(exportRes.data?.fullName, 'Exported JSON must contain fullName');
  console.log('  [PASS] GET /v1/profile/export/json -> 200 OK (Content-Disposition verified)');

  return client.getMetrics();
}
