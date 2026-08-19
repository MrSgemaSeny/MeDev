# 2026-08-14: JF-1C-style documentation structure (Epics + docs)

## Что сделано:
- По образцу JF-1C создана структурированная документация MeDev.

## Структура:
- `Epics/Plan/Epic-{01..12}-{slug}/epic.md` — 12 эпиков (auth, profile, portfolio,
  github, ai, resume, tracker, billing, admin, infra, observability, frontend).
  Стандартизованный шаблон: Мета, Зачем, User Stories, Out of Scope, Тех. решения,
  Acceptance Criteria, Definition of Done, Техдолг, Связанные ресурсы.
- `Epics/CLAUDE.md` — указатель на AI_AGENT_INSTRUCTION.md.
- `docs/ARCHITECTURE.md` — архитектура, модули, security, БД, FSD.
- `docs/ONBOARDING.md` — локальный запуск (Docker + ручной).
- `docs/RUNBOOK.md` — регламент эксплуатации, дерево инцидентов, откат релиза.
- `docs/CONTRIBUTING.md` — правила (Flyway, секреты, IDOR, FSD, тесты, коммиты).
- `docs/SECURITY_AUDIT.md` — security-аудит (0 CRITICAL, 9 WARNING, 15 INFO).
- `AI_AGENT_INSTRUCTION.md` — единый источник правды для AI-агентов
  (как в JF-1C), указатель на всю документацию.

## Статус:
- В код изменений не вносилось — только документация.
- Готово к push в main.
