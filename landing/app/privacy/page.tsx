import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export const metadata = {
  title: 'Политика конфиденциальности — MeDev',
};

export default function PrivacyPage() {
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

          <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Политика конфиденциальности</h1>
          <div className="mt-2 text-xs text-[#8b949e]">Последнее обновление: 7 сентября 2026 г.</div>

          <div className="mt-8 space-y-6 text-sm text-[#c9d1d9] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">1. Сбор информации</h2>
              <p>
                MeDev запрашивает доступ к вашим публичным данным GitHub через OAuth2 исключительно для формирования профиля инженера и синхронизации репозиториев. Мы не запрашиваем и не храним пароли от ваших внешних учетных записей.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">2. Использование данных и AI</h2>
              <p>
                Ваши данные используются для генерации структурированных PDF-резюме и ведения трекера откликов. Данные передаются в нейросеть Groq AI только в момент явного запроса генерации без сохранения для обучения сторонних моделей.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#f0f6fc]">3. Безопасность</h2>
              <p>
                Мы применяем строгие стандарты защиты (Row-Level Security, токены в httpOnly cookies, шифрование секретов в базе данных PostgreSQL).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
