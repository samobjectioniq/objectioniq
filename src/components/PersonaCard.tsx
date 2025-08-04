export default function PersonaCard() {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 max-w-sm mx-auto">
      <h3 className="text-xl font-semibold text-brand-dark mb-2">Sarah Mitchell</h3>
      <p className="text-sm text-gray-600">
        &quot;I&apos;m shopping around — what makes your policy different?&quot;<br />
        <span className="italic text-gray-400">AI Persona · Customer Objection Roleplay</span>
      </p>
      <button className="mt-4 w-full bg-brand-blue text-white py-2 rounded-xl hover:bg-blue-700 transition">
        Start Training
      </button>
    </div>
  );
} 