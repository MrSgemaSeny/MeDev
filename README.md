# MeDev

MeDev is a data-first SaaS platform designed for software engineers. It automates the creation of professional resumes and portfolios by analyzing GitHub activity, repositories, and technical contributions. 

By integrating with GitHub and utilizing an AI-driven approach, MeDev extracts the core architectural decisions and technical depth of a developer's work, transforming raw code statistics into compelling, ATS-friendly PDF resumes and public web portfolios.

## Core Features

- **GitHub & Google Integration (OAuth2)**
  Secure authentication and automated repository synchronization.
- **AI-Powered Profile Generation**
  Integrated AI assistant (streaming responses via SSE) designed specifically with a Senior Engineer persona to evaluate GitHub statistics, deduce architectural complexity, and auto-generate high-impact project descriptions.
- **AI Resume Parsing (Pro)**
  Automated extraction of existing PDF resumes. The backend utilizes a Smart Merge algorithm to intelligently combine imported text with active GitHub data without data loss or hallucination.
- **Resume Generator & Builder**
  A robust CRM-style table interface allowing fine-grained control over the visibility and ordering of profile sections. Exports to clean, ATS-optimized PDF formats.
- **Monetization & Quota Management**
  Stripe Checkout integration for Pro tier upgrades, including automated webhook synchronization for downgrades and real-time AI quota tracking with soft upsell flows.
- **Strict Rate Limiting & Security**
  API abuse prevention via Bucket4j, strict CORS policies, JWT type segregation, and secure OAuth2 code-exchange flows to prevent token leakage.
- **Feature-Sliced Design & UI**
  Highly modular frontend architecture (FSD). The UI features a strict dark mode design system, responsive layouts, and centralized state management.

## Technology Stack

### Backend (Modular Monolith)
- **Core**: Java 17, Spring Boot 3.3.0
- **Database & Cache**: PostgreSQL (with Flyway Migrations), Redis (for JWT refresh tokens and caching)
- **Security & Resilience**: Spring Security, OAuth2 Client, Stateless JWT, Bucket4j (Rate Limiting), Resilience4j (Circuit Breaker & Retry)
- **Integrations**: Groq API (AI generation), GitHub/Google API (Auth & Data parsing), Stripe API (Billing)
- **Logging & Deploy**: Structured JSON logging (Logstash/MDC), Dockerized for Fly.io

### Frontend (FSD Architecture)
- **Core**: React 19, TypeScript, Vite
- **State & Data**: Zustand (Global state), React Query (Server state)
- **Styling & UI**: Tailwind CSS v4, Lucide React
- **Interactions**: Server-Sent Events (SSE) for AI streaming

## Architecture

MeDev follows a Modular Monolith architecture on the backend, separated into distinct domains (`auth`, `profile`, `github`, `ai`, `portfolio`, `resume`, `billing`). 

The backend acts as a secure proxy for third-party services (Groq, Stripe, GitHub, Google), ensuring that API keys are never exposed to the frontend client. Authentication is handled via short-lived JWT Access Tokens and HttpOnly Refresh Tokens stored and validated against Redis.

## Running Locally

### Prerequisites
- JDK 17
- Node.js 20+
- PostgreSQL
- Redis
- Docker (optional, for infrastructure services via docker-compose)

### Local Development Setup

1. Clone the repository.
2. Set up environment variables for the backend:
   ```env
   DATABASE_URL=jdbc:postgresql://localhost:5432/medev
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=postgres
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your_256_bit_secret
   GROQ_API_KEY=your_groq_api_key
   GITHUB_CLIENT_ID=your_oauth_client_id
   GITHUB_CLIENT_SECRET=your_oauth_client_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   STRIPE_API_KEY=your_stripe_api_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_PRO_PRICE_ID=your_stripe_price_id
   ```
3. Run the backend: 
   ```bash
   ./gradlew bootRun
   ```
4. Run the frontend: 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Compose Environment

For local development, the entire infrastructure (PostgreSQL, Redis) and the application itself can be orchestrated using Docker Compose.

```bash
docker-compose up -d
```
