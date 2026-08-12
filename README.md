# MeDev — Developer Profile & Resume Platform (Production-Ready MVP)

MeDev is a data-first SaaS platform designed for software engineers. 
Stop writing resumes manually. Connect your GitHub account, let the system parse your repositories, and instantly generate beautiful PDF resumes or a public web portfolio. Powered by AI to help you articulate your experience.

## Core Features
- **GitHub & Google Integration (OAuth2)**: One-click login and automated repository import.
- **AI-Powered Profile Generation**: Integrated Groq AI assistant (streaming responses via SSE) to auto-generate project descriptions, experience summaries, and analyze your GitHub stats.
- **AI Resume Parsing (Pro)**: Upload an existing PDF resume, and our AI will extract the data and populate your profile automatically.
- **Resume Generator & Builder**: Export your data to a clean, ATS-friendly PDF resume in one click. Completely customize the order and visibility of your resume sections using a robust data-dense CRM table.
- **Monetization & Quota Management**: Full Stripe Checkout integration for Pro plan upgrades with automated webhook synchronization. Features real-time AI quota tracking and soft upsell flows.
- **Strict Rate Limiting & Security**: Implemented Bucket4j for API abuse prevention, strict CORS policies, JWT type segregation, and secure OAuth2 code-exchange flows (No tokens in URLs).
- **Feature-Sliced Design & UI**: Highly modular frontend architecture following FSD. Features a strict GitHub Dark Mode design system with responsive layouts and global headers.

## 🛠 Technology Stack
### Backend (Modular Monolith)
- **Core**: Java 17, Spring Boot 3.3.0
- **Database & Cache**: PostgreSQL (with Flyway Migrations), Redis (for JWT refresh tokens)
- **Security & Resilience**: Spring Security, OAuth2 Client, Stateless JWT, Bucket4j (Rate Limiting), Resilience4j (Circuit Breaker & Retry)
- **Integrations**: Groq API (AI generation), GitHub/Google API (Auth & Data parsing)
- **Logging & Deploy**: Structured JSON logging (Logstash/MDC), Dockerized for Fly.io

### Frontend (FSD Architecture)
- **Core**: React 19, TypeScript, Vite
- **State & Data**: Zustand (Global state), React Query (Server state)
- **Styling & UI**: Tailwind CSS v4, Lucide React (Icons)
- **Interactions**: Server-Sent Events (SSE) for AI streaming

## 🏗 Architecture
MeDev follows a **Modular Monolith** architecture on the backend, separated into distinct domains (`auth`, `profile`, `github`, `ai`, `portfolio`, `resume`, `billing`). 
The backend acts as a secure proxy for third-party services (Groq, Stripe, GitHub, Google), ensuring that API keys are never exposed to the frontend. Authentication is handled via short-lived JWTs (Access Tokens) and long-lived Refresh Tokens stored in Redis.

## 🚀 Running Locally
### Prerequisites
- JDK 17
- Node.js 20+
- PostgreSQL
- Redis
- Docker (for CRM and infrastructure services via docker-compose)

### Setup (Manual)
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
3. Run the backend: `./gradlew bootRun`
4. Run the frontend: `cd frontend && npm install && npm run dev`

### Setup (Docker Compose)
For local development, you can spin up the entire infrastructure (PostgreSQL, Redis) using the provided Docker Compose file:
```bash
docker-compose up -d
```
Then run the Spring Boot backend and Vite frontend normally.
