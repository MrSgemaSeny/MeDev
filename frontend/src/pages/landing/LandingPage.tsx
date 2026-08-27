import { Header, Hero, Features, Pricing, Footer } from '../../widgets/landing';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans selection:bg-[rgba(9,105,218,0.15)]">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};
