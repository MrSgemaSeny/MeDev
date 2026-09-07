import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58a6ff] hover:underline mb-2 focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Вернуться на главную</span>
        </Link>

        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-[#2ea043]" aria-hidden="true" />
          <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Политика возврата средств</h1>
        </div>
        <div className="text-xs text-[#8b949e]">Последнее обновление: 7 сентября 2026 г.</div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">1. 14-дневная гарантия возврата</h2>
            <p>
              Если вы впервые приобрели тарифный план PRO и сервис не оправдал ваших ожиданий либо возникли непреодолимые технические сложности, вы имеете право запросить полный возврат средств в течение <strong>14 календарных дней</strong> с даты платежа.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">2. Условия возврата</h2>
            <p>Возврат осуществляется при соблюдении следующих критериев:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Обращение отправлено в течение 14 календарных дней с момента оплаты.</li>
              <li>Запрос направлен с email-адреса, привязанного к аккаунту MeDev.</li>
              <li>Отсутствуют признаки мошенничества или автоматизированного скрейпинга платформы.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">3. Как запросить возврат</h2>
            <p>
              Отправьте письмо в службу поддержки на адрес{' '}
              <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline font-medium">
                support@medev.mrsgemaseny.com
              </a>{' '}
              с темой <code>Возврат: [ваш логин]</code> и приложите чек или идентификатор транзакции Kaspi Pay / Stripe.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">4. Сроки рассмотрения и выплаты</h2>
            <p>
              Заявка рассматривается в течение 3 рабочих дней. Возврат средств производится на ту же карту или счет Kaspi Pay, с которых производилась оплата. Срок зачисления банком составляет от 5 до 10 рабочих дней.
            </p>
          </section>

          <section className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-3">
            <div className="flex items-center gap-2 text-base font-semibold text-[#f0f6fc]">
              <HelpCircle className="h-5 w-5 text-[#58a6ff]" aria-hidden="true" />
              <span>Реквизиты исполнителя и служба поддержки</span>
            </div>
            <div className="space-y-1.5 text-xs text-[#c9d1d9]">
              <div><strong>Исполнитель:</strong> Индивидуальный предприниматель Орынбасар Мурат (ИП Орынбасар М.)</div>
              <div><strong>Юрисдикция:</strong> Республика Казахстан, г. Алматы</div>
              <div><strong>Email:</strong> <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">support@medev.mrsgemaseny.com</a></div>
              <div><strong>Telegram:</strong> <a href="https://t.me/MrSgemaSeny" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">@MrSgemaSeny</a></div>
              <div><strong>Регламент:</strong> Рассмотрение заявок в течение 3 рабочих дней, ответ поддержки до 24 часов</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
