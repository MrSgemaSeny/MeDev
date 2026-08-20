# Epic-01-auth: Auth

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Auth |
| **Роли** | USER, ADMIN |
| **Статус** | Done |
| **Миграции** | V1, V11, V14 |
| **Зависит от** | нет зависимостей |
| **Блокирует** | Все остальные эпики |

---

## Зачем этот эпик

Без этого эпика система не может различать пользователей, выдавать квоты и привязывать профиль к аккаунту. Эпик обеспечивает регистрацию, вход (email/пароль + GitHub/Google OAuth2), JWT-сессии, ротацию refresh-токенов и защиту от брутфорса.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-01.1 | Любая | регистрироваться по email/паролю | получить доступ к рабочему пространству | Done |
| US-01.2 | Любая | входить через GitHub или Google OAuth2 | не создавать отдельный пароль | Done |
| US-01.3 | Любая | безопасно хранить сессию | аккаунт не угонят через XSS или кражу токена из URL | Done |
| US-01.4 | Любая | продлевать сессию без повторного логина | не вводить пароль каждые 15 минут | Done |
| US-01.5 | USER | отвязать/привязать GitHub к существующему профилю | импортировать данные без потери профиля | Done |
| US-01.6 | ADMIN | менять роль и план пользователя | управлять доступом и монетизацией | Done |

---

## Out of Scope

- Двухфакторная аутентификация — нет в roadmap
- SSO/SAML — нет

---

## Технические решения

- **Access (15 мин) + refresh (30 дней в Redis)** — короткий TTL снижает риск компрометации, refresh в Redis даёт мгновенный revoke по deviceId.
- **JWT type segregation** — claim `type=access`/`type=refresh`; JwtFilter проверяет тип, refresh нельзя использовать как access.
- **OAuth2 code-exchange через Redis** — короткий `oauth2_code` (5 мин, single-use) обменивается на токены. Закрывает утечку access-токена в URL.
- **HttpOnly + Secure + SameSite=Lax cookie** для refresh — недоступен из JS.
- **AuthRateLimiter (Bucket4j, 20/мин) + RateLimitFilter (5/мин login, 10/час AI-parse)** — IP из `getRemoteAddr()` (не X-Forwarded-For) против спуфинга.
- **Pre-account-creation fix** — парольному юзеру без OAuth при первом OAuth-логине перегенерируется пароль.
- **Reserved usernames** — admin/root/system и т.д. недоступны при регистрации.

---

## Acceptance Criteria

- [x] [US-01.1] Регистрация создаёт пустой профиль, отдаёт access + HttpOnly refresh cookie
- [x] [US-01.2] OAuth2 upsert'ит юзера, привязывает providerId без потери профиля
- [x] [US-01.3] JwtFilter принимает только `type=access`; refresh в Authorization блокируется
- [x] [US-01.4] `/auth/refresh` валидирует refresh в Redis и ротирует
- [x] [US-01.5] Link-flow через `medev_link_jwt` cookie (5 мин) привязывает провайдер
- [x] [US-01.6] `/admin/users/{id}/role|plan` защищены `hasRole('ADMIN')`; self-role-change запрещён

---

## Definition of Done

- [x] Все US из таблицы выше реализованы или явно перенесены в другой эпик с указанием куда
- [x] Flyway-миграции добавлены и проверены на чистой БД
- [x] Smoke/интеграционные тесты покрывают happy path каждой US
- [x] Секреты только в env vars / Fly secrets, не в коде
- [x] Нет raw stack trace в ответах API (ошибки через GlobalExceptionHandler)
- [x] CI/CD pipeline зелёный (все тесты проходят перед деплоем)
- [x] Эпик задеплоен и проверен вручную

---

## Известные ограничения / технический долг

- [INFO] JWT access не имеет blacklist'а — отзыв инвалидирует только refresh. Access живёт до 15-минутного TTL.
- [WARNING] `RateLimitFilter` использует `X-Forwarded-For` (в отличие от AuthRateLimiter/AuthController) — несогласованность IP-резолва, потенциальный обход лимитов за прокси.
- [WARNING] `AdminGuard` на фронте проверяет `username === 'admin'`, а не `role`. Бэкенд-защита корректна, но UI вводит в заблуждение.

---

## Связанные ресурсы

- Миграции: `V1__create_users.sql`, `V11__add_github_oauth_fields.sql`, `V14__add_google_id.sql`
- Контроллер: `backend/src/main/java/com/medev/modules/auth/controller/AuthController.java`
- Сервисы: `AuthService.java`, `CustomOAuth2UserService.java`, `AuthRateLimiter.java`
- Security: `shared/security/SecurityConfig.java`, `JwtFilter.java`, `JwtService.java`
- Тесты: `backend/src/test/java/com/medev/modules/auth/`
- Frontend: `frontend/src/pages/auth/`, `frontend/src/entities/user/model/store.ts`
