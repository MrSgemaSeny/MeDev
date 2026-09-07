import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Политика конфиденциальности — MeDev',
  description: 'Политика конфиденциальности, обработки персональных данных и файлов cookie платформы MeDev.',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117]">
      <Header />
      <main id="main-content" className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58a6ff] hover:underline mb-8 focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Вернуться на главную</span>
          </Link>

          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#2ea043]" aria-hidden="true" />
            <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Политика конфиденциальности</h1>
          </div>
          <div className="mt-2 text-xs text-[#8b949e]">Последнее обновление: 7 сентября 2026 г.</div>

          <div className="mt-8 space-y-8 text-sm text-[#c9d1d9] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">1. Общие положения и оператор данных</h2>
              <p>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональной информации пользователей платформы <strong>MeDev</strong> (доступной по адресам <code>medev.mrsgemaseny.com</code> и <code>app.medev.mrsgemaseny.com</code>).
              </p>
              <p>
                Оператором обработки персональных данных является Индивидуальный предприниматель Орынбасар Мурат (ИП Орынбасар М., г. Алматы, Республика Казахстан). Сервис соблюдает нормы Закона Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите», а также общие принципы Общего регламента защиты данных ЕС (GDPR 2016/679).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">2. Какие данные мы собираем</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>
                  <strong>GitHub OAuth данные</strong>: публичный логин GitHub, адрес электронной почты, публичный аватар, публичные репозитории, языки программирования и статистика коммитов. Доступ к приватным репозиториям не запрашивается и не сохраняется.
                </li>
                <li>
                  <strong>Данные профиля и резюме</strong>: имя, фамилия, контактные ссылки (LinkedIn, Telegram), история профессионального опыта, образование и навыки, вносимые вами вручную либо извлекаемые из загружаемого PDF-резюме.
                </li>
                <li>
                  <strong>Платежные данные</strong>: при оплате подписки PRO обработка транзакций выполняется сертифицированными провайдерами Kaspi Pay и Stripe. MeDev <em>никогда не хранит</em> полные номера банковских карт или CVV/CVC коды на своих серверах.
                </li>
                <li>
                  <strong>Технические данные</strong>: IP-адрес, тип браузера, анонимная телеметрия производительности (Vercel Web Analytics).
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">3. Принцип минимизации данных (Data Minimization)</h2>
              <p>
                В соответствии со статьей 5(1)(c) GDPR и статьей 5 Закона РК № 94-V, платформа MeDev придерживается строгого принципа сбора данных в объеме, минимально необходимом для выполнения заявленных функций.
              </p>
              <p>
                Мы обрабатываем только ту информацию, которая напрямую требуется для синхронизации проектов разработки, формирования резюме, ведения трекера откликов и отображения страницы-портфолио.
              </p>
              <p><strong>Мы категорически НЕ собираем и НЕ запрашиваем:</strong></p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>Национальные идентификаторы, номера паспортов, удостоверений личности или ИИН.</li>
                <li>Точный домашний адрес (в профиле достаточно указать город и страну).</li>
                <li>Сведения о расовой или национальной принадлежности, религиозных убеждениях, здоровье или биометрические данные.</li>
                <li>Доступ к вашим приватным репозиториям или закрытому исходному коду.</li>
                <li>Полные реквизиты банковских карт и CVV/CVC коды.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">4. Использование искусственного интеллекта (AI) и безопасность PII</h2>
              <p>
                Для улучшения формулировок и адаптации резюме под вакансии используется Groq Cloud API (модель <code>openai/gpt-oss-20b</code>).
              </p>
              <p>
                <strong>Строгие гарантии:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>Перед отправкой текста в нейросеть конфиденциальные персональные данные (номер телефона, точный домашний адрес, персональный email) автоматически маскируются.</li>
                <li>Передаваемые в API данные <strong>не сохраняются и не используются для дообучения сторонних моделей искусственного интеллекта</strong>.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">5. Политика файлов cookie и локального хранилища</h2>
              <p>
                Мы используем только строго необходимые (Strictly Necessary) и функциональные файлы cookie и записи <code>localStorage</code>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li><code>refresh_token</code>: зашифрованный HttpOnly-cookie для безопасного поддержания авторизованной сессии.</li>
                <li><code>theme</code> в localStorage: сохранение выбранной цветовой темы (темная/светлая).</li>
                <li><code>cookie_consent</code> в localStorage: сохранение вашего подтверждения ознакомления с политикой.</li>
                <li>Vercel Analytics: cookieless-сбор агрегированных метрик загрузки страниц без отслеживания между сайтами. Рекламные сторонние трекеры (Meta Pixel, Google Ads) отсутствуют.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">6. Права пользователя и удаление данных</h2>
              <p>Вы имеете полное право в любой момент:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>Запросить выгрузку ваших данных в машиночитаемом формате (JSON / Markdown).</li>
                <li>Отредактировать любую информацию в личном кабинете.</li>
                <li>
                  Запросить <strong>полное и безвозвратное удаление</strong> вашего аккаунта и всех связанных баз данных, резюме и откликов, написав нам на{' '}
                  <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">
                    support@medev.mrsgemaseny.com
                  </a>
                  . Удаление выполняется в течение 48 часов.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">7. Реквизиты оператора и контакты</h2>
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-2 text-xs">
                <div><strong>Оператор данных:</strong> Индивидуальный предприниматель Орынбасар Мурат (ИП Орынбасар М.)</div>
                <div><strong>Юрисдикция:</strong> г. Алматы, Республика Казахстан</div>
                <div><strong>Email службы поддержки:</strong> <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">support@medev.mrsgemaseny.com</a></div>
                <div><strong>Email по вопросам приватности:</strong> <a href="mailto:privacy@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">privacy@medev.mrsgemaseny.com</a></div>
                <div><strong>Telegram:</strong> <a href="https://t.me/MrSgemaSeny" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">@MrSgemaSeny</a></div>
                <div><strong>Регламент ответов:</strong> В течение 24–48 часов</div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
