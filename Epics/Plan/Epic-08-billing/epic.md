# Epic-08-billing: Billing & Payments

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Billing |
| **Роли** | USER, ADMIN |
| **Статус** | Partial |
| **Миграции** | V8, V10, V22, V23 |
| **Зависит от** | Epic-01, Epic-02 |
| **Блокирует** | Epic-05 (PRO features) |

---

## Зачем этот эпик

Биллинг — монетизация: Stripe (международные) + Kaspi Pay (казахстанский рынок). Без этого эпика нет PRO-плана, нет gate для cover-letter/tailor, нет revenue.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-08.1 | USER | оформить PRO через Stripe Checkout | получить PRO-фичи | Done |
| US-08.2 | USER | авто upgrade/downgrade через webhook | не ждать ручного подтверждения | Done |
| US-08.3 | USER | оплатить PRO на N месяцев через Kaspi Pay | платить локальным способом | Planned |
| US-08.4 | USER | видеть текущий план | понимать доступные фичи | Done |
| US-08.5 | ADMIN | менять план вручную | компенсировать/тестировать | Done |
| US-08.6 | PRO | проходить `assertPro` gate | получать за что заплатил | Done |

---

## Out of Scope

- Авто-напоминания об оплате — нет
- PDF-инвойсы Kaspi — нет

---

## Технические решения

- **`StripeService`** — Checkout (SUBSCRIPTION), metadata `userId`. Webhook: checkout.session.completed (upgrade), subscription.deleted/updated (downgrade), invoice.payment_failed (downgrade).
- **`KaspiPayService` (mock)** — ссылка с `orderId={userId}_{months}`. HMAC-SHA256 webhook (constant-time).
- **`SubscriptionService.assertPro`** — gate для PRO-фич; проверяет план + `subscriptionExpiresAt`.
- **`stripeCustomerId`/`kaspiCustomerId`** — связка для webhook-резолва.

---

## Acceptance Criteria

- [ ] [US-08.1] `POST /v1/billing/checkout` → Stripe URL
- [ ] [US-08.2] Webhook авто-upgrade/downgrade по `stripeCustomerId`
- [ ] [US-08.3] `POST /v1/billing/checkout/kaspi` — mock-ссылка
- [ ] [US-08.4] `GET /v1/billing/status` → plan
- [ ] [US-08.5] `PUT /admin/users/{id}/plan`
- [ ] [US-08.6] `assertPro` → 403 для FREE

---

## Definition of Done

- [ ] Все US из таблицы выше реализованы или явно перенесены в другой эпик с указанием куда
- [ ] Flyway-миграции добавлены и проверены на чистой БД
- [ ] Smoke/интеграционные тесты покрывают happy path каждой US
- [ ] Секреты только в env vars / Fly secrets, не в коде
- [ ] Нет raw stack trace в ответах API (ошибки через GlobalExceptionHandler)
- [ ] CI/CD pipeline зелёный (все тесты проходят перед деплоем)
- [ ] Эпик задеплоен и проверен вручную

---

## Известные ограничения / технический долг

- [WARNING] Kaspi `orderId={userId}_{months}` — user-controlled. При скомпрометированном `secretKey` — privilege escalation любого userId до PRO.
- [WARNING] Stripe не ставит `subscriptionExpiresAt` (бессрочно до cancel). `assertPro` проверяет expiry только если `!= null`. Stripe-PRO и Kaspi-PRO — несогласованная модель.
- [WARNING] Stripe webhook без idempotency-key — replay обработается повторно (идемпотентен по плану, но шумно).
- [INFO] Мёртвая таблица `subscriptions` (V8) — план в `users.plan`.
- [INFO] Kaspi — mock.

---

## Связанные ресурсы

- Миграции: `V8` (мёртвая), `V10`, `V22`, `V23`
- Контроллер: `modules/billing/controller/BillingController.java`
- Сервисы: `StripeService.java`, `KaspiPayService.java`, `SubscriptionService.java`
- Тесты: `backend/src/test/java/com/medev/modules/billing/`
- Frontend: `frontend/src/pages/billing/`, `features/billing/`
