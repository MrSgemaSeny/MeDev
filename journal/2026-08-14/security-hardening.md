# Security Hardening & Rate Limiting (Redis)

- **Date:** 2026-08-14
- **Author:** Antigravity (Senior Tech Lead)

## Что было сделано

1. **Ротация ключей шифрования (AES-GCM)**:
   - Внедрен механизм fallback-ротации в `EncryptionUtils`. Теперь система может принимать два ключа: Primary (`encryption.secret`) и Secondary (`encryption.secret-old`). 
   - Защита от дефолтного ключа: добавлен `@PostConstruct` чекер, который принудительно останавливает приложение (`IllegalStateException`), если активен профиль `prod`, а в качестве Primary-ключа используется дефолтное значение (`super_secret_encryption_key_that_is_at_least_32_bytes_long_12345`).

2. **Rate Limiting через Redis**:
   - Отказались от In-Memory `ConcurrentHashMap` и `bucket4j-core` в пользу `RedisTemplate`.
   - Внедрен простой, но надежный алгоритм Fixed Window (`opsForValue().increment` + `expire`). Это позволило не тянуть новые зависимости (bucket4j-redis) и избежать сложностей с настройкой кастомного LettuceClient.
   - Ограничения настроены для `/v1/auth/login` (5/мин), `/v1/auth/register` (5/мин) и `/v1/ai/**` (10/час). 
   - Обновлен `AuthRateLimiter` (ограничение до 20/мин для контроллеров авторизации) — также переведен на `RedisTemplate`.

3. **Защита Actuator**:
   - Эндпоинты `/actuator/**` закрыты правилом `.hasRole("ADMIN")` в `SecurityConfig`, за исключением `/actuator/health` (остался публичным для Liveness Probes балансировщиков, таких как Fly.io).

## Статус тестов
- Unit и Integration тесты успешно пройдены (`testClasses` / `jacocoTestReport`). Исправлен контекст для `AdminControllerTest` путем мокирования `RedisTemplate`.

## Следующие шаги
- Audit Admin-related DTOs (Admin Entity Exposure Audit).
