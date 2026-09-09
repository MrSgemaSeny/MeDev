import { runAuthSuite } from './suites/01_auth.test.js';
import { runProfileSuite } from './suites/02_profile.test.js';
import { runResumeSuite } from './suites/03_resume.test.js';
import { runPortfolioSuite } from './suites/04_portfolio.test.js';
import { runTrackerSuite } from './suites/05_tracker.test.js';
import { runAiSuite } from './suites/06_ai.test.js';
import { runGitHubSuite } from './suites/07_github.test.js';
import { runAdminSuite } from './suites/08_admin.test.js';
import { runActuatorSuite } from './suites/09_actuator.test.js';
import { CONFIG } from './config.js';

async function main() {
  console.log('======================================================================');
  console.log('  MeDev Backend Production E2E API Test Suite');
  console.log(`  Target Environment: ${CONFIG.BASE_URL}`);
  console.log(`  Start Time: ${new Date().toISOString()}`);
  console.log('======================================================================');

  const allMetrics = [];
  const suites = [
    { name: '01_Auth', fn: runAuthSuite },
    { name: '02_Profile', fn: runProfileSuite },
    { name: '03_Resume', fn: runResumeSuite },
    { name: '04_Portfolio', fn: runPortfolioSuite },
    { name: '05_Tracker', fn: runTrackerSuite },
    { name: '06_Ai', fn: runAiSuite },
    { name: '07_GitHub', fn: runGitHubSuite },
    { name: '08_Admin', fn: runAdminSuite },
    { name: '09_Actuator', fn: runActuatorSuite },
  ];

  let failedSuites = 0;
  const suiteResults = [];

  for (const suite of suites) {
    const start = performance.now();
    try {
      const metrics = await suite.fn();
      const elapsed = Math.round(performance.now() - start);
      allMetrics.push(...metrics);
      suiteResults.push({ name: suite.name, status: 'PASS', elapsed });
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      failedSuites++;
      suiteResults.push({ name: suite.name, status: 'FAIL', elapsed, error: err.message });
      console.error(`\n  [FAIL] Suite ${suite.name} encountered an error:`, err.message);
      if (err.stack) {
        console.error(err.stack);
      }
    }
  }

  console.log('\n======================================================================');
  console.log('                    E2E SUITE EXECUTION SUMMARY                       ');
  console.log('======================================================================');
  for (const res of suiteResults) {
    const badge = res.status === 'PASS' ? '[PASS]' : '[FAIL]';
    console.log(`  ${badge.padEnd(8)} ${res.name.padEnd(20)} (${res.elapsed} ms)${res.error ? ' - ' + res.error : ''}`);
  }

  console.log('\n======================================================================');
  console.log('                    BACKEND API ROUTE COVERAGE MATRIX                 ');
  console.log('======================================================================');
  console.log(
    '  ' +
    'METHOD'.padEnd(12) +
    'ENDPOINT'.padEnd(42) +
    'STATUS'.padEnd(10) +
    'LATENCY'.padEnd(12) +
    'RESULT'
  );
  console.log('  ' + '-'.repeat(82));

  let passCount = 0;
  let failCount = 0;

  for (const m of allMetrics) {
    const resultText = m.pass ? 'PASS' : 'FAIL';
    if (m.pass) passCount++;
    else failCount++;

    const latencyText = `${m.latencyMs} ms`;
    console.log(
      '  ' +
      m.method.padEnd(12) +
      m.path.padEnd(42) +
      String(m.status).padEnd(10) +
      latencyText.padEnd(12) +
      resultText
    );
  }

  console.log('  ' + '-'.repeat(82));
  console.log(`  Total Checks: ${allMetrics.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('======================================================================');

  if (failedSuites > 0 || failCount > 0) {
    console.error(`\nE2E Run Finished with Failures (${failedSuites} suites failed). Exiting with code 1.`);
    process.exit(1);
  } else {
    console.log('\nAll E2E API tests completed with 100% PASS rate. System is healthy.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
