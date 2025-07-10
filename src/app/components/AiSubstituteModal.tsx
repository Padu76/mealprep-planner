interface AISubstituteModalProps {
  showModal: boolean;
  selectedIngredient: {
    ingredient: string;
    dayIndex: number;
    mealType: string;
    ingredientIndex: number;
  } | null;
  isLoadingSubstitutes: boolean;
  substitutes: Array<{
    ingredient: string;
    reason: string;
    difficulty: 'Facile' | 'Medio' | 'Difficile';
    tasteChange: 'Minimo' | 'Moderato' | 'Significativo';
    cookingNotes?: string;
  }>;
  onApplySubstitution: (newIngredient: string) => void;
  onCloseModal: () => void;
}

export default function AISubstituteModal({
  showModal,
  selectedIngredient,
  isLoadingSubstitutes,
  substitutes,
  onApplySubstitution,
  onCloseModal
}: AISubstituteModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{color: '#8FBC8F'}}>
                🔀 AI Sostituzione Ingrediente
              </h3>
              <p className="text-gray-300">
                <span className="font-semibold">Ingrediente:</span> {selectedIngredient?.ingredient}
              </p>
            </div>
            <button
              onClick={onCloseModal}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoadingSubstitutes ? (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-4">🤖</div>
                              <p className="text-lg">Il sistema sta analizzando alternative intelligenti...</p>
              <p className="text-sm text-gray-400 mt-2">Considerando allergie, preferenze e funzione culinaria</p>
            </div>
          ) : substitutes.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold mb-4">🎯 Alternative Consigliate:</h4>
              {substitutes.map((substitute, index) => (
                <div key={index} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-lg" style={{color: '#8FBC8F'}}>
                      {substitute.ingredient}
                    </h5>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        substitute.difficulty === 'Facile' ? 'bg-green-600' :
                        substitute.difficulty === 'Medio' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {substitute.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        substitute.tasteChange === 'Minimo' ? 'bg-green-600' :
                        substitute.tasteChange === 'Moderato' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        Sapore: {substitute.tasteChange}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-3">{substitute.reason}</p>
                  
                  {substitute.cookingNotes && (
                    <p className="text-sm text-blue-300 mb-3">
                      💡 <strong>Note:</strong> {substitute.cookingNotes}
                    </p>
                  )}
                  
                  <button
                    onClick={() => onApplySubstitution(substitute.ingredient)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    ✅ Usa Questo Ingrediente
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Nessuna alternativa trovata</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}