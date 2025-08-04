export default function Hero() {
  return (
    <section className="bg-brand-light py-24 px-6 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-brand-dark leading-tight">
        Train like top agents.<br />
        <span className="text-brand-blue">Overcome objections in real time.</span>
      </h1>
      <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
        ObjectionIQ simulates real conversations so insurance agents can practice and improve their skills using AI-powered voice training.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-3 rounded-xl border border-gray-300 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        <button className="bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition focus:ring-2 focus:ring-brand-blue">
          Request Access
        </button>
      </div>
    </section>
  );
} 