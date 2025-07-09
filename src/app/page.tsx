'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './components/header';
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
          userPreferences: formData.preferenze || [],
          allergies: formData.allergie || [],
          mealContext: `${mealType} del ${parsedPlan.days[dayIndex].day}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubstitutes(result.substitutes);
      } else {
        console.log('Substitute ingredient error:', result.error);
        setShowSubstituteModal(false);
      }
    } catch (error) {
      console.log('Substitute ingredient connection error:', error);
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

  // 🔄 SOSTITUZIONE RICETTA CON DATABASE
  const handleReplacement = async (mealType: string, dayNumber: string) => {
    console.log('🔄 REPLACEMENT STARTED:', { mealType, dayNumber });
    setIsReplacing(`${dayNumber}-${mealType}`);
    
    try {
      // Importa meal planner integration
      const { MealPlannerIntegration } = await import('../utils/mealPlannerIntegration');
      const mealPlanner = MealPlannerIntegration.getInstance();
      
      // Converti il piano attuale in formato MealPlan
      const dayIndex = parseInt(dayNumber.replace('Giorno ', '')) - 1;
      
      // Genera nuova ricetta usando il database
      const currentMealPlan = {
        days: parsedPlan.days.map((day: any) => ({
          day: day.day,
          meals: day.meals
        })),
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        userPreferences: formData
      };
      
      // Sostituisci la ricetta nel piano
      const updatedPlan = mealPlanner.replaceRecipeInPlan(currentMealPlan, dayIndex, mealType);
      
      // Riconverti in formato compatibile
      const newMeal = (updatedPlan.days[dayIndex].meals as any)[mealType];
      
      if (newMeal) {
        const updatedParsedPlan = { ...parsedPlan };
        updatedParsedPlan.days[dayIndex].meals[mealType] = {
          nome: newMeal.nome,
          calorie: newMeal.calorie,
          proteine: newMeal.proteine,
          carboidrati: newMeal.carboidrati,
          grassi: newMeal.grassi,
          tempo: `${newMeal.tempoPreparazione} min`,
          porzioni: newMeal.porzioni,
          ingredienti: newMeal.ingredienti,
          preparazione: newMeal.preparazione,
          recipeId: newMeal.id,
          rating: newMeal.rating,
          categoria: newMeal.categoria,
          tipoCucina: newMeal.tipoCucina,
          difficolta: newMeal.difficolta
        };
        
        setParsedPlan(updatedParsedPlan);
        
        // Rigenera il documento completo
        const completeDocument = generateCompleteDocument(updatedParsedPlan, formData);
        setGeneratedPlan(completeDocument);
        
        console.log('✅ Meal replaced successfully:', newMeal.nome);
      }
      
    } catch (error) {
      console.error('❌ Replace meal error:', error);
    } finally {
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

  // 🚀 FUNZIONE PRINCIPALE - SOLO DATABASE (NO API)
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMIT STARTED (Direct Database Mode)');
    console.log('📝 Form Data:', formData);
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      console.log('🔄 Generating meal plan using recipe database...');
      
      // Import dinamico del meal planner
      const { MealPlannerIntegration } = await import('../utils/mealPlannerIntegration');
      const mealPlanner = MealPlannerIntegration.getInstance();
      
      // Genera piano usando database
      const mealPlan = mealPlanner.generateMealPlan(formData);
      console.log('✅ Generated meal plan:', mealPlan);
      
      // Converti in formato compatibile
      const compatiblePlan = {
        days: mealPlan.days.map(day => ({
          day: day.day,
          meals: {
            colazione: day.meals.colazione ? {
              nome: day.meals.colazione.nome,
              calorie: day.meals.colazione.calorie,
              proteine: day.meals.colazione.proteine,
              carboidrati: day.meals.colazione.carboidrati,
              grassi: day.meals.colazione.grassi,
              tempo: `${day.meals.colazione.tempoPreparazione} min`,
              porzioni: day.meals.colazione.porzioni,
              ingredienti: day.meals.colazione.ingredienti,
              preparazione: day.meals.colazione.preparazione,
              recipeId: day.meals.colazione.id,
              rating: day.meals.colazione.rating,
              categoria: day.meals.colazione.categoria,
              tipoCucina: day.meals.colazione.tipoCucina,
              difficolta: day.meals.colazione.difficolta
            } : undefined,
            pranzo: day.meals.pranzo ? {
              nome: day.meals.pranzo.nome,
              calorie: day.meals.pranzo.calorie,
              proteine: day.meals.pranzo.proteine,
              carboidrati: day.meals.pranzo.carboidrati,
              grassi: day.meals.pranzo.grassi,
              tempo: `${day.meals.pranzo.tempoPreparazione} min`,
              porzioni: day.meals.pranzo.porzioni,
              ingredienti: day.meals.pranzo.ingredienti,
              preparazione: day.meals.pranzo.preparazione,
              recipeId: day.meals.pranzo.id,
              rating: day.meals.pranzo.rating,
              categoria: day.meals.pranzo.categoria,
              tipoCucina: day.meals.pranzo.tipoCucina,
              difficolta: day.meals.pranzo.difficolta
            } : undefined,
            cena: day.meals.cena ? {
              nome: day.meals.cena.nome,
              calorie: day.meals.cena.calorie,
              proteine: day.meals.cena.proteine,
              carboidrati: day.meals.cena.carboidrati,
              grassi: day.meals.cena.grassi,
              tempo: `${day.meals.cena.tempoPreparazione} min`,
              porzioni: day.meals.cena.porzioni,
              ingredienti: day.meals.cena.ingredienti,
              preparazione: day.meals.cena.preparazione,
              recipeId: day.meals.cena.id,
              rating: day.meals.cena.rating,
              categoria: day.meals.cena.categoria,
              tipoCucina: day.meals.cena.tipoCucina,
              difficolta: day.meals.cena.difficolta
            } : undefined,
            spuntino1: day.meals.spuntino1 ? {
              nome: day.meals.spuntino1.nome,
              calorie: day.meals.spuntino1.calorie,
              proteine: day.meals.spuntino1.proteine,
              carboidrati: day.meals.spuntino1.carboidrati,
              grassi: day.meals.spuntino1.grassi,
              tempo: `${day.meals.spuntino1.tempoPreparazione} min`,
              porzioni: day.meals.spuntino1.porzioni,
              ingredienti: day.meals.spuntino1.ingredienti,
              preparazione: day.meals.spuntino1.preparazione,
              recipeId: day.meals.spuntino1.id,
              rating: day.meals.spuntino1.rating,
              categoria: day.meals.spuntino1.categoria,
              tipoCucina: day.meals.spuntino1.tipoCucina,
              difficolta: day.meals.spuntino1.difficolta
            } : undefined,
            spuntino2: day.meals.spuntino2 ? {
              nome: day.meals.spuntino2.nome,
              calorie: day.meals.spuntino2.calorie,
              proteine: day.meals.spuntino2.proteine,
              carboidrati: day.meals.spuntino2.carboidrati,
              grassi: day.meals.spuntino2.grassi,
              tempo: `${day.meals.spuntino2.tempoPreparazione} min`,
              porzioni: day.meals.spuntino2.porzioni,
              ingredienti: day.meals.spuntino2.ingredienti,
              preparazione: day.meals.spuntino2.preparazione,
              recipeId: day.meals.spuntino2.id,
              rating: day.meals.spuntino2.rating,
              categoria: day.meals.spuntino2.categoria,
              tipoCucina: day.meals.spuntino2.tipoCucina,
              difficolta: day.meals.spuntino2.difficolta
            } : undefined,
            spuntino3: day.meals.spuntino3 ? {
              nome: day.meals.spuntino3.nome,
              calorie: day.meals.spuntino3.calorie,
              proteine: day.meals.spuntino3.proteine,
              carboidrati: day.meals.spuntino3.carboidrati,
              grassi: day.meals.spuntino3.grassi,
              tempo: `${day.meals.spuntino3.tempoPreparazione} min`,
              porzioni: day.meals.spuntino3.porzioni,
              ingredienti: day.meals.spuntino3.ingredienti,
              preparazione: day.meals.spuntino3.preparazione,
              recipeId: day.meals.spuntino3.id,
              rating: day.meals.spuntino3.rating,
              categoria: day.meals.spuntino3.categoria,
              tipoCucina: day.meals.spuntino3.tipoCucina,
              difficolta: day.meals.spuntino3.difficolta
            } : undefined
          }
        })),
        // Aggiungi statistiche del piano
        planStats: {
          totalCalories: mealPlan.totalCalories,
          totalProtein: mealPlan.totalProtein,
          totalCarbs: mealPlan.totalCarbs,
          totalFat: mealPlan.totalFat,
          avgCaloriesPerDay: Math.round(mealPlan.totalCalories / mealPlan.days.length),
          uniqueRecipes: mealPlanner.getPlanStats ? mealPlanner.getPlanStats(mealPlan).uniqueRecipes : 0,
          dietCompliance: mealPlanner.getPlanStats ? mealPlanner.getPlanStats(mealPlan).dietCompliance : 100
        },
        // Aggiungi lista spesa
        shoppingList: mealPlanner.generateShoppingList ? mealPlanner.generateShoppingList(mealPlan) : {}
      };
      
      setParsedPlan(compatiblePlan);
      
      // Genera documento completo
      const completeDocument = generateCompleteDocument(compatiblePlan, formData);
      setGeneratedPlan(completeDocument);
      setShowPreview(true);
      
      console.log('✅ Success! Plan generated with database recipes');
      
      // 🤖 AI Learning: Salva piano nello storico (opzionale)
      try {
        const aiLearning = (await import('../utils/aiLearningSystem')).AILearningSystem.getInstance();
        await aiLearning.savePlanToHistory({
          id: Date.now().toString(),
          nome: formData.nome || 'User',
          preferences: {
            preferenceColazione: formData.preferenceColazione || '',
            preferencePranzo: formData.preferencePranzo || '',
            preferenceCena: formData.preferenceCena || '',
            stileAlimentare: formData.stileAlimentare || '',
            livelloElaborazione: formData.livelloElaborazione || '',
            preferenzeCottura: formData.preferenzeCottura || '',
            evitaRipetizioni: formData.evitaRipetizioni || ''
          },
          generatedMeals: {
            colazione: compatiblePlan.days.flatMap((day: any) => day.meals.colazione ? [day.meals.colazione.nome] : []),
            pranzo: compatiblePlan.days.flatMap((day: any) => day.meals.pranzo ? [day.meals.pranzo.nome] : []),
            cena: compatiblePlan.days.flatMap((day: any) => day.meals.cena ? [day.meals.cena.nome] : []),
            spuntini: compatiblePlan.days.flatMap((day: any) => [
              ...(day.meals.spuntino1 ? [day.meals.spuntino1.nome] : []),
              ...(day.meals.spuntino2 ? [day.meals.spuntino2.nome] : [])
            ])
          },
          createdAt: new Date().toISOString()
        });
      } catch (aiError) {
        console.log('⚠️ AI Learning error (non-blocking):', aiError);
      }
      
      // 💾 SALVA IN AIRTABLE (opzionale)
      try {
        console.log('💾 Saving to Airtable...');
        const airtableResponse = await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveMealRequest',
            data: {
              nome: formData.nome || 'User',
              email: sessionStorage.getItem('userAuth') || '',
              age: formData.eta || 30,
              weight: formData.peso || 70,
              height: formData.altezza || 170,
              gender: formData.sesso || 'maschio',
              activity_level: formData.attivita || 'moderata',
              goal: formData.obiettivo === 'perdita-peso' ? 'dimagrimento' : 
                    formData.obiettivo === 'aumento-massa' ? 'aumento_massa' : 
                    formData.obiettivo || 'mantenimento',
              duration: formData.durata || '3',
              meals_per_day: formData.pasti || '3',
              exclusions: formData.allergie || [],
              foods_at_home: formData.preferenze || [],
              phone: '',
              ai_preferences: JSON.stringify({
                preferenceColazione: formData.preferenceColazione || '',
                preferencePranzo: formData.preferencePranzo || '',
                preferenceCena: formData.preferenceCena || '',
                stileAlimentare: formData.stileAlimentare || '',
                livelloElaborazione: formData.livelloElaborazione || '',
                preferenzeCottura: formData.preferenzeCottura || '',
                evitaRipetizioni: formData.evitaRipetizioni || ''
              })
            }
          })
        });
        
        if (airtableResponse.ok) {
          const airtableResult = await airtableResponse.json();
          console.log('✅ Airtable save successful:', airtableResult);
        }
      } catch (airtableError) {
        console.log('⚠️ Airtable save error (non-blocking):', airtableError);
      }
      
      // Scroll to preview
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('❌ Error generating meal plan:', error);
      
      // FALLBACK SEMPLICE IN CASO DI ERRORE
      const fallbackPlan = {
        days: [
          {
            day: 'Giorno 1',
            meals: {
              colazione: {
                nome: 'Toast Avocado e Uovo',
                calorie: 420,
                proteine: 18,
                carboidrati: 35,
                grassi: 22,
                tempo: '15 min',
                porzioni: 1,
                ingredienti: ['2 fette pane integrale', '1 avocado maturo', '1 uovo fresco'],
                preparazione: 'Tosta il pane, schiaccia avocado con limone, cuoci uovo in camicia, assembla'
              },
              pranzo: {
                nome: 'Insalata Quinoa e Pollo',
                calorie: 480,
                proteine: 32,
                carboidrati: 45,
                grassi: 18,
                tempo: '20 min',
                porzioni: 1,
                ingredienti: ['150g quinoa', '200g petto di pollo', '1 avocado', 'verdure miste'],
                preparazione: 'Cuoci quinoa e pollo, taglia avocado, assembla insalata'
              },
              cena: {
                nome: 'Salmone con Verdure',
                calorie: 420,
                proteine: 35,
                carboidrati: 15,
                grassi: 25,
                tempo: '25 min',
                porzioni: 1,
                ingredienti: ['200g filetto salmone', 'verdure grigliate', 'olio oliva'],
                preparazione: 'Griglia salmone 4 min per lato, griglia verdure, condisci con olio'
              }
            }
          },
          {
            day: 'Giorno 2',
            meals: {
              colazione: {
                nome: 'Yogurt Greco con Frutti di Bosco',
                calorie: 320,
                proteine: 20,
                carboidrati: 45,
                grassi: 8,
                tempo: '5 min',
                porzioni: 1,
                ingredienti: ['200g yogurt greco', '100g frutti di bosco', '30g granola'],
                preparazione: 'Mescola yogurt con frutti di bosco, aggiungi granola'
              },
              pranzo: {
                nome: 'Pasta Integrale con Verdure',
                calorie: 450,
                proteine: 16,
                carboidrati: 70,
                grassi: 12,
                tempo: '25 min',
                porzioni: 1,
                ingredienti: ['100g pasta integrale', 'verdure di stagione', 'olio extravergine'],
                preparazione: 'Cuoci pasta, salta verdure, manteca insieme'
              },
              cena: {
                nome: 'Pollo alla Griglia con Rucola',
                calorie: 380,
                proteine: 40,
                carboidrati: 8,
                grassi: 20,
                tempo: '20 min',
                porzioni: 1,
                ingredienti: ['200g petto di pollo', 'rucola fresca', 'pomodorini'],
                preparazione: 'Griglia pollo, servi su letto di rucola con pomodorini'
              }
            }
          },
          {
            day: 'Giorno 3',
            meals: {
              colazione: {
                nome: 'Porridge di Avena con Banana',
                calorie: 350,
                proteine: 14,
                carboidrati: 55,
                grassi: 9,
                tempo: '10 min',
                porzioni: 1,
                ingredienti: ['60g avena', '1 banana', '300ml latte', 'cannella'],
                preparazione: 'Cuoci avena nel latte, aggiungi banana tagliata e cannella'
              },
              pranzo: {
                nome: 'Zuppa di Lenticchie',
                calorie: 280,
                proteine: 18,
                carboidrati: 45,
                grassi: 4,
                tempo: '30 min',
                porzioni: 1,
                ingredienti: ['150g lenticchie', 'verdure miste', 'brodo vegetale'],
                preparazione: 'Cuoci lenticchie con verdure nel brodo per 25 minuti'
              },
              cena: {
                nome: 'Frittata di Verdure',
                calorie: 280,
                proteine: 18,
                carboidrati: 12,
                grassi: 18,
                tempo: '15 min',
                porzioni: 1,
                ingredienti: ['3 uova', 'verdure miste', 'formaggio', 'erbe aromatiche'],
                preparazione: 'Sbatti uova, aggiungi verdure, cuoci in padella'
              }
            }
          }
        ]
      };
      
      // Adatta il fallback al numero di giorni richiesto
      const numDays = parseInt(formData.durata) || 3;
      const adaptedPlan = {
        days: fallbackPlan.days.slice(0, numDays).map((day, index) => ({
          ...day,
          day: `Giorno ${index + 1}`
        }))
      };
      
      setParsedPlan(adaptedPlan);
      const completeDocument = generateCompleteDocument(adaptedPlan, formData);
      setGeneratedPlan(completeDocument);
      setShowPreview(true);
      
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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

      {/* Header Component */}
      <Header />

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

      {/* Features Component */}
      <Features />

      {/* How it Works */}
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

      {/* Results Section */}
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
      
      {/* FAQ Section */}
      {!generatedPlan && !showPreview && !showComplete && (
      <section className="bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
            Domande Frequenti
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Come funziona la programmazione?</h3>
              <p className="text-gray-300">Il sistema utilizza un database di oltre 500 ricette selezionate e le combina in base alle tue preferenze alimentari, allergie e obiettivi nutrizionali.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Le ricette sono personalizzate?</h3>
              <p className="text-gray-300">Sì! Ogni ricetta è selezionata automaticamente in base alle tue allergie, preferenze dietetiche (vegana, vegetariana, keto, ecc.) e tempo disponibile per cucinare.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Posso vedere i dettagli delle ricette?</h3>
              <p className="text-gray-300">Assolutamente! Ogni ricetta nel piano è collegata a una pagina dettagliata con ingredienti, preparazione, valori nutrizionali e consigli di cucina.</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🔀 Come funziona la sostituzione ricette?</h3>
              <p className="text-gray-300">Puoi sostituire qualsiasi ricetta del piano con una nuova ricetta dal database che rispetta le tue preferenze e restrizioni alimentari.</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <img src="/images/icon-192x192.png" alt="Meal Prep Logo" className="w-10 h-10 rounded-full" />
            <h3 className="text-2xl font-bold">Meal Prep Planner</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Semplificare la tua alimentazione con programmazione intelligente e ricette personalizzate.
          </p>
          <div className="flex justify-center gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-green-400">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-green-400">Termini</Link>
            <Link href="/contact" className="text-gray-400 hover:text-green-400">Contatti</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}