# AI Assistant Integration (Groq + SSE)

**Date**: 2026-08-10
**Status**: [x] Completed

## Изменения
- Интегрирован ИИ-ассистент на базе модели `llama-3.1-8b-instant` через бесплатное API Groq. 
- **Backend (Spring Boot):** 
  - Расширен `GroqClient.java` (используется реактивный `WebClient` из `webflux`), добавлен метод `streamChatCompletion` для обработки SSE (`data: ...`).
  - Добавлен `AiAssistantService.java` с логикой хранения системного промпта из `prompt.txt`.
  - Добавлен `AiController.java`, который отдает `SseEmitter` по пути `POST /api/v1/ai/chat/stream`. 
- **Frontend (React/Zustand):** 
  - Создан `useAiChatStore.ts` для хранения стейта чата.
  - Реализован плавающий виджет `AiChatWidget.tsx` (правый нижний угол) в стиле минимализма (GitHub Dark).
  - Применен нативный `fetch` с `TextDecoder` для плавного стриминга ответа от бэкенда.
  
## Зависимости
- Фронтенд успешно билдится. Бэкенд успешно компилируется (`./gradlew compileJava`).
- Ключ `GROQ_API_KEY` полностью изолирован на стороне бэкенда, как и требовала архитектура.

## Следующие шаги
- Интегрировать Rate Limiter (Bucket4j) на новый эндпоинт чата, чтобы защитить бесплатный лимит токенов.
- Перейти к покрытию тестами.
