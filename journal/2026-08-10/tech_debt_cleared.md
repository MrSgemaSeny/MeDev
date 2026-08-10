# Журнал: Закрытие технического долга (Тесты, i18n, Темы)

**Дата**: 2026-08-10
**Статус**: Выполнено

## Проделанная работа

1. **Баг с лимитами (429 Too Many Requests)**
   - Удалён дублирующийся фильтр `RateLimitingFilter.java` в папке `security`, который вызывал двойное списание токенов при каждом запросе.
   - Оставлен правильный `RateLimitFilter.java` в пакете `config`.

2. **Восстановление и улучшение тем оформления**
   - Восстановлена светлая тема и переработана тёмная под строгий GitHub Dark Mode.
   - Внедрены CSS-переменные в `index.css`.
   - Заменены хардкод-значения цветов во всех компонентах: `AppRouter`, `DashboardPage`, `ResumeBuilder`, `PricingPage`, `SuccessPage`, `CancelPage`, `LoginPage`, `RegisterPage`.
   - Настройки темы сохраняются в `localStorage`.

3. **Бэкенд тесты**
   - Убедились, что `AuthServiceTest.java` и `StripeServiceTest.java` существуют, и прогон тестов (`.\gradlew test`) проходит успешно.

4. **Фронтенд тесты**
   - Установлены Vitest, jsdom, React Testing Library.
   - Настроен `vitest.config.ts`.
   - Написаны unit-тесты для Zustand-стора авторизации (`store.test.ts`), которые успешно проверяют работу с `localStorage`.
   - Добавлен скрипт `"test": "vitest run"`.

5. **Локализация (i18n)**
   - Добавлены недостающие ключи для `DashboardPage` и страниц аутентификации (`LoginPage`, `RegisterPage`) в `en.json` и `ru.json`.
   - Элементы интерфейса используют хук `useTranslation()`.

## Дальнейшие шаги
- Запушить изменения в репозиторий.
