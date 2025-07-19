import { useState } from 'react';

interface MealFormProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleArrayChange: (field: string, values: string[]) => void;
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
  const [showAllergies, setShowAllergies] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [modalita, setModalita] = useState<'guidata' | 'esperto'>(formData.modalita || 'guidata');

  // Opzioni per allergie
  const allergieOptions = [
    'Glutine', 'Lattosio', 'Noci', 'Uova', 'Pesce', 'Crostacei', 
    'Soia', 'Sesamo', 'Sedano', 'Senape', 'Solfiti', 'Lupini'
  ];

  // Opzioni per preferenze
  const preferencesOptions = [
    'Vegetariano', 'Vegano', 'Pesce', 'Pollo', 'Carne rossa', 
    'Legumi', 'Cereali integrali', 'Frutta secca', 'Semi', 
    'Quinoa', 'Avocado', 'Verdure verdi', 'Proteine in polvere'
  ];

  const toggleAllergia = (allergia: string) => {
    const current = formData.allergie || [];
    const updated = current.includes(allergia)
      ? current.filter((a: string) => a !== allergia)
      : [...current, allergia];
    handleArrayChange('allergie', updated);
  };

  const togglePreference = (preference: string) => {
    const current = formData.preferenze || [];
    const updated = current.includes(preference)
      ? current.filter((p: string) => p !== preference)
      : [...current, preference];
    handleArrayChange('preferenze', updated);
  };

  // 🎯 FUNZIONE TOGGLE MODALITÀ
  const handleModalitaChange = (newModalita: 'guidata' | 'esperto') => {
    setModalita(newModalita);
    handleInputChange('modalita', newModalita);
    
    // Reset campi specifici modalità quando si cambia
    if (newModalita === 'guidata') {
      // Reset campi esperto
      handleInputChange('calorie_totali', '');
      handleInputChange('proteine_totali', '');
      handleInputChange('carboidrati_totali', '');
      handleInputChange('grassi_totali', '');
      handleInputChange('distribuzione_personalizzata', null);
    } else if (newModalita === 'esperto') {
      // Reset campi guidati non essenziali (mantieni nome, email, etc.)
      // I campi base rimangono per dare contesto
    }
  };

  // 🧮 VALIDAZIONE MACRO AUTOMATICA
  const calculateMacroPercentages = () => {
    const calorie = parseFloat(formData.calorie_totali) || 0;
    const proteine = parseFloat(formData.proteine_totali) || 0;
    const carboidrati = parseFloat(formData.carboidrati_totali) || 0;
    const grassi = parseFloat(formData.grassi_totali) || 0;
    
    if (calorie === 0) return { protPercent: 0, carbPercent: 0, grassPercent: 0, totalKcal: 0 };
    
    const protPercent = (proteine * 4 / calorie) * 100;
    const carbPercent = (carboidrati * 4 / calorie) * 100;
    const grassPercent = (grassi * 9 / calorie) * 100;
    const totalKcal = (proteine * 4) + (carboidrati * 4) + (grassi * 9);
    
    return { protPercent, carbPercent, grassPercent, totalKcal };
  };

  const { protPercent, carbPercent, grassPercent, totalKcal } = calculateMacroPercentages();
  const isCaloriesMatch = Math.abs(totalKcal - (parseFloat(formData.calorie_totali) || 0)) <= 20; // Tolleranza ±20 kcal

  return (
    <section id="meal-form" className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4" style={{color: '#8FBC8F'}}>
          📦 Crea il Tuo Meal Prep
        </h2>
        <p className="text-gray-300 text-lg">
          Compila il form per ottenere il tuo piano alimentare FITNESS personalizzato con ricette ottimizzate
        </p>
      </div>

      {hasSavedData && (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-400">✅</span>
            <span className="text-green-300">Dati precedenti caricati automaticamente</span>
          </div>
          <button
            onClick={clearSavedData}
            className="text-red-400 hover:text-red-300 text-sm underline"
          >
            🗑️ Cancella Dati e Inserisci Nuovi
          </button>
        </div>
      )}

      {/* 🎯 SELEZIONE MODALITÀ - NUOVO */}
      <div className="mb-8">
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="font-bold mb-4 text-center text-xl">Scegli Modalità di Calcolo:</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <button 
              type="button"
              className={`px-6 py-4 rounded-lg transition-all transform hover:scale-105 ${
                modalita === 'guidata' 
                  ? 'bg-green-600 text-white border-2 border-green-400' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              onClick={() => handleModalitaChange('guidata')}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🧭</div>
                <div className="font-bold">Modalità Guidata</div>
                <div className="text-xs mt-1">Calcolo automatico BMR</div>
                <div className="text-xs">Da peso, altezza, età</div>
              </div>
            </button>
            
            <button 
              type="button"
              className={`px-6 py-4 rounded-lg transition-all transform hover:scale-105 ${
                modalita === 'esperto' 
                  ? 'bg-blue-600 text-white border-2 border-blue-400' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
              onClick={() => handleModalitaChange('esperto')}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-bold">Modalità Esperto</div>
                <div className="text-xs mt-1">Input manuale macro</div>
                <div className="text-xs">Per Personal Trainer</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* DATI PERSONALI - SEMPRE VISIBILI */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-green-400">👤 Dati Personali</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome || ''}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Il tuo nome"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="tua.email@esempio.com"
                  required
                />
              </div>

              {/* Telefono */}
              <div>
                <label className="block text-sm font-medium mb-2">Telefono</label>
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Sesso - SEMPRE RICHIESTO */}
              <div>
                <label className="block text-sm font-medium mb-2">Sesso *</label>
                <select
                  value={formData.sesso || ''}
                  onChange={(e) => handleInputChange('sesso', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona</option>
                  <option value="maschio">Maschio</option>
                  <option value="femmina">Femmina</option>
                </select>
              </div>
            </div>
          </div>

          {/* 🧭 MODALITÀ GUIDATA - CAMPI TRADIZIONALI */}
          {modalita === 'guidata' && (
            <>
              {/* Dati Fisici Guidata */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-4 text-green-400">📏 Dati Fisici</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Età */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Età *</label>
                    <input
                      type="number"
                      value={formData.eta || ''}
                      onChange={(e) => handleInputChange('eta', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="33"
                      min="16"
                      max="80"
                      required
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Peso (kg) *</label>
                    <input
                      type="number"
                      value={formData.peso || ''}
                      onChange={(e) => handleInputChange('peso', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="77"
                      min="40"
                      max="200"
                      required
                    />
                  </div>

                  {/* Altezza */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Altezza (cm) *</label>
                    <input
                      type="number"
                      value={formData.altezza || ''}
                      onChange={(e) => handleInputChange('altezza', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="178"
                      min="140"
                      max="220"
                      required
                    />
                  </div>

                  {/* Livello di Attività */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Livello di Attività *</label>
                    <select
                      value={formData.attivita || ''}
                      onChange={(e) => handleInputChange('attivita', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleziona livello</option>
                      <option value="sedentario">Sedentario (nessun esercizio)</option>
                      <option value="leggero">Attività Leggera (1-3 giorni/settimana)</option>
                      <option value="moderato">Attività Moderata (3-5 giorni/settimana)</option>
                      <option value="intenso">Attività Intensa (6-7 giorni/settimana)</option>
                      <option value="molto_intenso">Molto Intenso (2x al giorno, allenamenti pesanti)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 🎯 MODALITÀ ESPERTO - CAMPI MACRO MANUALI */}
          {modalita === 'esperto' && (
            <div className="md:col-span-2">
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">🎯 Modalità Esperto - Input Macro Manuali</h3>
                
                {/* Input Macro */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Calorie Totali *</label>
                    <input
                      type="number"
                      value={formData.calorie_totali || ''}
                      onChange={(e) => handleInputChange('calorie_totali', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2400"
                      min="1200"
                      max="4000"
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">kcal/giorno</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Proteine *</label>
                    <input
                      type="number"
                      value={formData.proteine_totali || ''}
                      onChange={(e) => handleInputChange('proteine_totali', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="180"
                      min="50"
                      max="300"
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">grammi</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Carboidrati *</label>
                    <input
                      type="number"
                      value={formData.carboidrati_totali || ''}
                      onChange={(e) => handleInputChange('carboidrati_totali', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="240"
                      min="30"
                      max="400"
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">grammi</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Grassi *</label>
                    <input
                      type="number" 
                      value={formData.grassi_totali || ''}
                      onChange={(e) => handleInputChange('grassi_totali', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="80"
                      min="20"
                      max="200"
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">grammi</div>
                  </div>
                </div>
                
                {/* Validazione Macro Automatica */}
                {(formData.calorie_totali && formData.proteine_totali && formData.carboidrati_totali && formData.grassi_totali) && (
                  <div className={`rounded-lg p-4 mb-4 ${isCaloriesMatch ? 'bg-green-900/30 border border-green-700' : 'bg-yellow-900/30 border border-yellow-700'}`}>
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      {isCaloriesMatch ? '✅' : '⚠️'}
                      <span>Verifica Macro Automatica:</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-blue-400 font-bold">Proteine: {protPercent.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Target: 25-35%</div>
                        <div className={`text-xs ${protPercent >= 25 && protPercent <= 35 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {protPercent >= 25 && protPercent <= 35 ? '✅ OK' : '⚠️ Fuori range'}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-bold">Carb: {carbPercent.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Target: 40-50%</div>
                        <div className={`text-xs ${carbPercent >= 40 && carbPercent <= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {carbPercent >= 40 && carbPercent <= 50 ? '✅ OK' : '⚠️ Fuori range'}
                        </div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-bold">Grassi: {grassPercent.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Target: 20-30%</div>
                        <div className={`text-xs ${grassPercent >= 20 && grassPercent <= 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {grassPercent >= 20 && grassPercent <= 30 ? '✅ OK' : '⚠️ Fuori range'}
                        </div>
                      </div>
                      <div>
                        <div className="text-green-400 font-bold">Totale: {Math.round(totalKcal)} kcal</div>
                        <div className="text-xs text-gray-400">vs {formData.calorie_totali} target</div>
                        <div className={`text-xs ${isCaloriesMatch ? 'text-green-400' : 'text-red-400'}`}>
                          {isCaloriesMatch ? '✅ Match' : '❌ Discrepanza'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-300 font-bold">Qualità:</div>
                        <div className={`text-xs font-bold ${
                          isCaloriesMatch && protPercent >= 25 && protPercent <= 35 && carbPercent >= 40 && carbPercent <= 50 && grassPercent >= 20 && grassPercent <= 30
                            ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {isCaloriesMatch && protPercent >= 25 && protPercent <= 35 && carbPercent >= 40 && carbPercent <= 50 && grassPercent >= 20 && grassPercent <= 30
                            ? '🏆 PERFETTO' : '⚡ DA OTTIMIZZARE'}
                        </div>
                      </div>
                    </div>
                    
                    {!isCaloriesMatch && (
                      <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded text-sm">
                        <strong>⚠️ Attenzione:</strong> Le calorie calcolate dai macro ({Math.round(totalKcal)} kcal) non corrispondono al target inserito ({formData.calorie_totali} kcal). 
                        Verifica i valori inseriti.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OBIETTIVI FITNESS - SEMPRE VISIBILI */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-green-400">💪 Obiettivi Fitness</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Obiettivo */}
              <div>
                <label className="block text-sm font-medium mb-2">Obiettivo *</label>
                <select
                  value={formData.obiettivo || ''}
                  onChange={(e) => handleInputChange('obiettivo', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona obiettivo</option>
                  <option value="dimagrimento">Dimagrimento - Togli Calorie</option>
                  <option value="aumento-massa">Aumento Massa - Surplus Calorico</option>
                  <option value="mantenimento">Mantenimento - Calorie Bilanciate</option>
                  <option value="definizione">Definizione - Cut & Lean</option>
                </select>
              </div>

              {/* Durata Meal Prep */}
              <div>
                <label className="block text-sm font-medium mb-2">Durata Meal Prep (giorni) *</label>
                <select
                  value={formData.durata || ''}
                  onChange={(e) => handleInputChange('durata', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona durata</option>
                  <option value="1">1 Giorno (Test)</option>
                  <option value="2">2 Giorni (Weekend)</option>
                  <option value="3">3 Giorni</option>
                  <option value="5">5 Giorni (Settimana Lavorativa)</option>
                  <option value="7">7 Giorni (Settimana Completa)</option>
                </select>
              </div>

              {/* Numero Pasti al Giorno */}
              <div>
                <label className="block text-sm font-medium mb-2">Numero Pasti al Giorno *</label>
                <select
                  value={formData.pasti || ''}
                  onChange={(e) => handleInputChange('pasti', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleziona numero pasti</option>
                  <option value="2">2 Pasti (Intermittent Fasting)</option>
                  <option value="3">3 Pasti (Classico)</option>
                  <option value="4">4 Pasti (con Spuntino)</option>
                  <option value="5">5 Pasti (Bodybuilding)</option>
                  <option value="6">6 Pasti (Frequenti)</option>
                  <option value="7">7 Pasti (Ultra Frequenti)</option>
                </select>
              </div>

              {/* Varietà Pasti */}
              <div>
                <label className="block text-sm font-medium mb-2">Varietà Pasti *</label>
                <select
                  value={formData.varieta || 'diversi'}
                  onChange={(e) => handleInputChange('varieta', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="diversi">🌈 Pasti Diversi Tutti i Giorni</option>
                  <option value="ripetuti">🔄 Stessi Pasti Tutti i Giorni</option>
                </select>
              </div>
            </div>
          </div>

          {/* ALLERGIE E INTOLLERANZE - SEMPRE VISIBILI */}
          <div className="md:col-span-2">
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAllergies(!showAllergies)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400">⚠️</span>
                  <h3 className="text-lg font-semibold text-yellow-300">Allergie e Intolleranze</h3>
                  <span className="text-sm text-gray-400">
                    {formData.allergie?.length > 0 ? `${formData.allergie.length} selezionate` : 'Nessuna allergia selezionata - Clicca per configurare'}
                  </span>
                </div>
                <span className="text-yellow-400">{showAllergies ? '🔽' : '▶️'}</span>
              </div>
              
              {showAllergies && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {allergieOptions.map((allergia) => (
                    <button
                      key={allergia}
                      type="button"
                      onClick={() => toggleAllergia(allergia)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        formData.allergie?.includes(allergia)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {allergia}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PREFERENZE ALIMENTARI - SEMPRE VISIBILI */}
          <div className="md:col-span-2">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowPreferences(!showPreferences)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-green-400">🥗</span>
                  <h3 className="text-lg font-semibold text-green-300">Preferenze Alimentari e Regimi</h3>
                  <span className="text-sm text-gray-400">
                    {formData.preferenze?.length > 0 ? `${formData.preferenze.length} selezionate` : 'Nessun regime selezionato - Clicca per configurare'}
                  </span>
                </div>
                <span className="text-green-400">{showPreferences ? '🔽' : '▶️'}</span>
              </div>
              
              {showPreferences && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {preferencesOptions.map((preference) => (
                    <button
                      key={preference}
                      type="button"
                      onClick={() => togglePreference(preference)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        formData.preferenze?.includes(preference)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preference}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={isGenerating}
            className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all ${
              isGenerating
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                🧠 Generazione Piano FITNESS in corso...
              </span>
            ) : (
              `🏋️‍♂️ Genera Meal Prep ${modalita === 'esperto' ? '(Modalità Esperto)' : ''}`
            )}
          </button>
          
          {modalita === 'esperto' && (
            <div className="mt-3 text-sm text-blue-400">
              ⚡ Modalità Professional: Input macro diretto per massimo controllo
            </div>
          )}
        </div>
      </form>
    </section>
  );
}