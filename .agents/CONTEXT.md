# Current Project Context

## Status
- **Project Stage**: Level 4 — Production-Ready v1.0 Release
- **Developer Level**: Senior / Tech Lead
- **Latest Work (2026-08-21 Multi-Module Audit & Remediation)**:
  - **P0: PDF Engine & AI Core Remediation (M1)**: Eliminated PDFBox `InputStream` leaks via try-with-resources. Validated Cyrillic Roboto font embedding across all 6 resume HTML/PDF templates (`clean`, `github`, `apple-modern`, `grok-monolith`, `milky-soft`, `phub-orange`). Wired reactive `Disposable.dispose()` on SSE client disconnects in `AiController`. Raised `MAX_TOKENS` to 4096 with robust markdown/JSON extraction. Refined PII masking regexes to preserve technical skills. Fixed inverted PRO-gating in `ResumeController` and enforced PRO check on `AiApplicationService.matchJob`.
  - **P0: GitHub Deep Integration & Crypto Unification (M2)**: Mapped `fullName` and `isPrivate` in `GitHubRepoDto`, fixing org/repo path resolution. Unified all database encryption to AES-256-GCM (`EncryptedStringConverter` + `EncryptionUtils`) with key rotation and 17 dedicated tests.
  - **P1: Security, Billing & Concurrency Hardening (M3)**: Implemented pessimistic row locking (`findByUserIdForUpdate`) across all mutating methods in `ProfileService` and sub-services, eliminating race conditions. Hardened Stripe and Kaspi Pay webhooks with Redis idempotency release and constant-time HMAC-SHA256 verification. Wired `AuditService.logAction` into auth, billing, and admin flows. Connected admin dashboard to live `AiUsageRepository` token accounting. Aligned `Education.degree` nullability with DB schema.
  - **P2: Build, Test & Release Verification (M4)**: Refactored controller tests to standalone `@WebMvcTest`. Added comprehensive unit tests for all services. Resolved frontend Vite dynamic import warning and mocked `react-i18next` cleanly in test setup. Verified Flyway migrations (V1–V24) and Docker Compose setup.
  - **Test Baseline**: 253 backend tests passing (100% green via `.\gradlew.bat test`), 37 frontend tests passing (100% green via `npm test`), 0 build/lint warnings (`tsc -b && vite build`, `oxlint`).

## Active Backlog
- Production deployment to Fly.io (backend) and GitHub Pages / Custom Domain (frontend).
- Setting up automated nightly DB backup jobs.
- Sentry and Prometheus/Grafana monitoring dashboards.


