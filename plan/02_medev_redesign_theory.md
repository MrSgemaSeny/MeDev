# MeDev — Теория редизайна

## Что такое MeDev

Централизованный hub для разработчиков: заполняешь профиль один раз → генерируешь PDF-резюме и публичную веб-страницу. Интеграция с GitHub, AI-генерация текста, Pro-фичи (импорт из PDF).

Целевая аудитория: разработчики, ищущие работу или строящие личный бренд.

---

## Диагностика текущего UI

### Проблема 1 — Три уровня навигации
```
Sidebar (Dashboard / Profile / Resume / Billing)
  └── Sections sidebar (About / Experience / Education / ...)
        └── Content area
```
Для объёма данных MeDev достаточно двух уровней. Третий создаёт ощущение сложности там, где её нет.

**Решение:** Sections переезжают в тот же sidebar что и главные разделы. Один sidebar, один content area.

### Проблема 2 — Голые формы
Поля — HTML по умолчанию с тёмным фоном. Нет:
- визуальной группировки (basic info / summary / social links — всё в одну кучу)
- section labels с типографической иерархией
- логики расположения (Location и GitHub в разных группах)

**Решение:** Группировка через section dividers + 3-колоночная сетка для коротких полей.

### Проблема 3 — Скролл на формах
Страница About требует скролла при стандартной высоте окна. Для формы с ~8 полями это неприемлемо.

**Решение:** Компактная 3-колоночная сетка, textarea ограничен `rows="3"`, убраны избыточные отступы.

### Проблема 4 — Summary textarea без ограничений
Текстовое поле без `rows` и без счётчика символов растягивается бесконтрольно и ломает layout.

**Решение:** `rows="3"`, счётчик `/600`, кнопка AI inline рядом с label.

### Проблема 5 — Avatar-заглушки в sidebar
`D / P / R / B` — временный UI, который остался в продакшне. Выглядит как незавершённая разработка.

**Решение:** Инициал пользователя + Upload photo в шапке content area.

### Проблема 6 — Зелёный акцент без системы
`#22c55e` на кнопках — единственное цветовое решение. Нет токенов для hover, focus, muted, danger. Кнопки выглядят как Bootstrap по умолчанию.

**Решение:** Полноценная токен-система: accent / bg-accent / text-accent / border-accent.

### Проблема 7 — Pro badge как текст в скобках
`Import from PDF (Pro)` — пользователь не считывает это как badge. Теряется монетизационный сигнал.

**Решение:** Отдельный styled badge рядом с кнопкой.

---

## Целевое состояние

### Навигация
```
sidebar (196px)
├── MeDev [logo]
├── — Main —
│   ├── Dashboard
│   ├── Profile  ← active
│   └── Resume
├── — Sections —
│   ├── About    ← active (accent highlight)
│   ├── Experience
│   ├── Education
│   ├── Skills
│   ├── Languages
│   ├── Projects
│   └── GitHub
└── — bottom —
    ├── Billing
    └── Settings
```

### Content layout (About page)
```
[page header: title + import btn]
[avatar row: initials + name + headline + upload]
─────────────────────────────────
BASIC INFO
[Full name] [Headline ×2 cols    ]
[Location ] [Website] [GitHub    ]
─────────────────────────────────
SUMMARY                [AI button]
[textarea rows=3      ] [165/600 ]
─────────────────────────────────
[Save changes] [Discard]
```

### Typography шкала для MeDev
```
11px uppercase tracking  — section labels (BASIC INFO, SUMMARY)
12px                     — char counter, badges
13px                     — body, inputs, nav items
14px                     — avatar name
17px                     — page title (About you)
```

### Color система (dark theme)
```
--surface-0:    #0f1117   канвас
--surface-1:    #1a1d27   поля, sidebar
--border:       rgba(255,255,255,0.07)
--border-strong:rgba(255,255,255,0.12)
--text-primary: #f1f5f9
--text-secondary:#94a3b8
--text-muted:   #64748b
--accent:       #3b82f6   (синий — нейтральнее зелёного для dev-инструмента)
--bg-accent:    rgba(59,130,246,0.1)
--text-accent:  #60a5fa
--pro:          #a855f7
--bg-pro:       rgba(168,85,247,0.1)
--text-pro:     #c084fc
```

---

## Что не трогать (работает)

- Логика секций (About / Experience / Education / Skills / ...) — правильная структура
- GitHub integration через PAT — правильный подход (не OAuth для упрощения)
- "Generate with AI" inline в форме — хорошая UX-идея, только позиционирование надо исправить
- Разделение Dashboard / Profile / Resume на верхнем уровне — логично

---

## Приоритеты редизайна

| Приоритет | Задача | Сложность |
|---|---|---|
| P0 | Убрать скролл на About | низкая |
| P0 | Компактная навигация (2 уровня) | низкая |
| P0 | Section labels + группировка полей | низкая |
| P1 | Токен-система цветов | средняя |
| P1 | Pro badge | низкая |
| P1 | Empty states для Skills/Languages/Projects | средняя |
| P2 | Avatar upload + preview | средняя |
| P2 | Публичная страница профиля | высокая |
| P3 | Анимации переходов между секциями | высокая |
