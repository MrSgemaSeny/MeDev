import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Условия использования (Terms of Service) — MeDev',
  description: 'Пользовательское соглашение и правила предоставления услуг сервиса MeDev.',
};

export default function TermsPage() {
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
            <FileText className="h-8 w-8 text-[#2ea043]" aria-hidden="true" />
            <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Условия использования (Terms of Service)</h1>
          </div>
          <div className="mt-2 text-xs text-[#8b949e]">Последнее обновление: 7 сентября 2026 г.</div>

          <div className="mt-8 space-y-8 text-sm text-[#c9d1d9] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">1. Предмет соглашения и акцепт</h2>
              <p>
                Настоящие Условия использования представляют собой юридически обязательный договор между вами (Пользователем) и платформой <strong>MeDev</strong> (Оператор: Индивидуальный предприниматель Орынбасар Мурат / ИП Орынбасар М., г. Алматы, Республика Казахстан). Регистрируя аккаунт, подключая учетную запись GitHub или продолжая использование сайта, вы безоговорочно соглашаетесь с данными условиями.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">2. Описание сервиса и учетная запись</h2>
              <p>
                MeDev предоставляет специализированные инструменты для разработчиков программного обеспечения: автоматическую агрегацию публичной активности GitHub, адаптацию и экспорт ATS-резюме в формате PDF, создание персональной веб-страницы портфолио и ведение канбан-доски откликов на вакансии.
              </p>
              <p>
                Пользователь несет единоличную ответственность за безопасность своей учетной записи и достоверность сведений, размещаемых в резюме.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">3. Тарифные планы, оплата и правила возврата</h2>
              <p>
                Базовый тариф <strong>Developer</strong> предоставляется бесплатно на постоянной основе. Дополнительные возможности предоставляются в рамках платной подписки <strong>PRO</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>Оплата тарифа PRO принимается через провайдеров Kaspi Pay (в тенге) и Stripe (в долларах США).</li>
                <li>Подписка не содержит скрытых комиссий и может быть отменена пользователем в любой момент в настройках профиля.</li>
                <li>
                  В отношении платных подписок действует <strong>14-дневная гарантия возврата средств</strong>. Подробный регламент, критерии и сроки изложены в отдельном документе:{' '}
                  <Link href="/refund" className="font-semibold text-[#58a6ff] hover:underline">
                    Политика возврата средств (Refund Policy)
                  </Link>
                  .
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">4. Интеллектуальная собственность</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>
                  <strong>Ваши данные и код:</strong> Пользователь сохраняет 100% исключительных авторских прав на свой код, содержимое резюме, описания проектов и персональные материалы. MeDev не претендует на интеллектуальную собственность пользователя.
                </li>
                <li>
                  <strong>Платформа:</strong> Программный код сервиса MeDev, дизайн интерфейса, визуальные стили шаблонов резюме и фирменное наименование защищены законодательством об интеллектуальной собственности.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">5. Ограничение ответственности и гарантии</h2>
              <p>
                Сервис MeDev предоставляется по принципу «как есть» (as is). Мы прилагаем максимальные усилия для обеспечения бесперебойной работы и совместимости с популярными ATS-системами, однако MeDev не может гарантировать и не несет ответственности за решения сторонних работодателей, получение вами офферов или трудоустройство.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">6. Применимое право и разрешение споров</h2>
              <p>
                Настоящее соглашение регулируется действующим законодательством Республики Казахстан. Все споры и разногласия разрешаются путем конструктивных переговоров в досудебном претензионном порядке (срок ответа на претензию — 30 календарных дней).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">7. Реквизиты исполнителя и контакты</h2>
              <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-2 text-xs">
                <div><strong>Исполнитель:</strong> Индивидуальный предприниматель Орынбасар Мурат (ИП Орынбасар М.)</div>
                <div><strong>Юрисдикция регистрации:</strong> г. Алматы, Республика Казахстан</div>
                <div><strong>Служба поддержки:</strong> <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">support@medev.mrsgemaseny.com</a></div>
                <div><strong>Юридические вопросы:</strong> <a href="mailto:privacy@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">privacy@medev.mrsgemaseny.com</a></div>
                <div><strong>Telegram:</strong> <a href="https://t.me/MrSgemaSeny" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">@MrSgemaSeny</a></div>
                <div><strong>Режим работы поддержки:</strong> Ежедневно, ответ в течение 24–48 часов</div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
