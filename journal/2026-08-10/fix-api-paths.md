# Отчет за 2026-08-10

## Что было сделано:
- Исправлен баг `ERR_CONNECTION_REFUSED` при регистрации (`/v1/auth/register`). 
- **Проблема**: Фронтенд стучался на URL без префикса контекста приложения. В `backend/src/main/resources/application.yml` прописан `server.servlet.context-path: /api`, а в `axios.ts` был жестко задан baseURL: `http://localhost:8080/v1`.
- **Решение**: Во всех местах (включая `axios.ts` и `ResumeBuilder.tsx`) URL изменен на правильный формат: `http://localhost:8080/api/v1...`.

## Риски / Заметки:
- [INFO] Бекенд успешно запущен на порту `8080` (выявлено через `netstat`). Если в будущем ошибка повторится, возможно порт был занят, и сработал `ServerPortCustomizer`, запустив бекенд на `8081` или выше.

- ��������� ��������� @Transactional � AuthService, ����� ������������� ��������� �������� ������������ � ��, ���� Redis ����������.
