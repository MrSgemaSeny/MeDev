import { describe, it, expect } from 'vitest';
import ru from './locales/ru.json';
import en from './locales/en.json';

describe('i18n locales parity & completeness', () => {
  it('has matching top-level sections in ru.json and en.json', () => {
    const ruKeys = Object.keys(ru).sort();
    const enKeys = Object.keys(en).sort();
    expect(ruKeys).toEqual(enKeys);
  });

  it('contains essential navigation keys in both languages', () => {
    const requiredNavKeys = [
      'main',
      'dashboard',
      'profile',
      'importData',
      'resume',
      'tracker',
      'billing',
      'settings',
      'sections',
      'about',
      'experience',
      'education',
      'skills',
      'languages',
      'projects',
      'github',
      'adminPanel',
      'mobileNavAria',
      'closeMenu',
    ];

    for (const key of requiredNavKeys) {
      expect((ru.nav as Record<string, string>)[key]).toBeDefined();
      expect((en.nav as Record<string, string>)[key]).toBeDefined();
    }
  });

  it('contains essential builder keys and template names in both languages', () => {
    expect(ru.builder.title).toBe('Конструктор резюме');
    expect(en.builder.title).toBe('Resume Builder');

    expect(ru.builder.templatesHeading).toBe('Шаблоны');
    expect(en.builder.templatesHeading).toBe('Templates');

    expect(ru.builder.templateNames.clean).toBe('Clean ATS');
    expect(en.builder.templateNames.github).toBe('GitHub');

    expect(ru.builder.sectionNames.summary).toBe('О себе');
    expect(en.builder.sectionNames.summary).toBe('About');
  });

  it('contains essential tracker keys in both languages', () => {
    expect(ru.tracker.title).toBe('Отслеживание вакансий');
    expect(en.tracker.title).toBe('Job Tracker CRM');
    expect(ru.tracker.board).toBe('Доска');
    expect(en.tracker.board).toBe('Board');
    expect(ru.tracker.list).toBe('Список');
    expect(en.tracker.list).toBe('List');
    expect(ru.tracker.allStatuses).toBe('Все статусы');
    expect(en.tracker.allStatuses).toBe('All Statuses');
  });

  it('contains essential header keys in both languages', () => {
    expect(ru.header.language).toBe('Язык');
    expect(en.header.language).toBe('Language');
    expect(ru.header.logout).toBe('Выйти');
    expect(en.header.logout).toBe('Sign Out');
  });

  it('contains essential settings keys in both languages', () => {
    expect(ru.settings.title).toBe('Настройки');
    expect(en.settings.title).toBe('Settings');
    expect(ru.settings.username).toBe('Имя пользователя');
    expect(en.settings.username).toBe('Username');
    expect(ru.settings.session).toBe('Сессия');
    expect(en.settings.session).toBe('Session');
    expect(ru.settings.language).toBe('Язык');
    expect(en.settings.language).toBe('Language');
    expect(ru.settings.theme).toBe('Тема');
    expect(en.settings.theme).toBe('Theme');
  });
});

