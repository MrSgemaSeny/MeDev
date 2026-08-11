# Current Project Context

## Status
- **Project Stage**: Production-Ready MVP
- **Latest Work**:
  - Validated and verified full implementation of Sprint 1 (Bucket4j Rate Limiting, GlobalExceptionHandler, File upload limits, Config Validation, Axios Refresh Interceptor, Code Splitting).
  - Validated and verified full implementation of Sprint 2 (ProfileService decomposition, MapStruct, GroqClient resilience).
  - Validated and verified full implementation of Phase 1 - Production-ready AI Core (Resilience4j CircuitBreaker/Retry for GroqClient, LlmProvider Interface, PromptLoader with resources extraction, Bucket4j AiRateLimiter, JSON parsing graceful degradation).
  - Validated and verified full implementation of Phase 2 - Production-Ready AI & Frontend Integration (Token Accounting with AiUsage, Human Feedback with AiEvaluation, Frontend Synchronous hooks for "Generate with AI", Golden Dataset tests).
  - Validated and verified full implementation of Phase 4 - Monetization & Scale (Frontend Stripe Checkout integration, Quota Dashboard Widget, Soft Upsell Modal on 429 errors).
  - Implemented AI Resume Parsing via PDF upload (`useParseResume`).
  - Added AI Feedback Panel ("Analyze Resume") into the ResumeBuilder.
  - Enforced AI feature access restrictions based on Plan (Free/Pro) in `AiController`.
  - Configured `SecurityConfig` for strict CORS origins (configured via `application.yml`).
  - Implemented structured JSON logging via `logback-spring.xml` and MDC.
  - Created `Dockerfile` and `fly.toml` for backend deployment on Fly.io.

## Next in Backlog
- Frontend CI/CD / GitHub Pages deployment.
- Implement Vitest tests for the frontend and expand JUnit/Mockito tests on the backend.
