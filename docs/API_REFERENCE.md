# MeDev — Справочник API (API Reference)

Все эндпоинты бэкенда маршрутизируются через базовый префикс `/api/v1`.

---

## 1. Аутентификация (`/api/v1/auth`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Публичный | Регистрация пользователя по email/паролю |
| `POST` | `/auth/login` | Публичный | Вход, выдача JWT access токена и HttpOnly refresh cookie |
| `POST` | `/auth/refresh` | Публичный | Ротация refresh токена из cookie и выдача нового access токена |
| `POST` | `/auth/logout` | Авторизован | Сброс refresh сессии в Redis и очистка cookie |
| `GET` | `/auth/oauth2/code` | Публичный | Обмен временного Redis `oauth2_code` на JWT токены |

---

## 2. Профиль разработчика (`/api/v1/profile`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Авторизован | Получение полного профиля текущего пользователя |
| `PUT` | `/profile` | Авторизован | Обновление основных данных профиля (имя, локация, bio) |
| `PUT` | `/profile/section-order` | Авторизован | Сохранение порядка секций резюме |
| `GET` | `/profile/export/readme` | Авторизован | Генерация GitHub README (`?template=full\|minimal\|creative`) |
| `GET` | `/profile/export/json` | Авторизован | Экспорт полного профиля в формате JSON |
| `POST/PUT/DELETE` | `/profile/experience/**` | Авторизован | CRUD операций с опытом работы |
| `POST/PUT/DELETE` | `/profile/projects/**` | Авторизован | CRUD операций с проектами |
| `POST/PUT/DELETE` | `/profile/skills/**` | Авторизован | CRUD операций с навыками |
| `POST/PUT/DELETE` | `/profile/education/**` | Авторизован | CRUD операций с образованием |
| `POST/PUT/DELETE` | `/profile/languages/**` | Авторизован | CRUD операций с иностранными языками |

---

## 3. Резюме и шаблоны (`/api/v1/resume`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/resume/html/{template}` | Авторизован | Рендеринг чистого HTML резюме для Live Preview и экспорта |
| `GET` | `/resume/download` | Авторизован | Генерация и скачивание PDF резюме (Thymeleaf + Flying Saucer) |
| `GET` | `/resume/preview` | Авторизован | Получение PDF резюме в виде потока байтов |

---

## 4. Публичное портфолио (`/api/v1/portfolio`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/portfolio/{username}` | Публичный | Получение публичного профиля, проектов и вклада для витрины |

---

## 5. Job Tracker CRM (`/api/v1/tracker`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/tracker` | Авторизован | Получение списка всех откликов на вакансии пользователя |
| `POST` | `/tracker` | Авторизован | Создание нового отклика на вакансию |
| `PUT` | `/tracker/{id}` | Авторизован | Обновление статуса или деталей отклика |
| `DELETE` | `/tracker/{id}` | Авторизован | Удаление записи отклика |
| `POST` | `/tracker/scrape` | Авторизован | Извлечение текста вакансии по URL (HeadHunter, LinkedIn) |

---

## 6. AI Сервисы (`/api/v1/ai`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/generate-profile` | Авторизован | Полная AI-генерация профиля на основе GitHub Snapshot |
| `POST` | `/ai/parse-resume` | Авторизован | Загрузка PDF-файла и извлечение структурированного резюме |
| `POST` | `/ai/match-job` | Авторизован (PRO) | Расчет Match Score и анализ совпадения с описанием вакансии |
| `POST` | `/ai/tailor` | Авторизован (PRO) | Адаптация резюме под ключевые слова вакансии |
| `POST` | `/ai/cover-letter` | Авторизован (PRO) | Генерация сопроводительного письма |
| `GET` | `/ai/chat/stream` | Авторизован | Потоковый SSE-диалог с AI-ассистентом |

---

## 7. Биллинг и подписки (`/api/v1/billing`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `POST` | `/billing/create-checkout-session` | Авторизован | Создание сессии оплаты Stripe Checkout |
| `POST` | `/billing/kaspi/create-link` | Авторизован | Генерация платежной ссылки Kaspi Pay |
| `POST` | `/billing/webhook` | Публичный | Обработка вебхуков Stripe (обновление/отмена подписки) |
| `POST` | `/billing/webhook/kaspi` | Публичный | Обработка HMAC вебхуков Kaspi Pay |

---

## 8. Мониторинг и администрирование (`/api/v1/admin`, `/api/actuator`)

| Метод | Путь | Доступ | Описание |
| :--- | :--- | :--- | :--- |
| `GET` | `/actuator/health` | Публичный / Auth | Проверка статуса сервисов (Postgres, Redis, Groq) |
| `GET` | `/admin/dashboard` | ADMIN | Сводная аналитика по платформе |
| `GET` | `/admin/users` | ADMIN | Управление списком пользователей |
| `GET` | `/admin/audit` | ADMIN | Просмотр системных логов аудита |