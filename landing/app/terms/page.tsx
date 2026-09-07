import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Условия использования — MeDev',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117]">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58a6ff] hover:underline mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Вернуться на главную</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Условия использования</h1>
          <div className="mt-2 text-xs text-[#8b949e]">Последнее обновление: 7 сентября 2026 г.</div>

          <div className="mt-8 space-y-6 text-sm text-[#c9d1d9] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">1. Общие положения</h2>
              <p>
                Используя сервис MeDev, вы соглашаетесь соблюдать настоящие условия. Платформа предоставляет инструменты для создания резюме, ведения портфолио и управления поиском работы.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">2. Ответственность за контент</h2>
              <p>
                Пользователь несет полную ответственность за достоверность информации, указываемой в резюме, и за соблюдение авторских прав на публикуемый код и проекты.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">3. Платные услуги</h2>
              <p>
                Оплата тарифа PRO осуществляется через официальные платежные шлюзы Kaspi Pay и Stripe. Подписка может быть отменена пользователем в любой момент.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
