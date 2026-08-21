# Project: MeDev Multi-Module Audit & Defect Remediation for v1.0 Release

## Architecture
MeDev is an AI-powered developer portfolio, resume builder, and job application tracking platform.
- **Backend**: Java 17, Spring Boot 3.3.0, Spring Security (JWT + OAuth2), Spring Data JPA, PostgreSQL (pgvector), Redis, Flying Saucer (XHTML/CSS to PDF), PDFBox, Groq WebClient SSE streaming.
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Zustand, FSD (Feature-Sliced Design) architecture.
- **Infrastructure**: Docker Compose (`pgvector/pgvector:pg15`, `redis:alpine`, `backend`, `frontend`), Flyway migrations (V1–V24).

## Feature Inventory
| # | Feature / Defect | Description | Milestone | Source |
|---|------------------|-------------|-----------|--------|
| 1 | PDF Text Stream Leak (I-1) | Fix `file.getInputStream()` unclosed stream in `AiController.java` using try-with-resources. | M1 | Survey 1 / R1 |
| 2 | Cyrillic Font Embedding & Remote @import | Remove remote `@import url(...)` in `grok-monolith.html` / `milky-soft.html` and verify Cyrillic Roboto font fallbacks. | M1 | Survey 1 / R1 |
| 3 | AI SSE Stream Resilience | Wire `Disposable.dispose()` on `SseEmitter` completion/timeout/error in `AiController.java`. | M1 | Survey 1 / R1 |
| 4 | Max Tokens & JSON Sanitization (I-13) | Increase `MAX_TOKENS` to 4096 in `GroqClient.java` and implement robust markdown/JSON extraction. | M1 | Survey 1 / R1 |
| 5 | PII Masker Regex Fix | Remove overly broad noun-phrase regex from `PiiMasker.java` that masks technical terms. | M1 | Survey 1 / R1 |
| 6 | PRO Gate Consistency (W-8 / AI) | Add missing `assertPro(userId)` check in `AiApplicationService.matchJob`. Verify `ResumeController` PRO template gating. | M1 | Survey 1 / R1 |
| 7 | GitHub Org Repo URLs & Fields | Add `fullName` and `isPrivate` to `GitHubRepoDto` and fix repo path resolution in `GitHubService.java`. | M2 | Survey 2 / R2 |
| 8 | Crypto Unification Verification | Ensure all sensitive columns use AES-256-GCM `EncryptedStringConverter` and add `EncryptionUtilsTest`. | M2 | Survey 2 / R2 |
| 9 | Pessimistic Locking in ProfileService (W-9) | Wire `getProfileEntityForUpdate(userId)` into all mutating methods in `ProfileService.java` to prevent race conditions. | M3 | Survey 2 / R3 |
| 10 | Stripe & Kaspi Webhook Security (W-3, W-6) | Clean up Redis idempotency key on Stripe failure; secure Kaspi Pay with signed/validated orderId & idempotency. | M3 | Survey 2 / R3 |
| 11 | Audit Logging Wiring (W-5) | Wire `AuditService.logAction` across auth, billing, and admin plan/role modifications. | M3 | Survey 2 / R3 |
| 12 | Admin Dashboard Token Accounting (W-4) | Replace hardcoded 0 tokens in `AdminService.getDashboardStats` with live calculation from `AiUsageRepository`. | M3 | Survey 2 / R3 |
| 13 | Education Entity Nullability Discrepancy | Align `Education.java` degree nullability with `V4__create_education.sql` (`nullable = true`). | M3 | Survey 3 / R4 |
| 14 | Controller Tests Standalone Execution | Convert `AuthControllerTest`, `PortfolioControllerTest`, and `ProfileControllerTest` to standalone `@WebMvcTest`. | M4 | Survey 3 / R4 |
| 15 | Dedicated Service Unit Tests | Add unit tests for `KaspiPayService`, `AuditService`, `JobApplicationService`, and `ProfileService` concurrency. | M4 | Survey 3 / R4 |
| 16 | Frontend Build & Warning Remediation | Fix `AiChatWidget.tsx` dynamic import warning, i18n test mock in `setup.ts`, and clean up lint warnings. | M4 | Survey 3 / R4 |
| 17 | Full E2E Build & Docker/Flyway Verification | Validate 100% green `./gradlew test`, `npm run build`, `vitest run`, Flyway migrations, and Docker Compose configs. | M4 | Survey 3 / R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | P0: PDF Engine & AI Core Remediation | Features 1, 2, 3, 4, 5, 6 | none | DONE |
| M2 | P0: GitHub Deep Sync & Crypto Unification | Features 7, 8 | none | DONE |
| M3 | P1: Security, Billing & Concurrency Hardening | Features 9, 10, 11, 12, 13 | M1, M2 | DONE |
| M4 | P2: Build, Test & Release Verification | Features 14, 15, 16, 17 | M1, M2, M3 | DONE |

## Code Layout
- Backend Source: `backend/src/main/java/com/medev/`
  - Modules: `admin`, `ai`, `audit`, `auth`, `billing`, `github`, `portfolio`, `profile`, `resume`, `tracker`
  - Shared: `config`, `dto`, `entity`, `exception`, `security`, `util`
  - Resources: `backend/src/main/resources/` (`templates/resume/`, `fonts/`, `db/migration/`)
- Backend Tests: `backend/src/test/java/com/medev/`
- Frontend Source: `frontend/src/`
  - `app`, `entities`, `features`, `pages`, `shared`, `widgets`
- Frontend Tests: `frontend/src/**/*.test.{ts,tsx}`, `frontend/src/test/`
- Infra & Config: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`

## Interface Contracts
### ProfileService ↔ GitHubService / Resume Import
- All mutating methods MUST acquire pessimistic write lock via `getProfileEntityForUpdate(userId)`.
### KaspiPayService ↔ Controller / Webhook
- `createPaymentLink`: generates stateful/signed order token or verifies amount against subscription tier.
- `handleWebhook`: checks signature and verifies order validity with Redis idempotency lock.
### AuditService ↔ All Modules
- `logAction(userId, action, targetId, details, ipAddress)` called on all authentication events, role changes, and subscription mutations.
