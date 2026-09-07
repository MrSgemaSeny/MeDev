import {
  Header,
  Hero,
  Features,
  TemplatesShowcase,
  Pricing,
  Faq,
  Footer,
} from '../../widgets/landing';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[#238636]/30">
      <Header />
      <main>
        <Hero />
        <Features />
        <TemplatesShowcase />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
};
