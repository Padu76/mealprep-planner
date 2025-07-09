// Esempio di come aggiornare MealPreview.tsx per mostrare le immagini

export default function MealPreview({
  parsedPlan,
  handleReplacement,
  handleIngredientSubstitution,
  isReplacing,
  confirmPlan,
  onGenerateNewPlan
}: MealPreviewProps) {
  
  const renderMealCard = (meal: any, mealType: string, dayIndex: number) => {
    const isCurrentlyReplacing = isReplacing === `${parsedPlan.days[dayIndex].day}-${mealType}`;
    
    return (
      <div className="bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
        {/* 🖼️ IMMAGINE RICETTA */}
        <div className="relative mb-4">
          <img
            src={meal.imageUrl || `https://via.placeholder.com/400x300/8FBC8F/ffffff?text=${encodeURIComponent(meal.nome || 'Recipe')}`}
            alt={meal.nome}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              // Fallback sicuro se immagine non carica
              const target = e.target as HTMLImageElement;
              target.src = `https://via.placeholder.com/400x300/8FBC8F/ffffff?text=${encodeURIComponent(meal.nome || 'Recipe')}`;
            }}
          />
          
          {/* 🏋️‍♂️ FITNESS SCORE BADGE */}
          {meal.fitnessScore && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-bold">
              💪 {meal.fitnessScore}/100
            </div>
          )}
          
          {/* 📊 MACROS OVERLAY */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
            {meal.calorie} cal • {meal.proteine}P • {meal.carboidrati}C • {meal.grassi}F
          </div>
        </div>

        {/* 📝 CONTENUTO RICETTA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{meal.nome}</h3>
            <div className="flex items-center gap-2">
              {meal.rating && (
                <div className="flex items-center text-yellow-400">
                  <span>⭐</span>
                  <span className="text-sm ml-1">{meal.rating.toFixed(1)}</span>
                </div>
              )}
              <span className="text-sm text-gray-400">{meal.tempo}</span>
            </div>
          </div>

          {/* 🏷️ TAG CATEGORIA E CUCINA */}
          <div className="flex flex-wrap gap-2">
            {meal.categoria && (
              <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
                {meal.categoria}
              </span>
            )}
            {meal.tipoCucina && (
              <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                {meal.tipoCucina}
              </span>
            )}
            {meal.source && (
              <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                {meal.source}
              </span>
            )}
          </div>

          {/* 🏋️‍♂️ FITNESS DETAILS */}
          {meal.fitnessReasons && meal.fitnessReasons.length > 0 && (
            <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-green-400 mb-2">💪 Perché è Fitness:</h4>
              <ul className="text-sm text-green-300 space-y-1">
                {meal.fitnessReasons.map((reason: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 🥄 INGREDIENTI CLICCABILI */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Ingredienti:</h4>
            <div className="flex flex-wrap gap-2">
              {meal.ingredienti?.map((ingrediente: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleIngredientSubstitution(ingrediente, dayIndex, mealType, idx)}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg text-sm transition-colors cursor-pointer"
                  title="Clicca per sostituire questo ingrediente"
                >
                  {ingrediente}
                </button>
              ))}
            </div>
          </div>

          {/* 👨‍🍳 PREPARAZIONE */}
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Preparazione:</h4>
            <p className="text-gray-400 text-sm leading-relaxed">{meal.preparazione}</p>
          </div>

          {/* 🔄 BOTTONE SOSTITUZIONE */}
          <button
            onClick={() => handleReplacement(mealType, parsedPlan.days[dayIndex].day)}
            disabled={isCurrentlyReplacing}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isCurrentlyReplacing
                ? 'bg-yellow-600 text-yellow-100 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
            }`}
          >
            {isCurrentlyReplacing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sostituendo ricetta...
              </span>
            ) : (
              '🔄 Sostituisci con Ricetta Fitness'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="preview-section" className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4" style={{color: '#8FBC8F'}}>
          🏋️‍♂️ Il Tuo Piano Fitness Personalizzato
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Ecco il tuo piano meal prep ottimizzato per il fitness con ricette selezionate, immagini e score fitness.
        </p>
      </div>

      {/* 📊 STATS GENERALI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {parsedPlan.days.length}
          </div>
          <div className="text-sm text-gray-400">Giorni</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {parsedPlan.days.reduce((total: number, day: any) => 
              total + Object.keys(day.meals).length, 0
            )}
          </div>
          <div className="text-sm text-gray-400">Ricette</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(parsedPlan.days.reduce((total: number, day: any) => 
              total + Object.values(day.meals).reduce((dayTotal: number, meal: any) => 
                dayTotal + (meal?.fitnessScore || 0), 0
              ) / Object.keys(day.meals).length, 0
            ) / parsedPlan.days.length)}
          </div>
          <div className="text-sm text-gray-400">Fitness Score Medio</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round(parsedPlan.days.reduce((total: number, day: any) => 
              total + Object.values(day.meals).reduce((dayTotal: number, meal: any) => 
                dayTotal + (meal?.calorie || 0), 0
              ), 0
            ) / parsedPlan.days.length)}
          </div>
          <div className="text-sm text-gray-400">Cal/Giorno</div>
        </div>
      </div>

      {/* 📅 GIORNI E RICETTE */}
      <div className="space-y-8">
        {parsedPlan.days.map((day: any, dayIndex: number) => (
          <div key={dayIndex} className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#8FBC8F'}}>
              📅 {day.day}
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(day.meals).map(([mealType, meal]: [string, any]) => (
                <div key={mealType}>
                  <h4 className="text-lg font-semibold mb-3 text-center capitalize" style={{color: '#8FBC8F'}}>
                    {mealType.replace('spuntino1', 'Spuntino 1').replace('spuntino2', 'Spuntino 2').replace('spuntino3', 'Spuntino 3')}
                  </h4>
                  {renderMealCard(meal, mealType, dayIndex)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🎯 AZIONI FINALI */}
      <div className="flex flex-wrap gap-4 justify-center mt-12">
        <button
          onClick={confirmPlan}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105"
        >
          ✅ Conferma Piano Fitness
        </button>
        
        <button
          onClick={onGenerateNewPlan}
          className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold text-lg transition-all transform hover:scale-105"
        >
          🔄 Genera Nuovo Piano
        </button>
      </div>
    </section>
  );
}