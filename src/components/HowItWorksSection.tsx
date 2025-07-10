// 🎨 SEZIONE "COME FUNZIONA" REDESIGN COMPLETO

export default function HowItWorksSection() {
  return (
    <section className="bg-gray-800 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 🎯 HEADER DINAMICO */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            🚀 Il Tuo Trasformatore Fitness
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Da zero a eroe del meal prep in <span className="text-green-400 font-bold">4 step rivoluzionari</span>. 
            Trasforma la tua alimentazione con la precisione scientifica che meriti.
          </p>
        </div>

        {/* 🎮 STEPS INTERATTIVI CON ANIMAZIONI */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          
          {/* STEP 1 - PROFILO */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-purple-500/25">
              
              {/* Numero Badge Animato */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl transform group-hover:rotate-12 transition-transform duration-300">
                1
              </div>
              
              {/* Icona Grande */}
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                💪
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">
                Profilo Atletico
              </h3>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                Crea il tuo DNA fitness: obiettivi, fisico, stile di vita. 
                <span className="text-purple-400 font-semibold">Ogni dettaglio conta</span> 
                per il tuo successo.
              </p>
              
              {/* Features List */}
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Calcoli metabolici precisi
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Allergie e preferenze
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Goal personalizzati
                </li>
              </ul>
              
              {/* Effetto Glow Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-pink-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* STEP 2 - GENERAZIONE */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-2xl hover:shadow-blue-500/25">
              
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl transform group-hover:-rotate-12 transition-transform duration-300">
                2
              </div>
              
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                🧬
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">
                Generazione Scientifica
              </h3>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                Formula Harris-Benedict, macronutrienti ottimizzati, timing perfetto. 
                <span className="text-blue-400 font-semibold">Scienza pura</span> 
                al servizio dei tuoi muscoli.
              </p>
              
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  BMR + TDEE calculation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  Distribuzione macro perfetta
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Timing nutrizionale
                </li>
              </ul>
              
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-cyan-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* STEP 3 - OTTIMIZZAZIONE */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl hover:shadow-green-500/25">
              
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl transform group-hover:rotate-12 transition-transform duration-300">
                3
              </div>
              
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">
                Optimizzazione Fitness
              </h3>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                Ogni ricetta ha un fitness score. Ingredienti selezionati, 
                <span className="text-green-400 font-semibold">zero compromessi</span> 
                tra gusto e risultati.
              </p>
              
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Fitness score 0-100
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Ingredienti power food
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Meal prep friendly
                </li>
              </ul>
              
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/5 to-emerald-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* STEP 4 - RISULTATI */}
          <div className="group relative">
            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-8 h-full transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-2xl hover:shadow-orange-500/25">
              
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl transform group-hover:-rotate-12 transition-transform duration-300">
                4
              </div>
              
              <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                🏆
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white">
                Trasformazione Totale
              </h3>
              
              <p className="text-gray-300 leading-relaxed mb-6">
                Piano completo con immagini, sostituzioni smart, lista spesa. 
                <span className="text-orange-400 font-semibold">Il tuo successo</span> 
                inizia qui.
              </p>
              
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Sostituzioni intelligenti
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Lista spesa automatica
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Progress tracking
                </li>
              </ul>
              
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/5 to-red-600/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* 📊 SEZIONE BENEFICI CON ANIMAZIONE */}
        <div className="bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-12 border border-gray-700/50">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            
            <div className="space-y-4">
              <div className="text-5xl font-bold text-green-400">2.5x</div>
              <div className="text-xl font-semibold text-white">Risultati Più Veloci</div>
              <div className="text-gray-400">Piani scientifici accelerano i progressi</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-5xl font-bold text-blue-400">90%</div>
              <div className="text-xl font-semibold text-white">Tempo Risparmiato</div>
              <div className="text-gray-400">Meal prep automatizzato e intelligente</div>
            </div>
            
            <div className="space-y-4">
              <div className="text-5xl font-bold text-purple-400">∞</div>
              <div className="text-xl font-semibold text-white">Varietà Garantita</div>
              <div className="text-gray-400">Mai più monotonia alimentare</div>
            </div>
          </div>
        </div>

        {/* 🎯 CTA SECTION */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-600 to-blue-600 p-1 rounded-full">
            <button 
              onClick={() => document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              🚀 Inizia La Tua Trasformazione
            </button>
            <span className="text-white px-6 py-2 text-sm font-medium">
              Gratis • 2 minuti • Risultati immediati
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 EFFETTI BACKGROUND ANIMATI */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
    </section>
  );
}