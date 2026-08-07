# MeDev

MeDev is a data-first platform for developers.
Create your profile once and use it everywhere. Connect your GitHub account, upload your old resume, and let MeDev build a unified, structured profile for you. 

## Features
- **Public Portfolio Page**: A beautiful, shareable profile page (e.g. medev.app/username).
- **Automated Data Sync**: Connect GitHub to automatically fetch your repositories, languages, and activity.
- **Resume Generator**: Export your profile into multiple clean, professional PDF templates.
- **Drag-and-Drop Builder**: Completely customize the order and visibility of your resume sections.

## Technology Stack
- **Backend**: Java 17, Spring Boot 3, PostgreSQL, Flyway, Redis.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Query (Feature-Sliced Design architecture).
- **Infrastructure**: Fly.io (Backend), GitHub Pages (Frontend), Stripe & Kaspi Pay.

## Architecture
Modular monolith on the backend with a clear separation of concerns (Auth, Profile, GitHub, Resume, Portfolio, Billing). JWT based authentication. The frontend relies on `dnd-kit` for complex drag-and-drop interactions.
