# Current Project Context

## Status
- **Project Stage**: Minimal MVP (Completed Phase 2 & 3)
- **Latest Work**:
  - Implemented GitHub OAuth2 via Spring Security and `spring-boot-starter-oauth2-client` (removed legacy PAT-based token approach).
  - Integrated `useAiGenerate` custom React hook using Server-Sent Events (SSE) to stream Groq API AI generation directly into text fields (Summary, Projects, Experience).
  - Cleaned up the `DashboardPage` to remove fake hardcoded analytics.
  - Stabilized frontend and backend interactions.
  - Successfully deployed all core features locally.

## Next in Backlog
- CI/CD Setup: GitHub Actions for building, testing, and preventing failing PRs/pushes.
- GlobalExceptionHandler improvements (`@Valid`, `MaxUploadSizeExceeded`).
- Bucket4j Rate Limiting for AI endpoints to prevent abuse.
- Fly.toml and GitHub Pages deployment configuration.
