# ProfileService Refactoring - MapStruct & JPA

**Date**: 2026-08-10
**Status**: [x] Completed

## Изменения
- Сущность `Profile` была дополнена маппингами `@OneToMany` для `experiences`, `educations`, `skills`, `languages`, `projects`. Использована сортировка `@OrderBy("sortOrder ASC")`. Добавлен `@Builder.Default` для устранения Lombok warnings.
- `ProfileMapper` теперь автоматически мапит все вложенные коллекции. Добавлены аннотации `@Mapping` для сопоставления полей (`experiences` -> `experience`).
- Устранен анти-паттерн "God Object" в `ProfileService`: удален ручной маппинг в `mapToProfileDto` (состоявший из 25 строк и ручных запросов) и инъекции 5 лишних репозиториев (`ExperienceRepository`, `EducationRepository` и др.).
- Сборка бэкенда (`./gradlew compileJava`) успешно пройдена без ошибок (5 предупреждений Lombok устранены).

## Следующие шаги
- Переход к задаче `[CRITICAL] Тесты: Текущее покрытие 0%. Внедрить JUnit 5/Mockito на бэке, Vitest/Playwright на фронте.`
- Завершить ревью PR на фронтенде и переходить к настройке CI/CD.
