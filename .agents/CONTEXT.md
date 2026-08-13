# Current Project Context

## Status
- **Project Stage**: Production-Ready MVP
- **Latest Work**:
  - Validated and verified full implementation of Sprint 1 (Bucket4j Rate Limiting, GlobalExceptionHandler, File upload limits, Config Validation, Axios Refresh Interceptor, Code Splitting).
  - Validated and verified full implementation of Sprint 2 (ProfileService decomposition, MapStruct, GroqClient resilience).
  - Validated and verified full implementation of Phase 1 - Production-ready AI Core (Resilience4j CircuitBreaker/Retry for GroqClient, LlmProvider Interface, PromptLoader with resources extraction, Bucket4j AiRateLimiter, JSON parsing graceful degradation).
  - Validated and verified full implementation of Phase 2 - Production-Ready AI & Frontend Integration (Token Accounting with AiUsage, Human Feedback with AiEvaluation, Frontend Synchronous hooks for "Generate with AI", Golden Dataset tests).
  - Validated and verified full implementation of Phase 4 - Monetization & Scale (Frontend Stripe Checkout integration, Quota Dashboard Widget, Soft Upsell Modal on 429 errors).
  - Implemented AI Resume Parsing via PDF upload (`useParseResume`) with backend-driven **Smart Merge**, intelligently combining existing GitHub profile data with PDF text to avoid data loss and hallucinations.
  - Implemented Phase 1 & 2: GitHub Source of Truth and AI Full Profile Generation. Added `GithubSnapshot` tracking, parallel fetching of repo languages, README tech stack parsing, and `/api/v1/ai/generate-profile` endpoint for full profile generation based on GitHub data.
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
  - **Premium Landing Page & Onboarding**: Integrated standalone Landing Page at `/` for public access. Overhauled `OnboardingWizard` with premium animations and scale.
  - **Enterprise Job Tracker & Import**: Replaced drag-and-drop Kanban board with a data-dense CRM table (uninstalled `@dnd-kit`). Extracted "Zero-Input" resume upload to a dedicated `/import` route.
  - **Dashboard Redesign**: Replaced standard DashboardPage with premium landing-page aesthetics (hero, live portfolio mock window, quick actions cards). Removed all mock data.
  - **Enterprise Admin Panel & Audit Logs**: Created `audit` module (AuditLog entity, AuditLogRepository, AuditService). Created `admin` module (AdminController, AdminService, AdminDashboardDto). Frontend: AdminGuard, AdminDashboardPage, AdminUsersPage, AdminAuditPage. Flyway V19 migration for audit_logs table. Fixed broken tests (AiAnalysisServiceTest, AuthServiceTest, JwtFilterTest, ProfileServiceTest). Improved AiChatWidget UI (480x650, leading-relaxed). Fixed duplicate `spring:` key in application.yml.
  - **Roadmap Phase 3 (PDF Preview)**: Added backend logic to return base64 embedded PDFs or preview blobs. Created frontend component in ResumeBuilder to preview the generated PDF inline using an iframe.
  - **Roadmap Phase 4 (Job Tracker AI & Kanban)**: Added AI matcher to compare Job Description vs Profile. Built WebScraperService to pull JD from HH.kz and LinkedIn URLs. Added `dnd-kit` powered Kanban Board to `JobTrackerPage` alongside the CRM List View. Added Import by URL flow to Job Application modal.

## Next in Backlog
- Frontend CI/CD / GitHub Pages deployment.
- Expand test coverage (Vitest frontend, JUnit backend).
- Fix `MeDevApplicationTests.contextLoads()` (needs test profile with H2 or Testcontainers).
- Wire AuditService into auth/billing flows (login, register, plan change events).
- Add pagination controls to AdminUsersPage and AdminAuditPage.
- Add UserRepository.countByPlan() for accurate PRO user count in admin dashboard.
