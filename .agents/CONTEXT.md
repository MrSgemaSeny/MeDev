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
  - **Implemented Google OAuth2 integration** for universal Auth (added `google_id` to database via Flyway, refactored `CustomOAuth2UserService` to handle multiple providers, added frontend UI buttons).
  - **Dockerized local development**: Created root `docker-compose.yml` (Postgres, Redis, Backend, Frontend) and `frontend/Dockerfile` for isolated full-stack execution.
  - **Security Audit Fixes**: Closed critical OAuth token leak in URLs using short-lived `oauth2_code` in Redis. Added strict `type` checks for JWTs (`access` vs `refresh`). Fixed IP spoofing in Bucket4j by ignoring `X-Forwarded-For`. Prevented race conditions in user registration.
  - **Billing Synchronization**: Upgraded `StripeService` to handle `customer.subscription.deleted`, `customer.subscription.updated`, and `invoice.payment_failed` webhooks for automatic `FREE` plan downgrading. Enhanced frontend `SuccessPage` to securely poll backend status.
  - **Global Header & Dark Mode Redesign**: Implemented a strict GitHub Dark Mode design system. Forced `dark` mode by default via blocking inline script. Built a new global `AppHeader` and rewrote `UserProfileDropdown` to handle missing data gracefully.

## Next in Backlog
- Frontend CI/CD / GitHub Pages deployment.
- Implement Vitest tests for the frontend and expand JUnit/Mockito tests on the backend.
