import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { CookieBanner } from '../components/CookieBanner';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0d1117',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MeDev — Резюме и портфолио из твоего GitHub',
  description:
    'Подключи GitHub — MeDev создаст сильное резюме под конкретную вакансию и личную страницу-портфолио. Скачай готовый PDF в один клик.',
  keywords: [
    'MeDev',
    'GitHub резюме',
    'конструктор резюме для разработчиков',
    'портфолио разработчика',
    'трекер откликов',
    'IT резюме PDF',
  ],
  authors: [{ name: 'Murat Orynbasar', url: 'https://github.com/MrSgemaSeny' }],
  metadataBase: new URL('https://medev.mrsgemaseny.com'),
  alternates: {
    canonical: 'https://medev.mrsgemaseny.com',
  },
  openGraph: {
    title: 'MeDev — Резюме и портфолио из твоего GitHub',
    description:
      'Подключи GitHub — MeDev создаст сильное резюме под конкретную вакансию и личную страницу-портфолио. Скачай готовый PDF в один клик.',
    url: 'https://medev.mrsgemaseny.com',
    siteName: 'MeDev',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: 'https://medev.mrsgemaseny.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MeDev — резюме из твоего GitHub за 2 минуты',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeDev — Резюме и портфолио из твоего GitHub',
    description:
      'Подключи GitHub — MeDev создаст сильное резюме под конкретную вакансию и личную страницу-портфолио.',
    images: ['https://medev.mrsgemaseny.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[#0d1117] font-sans text-[#c9d1d9] antialiased selection:bg-[#238636]/30 selection:text-[#f0f6fc]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-[#238636] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Перейти к основному содержимому
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
