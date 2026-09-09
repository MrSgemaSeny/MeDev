# Project: MeDev Mobile Adaptation (SPA & Landing)

## Architecture
- **Monorepo Structure**:
  - `frontend/`: React 19 + Vite + TypeScript + FSD architecture + Tailwind CSS v4 + Zustand + React Query. SPA serving `/`, `/dashboard`, `/resume` (`/builder`), `/tracker`, `/profile/edit`, `/billing`, `/settings`, `/login`, `/register`.
  - `landing/`: Next.js 15 App Router SSG marketing platform serving `/`, `/privacy`, `/terms`, `/refund`.
- **Design System**: Strict GitHub Dark Mode aesthetic (`#0d1117` bg, `#161b22` surface, `#21262d` secondary, `#30363d` border, `#238636` accent). No glassmorphism. No emojis.
- **Mobile Specification (320px - 768px)**:
  - R1: Seamless responsive grid, zero horizontal overflow (`overflow-x: hidden`), scrollable tables with indicators.
  - R2: Mobile navigation (drawer/hamburger, backdrop, body scroll lock, Esc/overlay close, touch targets >= 44x44px).
  - R3: Resume Builder vertical stack (<1024px), A4 preview scaling (`transform: scale(scale)` with ResizeObserver and height compensation), inputs >= 16px to prevent iOS Safari auto-zoom.
  - R4: Native safe-area-inset-top/bottom support (`--sat`, `--sab`), `100dvh` for full-screen drawers and modals.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Landing Viewport & Safe Areas | `viewportFit: 'cover'`, safe-area CSS variables, `overflow-x: hidden`, tap highlight reset | M1 | Survey Landing |
| 2 | Landing Mobile Navigation Drawer | Hamburger button, animated drawer (`100dvh`), backdrop, body scroll lock, touch targets >= 44px, Esc/click close | M1 | Survey Landing |
| 3 | Landing Hero & CTA Anti-Overflow | Responsive CTA button (eliminate 322px overflow), demo window adaptation, resume download flex-col | M1 | Survey Landing |
| 4 | Landing Sections & Footer Ergonomics | Adaptive paddings (p-5 sm:p-8), price line flex-wrap, footer links touch targets >= 36-44px, CookieBanner safe-area | M1 | Survey Landing |
| 5 | Landing Legal Pages Mobile Touch | Back button touch targets >= 44px, break-words headers on 320px | M1 | Survey Landing |
| 6 | Frontend Viewport & Safe Areas | Safe-area utilities in `index.css`, `overflow-x: hidden` on html/body/#root, `100dvh` root height | M2 | Survey Frontend Core |
| 7 | Frontend Form Inputs iOS Auto-Zoom Guard | Input, Textarea, Select `text-[16px] md:text-sm`, min-h-[44px] on mobile to prevent iOS Safari auto-zoom | M2 | Survey Frontend Core |
| 8 | Frontend Base Button Touch Targets | Button sizeClasses ensuring >= 44x44px touch targets on mobile | M2 | Survey Frontend Core |
| 9 | Frontend Mobile Navigation Drawer & Header | `mobileNavStore`, `MobileNavDrawer`, hamburger button in `AppHeader`, hide desktop sidebar `hidden md:flex`, search collapse | M2 | Survey Frontend Core |
| 10 | Frontend App Layout & Base Pages | `AppLayout` responsive padding `p-3 sm:p-4 md:p-6 lg:p-8`, `DashboardPage` responsive stats, `LoginPage`/`RegisterPage`/`SettingsPage`/`PricingPage` adaptation | M2 | Survey Frontend Core |
| 11 | Frontend Modals Mobile Ergonomics | `Modal.tsx`, `UpsellModal.tsx`, `CookieBanner.tsx` safe-area padding, body scroll lock, Esc/backdrop close | M2 | Survey Frontend Core |
| 12 | Resume Builder Mobile Vertical Stack | `< 1024px` switch to `flex-col lg:flex-row`, sections accordion on top, preview on bottom, `/builder` route alias | M3 | Survey Frontend Modules |
| 13 | Resume Builder A4 Preview Scaling | Scale A4 sheet (794x1123px) via `transform: scale(scale)` with ResizeObserver and negative bottom margin compensation | M3 | Survey Frontend Modules |
| 14 | Resume Builder Controls & Touch Targets | Section reorder buttons touch target >= 44x44px, export buttons touch targets | M3 | Survey Frontend Modules |
| 15 | Job Tracker Mobile Adaptation | Adaptive header, fix touch `:hover` bug (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`), touch targets >= 44px | M3 | Survey Frontend Modules |
| 16 | AI Chat Widget Mobile Drawer/Fullscreen | Fullscreen `100dvh` modal/drawer on `< 640px`, safe-area insets, input `text-[16px]`, touch targets >= 44px | M3 | Survey Frontend Modules |
| 17 | Profile Editor Mobile Tabs & Form Grids | Horizontal scrollable chips/tabs for sections navigation, grid-cols-1 sm:grid-cols-2, Edit/Delete touch targets >= 44px | M3 | Survey Frontend Modules |
| 18 | Data Tables Mobile Scroll Indicators | Scrollable containers with visual fade/gradient indicator for admin audit and user tables | M3 | Survey Frontend Modules |
| 19 | Quality Gates & Comprehensive E2E Verification | `landing` build pass, `frontend` test & build pass, viewport checks (320px, 360px, 375px, 390px, 412px, 768px) | M4 | Quality Gate |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Landing Mobile Adaptation | Complete mobile adaptation of `landing/` (Header drawer, Hero/CTA anti-overflow, layout safe-areas, footer touch targets) | none | IN_PROGRESS |
| M2 | Frontend Core & Navigation | Mobile adaptation of `frontend/` shell, layout, `MobileNavDrawer`, `AppHeader`, `Input`/`Form` 16px auto-zoom guard, `Button` 44px touch targets, base pages | none | IN_PROGRESS |
| M3 | Frontend Complex Modules | Resume Builder vertical stack & A4 scaling, Job Tracker touch hover fix, AI Chat Widget fullscreen, Profile Editor mobile tabs, Data Tables | M2 | PLANNED |
| M4 | Quality Gates & Final Verification | Full build & test passes (`npm test`, `npm run build` on both landing and frontend), viewport integrity audit | M1, M2, M3 | PLANNED |

---

## Interface Contracts

### `frontend` Mobile Nav Contract
- **Store**: `useMobileNavStore` in `frontend/src/widgets/sidebar/model/mobileNavStore.ts`
  - `isOpen: boolean`
  - `open: () => void`
  - `close: () => void`
  - `toggle: () => void`
- **Integration**:
  - `AppHeader.tsx` triggers `toggle()` via hamburger button.
  - `MobileNavDrawer.tsx` subscribes to `isOpen`, renders drawer, calls `close()` on link click, Esc key, backdrop click.
  - `AppLayout.tsx` mounts `<MobileNavDrawer />`.

### Resume Builder Scaling Contract
- **Base Dimensions**: Fixed virtual A4 sheet $W = 794px$, $H = 1123px$.
- **Scaling Formula**: $scale = \min(1, \frac{W_{container} - padding}{794})$.
- **Height Compensation**: `marginBottom: -${(1 - scale) * 1123}px` with container `overflow: hidden`.

---

## Code Layout & File Ownership Boundaries

### M1 (Landing Track) Exclusive Ownership:
- `landing/app/layout.tsx`
- `landing/app/globals.css`
- `landing/components/Header.tsx`
- `landing/components/Hero.tsx`
- `landing/components/Features.tsx`
- `landing/components/TemplatesShowcase.tsx`
- `landing/components/Pricing.tsx`
- `landing/components/Faq.tsx`
- `landing/components/Cta.tsx`
- `landing/components/Footer.tsx`
- `landing/components/CookieBanner.tsx`
- `landing/app/privacy/page.tsx`
- `landing/app/terms/page.tsx`
- `landing/app/refund/page.tsx`

### M2 (Frontend Core Track) Exclusive Ownership:
- `frontend/src/index.css`
- `frontend/src/shared/ui/Input.tsx`
- `frontend/src/shared/ui/Form.tsx`
- `frontend/src/shared/ui/Button.tsx`
- `frontend/src/shared/ui/Modal.tsx`
- `frontend/src/shared/ui/UpsellModal.tsx`
- `frontend/src/shared/ui/CookieBanner.tsx`
- `frontend/src/widgets/sidebar/model/mobileNavStore.ts` (new)
- `frontend/src/widgets/sidebar/MobileNavDrawer.tsx` (new)
- `frontend/src/widgets/sidebar/AppSidebar.tsx`
- `frontend/src/widgets/header/AppHeader.tsx`
- `frontend/src/widgets/header/UserProfileDropdown.tsx`
- `frontend/src/app/layouts/AppLayout.tsx`
- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/auth/RegisterPage.tsx`
- `frontend/src/pages/dashboard/DashboardPage.tsx`
- `frontend/src/pages/settings/SettingsPage.tsx`
- `frontend/src/pages/billing/PricingPage.tsx`

### M3 (Frontend Complex Modules Track) Exclusive Ownership:
- `frontend/src/app/router/AppRouter.tsx`
- `frontend/src/widgets/resume-builder/ResumeBuilder.tsx`
- `frontend/src/pages/tracker/JobTrackerPage.tsx`
- `frontend/src/features/ai-assistant/ui/AiChatWidget.tsx`
- `frontend/src/widgets/profile-editor/ProfileEditor.tsx`
- `frontend/src/features/profile/sections/AboutSection.tsx`
- `frontend/src/features/profile/sections/ExperienceSection.tsx`
- `frontend/src/features/profile/sections/EducationSection.tsx`
- `frontend/src/features/profile/sections/SkillsSection.tsx`
- `frontend/src/features/profile/sections/LanguagesSection.tsx`
- `frontend/src/pages/admin/AdminAuditPage.tsx`
- `frontend/src/pages/admin/AdminUsersPage.tsx`

*Zero file overlap between M1, M2, and M3.*
