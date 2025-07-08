interface MealFormProps {
  formData: {
    nome: string;
    eta: string;
    sesso: string;
    peso: string;
    altezza: string;
    attivita: string;
    obiettivo: string;
    allergie: string;
    preferenze: string;
    pasti: string;
    durata: string;
    varieta: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isGenerating: boolean;
  hasSavedData: boolean;
  clearSavedData: () => void;
}

export default function MealForm({
  formData,
  handleInputChange,
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

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Allergie e Intolleranze</label>
          <textarea
            value={formData.allergie}
            onChange={(e) => handleInputChange('allergie', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
            rows={3}
            placeholder="Es: lattosio, glutine, noci..."
            disabled={isGenerating}
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Preferenze Alimentari</label>
          <textarea
            value={formData.preferenze}
            onChange={(e) => handleInputChange('preferenze', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-400 focus:outline-none"
            rows={3}
            placeholder="Es: vegetariano, vegano, mediterraneo..."
            disabled={isGenerating}
          />
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