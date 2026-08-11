# Current Project Context

## Status
- **Project Stage**: Production-Ready MVP
- **Latest Work**:
  - Validated and verified full implementation of Sprint 1 (Bucket4j Rate Limiting, GlobalExceptionHandler, File upload limits, Config Validation, Axios Refresh Interceptor, Code Splitting).
  - Validated and verified full implementation of Sprint 2 (ProfileService decomposition, MapStruct, GroqClient resilience).
  - Implemented AI Resume Parsing via PDF upload (`useParseResume`).
  - Added AI Feedback Panel ("Analyze Resume") into the ResumeBuilder.
  - Enforced AI feature access restrictions based on Plan (Free/Pro) in `AiController`.
  - Configured `SecurityConfig` for strict CORS origins (configured via `application.yml`).
  - Implemented structured JSON logging via `logback-spring.xml` and MDC.
  - Created `Dockerfile` and `fly.toml` for backend deployment on Fly.io.

## Next in Backlog
- Frontend CI/CD / GitHub Pages deployment.
- Implement Stripe / Kaspi Pay for actual PRO plan purchasing (currently mocked).
- Implement Vitest tests for the frontend and expand JUnit/Mockito tests on the backend.
