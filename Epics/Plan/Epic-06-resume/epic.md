# Epic-06-resume: Resume Generator

## Мета

| Поле | Значение |
|---|---|
| **Домен** | Resume |
| **Роли** | USER (FREE/PRO) |
| **Статус** | Done |
| **Миграции** | V2 (no new) |
| **Зависит от** | Epic-02 |
| **Блокирует** | ничего |

---

## Зачем этот эпик

PDF/HTML резюме — главный исходящий артефакт. Без этого эпика профиль нельзя скачать в ATS-friendly формате; продукт теряет смысл.

---

## Пользовательские истории

| ID | Роль | Хочу | Чтобы | Статус |
|---|---|---|---|---|
| US-06.1 | USER | сгенерировать PDF по шаблону | отправить резюме рекрутеру | Done |
| US-06.2 | USER | видеть live-preview в HTML | видеть что скачаю | Done |
| US-06.3 | USER | выбрать шаблон (5 вариантов) | адаптировать стиль | Done |
| US-06.4 | USER | выбрать 1-страница / мульти | вместить на один лист | Done |
| US-06.5 | FREE | иметь дневной лимит с upsell | не абузить генерацию | Done |
| US-06.6 | PRO | генерировать без лимита | откликаться массово | Done |

---

## Out of Scope

- PRO-only шаблоны — заблокированы логикой contains('pro'), см. долг

---

## Технические решения

- **Thymeleaf + Flying Saucer (iTextRenderer)** — HTML→PDF; шрифты из classpath в temp-файлы.
- **5 шаблонов** — apple-modern, github, grok-monolith, milky-soft, phub-orange; независимые DOM.
- **`GET /v1/resume/html/{template}`** — мгновенный preview без PDF-рендера.
- **Квота `PdfGeneratorService`** — Redis, 50 PDF/день FREE, безлимит PRO.
- **Avatar base64-embed** — фетч с github.com и встраивание.

---

## Acceptance Criteria

- [x] [US-06.1] `GET /v1/resume/generate/{template}` → application/pdf
- [x] [US-06.2] `GET /v1/resume/html/{template}` → text/html
- [x] [US-06.3] 5 шаблонов
- [x] [US-06.4] `?singlePage=true` → CSS `.single-page`
- [x] [US-06.5] `checkGenerationLimit` → TooManyRequestsException для FREE
- [x] [US-06.6] PRO обходит лимит

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

- [WARNING] `ResumeController` PRO-проверка инвертирована: `if (template.contains('pro')) throw` — блокирует шаблоны С 'pro' для ВСЕХ. Должно: блокировать если юзер НЕ PRO. Шаблоны с 'pro' недоступны.
- [INFO] Flying Saucer не поддерживает CSS3 (flex/grid) — CSS 2.1.
- [INFO] `phub-orange` PDF не поддерживает text rotation.

---

## Связанные ресурсы

- Контроллер: `modules/resume/controller/ResumeController.java`
- Сервис: `modules/resume/service/PdfGeneratorService.java`
- Шаблоны: `backend/src/main/resources/templates/resume/`, `templates/resume-html/`
- Шрифты: `backend/src/main/resources/fonts/`
- Тесты: `backend/src/test/java/com/medev/modules/resume/`
- Frontend: `frontend/src/pages/resume/`, `widgets/resume-builder/`
