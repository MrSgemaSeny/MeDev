# Current Project Context

## Status
- **Phase**: Phase 5 (Quality & Infrastructure)
- **Latest Work**:
  - Resolved `429 Too Many Requests` API error (removed duplicate `RateLimitingFilter`).
  - Restored light/dark theme toggle utilizing CSS variables based on GitHub Dark Mode aesthetic.
  - Implemented backend tests with JUnit/Mockito (`AuthServiceTest`, `StripeServiceTest`).
  - Implemented frontend tests with Vitest (`store.test.ts`).
  - Completed React-i18next setup for `DashboardPage`, `LoginPage`, and `RegisterPage`.
  
## Next in Backlog
- CI/CD Setup: GitHub Actions for building, testing, and preventing failing PRs/pushes.
- GlobalExceptionHandler improvements (@Valid, MaxUploadSizeExceeded).
- Dockerfile & fly.toml for deployment.
