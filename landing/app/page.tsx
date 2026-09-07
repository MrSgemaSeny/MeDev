import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { TemplatesShowcase } from '../components/TemplatesShowcase';
import { Pricing } from '../components/Pricing';
import { Faq } from '../components/Faq';
import { Footer } from '../components/Footer';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117]">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <TemplatesShowcase />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
