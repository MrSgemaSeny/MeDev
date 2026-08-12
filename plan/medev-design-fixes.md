# MeDev — исправление темы, хедера и кнопки профиля

Смотрел `01.zip` (тот же фронтенд, что и в прошлый раз). Важное уточнение сразу: то, что в коде, и то, что на твоих скриншотах — не совсем одно и то же. В коде `AppSidebar.tsx` есть блок "Sections" (About/Experience/.../GitHub), `QuotaWidget`, "Billing", "Settings" и `UserProfileDropdown` внизу — на скриншоте 1 в сайдбаре только Dashboard/Profile/Resume/Billing и строка "AI: /", без всего остального. Похоже, ты смотришь на сборку, которая либо старше архива, либо где-то разошлась с ним. Ниже чиню то, что реально нахожу как причину в коде архива — если после применения на твоей текущей ветке картина не сойдётся, скинь актуальный `AppSidebar.tsx`/`AppLayout.tsx`, поправлю прицельно.

## Причина №1 — тёмная тема не включается по умолчанию

В `index.css` тёмная палитра (GitHub Dark: `#0d1117` / `#161b22` / `#21262d`) целиком лежит под селектором `.dark`. Но класс `.dark` на `<html>` **никто не ставит при загрузке** — единственное место, где он появляется, это ручной клик по тумблеру темы в `UserProfileDropdown.tsx`:

```ts
const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
```

При первом заходе `classList.contains('dark')` — `false`, значит приложение рендерится по `:root`, то есть по **светлой** палитре (`--color-bg-secondary: #f6f8fa` — тот самый светло-серый, который ты видишь). Плюс выбор темы никуда не сохраняется — после `F5` он снова слетает в светлую, даже если ты его переключил.

**Правка — добавить блокирующий inline-скрипт в `index.html`** (выполняется до первой отрисовки, без "мигания" светлой темой):

```html
<!-- 01/index.html, в <head>, до подключения любых стилей -->
<script>
  (function () {
    var saved = localStorage.getItem('theme');
    var theme = saved || 'dark'; // GitHub-подобный дефолт — тёмная
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

Если `index.html` в проекте выглядит иначе — вставь скрипт первым тегом внутри `<head>`, до `<link>`/`<style>`.

**И синхронизировать тумблер в `UserProfileDropdown.tsx`, чтобы он реально сохранял выбор:**

```tsx
// src/widgets/header/UserProfileDropdown.tsx
const toggleTheme = () => {
  const html = document.documentElement;
  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    setIsDark(false);
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    setIsDark(true);
  }
};
```

Это закрывает «светло-серые цвета» полностью — без этого весь остальной аудит палитры бессмысленен, потому что дальше по коду (Card, Button, Input) все компоненты и так честно используют `var(--color-bg-secondary)` и остальные токены, ничего хардкодить не нужно — просто сам класс `.dark` никогда не долетал до `<html>`.

---

## Причина №2 — хедера нет физически

`AppLayout.tsx` сейчас:

```tsx
export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen" style={{ color: 'var(--color-text-primary)' }}>
        <div className="flex-1 overflow-y-auto relative p-8">
          <Outlet />
        </div>
        <AiChatWidget />
        <UpsellModal />
      </main>
    </div>
  );
};
```

Никакого header-компонента тут нет вообще — контент просто начинается с паддинга. Отсюда и «хидер неправильно настроен»: настраивать нечего, его нет. При этом в `index.css` уже год лежит готовая переменная `--color-header-bg`, которая нигде не используется — она была заведена под этот компонент заранее, просто компонент не написан.

**Новый файл `src/widgets/header/AppHeader.tsx`** — верхняя панель в духе GitHub (поиск по центру, иконки, аватар справа):

```tsx
// src/widgets/header/AppHeader.tsx
import { Search, Bell } from 'lucide-react';
import { UserProfileDropdown } from './UserProfileDropdown';

export const AppHeader = () => {
  return (
    <header
      className="h-14 shrink-0 flex items-center gap-4 px-6 border-b"
      style={{ backgroundColor: 'var(--color-header-bg)', borderColor: 'var(--color-border-default)' }}
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-8 pr-3 rounded-md text-sm outline-none transition-[border-color,box-shadow]"
            style={{
              backgroundColor: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-link)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-selection)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <button
        className="h-8 w-8 flex items-center justify-center rounded-md transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-btn-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        aria-label="Notifications"
      >
        <Bell size={16} />
      </button>

      <UserProfileDropdown variant="header" />
    </header>
  );
};
```

Подключение в `AppLayout.tsx`:

```tsx
// src/app/layouts/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../../widgets/sidebar/AppSidebar';
import { AppHeader } from '../../widgets/header/AppHeader';
import { AiChatWidget } from '../../features/ai-assistant/ui/AiChatWidget';
import { UpsellModal } from '../../shared/ui/UpsellModal';

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen" style={{ color: 'var(--color-text-primary)' }}>
        <AppHeader />
        <div className="flex-1 overflow-y-auto relative p-8">
          <Outlet />
        </div>
        <AiChatWidget />
        <UpsellModal />
      </main>
    </div>
  );
};
```

---

## Причина №3 — кнопки профиля нет / не видна

Тут два разных бага, оба чинятся одним заходом в `UserProfileDropdown.tsx`.

**3.1. Компонент физически исчезает, если `username` ещё не подтянулся.**

```tsx
if (!username) return null;
```

Пока `useAuthStore` не гидрировался или `username` пуст (например, доля секунды при первой загрузке, или бэкенд не прислал username в ответе) — компонент рендерит `null`, то есть буквально ничего, без скелетона и без запасного состояния. Если у тебя где-то в реальном сценарии `username` систематически пустой (например, после OAuth-редиректа, где он приходит из query-параметров и может не долететь) — кнопка профиля будет отсутствовать всегда, а не мигать. Замени на скелетон вместо молчаливого исчезновения:

```tsx
if (!username) {
  return (
    <div
      className="h-9 w-9 rounded-full animate-pulse"
      style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
    />
  );
}
```

**3.2. Компонент сверстан под расположение "снизу вверх" (в футере сайдбара), а не под хедер.**

Дропдаун раскрывается вверх (`bottom-full mb-2`) и якорится по левому краю (`left-0`) — это верно для места внизу сайдбара, но ломается, если триггер переехал в хедер (там дропдаун должен открываться вниз и вправо, как в примерах GitHub/Zhan Finance). Добавь проп `variant` и разное позиционирование/оформление триггера под два контекста:

```tsx
// src/widgets/header/UserProfileDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Bell, Globe, Mail, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../entities/user/model/store';
import { useTranslation } from 'react-i18next';

interface UserProfileDropdownProps {
  variant?: 'sidebar' | 'header';
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ variant = 'sidebar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);
  const { i18n } = useTranslation();

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!username) {
    return (
      <div
        className="h-9 w-9 rounded-full animate-pulse"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      />
    );
  }

  const toggleLanguage = (lang: string) => i18n.changeLanguage(lang);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const formatterTime = new Intl.DateTimeFormat(i18n.language === 'ru' ? 'ru-RU' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isHeader = variant === 'header';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Триггер */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isHeader
            ? 'h-9 w-9 rounded-full overflow-hidden shrink-0 hover:ring-2 transition-all'
            : 'w-full flex items-center justify-between gap-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors'
        }
        style={isHeader ? ({ '--tw-ring-color': 'var(--color-border-default)' } as React.CSSProperties) : undefined}
      >
        {isHeader ? (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[13px] font-medium text-primary">{username}</span>
              <span className="text-[10px] text-muted">{formatterTime.format(currentTime)}</span>
            </div>
          </div>
        )}
      </button>

      {/* Меню — открывается вниз и от правого края в хедере, вверх и от левого в сайдбаре */}
      {isOpen && (
        <div
          className={`absolute w-64 rounded-xl shadow-lg border z-50 flex flex-col py-2 ${
            isHeader ? 'right-0 top-full mt-2' : 'left-0 bottom-full mb-2'
          }`}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border-default)',
            boxShadow: '0 10px 25px -5px var(--color-shadow)',
          }}
        >
          <div className="px-4 py-3 border-b border-muted flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-[15px] truncate text-primary">{username}</span>
            </div>
          </div>

          <div className="py-2 flex flex-col">
            <div
              className="px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              onClick={toggleTheme}
            >
              <div className="flex items-center gap-3 text-secondary">
                {isDark ? <Moon size={18} /> : <Sun size={18} />}
                <span className="text-sm font-medium">Тема</span>
              </div>
              <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-xs font-semibold">
                <div className={`px-2.5 py-1 rounded-full transition-colors ${!isDark ? 'bg-white shadow-sm text-green-700' : 'text-muted'}`}>
                  Светлая
                </div>
                <div className={`px-2.5 py-1 rounded-full transition-colors ${isDark ? 'bg-white dark:bg-[#238636] shadow-sm text-white' : 'text-muted'}`}>
                  Тёмная
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
              <div className="flex items-center gap-3 text-secondary">
                <Bell size={18} />
                <span className="text-sm font-medium">Уведомления</span>
              </div>
            </button>

            <div className="h-px bg-border-muted my-1 mx-4" style={{ backgroundColor: 'var(--color-border-muted)' }} />

            <div className="px-4 py-2.5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3 text-secondary">
                <Globe size={18} />
                <span className="text-sm font-medium">Язык</span>
              </div>
              <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-0.5 text-xs font-bold">
                <button
                  onClick={() => toggleLanguage('ru')}
                  className={`px-3 py-1 rounded-full transition-colors ${i18n.language?.startsWith('ru') ? 'bg-[#006633] text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                >
                  RU
                </button>
                <button
                  onClick={() => toggleLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-colors ${i18n.language?.startsWith('en') ? 'bg-[#006633] text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="h-px bg-border-muted my-1 mx-4" style={{ backgroundColor: 'var(--color-border-muted)' }} />

            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left">
              <Mail size={18} />
              <span className="text-sm font-medium">Поддержка</span>
            </button>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left mt-1"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

Убрал бейдж "Администратор" и красный кружок "3" на уведомлениях из общего компонента — это были захардкоженные тестовые данные (роль и счётчик не приходят ни из какого стора), которые выдавали бы себя за реальные на проде. Если роль/уведомления нужны — это отдельная задача на бэкенд (эндпоинт с реальным count), не дизайн-фикс.

---

## Заодно, раз лезем в `AppSidebar.tsx` — тот самый хардкод подсветки

Из прошлого аудита: подсветка "Sections" всегда стоит на "About" вне зависимости от реального `location.hash`. Раз уж переверстываем сайдбар/хедер, поправь заодно:

```tsx
// src/widgets/sidebar/AppSidebar.tsx — было:
// const isActive = isProfileActive && item.to.includes('about');

// стало:
const location = useLocation();
const currentHash = location.hash.replace('#', '') || 'about';

{SECTIONS_NAV.map((item) => {
  const sectionId = item.to.split('#')[1];
  const isActive = isProfileActive && currentHash === sectionId;
  return (
    <NavLink
      key={item.to}
      to={item.to}
      className={`flex items-center gap-2 py-[0.4rem] px-[0.625rem] rounded-md text-[13px] transition-colors select-none ${
        isActive ? 'bg-[var(--color-accent-muted)] text-accent' : 'text-secondary hover:bg-surface-2 hover:text-primary'
      }`}
    >
      <item.icon size={15} />
      {item.label}
    </NavLink>
  );
})}
```

И "Settings" — сейчас это `<div>` без `onClick` и без роута, но со всеми hover-стилями активной кнопки, то есть выглядит рабочим, не будучи им. Пока страницы настроек нет, честнее пометить это визуально:

```tsx
// src/widgets/sidebar/AppSidebar.tsx
<div
  className="flex items-center gap-2 py-[0.4rem] px-[0.625rem] rounded-md text-[13px] text-muted select-none opacity-50 cursor-default"
  title="Скоро"
>
  <Settings size={15} />
  Settings
</div>
```

---

## Порядок применения

1. `index.html` — inline-скрипт, дефолт на тёмную тему (без него всё остальное бессмысленно).
2. `UserProfileDropdown.tsx` — новая версия целиком (скелетон вместо `null`, `variant`, сохранение темы в `localStorage`).
3. `AppHeader.tsx` — новый файл.
4. `AppLayout.tsx` — подключить `<AppHeader />`.
5. `AppSidebar.tsx` — убрать `UserProfileDropdown` из футера сайдбара (он переехал в хедер), поправить подсветку секций, обесцветить "Settings".

После этого пришли свежий скриншот — если тёмная тема всё ещё не встаёт по умолчанию, значит `index.html` в твоей рабочей копии отличается от того, что я предполагаю, и дело либо в порядке подключения скриптов, либо в SSR/кэше Vite — тогда нужен реальный `index.html`, чтобы не гадать.
