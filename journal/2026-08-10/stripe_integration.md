# Stripe Integration (Phase 4)

- Внедрен Stripe (Checkout Sessions и Webhooks).
- Написана миграция `V10` для добавления `stripe_customer_id` к `User`.
- Написаны Frontend-маршруты `/pricing`, `/billing/success`, `/billing/cancel`.
- Обновлен Zustand store для поддержки тарифа PRO.
- Исправлен баг `dnd-kit` с улетающим элементом при Drag&Drop.
- Исправлен баг сборки Frontend (в `DashboardPage.tsx` был незакрыт `useEffect`).
- Исправлен баг в тестах Backend (`ProfileServiceTest.java` и дубликат `AuthServiceTest.java`).
- Backend-тесты и Frontend-сборка успешно пройдены.
