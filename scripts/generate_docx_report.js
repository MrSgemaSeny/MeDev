import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BASE_DOCX = 'C:/Users/murat/IdeaProjects/JF-1C/docs/Отчет по JF-1C.docx';
const TEMP_ZIP = 'C:/Users/murat/IdeaProjects/new_world/MeDev/docs/base_template.zip';
const STAGING_DIR = 'C:/Users/murat/IdeaProjects/new_world/MeDev/docs/staging_docx';
const OUTPUT_TEMP_ZIP = 'C:/Users/murat/IdeaProjects/new_world/MeDev/docs/output_temp.zip';
const OUTPUT_DOCX = 'C:/Users/murat/IdeaProjects/new_world/MeDev/docs/Отчет по MeDev.docx';
const OUTPUT_MD = 'C:/Users/murat/IdeaProjects/new_world/MeDev/docs/Отчет по MeDev.md';
const DIAGRAM_IMG = 'C:/Users/murat/IdeaProjects/new_world/MeDev/docs/medev_workflow_diagram.png';

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

console.log('Step 1: Copying base docx to ASCII zip...');
fs.copyFileSync(BASE_DOCX, TEMP_ZIP);

if (fs.existsSync(STAGING_DIR)) {
  fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}

console.log('Step 2: Extracting template with PowerShell (ASCII paths)...');
execSync(`powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${TEMP_ZIP}', '${STAGING_DIR}')"`, { stdio: 'inherit' });

console.log('Step 3: Replacing diagram image...');
const destImg = path.join(STAGING_DIR, 'word/media/image1.png');
fs.copyFileSync(DIAGRAM_IMG, destImg);

const modules = [
  {
    n: 1,
    name: 'Лендинг (Визитка)',
    desc: 'Публичный сайт, презентация возможностей, интерактивное демо резюме, тарифные планы, CTA',
    status: 'Готово',
    statusColor: '008000',
    notes: 'Базовая структура готова в строгом GitHub Dark Mode стиле. Высокая скорость загрузки, адаптивный UI.'
  },
  {
    n: 2,
    name: 'Публичный профиль и портфолио (DevProfile)',
    desc: 'Публичная страница разработчика (/p/:username), визитка, опыт, стек технологий, проекты, контакты',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Полностью функционирует. Строгая валидация полей, защищенный публичный доступ без раскрытия приватных данных.'
  },
  {
    n: 3,
    name: 'Трекер вакансий (Job Tracker & Kanban)',
    desc: 'Канбан-доска стадий (WISH, APPLIED, INTERVIEW, OFFER, REJECTED), заметки, вилка ЗП, дедлайны',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Высокая отзывчивость интерфейса (@dnd-kit), плавная фильтрация, пагинация, тесная интеграция с профилем и AI.'
  },
  {
    n: 4,
    name: 'Умный парсинг вакансий (Smart Scraper)',
    desc: 'Автоматический сбор деталей вакансий по URL: HeadHunter API (/vacancies/{id}), Jina AI Reader, Fallback',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Проверено на боевых ссылках hh.kz/hh.ru. Автоматически извлекает стек, зарплатную вилку, грейд и требования.'
  },
  {
    n: 5,
    name: 'AI Карьерный Коуч и чат',
    desc: 'Диалоговый ассистент на базе Groq API (openai/gpt-oss-20b), SSE-стриминг сообщений в реальном времени',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Стриминг ответов без задержек (<1 сек), контекстные системные промпты, подготовка к тех-интервью, аудит резюме.'
  },
  {
    n: 6,
    name: 'AI-адаптация резюме под вакансию',
    desc: 'Сопоставление профиля с вакансией (Skill Gap Analysis), генерация сопроводительного письма и точечных правок',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Автоматически выявляет пробелы в навыках и переписывает опыт под фокус требований конкретного работодателя.'
  },
  {
    n: 7,
    name: 'RAG и семантический матчинг',
    desc: 'Векторизация профиля и вакансий (Jina AI Embeddings v3), хранение в PostgreSQL pgvector, косинусный поиск',
    status: 'Готово',
    statusColor: '008000',
    notes: 'Репозиторий PgVectorRepository настроен, расчет индекса релевантности (0–100%) протестирован и оптимизирован.'
  },
  {
    n: 8,
    name: 'Конструктор и PDF-экспорт резюме',
    desc: 'Визуальный редактор блоков, генерация PDF (Thymeleaf + Flying Saucer + PDFBox), экспорт в JSON и TXT',
    status: 'Готово',
    statusColor: '008000',
    notes: 'Шаблоны сверстаны, экспорт функционирует. Требуется финальная проверка кириллических шрифтов на боевом сервере.'
  },
  {
    n: 9,
    name: 'GitHub-интеграция и DevScore',
    desc: 'Синхронизация публичных репозиториев, коммитов, языков через GitHub API, скоринг активности разработчика',
    status: 'Готово',
    statusColor: '008000',
    notes: 'Парсинг GitHub API работает стабильно, агрегация статистики и расчет рейтинга активности полностью настроены.'
  },
  {
    n: 10,
    name: 'Безопасность, Auth и RBAC',
    desc: 'JWT access (24ч), refresh tokens в Redis (30д), GitHub OAuth 2.0, Row-Level Security, IDOR-защита',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Пройден 5-осевой аудит безопасности. Уязвимости закрыты, RLS через SecurityUtils.getCurrentUserId() на всех эндпоинтах.'
  },
  {
    n: 11,
    name: 'База данных и миграции',
    desc: 'PostgreSQL 16 + pgvector, Redis Cache, строгое версионирование схемы через Flyway (миграции V1–V24)',
    status: 'Готово+',
    statusColor: '008000',
    notes: 'Строгие лимиты длины полей (varchar), каскадное удаление, внешние ключи, оптимизированные индексы.'
  },
  {
    n: 12,
    name: 'VPS, инфраструктура и CI/CD',
    desc: 'Контейнеризация Docker Compose, конфигурация под Render / Fly.io / VPS, Vercel / GitHub Pages',
    status: 'В процессе',
    statusColor: 'B67700',
    notes: 'Локально и в Docker работает без сбоев. Требуется развертывание на постоянном боевом VPS с выделенным доменом.'
  },
  {
    n: 13,
    name: 'Биллинг и монетизация',
    desc: 'Тарификация AI-токенов, премиум-шаблоны PDF-резюме, прием платежей через Kaspi Pay / Stripe',
    status: 'В планах',
    statusColor: 'B67700',
    notes: 'Архитектура лимитов спроектирована. Требуется боевое подключение эквайринга (Kaspi QR / Stripe Checkout).'
  },
  {
    n: 14,
    name: 'Перспективы развития',
    desc: 'Акселерация Astana Hub, Telegram-бот для уведомлений о статусах откликов, мобильная PWA-версия',
    status: 'В планах',
    statusColor: '111111',
    notes: 'Стратегические задачи второго этапа масштабирования проекта после набора первых 100 активных пользователей.'
  }
];

const improvements = [
  'Деньги и монетизация. Надо с вашей помощью обсудить модель тарификации: freemium с лимитом генераций (например, 3 бесплатные AI-адаптации в день) или помесячная подписка. Для Казахстана необходим Kaspi Pay (QR и выставление счета), для зарубежных пользователей — Stripe.',
  'Боевой VPS, домен и Cloudflare. Серверная часть готова к непрерывной работе. Требуется перенос с временных бесплатных стендов на постоянный VPS, привязка собственного домена (например, medev.kz / medev.dev) и настройка защиты через Cloudflare (SSL, CDN, защита от DDoS).',
  'AI API и отказоустойчивость. Модель Groq openai/gpt-oss-20b обеспечивает высочайшую скорость генерации (<1 сек). Необходимо настроить мониторинг расхода квот токенов и резервный пул API-ключей на случай пиковых нагрузок.',
  'Парсинг вакансий и расширение каналов. Текущая связка HeadHunter API + Jina AI Reader работает стабильно. В планах добавить прямое извлечение вакансий из Habr Career, LinkedIn и профильных Telegram-каналов.',
  'PDF-генерация резюме на сервере. Серверный движок Flying Saucer генерирует качественные документы, но на боевом Linux-сервере важно проконтролировать установку пакетов шрифтов (dejavu-sans / liberation), чтобы исключить артефакты кириллицы.',
  'Бета-тестирование и первые пользователи. Запустить закрытое тестирование среди первых 20–50 практикующих разработчиков для сбора обратной связи по качеству AI-адаптации и юзабилити трекера вакансий.',
  'Astana Hub. Подготовить проект к подаче заявки в Astana Hub для получения статуса участника IT-технопарка (налоговые льготы 0% КПН/ИПН, менторская поддержка, гранты).',
  'Telegram-бот и мобильная версия. Разработку нативного мобильного приложения отложить на второй этап. В качестве оперативного решения использовать адаптивный PWA и легковесный Telegram-бот для мгновенных уведомлений об откликах и дедлайнах собеседований.'
];

function buildTableRowsXml() {
  let xml = `<w:tr w:rsidR="00BC727C" w:rsidRPr="009F0702" w:rsidTr="0057507D">
    <w:tc><w:tcPr><w:tcW w:w="851" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>N</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="1789" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Модуль / Подсистема</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="2900" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Назначение и функциональность</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Статус</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="2960" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="1E3A8A"/></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="FFFFFF"/><w:sz w:val="18"/></w:rPr><w:t>Текущее состояние и задачи</w:t></w:r>
      </w:p>
    </w:tc>
  </w:tr>`;

  for (const m of modules) {
    xml += `
  <w:tr w:rsidR="00BC727C" w:rsidRPr="009F0702" w:rsidTr="005E3AFB">
    <w:tc><w:tcPr><w:tcW w:w="846" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:jc w:val="both"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr><w:t>${m.n}</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="1794" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(m.name)}</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="2900" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(m.desc)}</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="1500" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="${m.statusColor}"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:color w:val="${m.statusColor}"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(m.status)}</w:t></w:r>
      </w:p>
    </w:tc>
    <w:tc><w:tcPr><w:tcW w:w="2960" w:type="dxa"/><w:tcBorders><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tcBorders></w:tcPr>
      <w:p><w:pPr><w:spacing w:before="280" w:after="100" w:line="240" w:lineRule="auto"/><w:ind w:right="400"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr></w:pPr>
        <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:color w:val="111111"/><w:sz w:val="18"/></w:rPr><w:t>${escapeXml(m.notes)}</w:t></w:r>
      </w:p>
    </w:tc>
  </w:tr>`;
  }

  return xml;
}

function buildImprovementsXml() {
  return improvements.map(item => `
    <w:p>
      <w:pPr>
        <w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>
        <w:tabs><w:tab w:val="clear" w:pos="720"/><w:tab w:val="num" w:pos="-426"/></w:tabs>
        <w:spacing w:after="0"/>
        <w:ind w:left="-709" w:firstLine="0"/>
        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr>
        <w:t>${escapeXml(item)}</w:t>
      </w:r>
    </w:p>`).join('\n');
}

const tableXml = `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="10000" w:type="dxa"/>
      <w:tblInd w:w="-714" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      </w:tblBorders>
      <w:tblLayout w:type="fixed"/>
      <w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="0"/>
    </w:tblPr>
    ${buildTableRowsXml()}
  </w:tbl>`;

const drawingXml = `
    <w:p>
      <w:pPr>
        <w:tabs><w:tab w:val="num" w:pos="-426"/></w:tabs>
        <w:spacing w:before="200" w:after="100"/>
        <w:ind w:left="-709"/>
        <w:jc w:val="center"/>
        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr>
        <w:lastRenderedPageBreak/>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="5940425" cy="3938905"/>
            <wp:effectExtent l="0" t="0" r="3175" b="4445"/>
            <wp:docPr id="21067471" name="Рисунок 1"/>
            <wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr><pic:cNvPr id="21067471" name=""/><pic:cNvPicPr/></pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId5" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm><a:off x="0" y="0"/><a:ext cx="5940425" cy="3938905"/></a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:spacing w:after="160"/>
        <w:ind w:left="-709"/>
        <w:jc w:val="center"/>
        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="20"/><w:lang w:val="ru-RU"/></w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:i/><w:sz w:val="20"/><w:lang w:val="ru-RU"/></w:rPr>
        <w:t>Рисунок 1. Архитектурный поток данных MeDev: от парсинга вакансии до генерации резюме.</w:t>
      </w:r>
    </w:p>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16du="http://schemas.microsoft.com/office/word/2023/wordml/word16du" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16sdtfl="http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14">
  <w:body>
    <w:p>
      <w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="-709"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="ru-RU"/></w:rPr><w:t>Отчет по MeDev</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="-709"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="ru-RU"/></w:rPr><w:t>12.09.2026</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="-709"/><w:jc w:val="right"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr><w:t>Мурат Орынбасар</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:sz w:val="32"/><w:szCs w:val="32"/><w:lang w:val="ru-RU"/></w:rPr><w:t>MeDev – DevProfile &amp; AI Job Assistant.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="auto"/></w:pBdr><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr><w:t>Полноценная data-first SaaS-платформа для разработчиков: интерактивный профиль/портфолио, умный трекер вакансий с парсингом URL, AI-адаптация резюме под требования конкретной вакансии, RAG-семантический матчинг и экспорт в PDF. Готовая боевая база (Level 4), требующая финальных шагов перед выходом в релиз.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr><w:t>Таблица 1 описывает все модули, которые были реализованы в проекте/сайте.</w:t></w:r>
    </w:p>

    ${tableXml}

    <w:p>
      <w:pPr><w:ind w:left="-709"/><w:jc w:val="center"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:lang w:val="ru-RU"/></w:rPr><w:t>Таблица 1. Модули.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="0"/><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr><w:t>Проект находится на стадии Production Live / Private Beta (Level 4). Развернут в Docker, функционирует быстро и стабильно.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="0"/><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr><w:t>Все ключевые сущности работают без сбоев, дизайн строгий и эргономичный (GitHub Dark Mode), трекер вакансий и AI-модули работают плавно.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="0"/><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr><w:t>Пройден полный 5-осевой технический аудит: закрыты риски IDOR, настроен Row-Level Security, защищены секреты и API-ключи, код соответствует стандартам SRP и FSD.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="0"/><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/></w:rPr><w:t>Все пользовательские сценарии проверены вручную: парсинг реальных вакансий HeadHunter, адаптация резюме, векторный скоринг и экспорт в PDF.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:before="140" w:after="0"/><w:ind w:left="-709"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/></w:rPr></w:pPr>
      <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/></w:rPr><w:t>Нужные улучшения и поправки:</w:t></w:r>
    </w:p>

    ${buildImprovementsXml()}

    ${drawingXml}

    <w:sectPr w:rsidR="00717F71" w:rsidRPr="00717F71">
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;

console.log('Step 4: Writing document.xml...');
fs.writeFileSync(path.join(STAGING_DIR, 'word/document.xml'), documentXml, 'utf-8');

console.log('Step 5: Writing docProps/core.xml...');
const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Отчет по MeDev</dc:title>
  <dc:subject>Отчет по проекту MeDev (DevProfile)</dc:subject>
  <dc:creator>Orynbassar Murat</dc:creator>
  <cp:keywords>MeDev, DevProfile, Report, Spring Boot, React, AI, Job Tracker</cp:keywords>
  <dc:description>Отчет по модулям, архитектуре и текущему состоянию проекта MeDev</dc:description>
  <cp:lastModifiedBy>Orynbassar Murat</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-09-12T14:10:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-09-12T14:10:00Z</dcterms:modified>
</cp:coreProperties>`;
fs.writeFileSync(path.join(STAGING_DIR, 'docProps/core.xml'), coreXml, 'utf-8');

console.log('Step 6: Packaging into DOCX with forward slashes...');
if (fs.existsSync(OUTPUT_TEMP_ZIP)) {
  fs.unlinkSync(OUTPUT_TEMP_ZIP);
}

const psScript = `
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$staging = (Resolve-Path "${STAGING_DIR}").Path
$outZip = "${OUTPUT_TEMP_ZIP.replace(/\//g, '\\')}"
if (Test-Path $outZip) { Remove-Item $outZip -Force }
$zip = [System.IO.Compression.ZipFile]::Open($outZip, [System.IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem -LiteralPath $staging -Recurse -File | ForEach-Object {
    $relPath = $_.FullName.Substring($staging.Length + 1).Replace('\\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$zip.Dispose()
`;
const psPath = path.join(path.dirname(OUTPUT_TEMP_ZIP), 'do_zip.ps1');
fs.writeFileSync(psPath, psScript, 'ascii');
execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit' });
fs.unlinkSync(psPath);

console.log('Step 7: Renaming temp zip to final docx via Node fs...');
if (fs.existsSync(OUTPUT_DOCX)) {
  fs.unlinkSync(OUTPUT_DOCX);
}
fs.renameSync(OUTPUT_TEMP_ZIP, OUTPUT_DOCX);

console.log('Step 8: Cleaning staging directory and temp zip...');
fs.rmSync(STAGING_DIR, { recursive: true, force: true });
if (fs.existsSync(TEMP_ZIP)) {
  fs.unlinkSync(TEMP_ZIP);
}

console.log('Step 9: Generating Markdown report...');
const mdContent = `# Отчет по MeDev
**Дата:** 12.09.2026  
**Автор:** Мурат Орынбасар  

## MeDev – DevProfile & AI Job Assistant
Полноценная data-first SaaS-платформа для разработчиков: интерактивный профиль/портфолио, умный трекер вакансий с парсингом URL, AI-адаптация резюме под требования конкретной вакансии, RAG-семантический матчинг и экспорт в PDF. Готовая боевая база (Level 4), требующая финальных шагов перед выходом в релиз.

Таблица 1 описывает все модули, которые были реализованы в проекте/сайте.

### Таблица 1. Модули

| N | Модуль / Подсистема | Назначение и функциональность | Статус | Текущее состояние и задачи |
|---|---------------------|-------------------------------|--------|----------------------------|
${modules.map(m => `| ${m.n} | ${m.name} | ${m.desc} | **${m.status}** | ${m.notes} |`).join('\n')}

### Состояние системы
Проект находится на стадии Production Live / Private Beta (Level 4). Развернут в Docker, функционирует быстро и стабильно.  
Все ключевые сущности работают без сбоев, дизайн строгий и эргономичный (GitHub Dark Mode), трекер вакансий и AI-модули работают плавно.  
Пройден полный 5-осевой технический аудит: закрыты риски IDOR, настроен Row-Level Security, защищены секреты и API-ключи, код соответствует стандартам SRP и FSD.  
Все пользовательские сценарии проверены вручную: парсинг реальных вакансий HeadHunter, адаптация резюме, векторный скоринг и экспорт в PDF.  

### Нужные улучшения и поправки:
${improvements.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

---

### Рисунок 1. Архитектурный поток данных MeDev: от парсинга вакансии до генерации резюме
![Архитектурный поток MeDev](medev_workflow_diagram.png)
`;

fs.writeFileSync(OUTPUT_MD, mdContent, 'utf-8');
console.log('Report generation complete!');
console.log('DOCX:', OUTPUT_DOCX);
console.log('MD:', OUTPUT_MD);
