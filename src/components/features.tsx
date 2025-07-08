export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
        Perché Scegliere Meal Prep Planner?
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-orange-400 to-red-500 h-48 rounded-t-xl flex items-center justify-center p-4">
            <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center" alt="Risparmio di Tempo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">Risparmio di Tempo</h3>
            <p className="text-gray-300">Prepara i tuoi pasti per più giorni in una sola sessione, liberando tempo prezioso durante la settimana.</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 h-48 rounded-t-xl flex items-center justify-center p-4">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop&crop=center" alt="Riduzione degli Sprechi" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">Riduzione degli Sprechi</h3>
            <p className="text-gray-300">Una lista spesa precisa ti aiuta a comprare solo ciò che serve, riducendo gli sprechi alimentari e il budget.</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-48 rounded-t-xl flex items-center justify-center p-4">
            <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center" alt="Obiettivi Raggiungibili" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">Obiettivi Raggiungibili</h3>
            <p className="text-gray-300">Piani personalizzati per perdita peso, aumento massa o mantenimento, con calcolo calorico dettagliato.</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 h-48 rounded-t-xl flex items-center justify-center p-4">
            <img src="/images/image4.png" alt="Ricette Varie e Gustose" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">Ricette Varie e Gustose</h3>
            <p className="text-gray-300">Scopri nuove ricette adatte alle tue preferenze e restrizioni alimentari.</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-pink-400 to-purple-500 h-48 rounded-t-xl flex items-center justify-center p-4">
            <img src="/images/image5.png" alt="Mobile-Friendly" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">Mobile-Friendly</h3>
            <p className="text-gray-300">Accedi ai tuoi piani e ricette ovunque, dal tuo smartphone o tablet.</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-teal-400 to-green-500 h-48 rounded-t-xl flex items-center justify-center p-4">
            <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&crop=center" alt="AI Sostituzione Ingredienti" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">🤖 AI Sostituzione Ingredienti</h3>
            <p className="text-gray-300">Non hai un ingrediente? L'AI ti suggerisce alternative intelligenti considerando allergie e preferenze.</p>
          </div>
        </div>
      </div>
    </section>
  );
}