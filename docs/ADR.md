# Architecture Decision Records (ADR) — MeDev

This document records the architectural and security decisions made in MeDev, their context, rationale, and trade-offs.

---

## ADR-001: Modular Monolith Architecture for Backend
- **Status**: Accepted
- **Context**: MeDev requires rapid feature iteration across auth, profile, AI sync, job tracking, and resume generation with a small engineering team.
- **Decision**: Organize the Spring Boot backend as a Modular Monolith with strict domain boundary packages (`auth`, `profile`, `github`, `ai`, `resume`, `jobtracker`, `billing`).
- **Consequences**:
  - *Positive*: Single deployment unit, zero distributed transaction overhead, easy local development, shared PostgreSQL transactional boundaries.
  - *Trade-off*: Must enforce package visibility to prevent cross-domain coupling (no direct database table joins across modules).

---

## ADR-002: Stateless Access JWT + Redis Refresh Tokens
- **Status**: Accepted
- **Context**: Secure authentication required with support for instant revocation, multi-device sessions, and OAuth2 callback security.
- **Decision**: 
  - Short-lived Access Tokens (15 min) with explicit `type=access` segregation.
  - Refresh Tokens stored exclusively in Redis (`refresh:{userId}:{deviceId}`) and transmitted via `HttpOnly`, `SameSite=Lax` cookies.
  - Single-use short-lived `oauth2_code` exchange pattern in Redis (60s TTL) to prevent access token leaks in browser navigation history.
- **Consequences**:
  - *Positive*: High throughput for API calls, instant session termination upon logout, zero token leakage in URL query parameters.

---

## ADR-003: AES-256 GCM Database Encryption with Key Rotation
- **Status**: Accepted
- **Context**: Sensitive user credentials (GitHub OAuth access tokens) must be stored at rest in PostgreSQL. Legacy AES/ECB was deprecated due to pattern leakage vulnerabilities.
- **Decision**: Implement `EncryptedStringConverter` using AES-256 in Galois/Counter Mode (GCM) with a cryptographically secure 12-byte random IV prepended to each cipher block, 128-bit authentication tag, and dual-key rotation fallback via `EncryptionUtils`.
- **Consequences**:
  - *Positive*: Industry-standard authenticated encryption, tamper detection, zero pattern leakage, seamless zero-downtime key rotation.

---

## ADR-004: Dual-Engine Resume Rendering (HTML Preview + PDF Export)
- **Status**: Accepted
- **Context**: Users demand instantaneous, interactive live previews in the browser while generating exact printable A4 PDF documents.
- **Decision**:
  - Engine 1 (Interactive): Pure HTML/CSS rendered directly inside an isolated iframe with web fonts.
  - Engine 2 (PDF Export): Thymeleaf + Flying Saucer XML/XHTML renderer with embedded Roboto TrueType fonts for Cyrillic support.
  - *Future Roadmap*: Migrate PDF backend to Headless Chromium (Gotenberg container) for complete CSS Grid / Flexbox parity.
- **Consequences**:
  - *Positive*: Sub-50ms live preview response, zero headless browser RAM overhead on standard MVP tier.

---

## ADR-005: Backend Proxy with PII Redaction for AI Streaming
- **Status**: Accepted
- **Context**: Groq API key must never be exposed to the client, and candidate PII must be protected before sending prompts to third-party LLMs.
- **Decision**: All AI interactions route through `AiController` via Server-Sent Events (SSE). Incoming profile data is scrubbed using `PiiMasker` (regex filters for SSN/national IDs, phone numbers, emails, physical addresses).
- **Consequences**:
  - *Positive*: Zero secret leakage, GDPR/privacy compliance, real-time streaming UX, server-side quota enforcement in Redis.

---

## ADR-006: Feature-Sliced Design (FSD) for Frontend
- **Status**: Accepted
- **Context**: Scalable React 19 frontend codebase requiring clear separation of concerns across widgets, features, entities, and shared utilities.
- **Decision**: Adopt Feature-Sliced Design (FSD) architecture: `app/` -> `pages/` -> `widgets/` -> `features/` -> `entities/` -> `shared/`.
- **Consequences**:
  - *Positive*: Predictable dependency direction (layers only import from lower layers), high component reusability, decoupled domain stores.