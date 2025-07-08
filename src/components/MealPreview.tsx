interface MealPreviewProps {
  parsedPlan: {
    days: Array<{
      day: string;
      meals: {
        colazione: {
          nome: string;
          calorie: number;
          proteine: number;
          carboidrati: number;
          grassi: number;
          ingredienti: string[];
        };
        pranzo: {
          nome: string;
          calorie: number;
          proteine: number;
          carboidrati: number;
          grassi: number;
          ingredienti: string[];
        };
        cena: {
          nome: string;
          calorie: number;
          proteine: number;
          carboidrati: number;
          grassi: number;
          ingredienti: string[];
        };
      };
    }>;
  };
  handleReplacement: (mealType: string, dayNumber: string) => void;
  handleIngredientSubstitution: (ingredient: string, dayIndex: number, mealType: string, ingredientIndex: number) => void;
  isReplacing: string | null;
  confirmPlan: () => void;
  onGenerateNewPlan: () => void;
}

export default function MealPreview({
  parsedPlan,
  handleReplacement,
  handleIngredientSubstitution,
  isReplacing,
  confirmPlan,
  onGenerateNewPlan
}: MealPreviewProps) {
  return (
    <section id="preview-section" className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
        📋 Anteprima del Tuo Piano Alimentare
      </h2>
      <p className="text-center text-gray-300 mb-8">
        Controlla il piano e clicca "🔄 Cambia" per sostituire un singolo pasto o "🔀" per sostituire un ingrediente
      </p>
      
      <div className="space-y-12">
        {parsedPlan.days.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-3xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
              {day.day}
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Colazione - Card Arancione */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl">🌅 Colazione</h4>
                  <button
                    onClick={() => handleReplacement('colazione', day.day)}
                    disabled={isReplacing === `${day.day}-colazione`}
                    className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    {isReplacing === `${day.day}-colazione` ? '⏳' : '🔄 Cambia'}
                  </button>
                </div>
                <h5 className="font-bold text-lg mb-3">{day.meals.colazione.nome}</h5>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                    🔥 {day.meals.colazione.calorie} kcal
                  </span>
                  <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    🥩 {day.meals.colazione.proteine}g
                  </span>
                  <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                    🍞 {day.meals.colazione.carboidrati}g
                  </span>
                  <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    🥑 {day.meals.colazione.grassi}g
                  </span>
                </div>

                <details className="group">
                  <summary className="cursor-pointer font-semibold mb-2 hover:text-orange-100">
                    📝 Ingredienti ({day.meals.colazione.ingredienti.length})
                  </summary>
                  <ul className="space-y-1 text-sm">
                    {day.meals.colazione.ingredienti.map((ing: string, i: number) => (
                      <li key={i} className="text-orange-100 flex items-center justify-between group/ingredient hover:bg-white/10 rounded px-2 py-1 transition-colors">
                        <span>• {ing}</span>
                        <button
                          onClick={() => handleIngredientSubstitution(ing, dayIndex, 'colazione', i)}
                          className="opacity-0 group-hover/ingredient:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-bold transition-all"
                          title="Sostituisci con AI"
                        >
                          🔀
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>

              {/* Pranzo - Card Blu */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl">☀️ Pranzo</h4>
                  <button
                    onClick={() => handleReplacement('pranzo', day.day)}
                    disabled={isReplacing === `${day.day}-pranzo`}
                    className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    {isReplacing === `${day.day}-pranzo` ? '⏳' : '🔄 Cambia'}
                  </button>
                </div>
                <h5 className="font-bold text-lg mb-3">{day.meals.pranzo.nome}</h5>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                    🔥 {day.meals.pranzo.calorie} kcal
                  </span>
                  <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    🥩 {day.meals.pranzo.proteine}g
                  </span>
                  <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                    🍞 {day.meals.pranzo.carboidrati}g
                  </span>
                  <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    🥑 {day.meals.pranzo.grassi}g
                  </span>
                </div>

                <details className="group">
                  <summary className="cursor-pointer font-semibold mb-2 hover:text-blue-100">
                    📝 Ingredienti ({day.meals.pranzo.ingredienti.length})
                  </summary>
                  <ul className="space-y-1 text-sm">
                    {day.meals.pranzo.ingredienti.map((ing: string, i: number) => (
                      <li key={i} className="text-blue-100 flex items-center justify-between group/ingredient hover:bg-white/10 rounded px-2 py-1 transition-colors">
                        <span>• {ing}</span>
                        <button
                          onClick={() => handleIngredientSubstitution(ing, dayIndex, 'pranzo', i)}
                          className="opacity-0 group-hover/ingredient:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-bold transition-all"
                          title="Sostituisci con AI"
                        >
                          🔀
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>

              {/* Cena - Card Viola */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-xl">🌙 Cena</h4>
                  <button
                    onClick={() => handleReplacement('cena', day.day)}
                    disabled={isReplacing === `${day.day}-cena`}
                    className="bg-white/20 hover:bg-white/30 disabled:bg-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    {isReplacing === `${day.day}-cena` ? '⏳' : '🔄 Cambia'}
                  </button>
                </div>
                <h5 className="font-bold text-lg mb-3">{day.meals.cena.nome}</h5>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-red-700 px-3 py-1 rounded-full text-sm font-bold">
                    🔥 {day.meals.cena.calorie} kcal
                  </span>
                  <span className="bg-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    🥩 {day.meals.cena.proteine}g
                  </span>
                  <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">
                    🍞 {day.meals.cena.carboidrati}g
                  </span>
                  <span className="bg-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                    🥑 {day.meals.cena.grassi}g
                  </span>
                </div>

                <details className="group">
                  <summary className="cursor-pointer font-semibold mb-2 hover:text-purple-100">
                    📝 Ingredienti ({day.meals.cena.ingredienti.length})
                  </summary>
                  <ul className="space-y-1 text-sm">
                    {day.meals.cena.ingredienti.map((ing: string, i: number) => (
                      <li key={i} className="text-purple-100 flex items-center justify-between group/ingredient hover:bg-white/10 rounded px-2 py-1 transition-colors">
                        <span>• {ing}</span>
                        <button
                          onClick={() => handleIngredientSubstitution(ing, dayIndex, 'cena', i)}
                          className="opacity-0 group-hover/ingredient:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs font-bold transition-all"
                          title="Sostituisci con AI"
                        >
                          🔀
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <p className="text-center font-bold text-lg">
                📊 Totale Giorno: {day.meals.colazione.calorie + day.meals.pranzo.calorie + day.meals.cena.calorie} kcal
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-12">
        <button
          onClick={confirmPlan}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
        >
          ✅ Conferma Piano
        </button>

        <button
          onClick={onGenerateNewPlan}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
        >
          🔄 Genera Nuovo Piano
        </button>
      </div>
    </section>
  );
}