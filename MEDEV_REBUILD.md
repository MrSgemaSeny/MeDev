# MeDev — Полная перестройка (Rebuild Plan)

## Контекст для AI

Ты работаешь над проектом **MeDev** — платформой для разработчиков.
Текущий код — январский прототип. Он работает, но архитектура фронтенда
сломана концептуально: всё редактирование происходит через модалки внутри
одного DashboardPage, ResumeBuilder занимает весь экран дашборда.
Это не продукт — это прототип. Задача: полная перестройка фронтенда.
Бэкенд не трогаем — он рабочий.

---

## Что за продукт

MeDev — две вещи в одном:
1. **Генератор резюме** — красивые PDF по шаблонам или секционная сборка
2. **Публичная страница разработчика** — портфолио через GitHub интеграцию

Целевая аудитория: разработчики по всему миру → мультиязычность обязательна (i18n уже подключён).

Тарифы: **Free** и **Pro** (Stripe уже интегрирован в бэкенд).

---

## Что есть в бэкенде (не трогать)

Модули:
- `auth` — JWT + Redis refresh tokens, register/login/logout/refresh
- `profile` — About, Experience, Education, Skills, Languages, Projects, section-order, reorder
- `github` — импорт GitHub профиля и репозиториев
- `resume` — PDF генерация (PdfGeneratorService), парсинг PDF (PdfParserService)
- `portfolio` — публичная страница по username
- `billing` — Stripe checkout, webhook, апгрейд плана FREE→PRO
- `ai` — AI анализ резюме через Groq

API prefix: `/api` (все пути через axios instance в `shared/api/axios.ts`)

---

## Что переиспользуется с фронтенда

**Оставить:**
- `src/shared/api/axios.ts` — axios instance, не трогать
- `src/shared/api/hooks/useProfile.ts` — все хуки рабочие, CRUD factory отличный
- `src/entities/user/model/store.ts` — auth store (Zustand)
- `src/entities/resume/model/resumeEditorStore.ts` — store для секций резюме, оставить
- `src/shared/ui/Button.tsx` — если есть, оставить
- `src/app/router/AppRouter.tsx` — обновить роуты
- `src/pages/auth/` — LoginPage и RegisterPage, оставить

**Выбросить полностью:**
- `src/pages/dashboard/DashboardPage.tsx` — переписать с нуля
- `src/features/resume/ResumeBuilder.tsx` — переписать с нуля
- `src/features/resume/forms/` — все формы (AboutForm, ExperienceForm и др.) — переписать
- `src/pages/portfolio/PortfolioPage.tsx` — переписать с нуля

---

## Новая структура роутов

```
/login                    — LoginPage (оставить)
/register                 — RegisterPage (оставить)
/dashboard                — обзор: статус профиля, быстрые действия, статистика
/profile/edit             — полноэкранный редактор профиля
/resume                   — генератор резюме
/portfolio/:username      — публичная страница (read-only, без авторизации)
/billing                  — тарифы и оплата
/billing/success          — успех оплаты
/billing/cancel           — отмена оплаты
```

---

## Новая структура папок фронтенда (FSD)

```
src/
  app/
    router/AppRouter.tsx         — обновить роуты
    layouts/
      AppLayout.tsx              — общий layout с сайдбаром для авторизованных
      PublicLayout.tsx           — layout для /portfolio/:username

  pages/
    auth/
      LoginPage.tsx              — оставить
      RegisterPage.tsx           — оставить
    dashboard/
      DashboardPage.tsx          — переписать
    profile/
      ProfileEditPage.tsx        — НОВАЯ, ключевая страница
    resume/
      ResumePage.tsx             — НОВАЯ
    portfolio/
      PortfolioPage.tsx          — переписать
    billing/
      PricingPage.tsx            — обновить
      SuccessPage.tsx            — оставить
      CancelPage.tsx             — оставить

  widgets/
    sidebar/
      AppSidebar.tsx             — НОВЫЙ, навигация приложения
    profile-editor/
      ProfileEditor.tsx          — НОВЫЙ, левый сайдбар секций + правая форма
    resume-builder/
      ResumeBuilder.tsx          — переписать как отдельный widget
    portfolio/
      PortfolioView.tsx          — публичная страница

  features/
    profile/
      sections/
        AboutSection.tsx
        ExperienceSection.tsx
        EducationSection.tsx
        SkillsSection.tsx
        LanguagesSection.tsx
        ProjectsSection.tsx
        GithubSection.tsx        — НОВЫЙ, импорт и настройка GitHub данных
    resume/
      templates/
        ClassicTemplate.tsx
        ModernTemplate.tsx
      ResumePreview.tsx
      TemplateSelector.tsx
    github/
      GithubImport.tsx
      RepoSelector.tsx
      ActivityStats.tsx

  entities/
    user/model/store.ts          — оставить
    resume/model/resumeEditorStore.ts — оставить
    profile/model/types.ts       — НОВЫЙ, типы ProfileDto и секций

  shared/
    api/
      axios.ts                   — оставить
      hooks/useProfile.ts        — оставить
    ui/                          — компоненты: Button, Input, Badge, etc.
    lib/
      i18n.ts                    — мультиязычность
```

---

## Ключевая страница: ProfileEditPage

Это главная страница продукта. Не модалка, не аккордеон.

**Layout:**
```
┌─────────────┬──────────────────────────────────────┐
│  Секции     │  Форма активной секции               │
│             │                                      │
│  > About    │  Full Name: [_____________]           │
│    Exp      │  Headline:  [_____________]           │
│    Edu      │  Summary:   [___________________]    │
│    Skills   │                                      │
│    Lang     │  Location:  [_____________]           │
│    Projects │  Website:   [_____________]           │
│    GitHub   │  GitHub:    [_____________]           │
│             │  LinkedIn:  [_____________]           │
│             │                                      │
│             │  [Save Changes]                      │
└─────────────┴──────────────────────────────────────┘
```

Левая колонка: список секций (кликабельные), индикатор заполненности.
Правая колонка: форма выбранной секции, занимает весь экран.
Никаких модалок. Никаких оверлеев.

**Поведение:**
- При клике на секцию слева — правая часть меняется без перехода страницы
- Активная секция выделена в сайдбаре
- Каждая секция показывает индикатор заполненности (пустая / частично / заполнена)
- URL обновляется: `/profile/edit?section=experience`

---

## Страница резюме: ResumePage

**Флоу:**
```
1. Выбор шаблона (превью карточки)
2. Превью резюме справа (A4, live update)
3. Управление секциями (drag & drop порядок, show/hide)
4. Кнопка Download PDF
```

**Шаблоны:**
- Classic — белый A4, строгий
- Modern — с цветными акцентами
- (Pro only) больше шаблонов

**Free vs Pro:**
- Free: 3 генерации в день, 2 шаблона, ватермарк
- Pro: безлимит, все шаблоны, без ватермарка, секционная сборка

---

## GitHub интеграция (GithubSection)

Что показываем на публичной странице и в резюме:
- Аватар, имя, bio с GitHub
- Выбранные репозитории (пользователь сам выбирает какие показывать)
- Языки и стек (из репозиториев)
- Статистика активности (stars, commits, contributions)

Флоу:
```
Ввёл GitHub username → импорт данных (GitHubController уже есть)
→ выбрал репозитории которые хочет показывать
→ данные сохраняются в профиле
→ отображаются на портфолио и в резюме
```

---

## Free vs Pro — детали

| Функция | Free | Pro |
|---|---|---|
| Генерация PDF | 3 в день | безлимит |
| Шаблонов | 2 | все |
| Ватермарк | есть | нет |
| README генерация | нет | есть |
| Секционная сборка профиля | нет | есть |
| Аналитика портфолио | нет | есть |
| AI анализ резюме | нет | есть |

README генерация: пользователь жмёт кнопку → получает markdown → копирует и вставляет в GitHub профиль сам (не автоматически через API).

---

## Дизайн — принципы

- Белый A4 для превью резюме — как документ, не как сайт
- Тёмная/светлая тема для интерфейса (уже есть, оставить)
- Никаких модалок для редактирования данных
- Левый сайдбар для навигации между секциями
- Минималистично — пользователь фокусируется на контенте, не на интерфейсе
- Мобилка — не в текущей фазе, не оптимизировать

---

## Мультиязычность

i18n уже подключён (useTranslation есть в ResumeBuilder).
Расширить на весь фронтенд.
Языки для старта: EN, RU.
Структура: `src/shared/lib/i18n/locales/en.json`, `ru.json`

---

## Что НЕ делать

- Не добавлять мобильную адаптацию — это следующая фаза
- Не добавлять MAX тариф — идея сохранена, реализация в будущем
- Не трогать бэкенд — все эндпоинты рабочие
- Не добавлять новые npm пакеты без необходимости — используй что уже есть
- Не делать модалки для редактирования — это главная проблема которую мы исправляем
- Не использовать Docker

---

## Порядок реализации

### Фаза 1 — Скелет и навигация
1. Создать `AppLayout.tsx` с сайдбаром
2. Обновить `AppRouter.tsx` с новыми роутами
3. Создать `AppSidebar.tsx`
4. Создать пустые страницы-заглушки для всех роутов

### Фаза 2 — Редактор профиля (главное)
5. Создать `ProfileEditPage.tsx` с двухколоночным layout
6. Переписать все секции (AboutSection, ExperienceSection и др.) как полноэкранные формы
7. Навигация между секциями через URL param

### Фаза 3 — Генератор резюме
8. Создать `ResumePage.tsx`
9. Переписать `ResumeBuilder` как widget
10. Шаблоны Classic и Modern
11. PDF download

### Фаза 4 — Публичная страница
12. Переписать `PortfolioPage.tsx`
13. GitHub секция с выбором репозиториев

### Фаза 5 — Polish
14. Free/Pro ограничения на UI
15. i18n на все страницы
16. Dashboard с реальными данными

---

## Критические правила для AI

1. FSD архитектура — строго: shared → entities → features → widgets → pages
2. Никаких модалок для редактирования данных — это главный запрет
3. TypeScript везде, any запрещён
4. Все API вызовы только через хуки из `shared/api/hooks/`
5. Tailwind v4 — без config файлов, через `@tailwindcss/vite`
6. CSS переменные для цветов — уже настроены, используй `var(--color-*)`
7. React Query для всех серверных данных
8. Zustand только для client-side state (не для серверных данных)
9. i18n для всех строк интерфейса
10. Тесты после каждой фазы перед переходом к следующей
