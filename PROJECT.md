# Project: MeDev Security & Architecture Hardening

## Architecture
- **Backend Architecture**: Modular monolith in Spring Boot 3.3.0 (modules: `auth`, `profile`, `tracker`, `ai`, `billing`, `admin`, `shared`).
- **Database**: PostgreSQL 17 with Flyway (`db/migration/`) and pgvector extension (`vector_store`).
- **Cache & Concurrency Layer**: Redis (StringRedisTemplate / Valkey) for atomic rate limits (Lua scripts), token revocations (SHA-256), and fast idempotency.
- **Frontend Architecture**: React 19, Vite, TypeScript, Feature-Sliced Design (FSD: `app`, `pages`, `features`, `entities`, `shared`), Tailwind CSS v4, Zustand.
- **Design System**: Strict GitHub Dark mode palette (`#0d1117` bg, `#161b22` cards, `#30363d` borders, `#238636` accent; GitHub Light `#1f883d`). Zero visual clutter, no small badges or hint subtext.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SSRF Remediation | Unswallow exceptions, resolve DNS, check all resolved IPs against full private/loopback/link-local/multicast CIDRs, enforce ports 80/443, disable unvalidated redirects, implement domain allowlist | M1 | ORIGINAL_REQUEST §R1, medev-security-audit §P0 |
| 2 | AI Quota Atomicity | Eliminate TOCTOU in AiRateLimiter using Redis Lua script for check-and-increment with TTL in single transaction | M1 | ORIGINAL_REQUEST §R1, medev-security-audit §P0 |
| 3 | Plan Cache Invalidation | Dynamic TTL `min(15m, expiry)` and immediate eviction of `user_plan:<userId>` key upon subscription upgrade, downgrade, or expiry | M1 | ORIGINAL_REQUEST §R1, medev-security-audit §P0 |
| 4 | Match Score Authority | Remove `matchScore` and `matchFeedback` from client-writable DTOs (`CreateJobApplicationRequest`, `UpdateJobApplicationRequest`); calculate score server-side | M1 | ORIGINAL_REQUEST §R1, medev-security-audit §P0 |
| 5 | Privacy by Default | Set `isPublic = false` by default in Profile entity, service, and Flyway migration V29 | M1 | ORIGINAL_REQUEST §R1, medev-security-audit §P0 |
| 6 | RAG Tenant Isolation | Add `user_id BIGINT NOT NULL` relational column with FK cascade and B-Tree index to `vector_store`; update PgVectorRepository queries | M1 | ORIGINAL_REQUEST §R1, medev-security-audit §P0 |
| 7 | OAuth Code Exchange Atomicity | Atomic `getAndDelete()` (GETDEL) for `oauth2_code:<code>` in Redis to eliminate race window | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 8 | Password Reset Security & Email Dispatch | Store `SHA-256(raw_token)` in Redis; send raw token to user; match hashed token on reset; implement EmailDispatchService | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 9 | JWT Blacklist Privacy & Privilege Window | Store `blacklist:access:<SHA-256(token)>`; implement server-side database privilege check for critical operations | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 10 | Stripe Webhook DB Idempotency & Period Sync | Implement `stripe_webhook_events` PostgreSQL table via Flyway V29; synchronize subscription expiration with `current_period_end` | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 11 | LLM Prompt Injection Defense & Bounds | Enclose untrusted job descriptions and candidate text in `<<< UNTRUSTED CONTENT >>>`; enforce central size/token limits on inputs | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 12 | AI Resume Import Safe Merge | Replace destructive `.clear()` with safe merge and diff preview confirmation; update frontend import flow | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 13 | RAG Chunk Caching | Check content hash (SHA-256) per chunk before embedding to avoid full profile re-embedding on minor edits | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 14 | Audit Logging Privacy | Purge plaintext PII (emails, raw tokens, passwords) from auth failure and scraper logs | M2 | ORIGINAL_REQUEST §R2, medev-security-audit §P1 |
| 15 | WebScraperService SRP Decomposition | Decompose monolithic WebScraperService into UrlSecurityValidator, HhVacancyClient, GenericPageFetcher, AiJobExtractor, ScrapeRateLimiter | M3 | ORIGINAL_REQUEST §R3, medev-security-audit §P2 |
| 16 | AI Fallbacks Cleanup | Replace dummy placeholders ("Company", "Software Engineer", "University") with null / optional types | M3 | ORIGINAL_REQUEST §R3, medev-security-audit §P2 |
| 17 | Embedding Metadata Versioning | Attach model, version, dimension, and content hash metadata to stored embeddings | M3 | ORIGINAL_REQUEST §R3, medev-security-audit §P2 |
| 18 | Documentation Alignment | Update README.md with accurate stack (TypeScript ~6.0.2, Flyway V1..V29, 278+ tests, openai/gpt-oss-20b) | M3 | ORIGINAL_REQUEST §R3, medev-security-audit §P2 |
| 19 | E2E Opaque-Box Test Suite & Hardening | Pass 100% of E2E test suite (Tiers 1-4) and complete Tier 5 adversarial coverage hardening | M4 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: P0 Critical Security & Concurrency | Features 1 to 6 (SSRF, Redis quota Lua, Plan cache TTL, Match score authority, Profile privacy default, RAG user_id column & index) | none | DONE (424 backend tests pass, 55 frontend tests pass, build 0 errors) |
| 2 | M2: P1 Auth, Billing, Data Privacy & AI | Features 7 to 14 (OAuth GETDEL, Password reset SHA-256 & email, JWT blacklist SHA-256 & DB privilege check, Stripe idempotency table & period sync, Prompt injection delimiters & bounds, Safe resume merge, RAG chunk caching, PII removal from audit logs) | M1 | DONE (446 backend tests pass, 55 frontend tests pass, build 0 errors, audit CLEAN) |
| 3 | M3: P2 Architecture Decoupling & Docs | Features 15 to 18 (WebScraper SRP decomposition, AI fallbacks nulls, Embedding metadata versioning, README update) | M2 | DONE (460 backend tests pass, 55 frontend tests pass, build 0 errors, audit CLEAN) |
| 4 | M4: Final Verification & Adversarial Hardening | Feature 19 (100% pass of E2E test suite, Tier 5 white-box challenger hardening, full gradlew test & npm test/build) | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts

### 1. UrlSecurityValidator
- `void validateUrl(String url) throws IllegalArgumentException`:
  - Validates scheme (`http`, `https`) and port (`80`, `443`, or `-1`).
  - Resolves host via `InetAddress.getAllByName(host)`.
  - Rejects loopback (`127.0.0.0/8`, `::1`), private IPv4/IPv6 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`), link-local (`169.254.0.0/16`, `fe80::/10`), multicast (`224.0.0.0/4`, `ff00::/8`), CGNAT (`100.64.0.0/10`), any local (`0.0.0.0`, `::`).
  - Allows verified domains: `hh.kz`, `hh.ru`, `linkedin.com`, `habr.com`, `career.habr.com`, `indeed.com`.

### 2. AiRateLimiter Lua Contract
- Redis Script: keys = `[ai_limit:<userId>:<date>]`, argv = `[limit, ttlSeconds]`.
- Returns `-1` if `current >= limit`, or new counter value if consumed.

### 3. JobApplication DTOs
- `CreateJobApplicationRequest`: does NOT include `matchScore` or `matchFeedback`.
- `UpdateJobApplicationRequest`: does NOT include `matchScore` or `matchFeedback`.
- `JobApplicationDto`: contains read-only `matchScore` and `matchFeedback`.

### 4. Database Migration V29 (`V29__security_and_architecture_hardening.sql`)
- `ALTER TABLE profiles ALTER COLUMN is_public SET DEFAULT FALSE;`
- `ALTER TABLE vector_store ADD COLUMN IF NOT EXISTS user_id BIGINT;`
- `UPDATE vector_store SET user_id = CAST(metadata->>'userId' AS BIGINT) WHERE metadata IS NOT NULL AND metadata->>'userId' IS NOT NULL;`
- `ALTER TABLE vector_store ADD CONSTRAINT fk_vector_store_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`
- `CREATE INDEX IF NOT EXISTS idx_vector_store_user_id ON vector_store (user_id);`
- `CREATE TABLE IF NOT EXISTS stripe_webhook_events (id BIGSERIAL PRIMARY KEY, event_id VARCHAR(255) NOT NULL UNIQUE, event_type VARCHAR(100) NOT NULL, processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);`
- `CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events (event_id);`

## Code Layout
- Backend Source: `backend/src/main/java/com/medev/`
  - Modules: `auth/`, `profile/`, `tracker/`, `ai/`, `billing/`, `admin/`, `shared/`
- Backend Resources & Migrations: `backend/src/main/resources/db/migration/`
- Backend Tests: `backend/src/test/java/com/medev/`
- Frontend Source: `frontend/src/`
  - FSD slices: `app/`, `pages/`, `features/`, `entities/`, `shared/`
- Frontend Tests: `frontend/src/**/*.test.ts*`
