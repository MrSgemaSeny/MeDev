import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0d1117',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MeDev — Data-First SaaS Платформа для Разработчиков',
  description:
    'Превратите ваш GitHub в профессиональное портфолио. Генерация ATS-резюме на базе Groq AI без галлюцинаций и встроенный Kanban-трекер откликов.',
  keywords: [
    'MeDev',
    'GitHub Resume',
    'ATS Resume Builder',
    'Groq AI',
    'Developer Portfolio',
    'Job Tracker',
    'Developer SaaS',
  ],
  authors: [{ name: 'Murat Orynbasar', url: 'https://github.com/MrSgemaSeny' }],
  metadataBase: new URL('https://medev.mrsgemaseny.com'),
  alternates: {
    canonical: 'https://medev.mrsgemaseny.com',
  },
  openGraph: {
    title: 'MeDev — Data-First SaaS Платформа для Разработчиков',
    description:
      'Автоматический парсинг GitHub, генерация ATS-friendly PDF-резюме через Groq AI и персональный трекер откликов.',
    url: 'https://medev.mrsgemaseny.com',
    siteName: 'MeDev',
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeDev — Платформа для инженеров',
    description:
      'Синхронизация GitHub, генерация ATS PDF-резюме на базе Groq AI и трекер откликов.',
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
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-[#0d1117] text-[#c9d1d9] antialiased selection:bg-[#238636]/30 selection:text-[#f0f6fc]">
        {children}
      </body>
    </html>
  );
}
