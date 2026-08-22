# MeDev

> Data-First AI SaaS Platform for Software Engineers

[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/MrSgemaSeny/MeDev/ci.yml?branch=main&style=flat-square&label=CI%2FCD)](https://github.com/MrSgemaSeny/MeDev/actions)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-253%20passed-brightgreen?style=flat-square&logo=junit5)](backend)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-37%20passed-brightgreen?style=flat-square&logo=vitest)](frontend)
[![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

MeDev automates career management, resume generation, and technical portfolio hosting by using GitHub activity as the primary Source of Truth. 

By analyzing repository topologies, commit distributions, language byte densities, and architectural decisions, MeDev transforms raw engineering data into ATS-optimized resumes, live portfolio web pages, and tailored job applications without LLM hallucinations.

---

## Architecture Overview

```
                          +------------------------------------------+
                          |           Client Tier (React 19)         |
                          |  FSD Architecture / Zustand / Vite / SSE |
                          +--------------------+---------------------+
                                               |
                                       HTTPS / WSS / REST
                                               |
+----------------------------------------------v-----------------------------------------------+
|                               Spring Boot 3.3 Modular Monolith                               |
|                                                                                              |
|  [ Auth Module ]       [ Profile Module ]    [ Resume Module ]    [ Job Tracker Module ]     |
|  - JWT Type Segreg     - Drag-n-Drop Sort    - 6 HTML/PDF Themes  - CRM List & Kanban        |
|  - OAuth2 Exchange     - Smart Merge Logic   - Flying Saucer A4   - URL Scraping (Anti-SSRF) |
|  - Refresh in Redis    - Pessimistic Locks   - Live HTML Preview  - AI Job Matching Score    |
|                                                                                              |
|  [ GitHub Module ]     [ AI Core Module ]    [ Portfolio Module ] [ Billing & Audit Module ] |
|  - GraphQL Stats       - Groq LLM Proxy      - Public /:username  - Stripe & Kaspi Webhooks  |
|  - README Tech Parser  - Reactive SSE Stream - Schema.org Person  - Redis Idempotency Locks  |
|  - Commit Chronology   - PII Masker / Tokens - OG & Twitter Cards - Async Audit Logging      |
+-----------------------+----------------------+--------------------+--------------------------+
                        |                      |                    |
        +---------------+                      +-------+            +---------------+
        |                                              |                            |
+-------v-------+                              +-------v-------+            +-------v-------+
|  PostgreSQL   |                              |  Redis Cache  |            |   Groq API    |
|  Flyway (V24) |                              |  Tokens / Rate|            | gpt-oss-20b   |
|  AES-256 GCM  |                              |  Limit Quotas |            |  SSE Streaming|
+---------------+                              +---------------+            +---------------+
```

---

## Key Capabilities

### 1. GitHub as Single Source of Truth
- Automatic calculation of actual years of experience based on first commit timestamps and language byte densities.
- Extraction of production technologies from repository `README.md` files and dependency configurations.
- Identification of engineering organizations and automated population of employment history.

### 2. Smart AI Sync & Zero-Loss PDF Import
- PDF resume text extraction via PDFBox with client-side and server-side magic byte validation (`%PDF-`) and leak-free resource management.
- Automated PII masking (phones, emails, national ID numbers) prior to upstream LLM transmission while strictly preserving technical skill tags.
- Deterministic merge algorithm that prioritizes verified GitHub commits for technical skills while preserving verified PDF dates and corporate credentials.

### 3. World-Class Resume Design Engine
- **6 Distinct Aesthetic Themes**:
  - `clean`: Recruiter Classic / ATS-friendly clean layout with high density.
  - `github`: Monospaced GitHub Dark / Developer-first terminal aesthetic.
  - `apple-modern`: Minimalist light design with bold typography.
  - `grok-monolith`: Dark Bento Grid layout with masonry arrangement.
  - `milky-soft`: Clean editorial style optimized for readability.
  - `phub-orange`: High-contrast poster layout with accent branding.
- **Dual Engine Output & Single-Page Fit**:
  - Instantaneous Live HTML preview with native web fonts and fixed A4 sheet container.
  - Exact A4 PDF export powered by Flying Saucer + PDFBox with embedded Roboto fonts for flawless Cyrillic glyph support and single-page / multi-page toggle.

### 4. Job Tracker CRM & AI Matcher
- Dual-view interface: Kanban Board with `@dnd-kit` drag-and-drop state management and dense CRM data table.
- Anti-SSRF protected scraper for HeadHunter (hh.ru / hh.kz) and LinkedIn job vacancies.
- Real-time Match Score calculation comparing candidate capabilities against recruiter requirements with missing skill gap identification.

### 5. GitHub Profile README Generator
- Generates dynamic Markdown for `github.com/username/username` profile repositories.
- 3 Layout Options: Full Stats with dynamic badges, Minimalist Clean, and Cyberpunk ASCII Banner.

### 6. Public Portfolio & SEO
- Vanity URL routing (`/:username` and `/p/:username`) for instant developer web presence.
- Fully populated OpenGraph, Twitter Cards, and Schema.org `Person` JSON-LD metadata for search engine indexing.

---

## Security & Reliability Model

- **Row-Level IDOR Protection**: All mutations resolve identity strictly through `SecurityUtils.getCurrentUserId()` extracted from cryptographically signed JWT access tokens.
- **Token Security**:
  - Short-lived Access Tokens (15 min) with explicit `type=access` segregation.
  - Refresh tokens stored exclusively in Redis (`refresh:{userId}:{deviceId}`) and transmitted via `HttpOnly`, `SameSite=Lax` cookies.
  - Short-lived, single-use `oauth2_code` exchange pattern in Redis to prevent token leaks in browser URL histories.
- **Data-at-Rest Encryption**: Sensitive third-party credentials (GitHub tokens) are encrypted in PostgreSQL using **AES-256 GCM** with per-record 12-byte random IVs and dual-key rotation fallback support (`EncryptedStringConverter` + `EncryptionUtils`).
- **Concurrency & Transaction Isolation**: Pessimistic write locking (`findByUserIdForUpdate`) on all profile mutation flows to prevent race conditions.
- **Billing Idempotency & Signature Verification**: Constant-time HMAC-SHA256 webhook signature verification with distributed Redis lock release for Stripe and Kaspi Pay.
- **Audit Logging & Accounting**: Live token tracking via `AiUsageRepository` and asynchronous action auditing (`AuditService.logAction`) for auth, billing, and admin events.
- **Distributed Rate Limiting**: Redis-backed sliding window rate limiters (Bucket4j) protecting against credential brute-forcing and AI quota abuse.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | Spring Boot 3.3.0 / Java 17 | Core Modular Monolith API |
| **Security** | Spring Security 6, JJWT | Stateless authentication, OAuth2, RBAC, AES-256-GCM |
| **Persistence** | PostgreSQL 16, Flyway (V24) | Schema validation, relational data, pgvector |
| **Cache & In-Memory** | Redis 7, Lettuce | Distributed rate-limiting, session tokens, idempotency locks |
| **AI Integration** | Groq API (openai/gpt-oss-20b) | Reactive SSE streaming, structured JSON, token accounting |
| **Document Processing**| Thymeleaf, Flying Saucer, PDFBox | Leak-free PDF & HTML rendering, Cyrillic font embedding |
| **Frontend Framework** | React 19, Vite, TypeScript | Single Page Application |
| **State Management** | Zustand (Persistent), React Query | Client state & asynchronous server state |
| **Architecture** | Feature-Sliced Design (FSD) | Scalable modular directory structure |
| **Styling** | Tailwind CSS v4 | Strict GitHub Dark Mode design system |
| **Testing** | Vitest, Testing Library, JUnit 5, MockMvc, Testcontainers | 290 total automated tests (100% green) |

---

## Getting Started

### Prerequisites
- JDK 17+
- Node.js 20+
- Docker & Docker Compose

### 1. Instant Launch via Docker Compose

```bash
# Clone the repository
git clone https://github.com/MrSgemaSeny/MeDev.git
cd MeDev

# Spin up full stack (PostgreSQL, Redis, Backend, Frontend)
docker-compose up --build -d
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
- API Health Endpoint: `http://localhost:8080/api/actuator/health`

### 2. Manual Development Setup

#### Backend
```bash
cd backend

# Ensure PostgreSQL and Redis are running locally, then:
./gradlew bootRun
```

#### Frontend
```bash
cd frontend

# Install dependencies and start Vite dev server
npm install
npm run dev
```

---

## Environment Variables

### Backend Configuration (`application-prod.yml`)

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/medev
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_minimum_256_bit_secure_jwt_secret_key
ENCRYPTION_SECRET=your_32_character_encryption_key_gcm
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### Frontend Configuration (`.env`)

```env
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Test Suite Execution

```bash
# Run backend integration & unit tests (253 tests)
cd backend
./gradlew test

# Run frontend unit & component tests (37 tests)
cd frontend
npm test
```

---

## Documentation & Architecture Records

- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Deployment Runbook](docs/DEPLOYMENT.md)
- [Strategic Epics & Roadmap](docs/EPICS.md)
- [Architectural Decision Records (ADR-001..010)](docs/ADR.md)
- [Security Audit & Hardening Report](docs/SECURITY_AUDIT.md)
- [Production Runbook](docs/RUNBOOK.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.