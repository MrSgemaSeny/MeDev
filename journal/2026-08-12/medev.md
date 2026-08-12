# MeDev - 2026-08-12

## Добавлено
- `project_description_v1.txt` — отдельный промпт для генерации описания проектов в портфолио.

## Изменено
- `AiController.java` — добавлен `produces = MediaType.APPLICATION_JSON_VALUE` для эндпоинтов генерации, чтобы Axios на фронтенде автоматически парсил JSON-ответ от LLM.
- `summary_generator_v1.txt` — изменен формат вывода на строгий JSON, чтобы соответствовать требованиям Groq (`response_format: { type: "json_object" }`).
- `AiGenerateService.java` — `generateProjectDescription` теперь использует свой собственный промпт.

## Проблемы (Решено)
- **Баг:** Кнопка "Generate with AI" не работала.
- **Причина:** GroqClient передавал флаг `json_object`, но системный промпт (`summary_generator_v1.txt`) явно запрещал LLM выдавать JSON. Это приводило к 400 Bad Request от Groq. Кроме того, бэкенд возвращал ответ как `text/plain`, что ломало парсинг на клиенте.
- **Решение:** Промпты переписаны под возврат JSON с ключом `content`. В контроллере явно указан `application/json`. Фронтенд успешно парсит ответ и извлекает `data.content`.

## Тесты
- Юнит-тесты на бэкенде пока отсутствуют (0% покрытие). Логика генерации изолирована и протестирована через интерфейсы LLM Provider.
