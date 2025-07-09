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
      // Importa meal planner integration con path corretto
      const { MealPlannerIntegration } = await import('./utils/mealPlannerIntegration');
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

  // 🤖 Funzione per arricchire piano AI con database
  const enrichAIPlanWithDatabase = async (aiPlan: string, formData: any, mealPlanner: any) => {
    console.log('🔄 Enriching AI plan with database...');
    
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 4;
    
    const enrichedDays = [];
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {} as any
      };
      
      // Per ogni pasto, cerca ricetta simile nel database o usa dati AI
      const meals = ['colazione', 'pranzo', 'cena'];
      
      for (const mealType of meals) {
        const dbRecipe = await findSimilarRecipeInDatabase(mealType, formData, mealPlanner);
        if (dbRecipe) {
          day.meals[mealType] = {
            nome: dbRecipe.nome,
            calorie: dbRecipe.calorie,
            proteine: dbRecipe.proteine,
            carboidrati: dbRecipe.carboidrati,
            grassi: dbRecipe.grassi,
            tempo: `${dbRecipe.tempoPreparazione} min`,
            porzioni: dbRecipe.porzioni,
            ingredienti: dbRecipe.ingredienti,
            preparazione: dbRecipe.preparazione,
            recipeId: dbRecipe.id,
            rating: dbRecipe.rating,
            categoria: dbRecipe.categoria,
            tipoCucina: dbRecipe.tipoCucina,
            difficolta: dbRecipe.difficolta,
            source: 'database'
          };
        } else {
          day.meals[mealType] = createGenericMeal(mealType, i);
        }
      }
      
      // Aggiungi spuntini se richiesti
      if (numPasti >= 4) {
        const spuntino1 = await findSimilarRecipeInDatabase('spuntino', formData, mealPlanner);
        if (spuntino1) {
          day.meals.spuntino1 = {
            nome: spuntino1.nome,
            calorie: spuntino1.calorie,
            proteine: spuntino1.proteine,
            carboidrati: spuntino1.carboidrati,
            grassi: spuntino1.grassi,
            tempo: `${spuntino1.tempoPreparazione} min`,
            porzioni: spuntino1.porzioni,
            ingredienti: spuntino1.ingredienti,
            preparazione: spuntino1.preparazione,
            recipeId: spuntino1.id,
            source: 'database'
          };
        } else {
          day.meals.spuntino1 = {
            nome: `Spuntino Mattutino ${i + 1}`,
            calorie: 150,
            proteine: 8,
            carboidrati: 20,
            grassi: 5,
            tempo: '5 min',
            porzioni: 1,
            ingredienti: ['Frutta', 'Yogurt'],
            preparazione: 'Mescola frutta con yogurt',
            source: 'ai'
          };
        }
      }
      
      if (numPasti >= 5) {
        const spuntino2 = await findSimilarRecipeInDatabase('spuntino', formData, mealPlanner);
        if (spuntino2) {
          day.meals.spuntino2 = {
            nome: spuntino2.nome,
            calorie: spuntino2.calorie,
            proteine: spuntino2.proteine,
            carboidrati: spuntino2.carboidrati,
            grassi: spuntino2.grassi,
            tempo: `${spuntino2.tempoPreparazione} min`,
            porzioni: spuntino2.porzioni,
            ingredienti: spuntino2.ingredienti,
            preparazione: spuntino2.preparazione,
            recipeId: spuntino2.id,
            source: 'database'
          };
        } else {
          day.meals.spuntino2 = {
            nome: `Spuntino Pomeridiano ${i + 1}`,
            calorie: 120,
            proteine: 6,
            carboidrati: 15,
            grassi: 4,
            tempo: '3 min',
            porzioni: 1,
            ingredienti: ['Frutta secca', 'Frutta'],
            preparazione: 'Mescola frutta secca con frutta fresca',
            source: 'ai'
          };
        }
      }
      
      enrichedDays.push(day);
    }
    
    return { days: enrichedDays };
  };

  // 🔍 Trova ricetta simile nel database
  const findSimilarRecipeInDatabase = async (mealType: string, formData: any, mealPlanner: any) => {
    try {
      const filters = {
        categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any,
        allergie: parseAllergies(formData.allergie),
        maxTempo: getMaxTime(mealType)
      };
      
      const candidates = mealPlanner.recipeDB.searchRecipes(filters);
      
      if (candidates.length > 0) {
        candidates.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        return candidates[0];
      }
      
      return null;
    } catch (error) {
      console.log('Error finding recipe in database:', error);
      return null;
    }
  };

  // 🍽️ Crea pasto generico se database non disponibile
  const createGenericMeal = (mealType: string, dayIndex: number) => {
    const genericMeals = {
      colazione: {
        nome: `Colazione Energetica ${dayIndex + 1}`,
        calorie: 400,
        proteine: 20,
        carboidrati: 45,
        grassi: 15,
        tempo: '15 min',
        porzioni: 1,
        ingredienti: ['Avena', 'Frutta', 'Yogurt', 'Noci'],
        preparazione: 'Mescola avena con yogurt, aggiungi frutta e noci',
        source: 'ai'
      },
      pranzo: {
        nome: `Pranzo Bilanciato ${dayIndex + 1}`,
        calorie: 500,
        proteine: 30,
        carboidrati: 50,
        grassi: 20,
        tempo: '25 min',
        porzioni: 1,
        ingredienti: ['Proteine', 'Verdure', 'Carboidrati', 'Olio'],
        preparazione: 'Cuoci proteine, aggiungi verdure e carboidrati',
        source: 'ai'
      },
      cena: {
        nome: `Cena Leggera ${dayIndex + 1}`,
        calorie: 450,
        proteine: 35,
        carboidrati: 30,
        grassi: 18,
        tempo: '30 min',
        porzioni: 1,
        ingredienti: ['Pesce o Pollo', 'Verdure', 'Insalata'],
        preparazione: 'Griglia proteine, servi con verdure fresche',
        source: 'ai'
      }
    };
    
    return (genericMeals as any)[mealType] || genericMeals.colazione;
  };

  // 🔄 Parse piano AI semplificato
  const parseAIPlan = async (aiResponse: string, formData: any) => {
    console.log('🔄 Parsing AI plan...');
    
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 4;
    
    const days = [];
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {
          colazione: createGenericMeal('colazione', i),
          pranzo: createGenericMeal('pranzo', i),
          cena: createGenericMeal('cena', i)
        } as any
      };
      
      // Aggiungi spuntini
      if (numPasti >= 4) {
        day.meals.spuntino1 = {
          nome: `Spuntino Mattutino ${i + 1}`,
          calorie: 150,
          proteine: 8,
          carboidrati: 20,
          grassi: 5,
          tempo: '5 min',
          porzioni: 1,
          ingredienti: ['Frutta', 'Yogurt'],
          preparazione: 'Mescola frutta con yogurt',
          source: 'ai'
        };
      }
      
      if (numPasti >= 5) {
        day.meals.spuntino2 = {
          nome: `Spuntino Pomeridiano ${i + 1}`,
          calorie: 120,
          proteine: 6,
          carboidrati: 15,
          grassi: 4,
          tempo: '3 min',
          porzioni: 1,
          ingredienti: ['Frutta secca', 'Frutta'],
          preparazione: 'Mescola frutta secca con frutta fresca',
          source: 'ai'
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: `Spuntino Serale ${i + 1}`,
          calorie: 100,
          proteine: 5,
          carboidrati: 12,
          grassi: 3,
          tempo: '2 min',
          porzioni: 1,
          ingredienti: ['Tisana', 'Biscotti integrali'],
          preparazione: 'Prepara tisana e accompagna con biscotti',
          source: 'ai'
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: `Spuntino Serale ${i + 1}`,
          calorie: 100,
          proteine: 5,
          carboidrati: 12,
          grassi: 3,
          tempo: '2 min',
          porzioni: 1,
          ingredienti: ['Tisana', 'Biscotti integrali'],
          preparazione: 'Prepara tisana e accompagna con biscotti',
          source: 'ai'
        };
      }
      
      days.push(day);
    }
    
    return { days };
  };

  // 🔄 Piano fallback
  const createFallbackPlan = (formData: any) => {
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 4;
    
    const days = [];
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {
          colazione: {
            nome: 'Toast Avocado e Uovo',
            calorie: 420,
            proteine: 18,
            carboidrati: 35,
            grassi: 22,
            tempo: '15 min',
            porzioni: 1,
            ingredienti: ['2 fette pane integrale', '1 avocado', '1 uovo'],
            preparazione: 'Tosta il pane, schiaccia avocado, aggiungi uovo in camicia'
          },
          pranzo: {
            nome: 'Insalata Quinoa e Pollo',
            calorie: 480,
            proteine: 32,
            carboidrati: 45,
            grassi: 18,
            tempo: '20 min',
            porzioni: 1,
            ingredienti: ['150g quinoa', '200g pollo', 'verdure'],
            preparazione: 'Cuoci quinoa e pollo, assembla insalata'
          },
          cena: {
            nome: 'Salmone con Verdure',
            calorie: 420,
            proteine: 35,
            carboidrati: 15,
            grassi: 25,
            tempo: '25 min',
            porzioni: 1,
            ingredienti: ['200g salmone', 'verdure grigliate'],
            preparazione: 'Griglia salmone e verdure'
          }
        } as any
      };
      
      if (numPasti >= 4) {
        day.meals.spuntino1 = {
          nome: 'Yogurt con Frutti di Bosco',
          calorie: 180,
          proteine: 15,
          carboidrati: 20,
          grassi: 3,
          tempo: '5 min',
          porzioni: 1,
          ingredienti: ['150g yogurt greco', '100g frutti di bosco'],
          preparazione: 'Mescola yogurt con frutti di bosco'
        };
      }
      
      if (numPasti >= 5) {
        day.meals.spuntino2 = {
          nome: 'Frutta Secca e Mela',
          calorie: 150,
          proteine: 6,
          carboidrati: 18,
          grassi: 8,
          tempo: '2 min',
          porzioni: 1,
          ingredienti: ['1 mela', '20g mandorle'],
          preparazione: 'Taglia mela e accompagna con mandorle'
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: 'Tisana e Crackers',
          calorie: 80,
          proteine: 3,
          carboidrati: 12,
          grassi: 2,
          tempo: '5 min',
          porzioni: 1,
          ingredienti: ['Tisana rilassante', 'Crackers integrali'],
          preparazione: 'Prepara tisana calda e accompagna con crackers'
        };
      }
      
      days.push(day);
    }
    
    return { days };
  };

  // 🔧 Utility functions
  const parseAllergies = (allergie: string): string[] => {
    if (!allergie) return [];
    
    const allergieText = allergie.toLowerCase();
    const allergieMap: { [key: string]: string } = {
      'glutine': 'glutine',
      'lattosio': 'latte',
      'latte': 'latte',
      'latticini': 'latte',
      'uova': 'uova',
      'pesce': 'pesce',
      'frutti di mare': 'pesce',
      'crostacei': 'pesce',
      'noci': 'frutta_secca',
      'mandorle': 'frutta_secca',
      'nocciole': 'frutta_secca',
      'pistacchi': 'frutta_secca',
      'frutta secca': 'frutta_secca',
      'soia': 'soia',
      'sesamo': 'sesamo',
      'arachidi': 'frutta_secca',
      'sedano': 'sedano',
      'senape': 'senape',
      'lupini': 'lupini',
      'molluschi': 'pesce',
      'anidride solforosa': 'solfiti',
      'solfiti': 'solfiti'
    };
    
    const result: string[] = [];
    Object.keys(allergieMap).forEach(key => {
      if (allergieText.includes(key)) {
        result.push(allergieMap[key]);
      }
    });
    
    return result;
  };

  const getMaxTime = (mealType: string): number => {
    const timeMap: { [key: string]: number } = {
      'colazione': 20,
      'pranzo': 40,
      'cena': 45,
      'spuntino': 10
    };
    
    return timeMap[mealType] || 30;
  };

  // 💾 Salva in Airtable
  const saveToAirtable = async (plan: any, formData: any) => {
    try {
      const response = await fetch('/api/airtable', {
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
            goal: formData.obiettivo,
            duration: formData.durata,
            meals_per_day: formData.pasti,
            exclusions: formData.allergie || '',
            foods_at_home: formData.preferenze || '',
            phone: ''
          }
        })
      });
      
      if (response.ok) {
        console.log('✅ Saved to Airtable successfully');
      }
    } catch (error) {
      console.log('⚠️ Airtable save error:', error);
    }
  };

  // 🚀 FUNZIONE PRINCIPALE - SISTEMA IBRIDO AI + DATABASE
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMIT STARTED (AI + Database Hybrid)');
    console.log('📝 Form Data:', formData);
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // 🤖 STEP 1: Genera ricette con AI
      console.log('🧠 Generating meal plan with AI...');
      
      const aiPrompt = `Crea un piano meal prep per ${formData.nome}:
- Età: ${formData.eta} anni
- Sesso: ${formData.sesso}
- Peso: ${formData.peso}kg
- Obiettivo: ${formData.obiettivo}
- Allergie: ${formData.allergie || 'nessuna'}
- Preferenze: ${formData.preferenze || 'nessuna'}
- Durata: ${formData.durata} giorni
- Pasti al giorno: ${formData.pasti}

Genera ricette creative e personalizzate per ogni pasto.`;

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prompt: aiPrompt
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ AI generated plan successfully');
        
        // 🔄 STEP 2: Arricchisci con database se disponibile
        let enrichedPlan;
        try {
          const { MealPlannerIntegration } = await import('./utils/mealPlannerIntegration');
          const mealPlanner = MealPlannerIntegration.getInstance();
          
          // Arricchisci il piano AI con dettagli dal database
          enrichedPlan = await enrichAIPlanWithDatabase(result.piano, formData, mealPlanner);
          console.log('✅ Plan enriched with database details');
        } catch (dbError) {
          console.log('⚠️ Database enrichment failed, using AI plan:', dbError);
          enrichedPlan = await parseAIPlan(result.piano, formData);
        }
        
        setParsedPlan(enrichedPlan);
        
        const completeDocument = generateCompleteDocument(enrichedPlan, formData);
        setGeneratedPlan(completeDocument);
        setShowPreview(true);
        
        // Salva piano (opzionale)
        try {
          await saveToAirtable(enrichedPlan, formData);
        } catch (airtableError) {
          console.log('⚠️ Airtable save error (non-blocking):', airtableError);
        }
        
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
      } else {
        console.log('❌ AI generation failed, using fallback');
        throw new Error(result.error || 'AI generation failed');
      }
      
    } catch (error) {
      console.error('❌ Error in meal plan generation:', error);
      
      // 🔄 FALLBACK: Piano con ricette base
      const fallbackPlan = createFallbackPlan(formData);
      setParsedPlan(fallbackPlan);
      
      const completeDocument = generateCompleteDocument(fallbackPlan, formData);
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
              <p className="text-gray-300">Il sistema usa l'AI per creare ricette personalizzate e arricchisce i dettagli con il nostro database di oltre 500 ricette selezionate.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Le ricette sono personalizzate?</h3>
              <p className="text-gray-300">Sì! L'AI crea ricette uniche per te, mentre il database fornisce ingredienti dettagliati e preparazioni accurate.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Posso vedere i dettagli delle ricette?</h3>
              <p className="text-gray-300">Assolutamente! Ogni ricetta è collegata a una pagina dettagliata con ingredienti, preparazione e valori nutrizionali.</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🔀 Come funziona la sostituzione ricette?</h3>
              <p className="text-gray-300">Puoi sostituire qualsiasi ricetta con una nuova dal database che rispetta le tue preferenze e restrizioni alimentari.</p>
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
            Semplificare la tua alimentazione con programmazione AI intelligente e ricette personalizzate.
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