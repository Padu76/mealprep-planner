'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Features from '../components/Features';
import MealForm from '../components/MealForm';
import MealPreview from '../components/MealPreview';
import MealPlanComplete from '../components/MealPlanComplete';
import AISubstituteModal from '../components/AiSubstituteModal';
import { generateCompleteDocument } from '../utils/documentGenerator';
import { useFormData } from '../hooks/useFormData';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [parsedPlan, setParsedPlan] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [isReplacing, setIsReplacing] = useState<string | null>(null);
  
  // Stati per sostituzione ingredienti AI
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<{
    ingredient: string;
    dayIndex: number;
    mealType: string;
    ingredientIndex: number;
  } | null>(null);
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);

  // Usa il hook useFormData
  const { formData, hasSavedData, handleInputChange, clearSavedData, resetFormData } = useFormData();

  // Funzione per richiedere sostituzione ingrediente AI
  const handleIngredientSubstitution = async (ingredient: string, dayIndex: number, mealType: string, ingredientIndex: number) => {
    setSelectedIngredient({ ingredient, dayIndex, mealType, ingredientIndex });
    setShowSubstituteModal(true);
    setIsLoadingSubstitutes(true);
    setSubstitutes([]);

    try {
      const response = await fetch('/api/substitute-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient,
          userPreferences: formData.preferenze,
          allergies: formData.allergie,
          mealContext: `${mealType} del ${parsedPlan.days[dayIndex].day}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubstitutes(result.substitutes);
      } else {
        alert('❌ Errore nella ricerca di sostituti: ' + result.error);
        setShowSubstituteModal(false);
      }
    } catch (error) {
      alert('❌ Errore di connessione per la sostituzione ingrediente');
      setShowSubstituteModal(false);
    } finally {
      setIsLoadingSubstitutes(false);
    }
  };

  // Funzione per applicare la sostituzione
  const applySubstitution = (newIngredient: string) => {
    if (!selectedIngredient || !parsedPlan) return;

    const { dayIndex, mealType, ingredientIndex } = selectedIngredient;
    
    // Crea una copia del piano parsed
    const updatedPlan = { ...parsedPlan };
    updatedPlan.days = [...parsedPlan.days];
    updatedPlan.days[dayIndex] = { ...parsedPlan.days[dayIndex] };
    updatedPlan.days[dayIndex].meals = { ...parsedPlan.days[dayIndex].meals };
    updatedPlan.days[dayIndex].meals[mealType] = { ...parsedPlan.days[dayIndex].meals[mealType] };
    updatedPlan.days[dayIndex].meals[mealType].ingredienti = [...parsedPlan.days[dayIndex].meals[mealType].ingredienti];
    
    // Sostituisci l'ingrediente
    updatedPlan.days[dayIndex].meals[mealType].ingredienti[ingredientIndex] = newIngredient;
    
    // Aggiorna lo stato
    setParsedPlan(updatedPlan);
    
    const completeDocument = generateCompleteDocument(updatedPlan, formData);
    setGeneratedPlan(completeDocument);
    
    // Chiudi il modal
    setShowSubstituteModal(false);
    setSelectedIngredient(null);
    setSubstitutes([]);
  };

  const closeSubstituteModal = () => {
    setShowSubstituteModal(false);
    setSelectedIngredient(null);
    setSubstitutes([]);
  };

  // 🎯 FUNZIONE AGGIORNATA CON LOGICA SPUNTINI - FIX CALORIE
  const parsePlanFromAI = (aiResponse: string) => {
    console.log('🔧 Parsing AI response...');
    
    // Dati base sempre presenti
    const baseMeals = {
      colazione: {
        nome: "Toast Avocado e Uovo in Camicia",
        calorie: 633,
        proteine: 32,
        carboidrati: 87,
        grassi: 18,
        tempo: "15 min",
        porzioni: 1,
        ingredienti: [
          "2 fette pane integrale (60g)",
          "1/2 avocado maturo (80g)",
          "1 uovo fresco biologico",
          "1 cucchiaino aceto bianco",
          "Succo di 1/4 limone",
          "Sale e pepe q.b.",
          "Scaglie di peperoncino (opzionale)"
        ],
        preparazione: "Porta a bollore una casseruola d'acqua con l'aceto. Tosta il pane fino a doratura. In una ciotola, schiaccia l'avocado con una forchetta, aggiungi succo di limone, sale e pepe. Crea un vortice nell'acqua caliente e immergi delicatamente l'uovo per 3-4 minuti. Spalma l'avocado sul pane tostato, adagia sopra l'uovo scodellato e condisci con pepe e peperoncino."
      },
      pranzo: {
        nome: "Pasta e Fagioli",
        calorie: 886,
        proteine: 66,
        carboidrati: 100,
        grassi: 25,
        tempo: "30 min",
        porzioni: 1,
        ingredienti: [
          "75g pasta corta",
          "100g fagioli borlotti lessati",
          "1/2 costa di sedano (15g)",
          "1/4 carota (20g)",
          "1/4 cipolla (25g)",
          "1/2 spicchio aglio",
          "100g passata di pomodoro",
          "200ml brodo vegetale",
          "Rosmarino fresco",
          "1 cucchiaio olio extravergine"
        ],
        preparazione: "Prepara un soffritto con sedano, carota e cipolla tritati. Soffriggi in olio con aglio e rosmarino per 5 minuti. Aggiungi metà fagioli schiacciati e quelli interi. Incorpora la passata e cuoci 10 minuti. Aggiungi brodo e pasta, cuoci mescolando spesso fino a consistenza cremosa."
      },
      cena: {
        nome: "Tagliata di Manzo ai Funghi",
        calorie: 759,
        proteine: 66,
        carboidrati: 66,
        grassi: 25,
        tempo: "25 min",
        porzioni: 1,
        ingredienti: [
          "120g controfiletto di manzo",
          "60g funghi porcini freschi",
          "1/2 spicchio aglio",
          "Prezzemolo fresco (3g)",
          "40g rucola",
          "20g scaglie di Parmigiano",
          "1 cucchiaio olio extravergine",
          "Sale, pepe, rosmarino q.b."
        ],
        preparazione: "Porta la carne a temperatura ambiente. Pulisci e affetta i porcini. Cuoci la carne 3-4 minuti per lato. Lascia riposare 5 minuti. Saltare i porcini con aglio e prezzemolo. Taglia la carne, servi su rucola con porcini e Parmigiano."
      }
    };

    // Spuntini disponibili
    const availableSnacks = {
      spuntino1: {
        nome: "Yogurt con Frutti di Bosco",
        calorie: 180,
        proteine: 15,
        carboidrati: 20,
        grassi: 3,
        tempo: "5 min",
        porzioni: 1,
        ingredienti: [
          "150g yogurt greco 0%",
          "80g frutti di bosco misti",
          "10g miele",
          "5g mandorle a lamelle"
        ],
        preparazione: "Mescola lo yogurt greco con il miele. Aggiungi i frutti di bosco e le mandorle a lamelle."
      },
      spuntino2: {
        nome: "Smoothie Proteico Verde",
        calorie: 165,
        proteine: 12,
        carboidrati: 18,
        grassi: 4,
        tempo: "5 min",
        porzioni: 1,
        ingredienti: [
          "1/2 banana (60g)",
          "50g spinaci freschi",
          "200ml latte di mandorla",
          "10g proteine in polvere",
          "5g burro di mandorle"
        ],
        preparazione: "Frulla tutti gli ingredienti fino ad ottenere una consistenza cremosa. Servi freddo."
      },
      spuntino3: {
        nome: "Hummus con Verdure",
        calorie: 145,
        proteine: 8,
        carboidrati: 15,
        grassi: 6,
        tempo: "5 min",
        porzioni: 1,
        ingredienti: [
          "60g hummus di ceci",
          "80g carote baby",
          "60g cetrioli",
          "40g peperoni rossi",
          "Prezzemolo fresco"
        ],
        preparazione: "Taglia le verdure a bastoncini. Servi con l'hummus come salsa. Guarnisci con prezzemolo fresco."
      }
    };

    // Determina quali pasti includere basandoti sul numero di pasti
    const numPasti = parseInt(formData.pasti) || 3;
    console.log('🍽️ Numero pasti:', numPasti);
    
    const createDayMeals = () => {
      const meals: any = {
        colazione: baseMeals.colazione,
        pranzo: baseMeals.pranzo,
        cena: baseMeals.cena
      };

      // Aggiungi spuntini basati sul numero di pasti
      if (numPasti >= 4) {
        meals.spuntino1 = availableSnacks.spuntino1;
      }
      if (numPasti >= 5) {
        meals.spuntino2 = availableSnacks.spuntino2;
      }
      if (numPasti >= 6) {
        meals.spuntino3 = availableSnacks.spuntino3;
      }

      return meals;
    };

    const mockPlan = {
      days: [
        {
          day: "Giorno 1",
          meals: createDayMeals()
        },
        {
          day: "Giorno 2", 
          meals: createDayMeals() // Per ora stessi pasti, poi possiamo variare
        }
      ]
    };

    const numDays = parseInt(formData.durata) || 1;
    const allDays = [];
    
    if (formData.varieta === 'ripetuti') {
      for (let i = 0; i < numDays; i++) {
        allDays.push({
          ...mockPlan.days[0],
          day: `Giorno ${i + 1}`
        });
      }
    } else {
      for (let i = 0; i < numDays; i++) {
        allDays.push({
          ...mockPlan.days[i % 2],
          day: `Giorno ${i + 1}`
        });
      }
    }

    const finalPlan = { ...mockPlan, days: allDays };
    console.log('✅ Plan parsed successfully:', finalPlan);
    return finalPlan;
  };

  // Test connessione API all'avvio
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('/api/test-connection');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (error) {
        setApiStatus('error');
      }
    };
    testAPI();
  }, []);

  const handleReplacement = async (mealType: string, dayNumber: string) => {
    console.log('🔄 REPLACEMENT STARTED:', { mealType, dayNumber }); // DEBUG
    setIsReplacing(`${dayNumber}-${mealType}`);
    
    try {
      console.log('📡 Calling replace-meal API...'); // DEBUG
      const response = await fetch('/api/replace-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          mealType,
          dayNumber,
          currentPlan: generatedPlan
        })
      });
      
      console.log('📨 API Response status:', response.status); // DEBUG
      const result = await response.json();
      console.log('🔄 Replace meal result:', result); // DEBUG
      
      if (result.success && result.newMeal) {
        console.log('✅ Processing successful result...'); // DEBUG
        
        // Aggiorna il parsedPlan direttamente invece di rigenerarlo
        const updatedPlan = { ...parsedPlan };
        const dayIndex = parseInt(dayNumber.replace('Giorno ', '')) - 1;
        
        console.log('📅 Day index:', dayIndex); // DEBUG
        
        if (updatedPlan.days[dayIndex]) {
          // Fix sintassi TypeScript
          const dayMeals = updatedPlan.days[dayIndex].meals;
          (dayMeals as any)[mealType] = result.newMeal;
          
          console.log('🔄 Updating parsed plan...'); // DEBUG
          setParsedPlan(updatedPlan);
          
          // Rigenera il documento completo
          const completeDocument = generateCompleteDocument(updatedPlan, formData);
          setGeneratedPlan(completeDocument);
          
          console.log('✅ Meal replaced successfully:', result.newMeal.nome);
        } else {
          console.log('❌ Day not found:', dayIndex); // DEBUG
        }
      } else {
        console.log('❌ API returned error:', result); // DEBUG
        alert('Errore nella sostituzione del pasto: ' + (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error('❌ Replace meal error:', error);
      alert('Errore di connessione per la sostituzione');
    } finally {
      console.log('🏁 Replacement finished'); // DEBUG
      setIsReplacing(null);
    }
  };

  const confirmPlan = () => {
    setShowPreview(false);
    setShowComplete(true);
    setTimeout(() => {
      document.getElementById('complete-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGenerateNewPlan = () => {
    setShowPreview(false);
    setShowComplete(false);
    setGeneratedPlan(null);
    setParsedPlan(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMIT STARTED');
    console.log('📝 Form Data:', formData);
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // 🤖 AI Learning: Genera prompt personalizzato
      const aiLearning = (await import('../utils/aiLearningSystem')).AILearningSystem.getInstance();
      const basePrompt = `Genera un piano meal prep personalizzato per ${formData.nome}`;
      const enhancedPrompt = aiLearning.generatePersonalizedPrompt(
        basePrompt, 
        {
          preferenceColazione: formData.preferenceColazione,
          preferencePranzo: formData.preferencePranzo,
          preferenceCena: formData.preferenceCena,
          stileAlimentare: formData.stileAlimentare,
          livelloElaborazione: formData.livelloElaborazione,
          preferenzeCottura: formData.preferenzeCottura,
          evitaRipetizioni: formData.evitaRipetizioni
        },
        formData.nome
      );

      console.log('🧠 AI Enhanced Prompt:', enhancedPrompt);
      
      console.log('📡 Making API call...');
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          aiEnhancedPrompt: enhancedPrompt
        })
      });
      
      console.log('📨 Response received:', response.status);
      const result = await response.json();
      console.log('📋 Result:', result);
      
      if (result.success) {
        console.log('✅ Success! Parsing plan...');
        const parsed = parsePlanFromAI(result.piano);
        setParsedPlan(parsed);
        
        const completeDocument = generateCompleteDocument(parsed, formData);
        setGeneratedPlan(completeDocument);
        setShowPreview(true);
        
        // 🤖 AI Learning: Salva piano nello storico
        await aiLearning.savePlanToHistory({
          id: Date.now().toString(),
          nome: formData.nome,
          preferences: {
            preferenceColazione: formData.preferenceColazione,
            preferencePranzo: formData.preferencePranzo,
            preferenceCena: formData.preferenceCena,
            stileAlimentare: formData.stileAlimentare,
            livelloElaborazione: formData.livelloElaborazione,
            preferenzeCottura: formData.preferenzeCottura,
            evitaRipetizioni: formData.evitaRipetizioni
          },
          generatedMeals: {
            colazione: parsed.days.flatMap(day => day.meals.colazione ? [day.meals.colazione.nome] : []),
            pranzo: parsed.days.flatMap(day => day.meals.pranzo ? [day.meals.pranzo.nome] : []),
            cena: parsed.days.flatMap(day => day.meals.cena ? [day.meals.cena.nome] : []),
            spuntini: parsed.days.flatMap(day => [
              ...(day.meals.spuntino1 ? [day.meals.spuntino1.nome] : []),
              ...(day.meals.spuntino2 ? [day.meals.spuntino2.nome] : [])
            ])
          },
          createdAt: new Date().toISOString()
        });
        
        // 💾 SALVA IN AIRTABLE
        try {
          console.log('💾 Saving to Airtable...');
          const airtableResponse = await fetch('/api/airtable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'saveMealRequest',
              data: {
                nome: formData.nome,
                email: sessionStorage.getItem('userAuth') || '',
                age: formData.eta,
                weight: formData.peso,
                height: formData.altezza,
                gender: formData.sesso,
                activity_level: formData.attivita,
                goal: formData.obiettivo === 'perdita-peso' ? 'dimagrimento' : 
                      formData.obiettivo === 'aumento-massa' ? 'aumento_massa' : 
                      formData.obiettivo,
                duration: formData.durata,
                meals_per_day: formData.pasti,
                exclusions: formData.allergie,
                foods_at_home: formData.preferenze,
                phone: '',
                // Nuovi campi AI
                ai_preferences: JSON.stringify({
                  preferenceColazione: formData.preferenceColazione,
                  preferencePranzo: formData.preferencePranzo,
                  preferenceCena: formData.preferenceCena,
                  stileAlimentare: formData.stileAlimentare,
                  livelloElaborazione: formData.livelloElaborazione,
                  preferenzeCottura: formData.preferenzeCottura,
                  evitaRipetizioni: formData.evitaRipetizioni
                })
              }
            })
          });
          
          console.log('📊 Airtable response status:', airtableResponse.status);
          
          if (airtableResponse.ok) {
            const airtableResult = await airtableResponse.json();
            console.log('✅ Airtable response:', airtableResult);
            
            // Salva il piano completo per le future visualizzazioni
            if (airtableResult.recordId) {
              try {
                await fetch('/api/airtable', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'updateRequestStatus',
                    data: {
                      recordId: airtableResult.recordId,
                      status: 'Piano generato',
                      mealPlan: {
                        generatedPlan: completeDocument,
                        parsedPlan: parsed,
                        formData: formData
                      }
                    }
                  })
                });
                console.log('✅ Piano completo salvato in Airtable');
              } catch (updateError) {
                console.error('❌ Error updating plan:', updateError);
              }
            }
            
            console.log('✅ Saved to Airtable successfully');
          } else {
            const errorText = await airtableResponse.text();
            console.error('❌ Airtable API error:', airtableResponse.status, errorText);
            alert('⚠️ Piano generato ma errore nel salvataggio. Verifica la connessione.');
          }
        } catch (airtableError) {
          console.error('❌ Airtable save error:', airtableError);
          alert('⚠️ Piano generato ma errore nel salvataggio Airtable.');
        }
        
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        console.log('❌ API returned error:', result.error);
        alert(`❌ Errore: ${result.error}\n\nDettagli: ${result.details || 'Nessun dettaglio disponibile'}`);
      }
    } catch (error) {
      console.log('💥 Catch error:', error);
      alert('❌ Errore di connessione. Riprova più tardi.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* AI Substitute Modal Component */}
      <AISubstituteModal 
        showModal={showSubstituteModal}
        selectedIngredient={selectedIngredient}
        isLoadingSubstitutes={isLoadingSubstitutes}
        substitutes={substitutes}
        onApplySubstitution={applySubstitution}
        onCloseModal={closeSubstituteModal}
      />

      {/* Header - RIMANE INLINE */}
      <header className="bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold">Meal Prep Planner</h1>
          </div>
          
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - RIMANE INLINE */}
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

      {/* Features Component */}
      <Features />

      {/* How it Works - RIMANE INLINE */}
      <section className="bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
            Come Funziona
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>1</div>
              <h3 className="text-xl font-bold mb-3">Compila il Modulo</h3>
              <p className="text-gray-300">Inserisci le tue informazioni personali, obiettivi e preferenze alimentari.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>2</div>
              <h3 className="text-xl font-bold mb-3">Ricevi Pasti e Ricette</h3>
              <p className="text-gray-300">Ottieni una programmazione personalizzata con ricette dettagliate e lista spesa.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>3</div>
              <h3 className="text-xl font-bold mb-3">Prepara i Pasti</h3>
              <p className="text-gray-300">Segui le ricette passo-passo e prepara i tuoi meal prep.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>4</div>
              <h3 className="text-xl font-bold mb-3">Goditi i Risultati</h3>
              <p className="text-gray-300">Risparmia tempo, denaro e raggiungi i tuoi obiettivi di salute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MealForm Component */}
      <MealForm 
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isGenerating}
        hasSavedData={hasSavedData}
        clearSavedData={clearSavedData}
      />

      {/* MealPreview Component */}
      {showPreview && parsedPlan && (
        <MealPreview 
          parsedPlan={parsedPlan}
          handleReplacement={handleReplacement}
          handleIngredientSubstitution={handleIngredientSubstitution}
          isReplacing={isReplacing}
          confirmPlan={confirmPlan}
          onGenerateNewPlan={handleGenerateNewPlan}
        />
      )}

      {/* MealPlanComplete Component */}
      {showComplete && parsedPlan && (
        <MealPlanComplete 
          parsedPlan={parsedPlan}
          formData={formData}
          generatedPlan={generatedPlan}
          handleReplacement={handleReplacement}
          handleIngredientSubstitution={handleIngredientSubstitution}
          isReplacing={isReplacing}
          onGenerateNewPlan={handleGenerateNewPlan}
        />
      )}

      {/* Results Section - RIMANE INLINE */}
      {!showPreview && !showComplete && generatedPlan && (
        <section id="results-section" className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#8FBC8F'}}>
            🎉 La Tua Programmazione Pasti è Pronta!
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl mb-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">📋 Il Tuo Piano Alimentare</h3>
              <div className="bg-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto" style={{fontFamily: 'Georgia, serif'}}>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedPlan}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  const text = `🍽️ Ecco il mio piano alimentare personalizzato!\n\n${generatedPlan}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📱 Condividi su WhatsApp
              </button>

              <button
                onClick={() => {
                  const printContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <title>Piano Alimentare - ${formData.nome || 'Utente'}</title>
                        <style>
                          @page { margin: 15mm; size: A4; }
                          body { 
                            font-family: 'Georgia', 'Times New Roman', serif; 
                            line-height: 1.4; color: #333; font-size: 12px;
                            margin: 0; padding: 0;
                          }
                          .header {
                            text-align: center; margin-bottom: 20px;
                            border-bottom: 2px solid #8FBC8F; padding-bottom: 10px;
                          }
                          .title { font-size: 20px; font-weight: bold; color: #2F4F4F; margin-bottom: 5px; }
                          .subtitle { font-size: 14px; color: #666; }
                          h2 {
                            color: #8FBC8F; font-size: 16px; margin: 20px 0 10px 0;
                            border-bottom: 1px solid #8FBC8F; padding-bottom: 5px;
                          }
                          pre { font-family: 'Georgia', serif; white-space: pre-wrap; font-size: 11px; line-height: 1.3; }
                          @media print { body { font-size: 11px; } .no-print { display: none; } }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="title">Piano Preparazione Pasti Personalizzato</div>
                          <div class="subtitle">Generato il ${new Date().toLocaleDateString('it-IT')} per ${formData.nome || 'Utente'}</div>
                        </div>
                        <div style="white-space: pre-wrap; font-family: Georgia, serif; line-height: 1.4;">
                          ${generatedPlan}
                        </div>
                      </body>
                    </html>
                  `;
                  
                  const printWindow = window.open('', '_blank', 'width=800,height=600');
                  if (printWindow) {
                    printWindow.document.write(printContent);
                    printWindow.document.close();
                    printWindow.onload = () => {
                      setTimeout(() => {
                        printWindow.print();
                      }, 500);
                    };
                  } else {
                    alert('Popup bloccato! Abilita i popup per scaricare il PDF');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📥 Scarica PDF
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPlan);
                  alert('Piano copiato negli appunti!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📋 Copia Testo
              </button>

              <button
                onClick={() => {
                  setGeneratedPlan(null);
                  setShowPreview(false);
                  resetFormData();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                🔄 Nuovo Piano
              </button>
            </div>
          </div>
        </section>
      )}
      
      {/* FAQ Section - RIMANE INLINE */}
      {!generatedPlan && !showPreview && !showComplete && (
      <section className="bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
            Domande Frequenti
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Come funziona la programmazione?</h3>
              <p className="text-gray-300">Il sistema analizza i tuoi dati personali e crea una programmazione completa con ricette, lista spesa e consigli nutrizionali.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Quanto tempo richiede la creazione?</h3>
              <p className="text-gray-300">La programmazione viene creata in 10-30 secondi, con un piano settimanale completo e ricette dettagliate.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Posso modificare la programmazione?</h3>
              <p className="text-gray-300">Sì, puoi sempre creare una nuova programmazione con preferenze diverse o richiedere modifiche specifiche.</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🔀 Come funziona la sostituzione ingredienti?</h3>
              <p className="text-gray-300">Il sistema analizza ogni ingrediente e suggerisce alternative intelligenti considerando allergie, preferenze e funzione culinaria. Basta fare hover su un ingrediente e cliccare "🔀".</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer - RIMANE INLINE */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h3 className="text-2xl font-bold">Meal Prep Planner</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Semplificare la tua alimentazione con programmazione intelligente.
          </p>
          <div className="text-gray-400 text-sm">
            © 2025 Meal Prep Planner. Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}