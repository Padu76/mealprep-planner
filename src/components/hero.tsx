export default function Hero() {
  return (
    <section className="text-center py-12 px-4" style={{background: 'linear-gradient(to right, #8FBC8F, #9ACD32)'}}>
      <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
        Rivoluziona la Tua Alimentazione con<br />Meal Prep Planner
      </h1>
      <p className="text-lg text-gray-800 mb-6 max-w-2xl mx-auto">
        Generazione meal prep, Lista della Spesa Intelligente e Ricette Passo-Passo per una Vita più Sana e Semplice.
      </p>
      <button 
        onClick={() => document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' })}
        className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
      >
        Inizia Ora!
      </button>
    </section>
  );
}