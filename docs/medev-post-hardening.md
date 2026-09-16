# MeDev — Ожидаемое состояние после hardening

**Условие:** закрыты все P0/P1 из audit v2.0. Ни одна новая фича не добавлена.

---

## Что меняется по областям

| Область              | Сейчас                            | После                                      |
|----------------------|-----------------------------------|--------------------------------------------|
| SSRF                 | Защита не выполняется             | Allowlist + валидация каждого redirect     |
| AI quota             | Race condition, лимит не жёсткий  | Атомарная операция, лимит гарантированный  |
| Plan cache           | До 15 мин окно неверных прав      | Инвалидация при любом изменении плана      |
| OAuth code           | Race window при двух запросах     | GETDEL — атомарно                          |
| Password reset       | Токен в plaintext, email не уходит| Хеш в Redis, delivery реализован           |
| Match score          | Клиент пишет AI-значение          | Server-owned field                         |
| Profile privacy      | Публичный по умолчанию            | Приватный по умолчанию, явный opt-in       |
| Stripe idempotency   | Redis TTL 24ч, потом теряется     | Persistent DB record, unique constraint    |
| Subscription dates   | `now + 1 month` локально          | `current_period_end` из Stripe             |
| RAG isolation        | JSON metadata, хрупко             | `user_id BIGINT NOT NULL`, индекс          |
| RAG reindex          | Полная пересборка при любом update| Content hash per chunk, инкрементально     |
| Prompt injection     | Job description как часть промпта | Явное разделение: instruction vs data      |
| AI input limits      | Отсутствуют                       | Централизованная политика по символам      |
| Profile import       | Destructive overwrite              | Diff + подтверждение пользователем         |
| Audit log            | Plaintext email в логах           | Structured events без PII                  |
| JWT blacklist key    | Полный JWT как ключ               | `jti` или hash                             |
| Embedding versioning | Отсутствует                       | `model`, `version`, `dimension` в metadata |

---

## Что hardening не изменит

Следующие проблемы после P0/P1 sprint **останутся открытыми** — это важно понимать:

- `WebScraperService` — God Service, тестируемость низкая. Требует декомпозиции.
- AVG embedding как profile vector — математически спорный heuristic, не станет точнее.
- AI fallback placeholder-строки (`"Company"`, `"University"`) — нужен отдельный pass.
- README расходится с кодом — нужна ручная синхронизация.
- Negative/concurrency/security test suite — пока не существует.

---

## Что нужно проверить тестами, а не верить на слово

После hardening эти сценарии должны покрываться тестами — иначе "исправлено" это только на словах:

**Concurrency:**
- Два параллельных AI запроса при quota = limit — только один проходит.
- Два параллельных OAuth code exchange — только один успешен.

**Security / IDOR:**
- User A пытается читать/изменять JobApplication User B → 403.
- User A пытается получить RAG-результаты User B → пусто или 403.
- ADMIN endpoint с USER токеном → 403.
- SSRF: `http://127.0.0.1`, `http://169.254.169.254`, `http://10.0.0.1` → отклонено до соединения.

**Billing:**
- Webhook с одним event_id обрабатывается ровно один раз при двух параллельных delivery.
- Downgrade плана → AI quota немедленно снижается (не через 15 мин).

**Auth:**
- Logout → refresh token больше не работает.
- Использованный refresh token не принимается повторно.
- Password reset token использован → второй использование отклонено.

**AI:**
- Job description > N символов → 400 до LLM-вызова.
- Profile import предлагает diff, не применяет сразу.

---

## Корректная формулировка проекта после hardening

До:

> "Приложение с AI для резюме и поиска работы"

После:

> "Модульный full-stack SaaS: profile/resume management, GitHub import, AI/RAG pipeline, job tracking с парсингом вакансий, Stripe/Kaspi billing, OAuth2, production-oriented security."

Это другой уровень не потому что добавлены фичи — а потому что закрыты дыры, которые делали существующие фичи ненадёжными.

---

## Что даёт больше, чем ещё 30 фич

```
Production hardening pass
  ├── Security (P0/P1 из audit)
  ├── Concurrency (atomic ops, cache invalidation)
  ├── Data integrity (diff/confirm, server-owned fields)
  ├── Observability (structured logs, метрики)
  ├── Negative/security test suite
  ├── Deployment (S3 для файлов, DB backups)
  └── Documentation (README = код, не wishlist)
```

После этого — осмысленный старт фазы 2 (Vector Job Match Engine).  
До этого — фаза 2 строится на нестабильном основании.
