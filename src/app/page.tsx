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
  const { formData, hasSavedData, handleInputChange, handleArrayChange, clearSavedData, resetFormData } = useFormData();

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

  // 🔄 SOSTITUZIONE RICETTA CON DATABASE + FITNESS PRIORITY
  const handleReplacement = async (mealType: string, dayNumber: string) => {
    console.log('🔄 REPLACEMENT STARTED (Fitness Priority):', { mealType, dayNumber });
    setIsReplacing(`${dayNumber}-${mealType}`);
    
    try {
      // Importa meal planner integration e AI fitness enhancer
      const { MealPlannerIntegration } = await import('./utils/mealPlannerIntegration');
      const { aiRecipeEnhancer } = await import('../utils/aiRecipeEnhancer');
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
        // 🏋️‍♂️ APPLICA FITNESS ENHANCEMENT
        const fitnessScore = aiRecipeEnhancer.calculateFitnessScore(newMeal, formData.obiettivo);
        const enhancedPreparation = await aiRecipeEnhancer.enhanceRecipeForFitness(newMeal, formData.obiettivo);
        const imageUrl = await aiRecipeEnhancer.generateRecipeImage(newMeal);
        
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
          preparazione: enhancedPreparation, // Preparazione migliorata per fitness
          recipeId: newMeal.id,
          rating: newMeal.rating,
          categoria: newMeal.categoria,
          tipoCucina: newMeal.tipoCucina,
          difficolta: newMeal.difficolta,
          fitnessScore: fitnessScore.score, // Aggiungi fitness score
          fitnessReasons: fitnessScore.reasons,
          imageUrl: imageUrl, // Immagine AI generata
          source: 'database-fitness-enhanced'
        };
        
        setParsedPlan(updatedParsedPlan);
        
        // Rigenera il documento completo
        const completeDocument = generateCompleteDocument(updatedParsedPlan, formData);
        setGeneratedPlan(completeDocument);
        
        console.log('✅ Meal replaced with FITNESS enhancement:', newMeal.nome, 'Score:', fitnessScore.score);
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

  // 🤖 Funzione per arricchire piano AI con database + FITNESS PRIORITY
  const enrichAIPlanWithDatabase = async (aiPlan: string, formData: any, mealPlanner: any) => {
    console.log('🔄 Enriching AI plan with database + FITNESS PRIORITY...');
    
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 4;
    
    const enrichedDays = [];
    
    // 🏋️‍♂️ IMPORTA FITNESS ENHANCER
    const { aiRecipeEnhancer } = await import('../utils/aiRecipeEnhancer');
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {} as any
      };
      
      // Per ogni pasto, cerca ricetta simile nel database con priorità FITNESS
      const meals = ['colazione', 'pranzo', 'cena'];
      
      for (const mealType of meals) {
        const dbRecipe = await findSimilarRecipeInDatabase(mealType, formData, mealPlanner);
        if (dbRecipe) {
          // 🏋️‍♂️ CALCOLA FITNESS SCORE E MIGLIORA RICETTA
          const fitnessScore = aiRecipeEnhancer.calculateFitnessScore(dbRecipe, formData.obiettivo);
          const enhancedPreparation = await aiRecipeEnhancer.enhanceRecipeForFitness(dbRecipe, formData.obiettivo);
          const imageUrl = await aiRecipeEnhancer.generateRecipeImage(dbRecipe);
          
          day.meals[mealType] = {
            nome: dbRecipe.nome,
            calorie: dbRecipe.calorie,
            proteine: dbRecipe.proteine,
            carboidrati: dbRecipe.carboidrati,
            grassi: dbRecipe.grassi,
            tempo: `${dbRecipe.tempoPreparazione} min`,
            porzioni: dbRecipe.porzioni,
            ingredienti: dbRecipe.ingredienti,
            preparazione: enhancedPreparation, // Versione fitness-enhanced
            recipeId: dbRecipe.id,
            rating: dbRecipe.rating,
            categoria: dbRecipe.categoria,
            tipoCucina: dbRecipe.tipoCucina,
            difficolta: dbRecipe.difficolta,
            fitnessScore: fitnessScore.score,
            fitnessReasons: fitnessScore.reasons,
            imageUrl: imageUrl,
            source: 'database-fitness-enhanced'
          };
        } else {
          day.meals[mealType] = createGenericMeal(mealType, i);
        }
      }
      
      // Aggiungi spuntini con FOCUS FITNESS
      if (numPasti >= 4) {
        const spuntino1 = await findSimilarRecipeInDatabase('spuntino', formData, mealPlanner);
        if (spuntino1) {
          const fitnessScore = aiRecipeEnhancer.calculateFitnessScore(spuntino1, formData.obiettivo);
          const imageUrl = await aiRecipeEnhancer.generateRecipeImage(spuntino1);
          
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
            fitnessScore: fitnessScore.score,
            imageUrl: imageUrl,
            source: 'database-fitness'
          };
        } else {
          day.meals.spuntino1 = {
            nome: `Spuntino Fitness ${i + 1}`,
            calorie: 180,
            proteine: 15,
            carboidrati: 12,
            grassi: 8,
            tempo: '5 min',
            porzioni: 1,
            ingredienti: ['Yogurt greco', 'Frutti di bosco', 'Mandorle'],
            preparazione: 'Mescola yogurt greco con frutti di bosco e mandorle per uno spuntino ricco di proteine',
            fitnessScore: 85,
            source: 'ai-fitness-optimized'
          };
        }
      }
      
      if (numPasti >= 5) {
        day.meals.spuntino2 = {
          nome: `Shake Proteico ${i + 1}`,
          calorie: 250,
          proteine: 25,
          carboidrati: 20,
          grassi: 8,
          tempo: '3 min',
          porzioni: 1,
          ingredienti: ['Proteine in polvere', 'Banana', 'Latte mandorle', 'Avena'],
          preparazione: 'Frulla tutti gli ingredienti per uno shake post-workout completo',
          fitnessScore: 90,
          source: 'ai-fitness-optimized'
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: `Spuntino Serale Fit ${i + 1}`,
          calorie: 150,
          proteine: 12,
          carboidrati: 8,
          grassi: 6,
          tempo: '2 min',
          porzioni: 1,
          ingredienti: ['Ricotta light', 'Noci', 'Cannella'],
          preparazione: 'Ricotta con noci e cannella per il recovery notturno',
          fitnessScore: 80,
          source: 'ai-fitness-optimized'
        };
      }
      
      enrichedDays.push(day);
    }
    
    return { days: enrichedDays };
  };

  // 🔍 Trova ricetta simile nel database con PRIORITÀ FITNESS
  const findSimilarRecipeInDatabase = async (mealType: string, formData: any, mealPlanner: any) => {
    try {
      // 🏋️‍♂️ IMPORTA FITNESS ENHANCER PER SUGGERIMENTI
      const { aiRecipeEnhancer } = await import('../utils/aiRecipeEnhancer');
      const fitnessGuidelines = aiRecipeEnhancer.suggestFitnessRecipesByGoal(formData.obiettivo);
      
      const filters = {
        categoria: mealType === 'spuntino' ? 'spuntino' : mealType as any,
        allergie: parseAllergies(formData.allergie),
        maxTempo: getMaxTime(mealType),
        maxCalorie: fitnessGuidelines.maxCalories, // Limite calorico per obiettivo
        minProtein: fitnessGuidelines.minProtein   // Proteine minime per obiettivo
      };
      
      let candidates = mealPlanner.recipeDB.searchRecipes(filters);
      
      if (candidates.length > 0) {
        // 🏋️‍♂️ ORDINA PER FITNESS SCORE
        const rankedCandidates = await Promise.all(
          candidates.map(async (recipe: any) => {
            const fitnessScore = aiRecipeEnhancer.calculateFitnessScore(recipe, formData.obiettivo);
            return { ...recipe, fitnessScore: fitnessScore.score };
          })
        );
        
        // Ordina: prima fitness score, poi rating
        rankedCandidates.sort((a, b) => {
          if (b.fitnessScore !== a.fitnessScore) {
            return b.fitnessScore - a.fitnessScore;
          }
          return (b.rating || 0) - (a.rating || 0);
        });
        
        return rankedCandidates[0];
      }
      
      return null;
    } catch (error) {
      console.log('Error finding fitness recipe in database:', error);
      return null;
    }
  };

  // 🍽️ Crea pasto generico FITNESS-OTTIMIZZATO
  const createGenericMeal = (mealType: string, dayIndex: number) => {
    const fitnessGoal = formData.obiettivo || 'mantenimento';
    
    const fitnessOptimizedMeals = {
      'perdita-peso': {
        colazione: {
          nome: `Colazione Proteica ${dayIndex + 1}`,
          calorie: 350,
          proteine: 25,
          carboidrati: 30,
          grassi: 12,
          tempo: '10 min',
          porzioni: 1,
          ingredienti: ['Uova', 'Spinaci', 'Avocado', 'Pane integrale'],
          preparazione: 'Uova strapazzate con spinaci, servite con avocado su pane integrale',
          fitnessScore: 85,
          source: 'ai-fitness-optimized'
        },
        pranzo: {
          nome: `Pranzo Lean ${dayIndex + 1}`,
          calorie: 400,
          proteine: 35,
          carboidrati: 25,
          grassi: 15,
          tempo: '20 min',
          porzioni: 1,
          ingredienti: ['Pollo', 'Quinoa', 'Broccoli', 'Olio oliva'],
          preparazione: 'Pollo grigliato con quinoa e broccoli al vapore',
          fitnessScore: 90,
          source: 'ai-fitness-optimized'
        },
        cena: {
          nome: `Cena Light ${dayIndex + 1}`,
          calorie: 320,
          proteine: 30,
          carboidrati: 15,
          grassi: 12,
          tempo: '25 min',
          porzioni: 1,
          ingredienti: ['Salmone', 'Verdure miste', 'Limone'],
          preparazione: 'Salmone al limone con verdure grigliate',
          fitnessScore: 88,
          source: 'ai-fitness-optimized'
        }
      },
      'aumento-massa': {
        colazione: {
          nome: `Colazione Bulk ${dayIndex + 1}`,
          calorie: 550,
          proteine: 30,
          carboidrati: 60,
          grassi: 18,
          tempo: '15 min',
          porzioni: 1,
          ingredienti: ['Avena', 'Proteine whey', 'Banana', 'Mandorle', 'Latte'],
          preparazione: 'Porridge proteico con banana e mandorle',
          fitnessScore: 92,
          source: 'ai-fitness-optimized'
        },
        pranzo: {
          nome: `Pranzo Mass Gain ${dayIndex + 1}`,
          calorie: 650,
          proteine: 40,
          carboidrati: 55,
          grassi: 22,
          tempo: '25 min',
          porzioni: 1,
          ingredienti: ['Riso integrale', 'Pollo', 'Verdure', 'Olio oliva', 'Avocado'],
          preparazione: 'Bowl completo con riso, pollo e verdure',
          fitnessScore: 88,
          source: 'ai-fitness-optimized'
        },
        cena: {
          nome: `Cena Anabolica ${dayIndex + 1}`,
          calorie: 580,
          proteine: 45,
          carboidrati: 35,
          grassi: 20,
          tempo: '30 min',
          porzioni: 1,
          ingredienti: ['Manzo magro', 'Patate dolci', 'Spinaci'],
          preparazione: 'Manzo con patate dolci e spinaci per il recovery',
          fitnessScore: 85,
          source: 'ai-fitness-optimized'
        }
      }
    };
    
    const selectedMeals = fitnessOptimizedMeals[fitnessGoal as keyof typeof fitnessOptimizedMeals] || 
                         fitnessOptimizedMeals['perdita-peso'];
    
    return (selectedMeals as any)[mealType] || selectedMeals.colazione;
  };

  // 🔄 Parse piano AI semplificato con FITNESS FOCUS
  const parseAIPlan = async (aiResponse: string, formData: any) => {
    console.log('🔄 Parsing AI plan with FITNESS focus...');
    
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
      
      // Aggiungi spuntini FITNESS
      if (numPasti >= 4) {
        day.meals.spuntino1 = {
          nome: `Spuntino Pre-Workout ${i + 1}`,
          calorie: 180,
          proteine: 15,
          carboidrati: 20,
          grassi: 5,
          tempo: '5 min',
          porzioni: 1,
          ingredienti: ['Yogurt greco', 'Miele', 'Avena'],
          preparazione: 'Yogurt greco con miele e avena per energia pre-allenamento',
          fitnessScore: 82,
          source: 'ai-fitness'
        };
      }
      
      if (numPasti >= 5) {
        day.meals.spuntino2 = {
          nome: `Snack Post-Workout ${i + 1}`,
          calorie: 220,
          proteine: 20,
          carboidrati: 25,
          grassi: 6,
          tempo: '3 min',
          porzioni: 1,
          ingredienti: ['Shake proteico', 'Banana'],
          preparazione: 'Shake proteico con banana per il recovery post-allenamento',
          fitnessScore: 90,
          source: 'ai-fitness'
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: `Spuntino Serale ${i + 1}`,
          calorie: 150,
          proteine: 12,
          carboidrati: 8,
          grassi: 8,
          tempo: '2 min',
          porzioni: 1,
          ingredienti: ['Ricotta', 'Noci'],
          preparazione: 'Ricotta con noci per proteine a lento rilascio',
          fitnessScore: 75,
          source: 'ai-fitness'
        };
      }
      
      days.push(day);
    }
    
    return { days };
  };

  // 🔄 Piano fallback FITNESS-OTTIMIZZATO
  const createFallbackPlan = (formData: any) => {
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 4;
    
    const days = [];
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {
          colazione: {
            nome: 'Power Breakfast Bowl',
            calorie: 420,
            proteine: 25,
            carboidrati: 35,
            grassi: 18,
            tempo: '15 min',
            porzioni: 1,
            ingredienti: ['Avena', 'Proteine whey', 'Frutti di bosco', 'Mandorle'],
            preparazione: 'Bowl proteico con avena, proteine e frutti di bosco',
            fitnessScore: 88
          },
          pranzo: {
            nome: 'Chicken Power Bowl',
            calorie: 480,
            proteine: 40,
            carboidrati: 35,
            grassi: 18,
            tempo: '20 min',
            porzioni: 1,
            ingredienti: ['Pollo', 'Quinoa', 'Verdure miste', 'Avocado'],
            preparazione: 'Bowl completo con pollo grigliato e quinoa',
            fitnessScore: 92
          },
          cena: {
            nome: 'Lean Salmon Plate',
            calorie: 420,
            proteine: 35,
            carboidrati: 20,
            grassi: 20,
            tempo: '25 min',
            porzioni: 1,
            ingredienti: ['Salmone', 'Broccoli', 'Patate dolci'],
            preparazione: 'Salmone con verdure e carboidrati complessi',
            fitnessScore: 85
          }
        } as any
      };
      
      if (numPasti >= 4) {
        day.meals.spuntino1 = {
          nome: 'Protein Greek Yogurt',
          calorie: 180,
          proteine: 20,
          carboidrati: 15,
          grassi: 3,
          tempo: '5 min',
          porzioni: 1,
          ingredienti: ['Yogurt greco', 'Frutti di bosco', 'Granola proteica'],
          preparazione: 'Yogurt greco con frutti di bosco e granola',
          fitnessScore: 85
        };
      }
      
      if (numPasti >= 5) {
        day.meals.spuntino2 = {
          nome: 'Power Shake',
          calorie: 250,
          proteine: 25,
          carboidrati: 20,
          grassi: 8,
          tempo: '2 min',
          porzioni: 1,
          ingredienti: ['Proteine whey', 'Banana', 'Burro mandorle'],
          preparazione: 'Shake proteico post-workout completo',
          fitnessScore: 90
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: 'Casein Night Snack',
          calorie: 160,
          proteine: 15,
          carboidrati: 8,
          grassi: 6,
          tempo: '5 min',
          porzioni: 1,
          ingredienti: ['Ricotta light', 'Noci', 'Cannella'],
          preparazione: 'Ricotta con noci per proteine notturne',
          fitnessScore: 78
        };
      }
      
      days.push(day);
    }
    
    return { days };
  };

  // 🔧 Utility functions
  const parseAllergies = (allergie: string[]): string[] => {
    if (!allergie || !Array.isArray(allergie)) return [];
    
    // Le allergie sono già standardizzate dalle checkbox
    const allergieMap: { [key: string]: string } = {
      'glutine': 'glutine',
      'lattosio': 'latte',
      'latte': 'latte',
      'uova': 'uova',
      'pesce': 'pesce',
      'frutti_mare': 'pesce',
      'noci': 'frutta_secca',
      'arachidi': 'frutta_secca',
      'soia': 'soia',
      'sesamo': 'sesamo',
      'sedano': 'sedano',
      'senape': 'senape',
      'lupini': 'lupini',
      'solfiti': 'solfiti'
    };
    
    const result: string[] = [];
    allergie.forEach(allergia => {
      const mapped = allergieMap[allergia];
      if (mapped && !result.includes(mapped)) {
        result.push(mapped);
      }
    });
    
    console.log('⚠️ Parsed allergies:', result);
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
            exclusions: formData.allergie?.join(', ') || '',
            foods_at_home: formData.preferenze?.join(', ') || '',
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

  // 🚀 FUNZIONE PRINCIPALE - SISTEMA IBRIDO AI + DATABASE + FITNESS PRIORITY
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMIT STARTED (AI + Database + FITNESS Hybrid)');
    console.log('📝 Form Data:', formData);
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // 🤖 STEP 1: Genera ricette con AI FITNESS-OTTIMIZZATO
      console.log('🧠 Generating FITNESS-OPTIMIZED meal plan with AI...');
      
      // 🏋️‍♂️ IMPORTA FITNESS ENHANCER PER PROMPT OTTIMIZZATO
      const { aiRecipeEnhancer } = await import('../utils/aiRecipeEnhancer');
      const fitnessPrompt = aiRecipeEnhancer.createFitnessOptimizedPrompt(formData);

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          prompt: fitnessPrompt
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ AI generated FITNESS plan successfully');
        
        // 🔄 STEP 2: Arricchisci con database con PRIORITÀ FITNESS
        let enrichedPlan;
        try {
          const { MealPlannerIntegration } = await import('./utils/mealPlannerIntegration');
          const mealPlanner = MealPlannerIntegration.getInstance();
          
          // Arricchisci il piano AI con dettagli dal database + FITNESS PRIORITY
          enrichedPlan = await enrichAIPlanWithDatabase(result.piano, formData, mealPlanner);
          console.log('✅ Plan enriched with database + FITNESS details');
        } catch (dbError) {
          console.log('⚠️ Database enrichment failed, using FITNESS AI plan:', dbError);
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
        console.log('❌ AI generation failed, using FITNESS fallback');
        throw new Error(result.error || 'AI generation failed');
      }
      
    } catch (error) {
      console.error('❌ Error in meal plan generation:', error);
      
      // 🔄 FALLBACK: Piano con ricette FITNESS
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
          Generazione meal prep FITNESS-OTTIMIZZATA con AI, Lista della Spesa Intelligente e Ricette con Priorità Fitness.
        </p>
        <button 
          onClick={() => document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
        >
          🏋️‍♂️ Inizia il Tuo Piano Fitness!
        </button>
      </section>

      {/* Features Component */}
      <Features />

      {/* How it Works */}
      <section className="bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{color: '#8FBC8F'}}>
            Come Funziona il Sistema Fitness
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>1</div>
              <h3 className="text-xl font-bold mb-3">📊 Profilo Fitness</h3>
              <p className="text-gray-300">Inserisci obiettivi, allergie e preferenze. L'AI ottimizza per il tuo goal fitness.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>2</div>
              <h3 className="text-xl font-bold mb-3">🏋️‍♂️ AI Fitness-Aware</h3>
              <p className="text-gray-300">L'AI genera ricette con priorità fitness, calcola score e ottimizza macronutrienti.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>3</div>
              <h3 className="text-xl font-bold mb-3">💪 Database Enhancement</h3>
              <p className="text-gray-300">Database arricchisce con ricette fitness, immagini AI e preparazioni ottimizzate.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold" style={{backgroundColor: '#8FBC8F', color: 'black'}}>4</div>
              <h3 className="text-xl font-bold mb-3">🎯 Piano Personalizzato</h3>
              <p className="text-gray-300">Ricevi piano con score fitness, sostituzioni intelligenti e progressi verso il goal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MealForm Component */}
      <MealForm 
        formData={formData}
        handleInputChange={handleInputChange}
        handleArrayChange={handleArrayChange}
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
            🎉 Il Tuo Piano Fitness è Pronto!
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl mb-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">📋 Piano Alimentare Fitness-Ottimizzato</h3>
              <div className="bg-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto" style={{fontFamily: 'Georgia, serif'}}>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedPlan}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  const text = `🏋️‍♂️ Ecco il mio piano alimentare FITNESS personalizzato!\n\n${generatedPlan}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📱 Condividi Piano Fitness
              </button>

              <button
                onClick={() => {
                  const printContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <title>Piano Fitness - ${formData.nome || 'Utente'}</title>
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
                          <div class="title">🏋️‍♂️ Piano Alimentare Fitness Personalizzato</div>
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
                📥 Scarica Piano PDF
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPlan);
                  alert('Piano fitness copiato negli appunti!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📋 Copia Piano
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
                🔄 Nuovo Piano Fitness
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
            Domande Frequenti - Sistema Fitness
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🏋️‍♂️ Come funziona la priorità fitness?</h3>
              <p className="text-gray-300">L'AI calcola un fitness score (0-100) per ogni ricetta basato su proteine, calorie, ingredienti e obiettivo. Le ricette con score più alto vengono prioritizzate.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">📊 Che cosa include il fitness score?</h3>
              <p className="text-gray-300">Il sistema analizza: rapporto proteine/calorie, ingredienti fitness-friendly (avena, pollo, quinoa), tempo preparazione, categoria pasto e compatibilità con il tuo obiettivo.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🎯 Le ricette cambiano per obiettivo?</h3>
              <p className="text-gray-300">Sì! Per perdita peso: ricette sotto 400 cal, alto contenuto proteico. Per massa: ricette 500+ cal, surplus calorico. Per mantenimento: bilanciate.</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🖼️ Le immagini sono reali?</h3>
              <p className="text-gray-300">L'AI genera immagini food photography professionali per ogni ricetta, ottimizzate per mostrare ingredienti fitness e presentazione appetitosa.</p>
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
            <h3 className="text-2xl font-bold">Meal Prep Planner 💪</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Semplificare la tua alimentazione con programmazione AI fitness-ottimizzata e ricette personalizzate per i tuoi obiettivi.
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