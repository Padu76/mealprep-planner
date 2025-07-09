// Definizione costanti per allergie e preferenze
export const ALLERGIE_OPTIONS = [
  { id: 'glutine', label: 'Glutine', description: 'Cereali contenenti glutine' },
  { id: 'lattosio', label: 'Lattosio', description: 'Zucchero del latte' },
  { id: 'latte', label: 'Latte e Latticini', description: 'Tutti i prodotti caseari' },
  { id: 'uova', label: 'Uova', description: 'Uova e derivati' },
  { id: 'pesce', label: 'Pesce', description: 'Pesce e prodotti ittici' },
  { id: 'frutti_mare', label: 'Frutti di Mare', description: 'Crostacei e molluschi' },
  { id: 'noci', label: 'Noci', description: 'Noci e frutta secca' },
  { id: 'arachidi', label: 'Arachidi', description: 'Arachidi e derivati' },
  { id: 'soia', label: 'Soia', description: 'Soia e prodotti derivati' },
  { id: 'sesamo', label: 'Sesamo', description: 'Semi di sesamo' },
  { id: 'sedano', label: 'Sedano', description: 'Sedano e derivati' },
  { id: 'senape', label: 'Senape', description: 'Senape e derivati' },
  { id: 'lupini', label: 'Lupini', description: 'Lupini e derivati' },
  { id: 'solfiti', label: 'Solfiti', description: 'Anidride solforosa e solfiti' }
];

export const PREFERENZE_OPTIONS = [
  { id: 'standard', label: 'Standard', description: 'Dieta equilibrata senza restrizioni' },
  { id: 'mediterraneo', label: 'Mediterraneo', description: 'Dieta mediterranea tradizionale' },
  { id: 'vegetariano', label: 'Vegetariano', description: 'Senza carne e pesce' },
  { id: 'vegano', label: 'Vegano', description: 'Solo alimenti vegetali' },
  { id: 'keto', label: 'Keto', description: 'Basso contenuto di carboidrati' },
  { id: 'paleo', label: 'Paleo', description: 'Dieta paleolitica' },
  { id: 'low_carb', label: 'Low-Carb', description: 'Ridotto contenuto di carboidrati' },
  { id: 'high_protein', label: 'High-Protein', description: 'Alto contenuto proteico' },
  { id: 'bilanciato', label: 'Bilanciato', description: 'Equilibrio ottimale macronutrienti' },
  { id: 'senza_glutine', label: 'Senza Glutine', description: 'Gluten-free' },
  { id: 'anti_infiammatorio', label: 'Anti-infiammatorio', description: 'Alimenti anti-infiammatori' },
  { id: 'detox', label: 'Detox', description: 'Dieta depurativa' }
];

interface MealFormProps {
  formData: {
    nome: string;
    eta: string;
    sesso: string;
    peso: string;
    altezza: string;
    attivita: string;
    obiettivo: string;
    allergie: string[]; // Ora è un array
    preferenze: string[]; // Ora è un array
    pasti: string;
    durata: string;
    varieta: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleArrayChange: (field: string, value: string, checked: boolean) => void; // Nuova funzione
  handleSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  hasSavedData: boolean;
  clearSavedData: () => void;
}

export default function MealForm({
  formData,
  handleInputChange,
  handleArrayChange,
  handleSubmit,
  isGenerating,
  hasSavedData,
  clearSavedData
}: MealFormProps) {
  return (
    <section id="meal-form" className="max-w-4xl mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
        🍽️ Crea la Tua Programmazione Pasti e Ricette
      </h2>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {hasSavedData && (
          <div className="bg-green-600/20 border border-green-500 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-green-400">✅ Dati preferiti caricati</span>
          </div>
        )}
        
        {hasSavedData && (
          <button
            onClick={clearSavedData}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            🗑️ Cancella Dati e Inserisci Nuovi
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Età</label>
            <input
              type="number"
              value={formData.eta}
              onChange={(e) => handleInputChange('eta', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sesso</label>
            <select
              value={formData.sesso}
              onChange={(e) => handleInputChange('sesso', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            >
              <option value="">Seleziona...</option>
              <option value="maschio">Maschio</option>
              <option value="femmina">Femmina</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Peso (kg)</label>
            <input
              type="number"
              value={formData.peso}
              onChange={(e) => handleInputChange('peso', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Altezza (cm)</label>
            <input
              type="number"
              value={formData.altezza}
              onChange={(e) => handleInputChange('altezza', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Livello di Attività</label>
            <select
              value={formData.attivita}
              onChange={(e) => handleInputChange('attivita', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            >
              <option value="">Seleziona...</option>
              <option value="sedentario">Sedentario</option>
              <option value="leggero">Attività Leggera</option>
              <option value="moderato">Attività Moderata</option>
              <option value="intenso">Attività Intensa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Obiettivo</label>
            <select
              value={formData.obiettivo}
              onChange={(e) => handleInputChange('obiettivo', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            >
              <option value="">Seleziona...</option>
              <option value="perdita-peso">Perdita di Peso</option>
              <option value="mantenimento">Mantenimento</option>
              <option value="aumento-massa">Aumento Massa Muscolare</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Durata Meal Prep (giorni)</label>
            <select
              value={formData.durata}
              onChange={(e) => handleInputChange('durata', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            >
              <option value="">Seleziona...</option>
              <option value="2">2 Giorni</option>
              <option value="3">3 Giorni</option>
              <option value="5">5 Giorni</option>
              <option value="7">7 Giorni</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Numero Pasti al Giorno</label>
            <select
              value={formData.pasti}
              onChange={(e) => handleInputChange('pasti', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            >
              <option value="">Seleziona...</option>
              <option value="3">3 Pasti</option>
              <option value="4">4 Pasti</option>
              <option value="5">5 Pasti</option>
              <option value="6">6 Pasti</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Varietà Pasti</label>
            <select
              value={formData.varieta}
              onChange={(e) => handleInputChange('varieta', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
              required
              disabled={isGenerating}
            >
              <option value="">Seleziona...</option>
              <option value="diversi">🔄 Pasti Diversi per Giorno</option>
              <option value="ripetuti">🎯 Stessi Pasti Tutti i Giorni</option>
            </select>
          </div>
        </div>

        {/* SEZIONE ALLERGIE E INTOLLERANZE - CHECKBOX */}
        <div className="mt-8">
          <label className="block text-lg font-semibold mb-4" style={{color: '#8FBC8F'}}>
            ⚠️ Allergie e Intolleranze
          </label>
          <p className="text-sm text-gray-400 mb-4">
            Seleziona tutte le allergie e intolleranze che ti riguardano. Il sistema filtrerà automaticamente le ricette compatibili.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {ALLERGIE_OPTIONS.map((allergia) => (
              <label
                key={allergia.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.allergie.includes(allergia.id)
                    ? 'bg-red-600/20 border-red-500 text-red-300'
                    : 'bg-gray-700 border-gray-600 hover:border-red-400'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={allergia.description}
              >
                <input
                  type="checkbox"
                  checked={formData.allergie.includes(allergia.id)}
                  onChange={(e) => handleArrayChange('allergie', allergia.id, e.target.checked)}
                  className="mr-2 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  disabled={isGenerating}
                />
                <span className="text-sm">{allergia.label}</span>
              </label>
            ))}
          </div>
          {formData.allergie.length > 0 && (
            <div className="mt-3 p-3 bg-red-600/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">
                ✅ Allergie selezionate: {formData.allergie.length} 
                <span className="ml-2 text-xs">
                  ({ALLERGIE_OPTIONS.filter(a => formData.allergie.includes(a.id)).map(a => a.label).join(', ')})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* SEZIONE PREFERENZE ALIMENTARI - CHECKBOX */}
        <div className="mt-8">
          <label className="block text-lg font-semibold mb-4" style={{color: '#8FBC8F'}}>
            🥗 Preferenze Alimentari e Regimi
          </label>
          <p className="text-sm text-gray-400 mb-4">
            Seleziona i tuoi regimi alimentari preferiti. L'AI genererà ricette in linea con le tue scelte.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PREFERENZE_OPTIONS.map((preferenza) => (
              <label
                key={preferenza.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.preferenze.includes(preferenza.id)
                    ? 'bg-green-600/20 border-green-500 text-green-300'
                    : 'bg-gray-700 border-gray-600 hover:border-green-400'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={preferenza.description}
              >
                <input
                  type="checkbox"
                  checked={formData.preferenze.includes(preferenza.id)}
                  onChange={(e) => handleArrayChange('preferenze', preferenza.id, e.target.checked)}
                  className="mr-2 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  disabled={isGenerating}
                />
                <span className="text-sm">{preferenza.label}</span>
              </label>
            ))}
          </div>
          {formData.preferenze.length > 0 && (
            <div className="mt-3 p-3 bg-green-600/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300">
                ✅ Preferenze selezionate: {formData.preferenze.length}
                <span className="ml-2 text-xs">
                  ({PREFERENZE_OPTIONS.filter(p => formData.preferenze.includes(p.id)).map(p => p.label).join(', ')})
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={isGenerating}
            className={`px-12 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 ${
              isGenerating 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'hover:opacity-90'
            }`}
            style={{backgroundColor: isGenerating ? '#6B7280' : '#8FBC8F', color: 'black'}}
          >
            {isGenerating ? '🍽️ Creando programmazione pasti...' : '🚀 Crea Programmazione Pasti e Ricette'}
          </button>
        </div>
      </form>
    </section>
  );
}