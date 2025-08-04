'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PersonaCard from '@/components/PersonaCard';
import ROICalculator from '@/components/ROICalculator';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-light">
        <Hero />
        <section className="mt-12">
          <PersonaCard />
        </section>
        
        {/* ROI Calculator Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark mb-4">
                Calculate Your Training ROI
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See how improved objection handling can impact your conversion rates and cost per sale
              </p>
            </div>
            <ROICalculator />
          </div>
        </section>
      </main>
    </>
  );
}

