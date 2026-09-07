import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Политика возврата средств — MeDev',
  description: 'Условия и процедура возврата денежных средств за подписку MeDev PRO.',
};

export default function RefundPage() {
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
            <ShieldCheck className="h-8 w-8 text-[#2ea043]" aria-hidden="true" />
            <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Политика возврата средств</h1>
          </div>
          <div className="mt-2 text-xs text-[#8b949e]">Последнее обновление: 7 сентября 2026 г.</div>

          <div className="mt-8 space-y-8 text-sm text-[#c9d1d9] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">1. 14-дневная гарантия возврата</h2>
              <p>
                Мы уверены в пользе сервиса MeDev для ускорения поиска работы. Если вы впервые приобрели тарифный план PRO и по какой-либо причине сервис не оправдал ваших ожиданий либо вы столкнулись с непреодолимой технической неисправностью, вы имеете право запросить полный возврат средств в течение <strong>14 календарных дней</strong> с момента первоначальной оплаты.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">2. Условия предоставления возврата</h2>
              <p>Возврат денежных средств осуществляется при соблюдении следующих условий:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#c9d1d9]">
                <li>Обращение поступило не позднее 14 календарных дней с момента совершения транзакции.</li>
                <li>Запрос отправлен с адреса электронной почты, привязанного к аккаунту MeDev.</li>
                <li>Не выявлено признаков намеренного злоупотребления сервисом (например, массовый автоматизированный скрейпинг API или генерация сотен резюме скриптами).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">3. Процедура запроса возврата</h2>
              <p>Для оформления возврата выполните простые шаги:</p>
              <ol className="list-decimal pl-5 space-y-2 text-[#c9d1d9]">
                <li>
                  Отправьте письмо на наш адрес службы поддержки:{' '}
                  <a
                    href="mailto:support@medev.mrsgemaseny.com"
                    className="font-semibold text-[#58a6ff] hover:underline"
                  >
                    support@medev.mrsgemaseny.com
                  </a>
                  .
                </li>
                <li>
                  В теме письма укажите: <code>Запрос возврата: [ваш логин / email]</code>.
                </li>
                <li>
                  Приложите идентификатор платежа (номер транзакции Kaspi Pay или квитанцию Stripe).
                </li>
                <li>
                  Кратко укажите причину — это поможет нам улучшить сервис.
                </li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">4. Сроки и способ возврата</h2>
              <p>
                Заявки рассматриваются нашей командой в течение <strong>3 рабочих дней</strong>. После подтверждения возврата средства отправляются обратно на ту же банковскую карту или счет Kaspi Pay, с которых производилась оплата.
              </p>
              <p className="text-xs text-[#8b949e]">
                Фактическое зачисление средств банком-эмитентом обычно занимает от 5 до 10 рабочих дней в зависимости от регламента вашего банка.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#f0f6fc]">5. Отмена продления подписки</h2>
              <p>
                Вы можете отключить автопродление подписки в любой момент в настройках профиля. Доступ к функциям PRO сохранится до конца уже оплаченного расчетного периода без списания средств за следующий месяц.
              </p>
            </section>

            <section className="space-y-3 rounded-xl border border-[#30363d] bg-[#161b22] p-5">
              <div className="flex items-center gap-2 text-base font-semibold text-[#f0f6fc]">
                <HelpCircle className="h-5 w-5 text-[#58a6ff]" aria-hidden="true" />
                <span>Вопросы по платежам?</span>
              </div>
              <p className="text-xs text-[#8b949e]">
                Если у вас возникли вопросы по тарифам или списаниям, напишите нам на{' '}
                <a
                  href="mailto:support@medev.mrsgemaseny.com"
                  className="text-[#58a6ff] hover:underline"
                >
                  support@medev.mrsgemaseny.com
                </a>
                . Мы отвечаем в течение 24 часов.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
