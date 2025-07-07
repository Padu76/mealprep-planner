'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [parsedPlan, setParsedPlan] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  
  // 🆕 STATI PER SOSTITUZIONE INGREDIENTI
  const [showSubstitution, setShowSubstitution] = useState<{dayIndex: number, mealType: string, ingredient: string} | null>(null);
  const [substitutionData, setSubstitutionData] = useState<any>(null);
  const [isLoadingSubstitution, setIsLoadingSubstitution] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    eta: '',
    sesso: '',
    peso: '',
    altezza: '',
    attivita: '',
    obiettivo: '',
    allergie: '',
    preferenze: '',
    pasti: '',
    durata: '',
    varieta: ''
  });

  // ... [mantieni tutte le funzioni esistenti: generateShoppingList, generateCompleteDocument, parsePlanFromAI, etc.] ...

  // 🆕 FUNZIONE SOSTITUZIONE INGREDIENTI
  const handleIngredientSubstitution = async (dayIndex: number, mealType: string, ingredient: string) => {
    setIsLoadingSubstitution(true);
    setShowSubstitution({ dayIndex, mealType, ingredient });
    
    try {
      const recipe = parsedPlan.days[dayIndex].meals[mealType];
      
      const response = await fetch('/api/substitute-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient,
          recipe,
          allergies: formData.allergie,
          preferences: formData.preferenze
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubstitutionData(result.data);
      } else {
        alert('❌ Errore nella sostituzione ingrediente');
      }
    } catch (error) {
      alert('❌ Errore di connessione');
    } finally {
      setIsLoadingSubstitution(false);
    }
  };

  // 🆕 APPLICA SOSTITUZIONE
  const applySubstitution = (newIngredient: string) => {
    if (!showSubstitution || !parsedPlan) return;
    
    const { dayIndex, mealType, ingredient: oldIngredient } = showSubstitution;
    
    // Aggiorna parsedPlan
    const updatedPlan = { ...parsedPlan };
    const meal = updatedPlan.days[dayIndex].meals[mealType];
    const ingredientIndex = meal.ingredienti.findIndex((ing: string) => ing === oldIngredient);
    
    if (ingredientIndex !== -1) {
      meal.ingredienti[ingredientIndex] = newIngredient;
      setParsedPlan(updatedPlan);
      
      // Rigenera il documento completo
      const newDocument = generateCompleteDocument(updatedPlan);
      setGeneratedPlan(newDocument);
    }
    
    // Chiudi modal
    setShowSubstitution(null);
    setSubstitutionData(null);
  };

  // ... [mantieni tutte le altre funzioni esistenti] ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Meal Prep Planner</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
            <Link href="/ricette" className="hover:text-green-400 transition-colors">Ricette</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Features Section */}
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
              <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&crop=center" alt="Semplice e Intuitivo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">🤖 AI Sostituzione Ingredienti</h3>
              <p className="text-gray-300">Non hai un ingrediente? L'AI ti suggerisce alternative perfette per ogni ricetta!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ... [mantieni tutte le altre sezioni esistenti fino al Preview] ... */}

      {/* 🆕 ANTEPRIMA ENHANCED CON SOSTITUZIONE INGREDIENTI */}
      {showPreview && parsedPlan && (
        <section id="preview-section" className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
            📋 Anteprima del Tuo Piano Alimentare
          </h2>
          <p className="text-center text-gray-300 mb-8">
            Controlla il piano e clicca "🔄 Cambia" per sostituire un pasto o "🔀" per sostituire un ingrediente
          </p>
          
          <div className="space-y-12">
            {parsedPlan.days.map((day: any, dayIndex: number) => (
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
                    
                    {/* Macronutrienti */}
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

                    {/* 🆕 INGREDIENTI CON SOSTITUZIONE */}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-orange-100">
                        📝 Ingredienti ({day.meals.colazione.ingredienti.length})
                      </summary>
                      <ul className="space-y-2 text-sm">
                        {day.meals.colazione.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-orange-100 flex justify-between items-center group/item">
                            <span>• {ing}</span>
                            <button
                              onClick={() => handleIngredientSubstitution(dayIndex, 'colazione', ing)}
                              className="opacity-0 group-hover/item:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-all"
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
                    
                    {/* Macronutrienti */}
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

                    {/* 🆕 INGREDIENTI CON SOSTITUZIONE */}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-blue-100">
                        📝 Ingredienti ({day.meals.pranzo.ingredienti.length})
                      </summary>
                      <ul className="space-y-2 text-sm">
                        {day.meals.pranzo.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-blue-100 flex justify-between items-center group/item">
                            <span>• {ing}</span>
                            <button
                              onClick={() => handleIngredientSubstitution(dayIndex, 'pranzo', ing)}
                              className="opacity-0 group-hover/item:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-all"
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
                    
                    {/* Macronutrienti */}
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

                    {/* 🆕 INGREDIENTI CON SOSTITUZIONE */}
                    <details className="group">
                      <summary className="cursor-pointer font-semibold mb-2 hover:text-purple-100">
                        📝 Ingredienti ({day.meals.cena.ingredienti.length})
                      </summary>
                      <ul className="space-y-2 text-sm">
                        {day.meals.cena.ingredienti.map((ing: string, i: number) => (
                          <li key={i} className="text-purple-100 flex justify-between items-center group/item">
                            <span>• {ing}</span>
                            <button
                              onClick={() => handleIngredientSubstitution(dayIndex, 'cena', ing)}
                              className="opacity-0 group-hover/item:opacity-100 bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs transition-all"
                            >
                              🔀
                            </button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
                
                {/* Totale Giornaliero */}
                <div className="mt-6 bg-gray-700 rounded-lg p-4">
                  <p className="text-center font-bold text-lg">
                    📊 Totale Giorno: {day.meals.colazione.calorie + day.meals.pranzo.calorie + day.meals.cena.calorie} kcal
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Preview Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <button
              onClick={confirmPlan}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
            >
              ✅ Conferma Piano
            </button>

            <button
              onClick={() => {
                setShowPreview(false);
                setGeneratedPlan(null);
                setParsedPlan(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg"
            >
              🔄 Genera Nuovo Piano
            </button>
          </div>
        </section>
      )}

      {/* 🆕 MODAL SOSTITUZIONE INGREDIENTI */}
      {showSubstitution && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">
                  🔀 Sostituisci Ingrediente
                </h3>
                <button
                  onClick={() => {
                    setShowSubstitution(null);
                    setSubstitutionData(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-300 mt-2">
                Ingrediente da sostituire: <span className="font-bold text-emerald-400">{showSubstitution.ingredient}</span>
              </p>
            </div>

            <div className="p-6">
              {isLoadingSubstitution ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-gray-300">L'AI sta analizzando le alternative...</p>
                </div>
              ) : substitutionData ? (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {substitutionData.substitutions.map((sub: any, index: number) => (
                      <div key={index} className="bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-white">{sub.name}</h4>
                            <p className="text-emerald-400 font-medium">{sub.quantity}</p>
                          </div>
                          <button
                            onClick={() => applySubstitution(`${sub.quantity} ${sub.name}`)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            ✅ Usa Questo
                          </button>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{sub.reason}</p>
                        
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className={`px-3 py-1 rounded-full ${
                            sub.difficulty === 'Facile' ? 'bg-green-600' :
                            sub.difficulty === 'Medio' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {sub.difficulty}
                          </span>
                          <span className={`px-3 py-1 rounded-full ${
                            sub.taste_change === 'Nessuno' ? 'bg-green-600' :
                            sub.taste_change === 'Leggero' ? 'bg-yellow-600' : 'bg-orange-600'
                          }`}>
                            Sapore: {sub.taste_change}
                          </span>
                        </div>
                        
                        {sub.cooking_adjustment && (
                          <div className="mt-3 p-3 bg-blue-600/20 rounded-lg">
                            <p className="text-blue-300 text-sm">
                              💡 <strong>Nota cottura:</strong> {sub.cooking_adjustment}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {substitutionData.tips && (
                    <div className="bg-emerald-600/20 rounded-xl p-4">
                      <h4 className="font-bold text-emerald-400 mb-2">💡 Consigli dell'AI</h4>
                      <p className="text-emerald-200">{substitutionData.tips}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ... [mantieni tutte le altre sezioni esistenti: Results, FAQ, Footer] ... */}
    </div>
  );
}