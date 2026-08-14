# Режим Layout (1 Страница / Multi-Page) для Резюме

## Что сделано:
- Добавлен переключатель `singlePage` (1 Page vs Multi-Page) в UI конструктора резюме (`ResumeBuilder.tsx`).
- Состояние переключателя хранится в `resumeEditorStore.ts`.
- В бэкенд контроллере `ResumeController` добавлен query-параметр `?singlePage=true|false`.
- В сервисе `PdfGeneratorService` параметр передается в Thymeleaf context.
- Во всех 5 HTML шаблонах (`grok-monolith`, `apple-modern`, `milky-soft`, `github`, `phub-orange`) в папках `resume/` и `resume-html/` внедрена поддержка CSS классов `.single-page` и `.multi-page`, динамически применяемых на `<body>`.
- `.single-page` режим жестко сжимает шрифты, отступы (padding/margin) и активирует `page-break-inside: avoid` так, чтобы резюме уместилось на одной странице.
- `.multi-page` режим использует стандартные, более крупные размеры для комфортного чтения больших резюме на нескольких страницах.

## Статус:
- Тесты на фронтенде и бэкенде пройдены успешно.
- Код скомпилирован.
- Изменения готовы к коммиту.
