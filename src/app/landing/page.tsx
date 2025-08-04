import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PersonaCard from '@/components/PersonaCard';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light">
        <Hero />
        <section className="mt-12">
          <PersonaCard />
        </section>
      </main>
    </>
  );
} 