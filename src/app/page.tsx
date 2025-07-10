'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from './components/header';
import Features from '../components/Features';
import MealForm from '../components/MealForm';
import MealPreview from '../components/MealPreview';
import MealPlanComplete from '../components/MealPlanComplete';
import AISubstituteModal from '../components/AiSubstituteModal';
import HowItWorksSection from '../components/HowItWorksSection';
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

  // 🔄 SOSTITUZIONE RICETTA CON CLAUDE AI
  const handleReplacement = async (mealType: string, dayNumber: string) => {
    console.log('🔄 REPLACEMENT STARTED (Claude AI):', { mealType, dayNumber });
    setIsReplacing(`${dayNumber}-${mealType}`);
    
    try {
      const dayIndex = parseInt(dayNumber.replace('Giorno ', '')) - 1;
      const currentMeal = parsedPlan.days[dayIndex].meals[mealType];
      
      // 🤖 STEP 1: Chiama la tua API Claude AI esistente
      const response = await fetch('/api/replace-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: formData,
          mealType: mealType,
          dayNumber: dayNumber,
          currentPlan: parsedPlan
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.newMeal) {
          // 🎯 Usa la ricetta generata da Claude AI
          const newMeal = result.newMeal;
          
          // 🖼️ Genera immagine per la nuova ricetta
          let imageUrl = '';
          try {
            const imageResponse = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: `Professional food photography of ${newMeal.nome}, healthy fitness meal, appetizing`
              })
            });
            const imageResult = await imageResponse.json();
            imageUrl = imageResult.imageUrl || '';
          } catch (imageError) {
            console.log('⚠️ Image generation failed:', imageError);
          }
          
          // 🏋️‍♂️ Calcola fitness score per la nuova ricetta
          let fitnessScore = 75; // Score base
          const proteinRatio = newMeal.proteine / newMeal.calorie * 4;
          
          // Bonus proteine
          if (proteinRatio >= 0.20 && proteinRatio <= 0.35) {
            fitnessScore += 15;
          }
          
          // Bonus per obiettivo
          if (formData.obiettivo === 'dimagrimento' && newMeal.calorie <= 400) {
            fitnessScore += 10;
          } else if (formData.obiettivo === 'aumento-massa' && newMeal.calorie >= 500) {
            fitnessScore += 10;
          }
          
          // 🔄 Aggiorna il piano con la nuova ricetta Claude AI - SENZA TAG DEBUG
          const updatedParsedPlan = { ...parsedPlan };
          updatedParsedPlan.days[dayIndex].meals[mealType] = {
            nome: newMeal.nome,
            calorie: newMeal.calorie,
            proteine: newMeal.proteine,
            carboidrati: newMeal.carboidrati,
            grassi: newMeal.grassi,
            tempo: newMeal.tempo,
            porzioni: newMeal.porzioni,
            ingredienti: newMeal.ingredienti,
            preparazione: newMeal.preparazione,
            imageUrl: imageUrl,
            fitnessScore: Math.min(100, fitnessScore),
            fitnessReasons: [
              `Fitness Score: ${Math.min(100, fitnessScore)}/100`,
              `Proteine: ${newMeal.proteine}g (${(proteinRatio * 100).toFixed(1)}%)`,
              `Calorie ottimizzate per ${formData.obiettivo}`
            ],
            recipeId: `recipe-${Date.now()}`,
            rating: 4.5,
            categoria: mealType,
            tipoCucina: 'italiana',
            difficolta: 'facile'
          };
          
          setParsedPlan(updatedParsedPlan);
          
          // Rigenera il documento completo
          const completeDocument = generateCompleteDocument(updatedParsedPlan, formData);
          setGeneratedPlan(completeDocument);
          
          console.log('✅ Meal replaced with Claude AI:', newMeal.nome, 'Score:', Math.min(100, fitnessScore));
        } else {
          throw new Error('No meal generated');
        }
      } else {
        throw new Error('API replacement failed');
      }
      
    } catch (error) {
      console.error('❌ Claude AI replacement failed, trying database fallback:', error);
      
      // 🔄 FALLBACK: Usa il sistema database esistente
      try {
        const { MealPlannerIntegration } = await import('./utils/mealPlannerIntegration');
        const mealPlanner = MealPlannerIntegration.getInstance();
        
        const dayIndex = parseInt(dayNumber.replace('Giorno ', '')) - 1;
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
        
        const updatedPlan = mealPlanner.replaceRecipeInPlan(currentMealPlan, dayIndex, mealType);
        const newMeal = (updatedPlan.days[dayIndex].meals as any)[mealType];
        
        if (newMeal) {
          // 🖼️ Genera immagine
          let imageUrl = '';
          try {
            const imageResponse = await fetch('/api/generate-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: `Professional food photography of ${newMeal.nome}, healthy fitness meal`
              })
            });
            const imageResult = await imageResponse.json();
            imageUrl = imageResult.imageUrl || '';
          } catch (imageError) {
            console.log('⚠️ Fallback image generation failed:', imageError);
          }
          
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
            difficolta: newMeal.difficolta,
            fitnessScore: 70,
            fitnessReasons: ['Ricetta bilanciata', 'Ingredienti fitness'],
            imageUrl: imageUrl
          };
          
          setParsedPlan(updatedParsedPlan);
          const completeDocument = generateCompleteDocument(updatedParsedPlan, formData);
          setGeneratedPlan(completeDocument);
          
          console.log('✅ Fallback replacement successful:', newMeal.nome);
        }
      } catch (fallbackError) {
        console.error('❌ Complete replacement failure:', fallbackError);
      }
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
            preparazione: enhancedPreparation,
            recipeId: dbRecipe.id,
            rating: dbRecipe.rating,
            categoria: dbRecipe.categoria,
            tipoCucina: dbRecipe.tipoCucina,
            difficolta: dbRecipe.difficolta,
            fitnessScore: fitnessScore.score,
            fitnessReasons: fitnessScore.reasons,
            imageUrl: imageUrl
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
            imageUrl: imageUrl
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
            fitnessScore: 85
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
          fitnessScore: 90
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
          fitnessScore: 80
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
        maxCalorie: fitnessGuidelines.maxCalories,
        minProtein: fitnessGuidelines.minProtein
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
      'dimagrimento': {
        colazione: {
          nome: `Colazione Energetica ${dayIndex + 1}`,
          calorie: 350,
          proteine: 25,
          carboidrati: 30,
          grassi: 12,
          tempo: '10 min',
          porzioni: 1,
          ingredienti: ['2 uova', '1 fetta pane integrale', '1/2 avocado', 'Spinaci freschi'],
          preparazione: 'Uova strapazzate con spinaci, servite con avocado su pane integrale per una colazione bilanciata',
          fitnessScore: 85,
          tipoCucina: 'italiana',
          difficolta: 'facile',
          rating: 4.2
        },
        pranzo: {
          nome: `Pranzo Proteico ${dayIndex + 1}`,
          calorie: 400,
          proteine: 35,
          carboidrati: 25,
          grassi: 15,
          tempo: '20 min',
          porzioni: 1,
          ingredienti: ['120g pollo grigliato', '80g quinoa', '100g broccoli', '1 cucchiaio olio EVO'],
          preparazione: 'Pollo grigliato con quinoa e broccoli al vapore, conditi con olio extravergine',
          fitnessScore: 90,
          tipoCucina: 'mediterranea',
          difficolta: 'facile',
          rating: 4.5
        },
        cena: {
          nome: `Cena Bilanciata ${dayIndex + 1}`,
          calorie: 320,
          proteine: 30,
          carboidrati: 15,
          grassi: 12,
          tempo: '25 min',
          porzioni: 1,
          ingredienti: ['130g salmone', '80g verdure miste', 'Limone', 'Erbe aromatiche'],
          preparazione: 'Salmone al limone con verdure grigliate, ricco di omega-3 per il recupero',
          fitnessScore: 88,
          tipoCucina: 'mediterranea',
          difficolta: 'medio',
          rating: 4.3
        }
      },
      'aumento-massa': {
        colazione: {
          nome: `Colazione Power ${dayIndex + 1}`,
          calorie: 550,
          proteine: 30,
          carboidrati: 60,
          grassi: 18,
          tempo: '15 min',
          porzioni: 1,
          ingredienti: ['60g avena', '30g proteine whey', '1 banana', '20g mandorle', '250ml latte'],
          preparazione: 'Porridge proteico con banana e mandorle per massimizzare l\'energia',
          fitnessScore: 92,
          tipoCucina: 'fitness',
          difficolta: 'facile',
          rating: 4.6
        },
        pranzo: {
          nome: `Pranzo Anabolico ${dayIndex + 1}`,
          calorie: 650,
          proteine: 40,
          carboidrati: 55,
          grassi: 22,
          tempo: '25 min',
          porzioni: 1,
          ingredienti: ['100g riso integrale', '140g pollo', '100g verdure', '1/2 avocado', 'Olio EVO'],
          preparazione: 'Bowl completo con riso, pollo e verdure per supportare la crescita muscolare',
          fitnessScore: 88,
          tipoCucina: 'fitness',
          difficolta: 'facile',
          rating: 4.4
        },
        cena: {
          nome: `Cena Muscolare ${dayIndex + 1}`,
          calorie: 580,
          proteine: 45,
          carboidrati: 35,
          grassi: 20,
          tempo: '30 min',
          porzioni: 1,
          ingredienti: ['150g manzo magro', '100g patate dolci', '80g spinaci'],
          preparazione: 'Manzo con patate dolci e spinaci per il recovery notturno e la sintesi proteica',
          fitnessScore: 85,
          tipoCucina: 'americana',
          difficolta: 'medio',
          rating: 4.2
        }
      }
    };
    
    const selectedMeals = fitnessOptimizedMeals[fitnessGoal as keyof typeof fitnessOptimizedMeals] || 
                         fitnessOptimizedMeals['dimagrimento'];
    
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
          tipoCucina: 'fitness',
          difficolta: 'facile',
          rating: 4.1
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
          tipoCucina: 'fitness',
          difficolta: 'facile',
          rating: 4.4
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
          tipoCucina: 'italiana',
          difficolta: 'facile',
          rating: 4.0
        };
      }
      
      days.push(day);
    }
    
    return { days };
  };

  // 🔄 Piano fallback FITNESS-OTTIMIZZATO CON VARIETÀ
  const createFallbackPlan = (formData: any) => {
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 4;
    const varieta = formData.varieta || 'diversi';
    
    console.log(`🍽️ Creating fallback plan: ${numDays} days, ${numPasti} meals, variety: ${varieta}`);
    
    const days = [];
    
    // 🎨 VARIETÀ PASTI - RICETTE DIVERSE PER GIORNO
    const mealVariations = {
      colazione: [
        {
          nome: 'Power Breakfast Bowl',
          calorie: 420, proteine: 25, carboidrati: 35, grassi: 18,
          ingredienti: ['60g avena', '25g proteine whey', '100g frutti di bosco', '15g mandorle'],
          preparazione: 'Bowl proteico con avena, proteine e frutti di bosco per energia duratura'
        },
        {
          nome: 'Pancakes Proteici',
          calorie: 450, proteine: 28, carboidrati: 38, grassi: 16,
          ingredienti: ['150g ricotta', '40g farina avena', '2 uova', '80g mirtilli'],
          preparazione: 'Pancakes con ricotta e mirtilli, ricchi di proteine e gusto'
        },
        {
          nome: 'Overnight Oats Fitness',
          calorie: 390, proteine: 22, carboidrati: 42, grassi: 14,
          ingredienti: ['50g avena', '30g proteine', '1 mela', '10g burro mandorle'],
          preparazione: 'Overnight oats con mela e burro di mandorle, preparati la sera prima'
        },
        {
          nome: 'Smoothie Energetico',
          calorie: 380, proteine: 26, carboidrati: 35, grassi: 12,
          ingredienti: ['30g proteine whey', '1 banana', '200ml latte mandorle', '20g spinaci', '15g mandorle'],
          preparazione: 'Smoothie verde energetico con proteine e frutta fresca'
        }
      ],
      pranzo: [
        {
          nome: 'Chicken Power Bowl',
          calorie: 480, proteine: 40, carboidrati: 35, grassi: 18,
          ingredienti: ['120g pollo', '80g quinoa', '100g verdure miste', '1/2 avocado'],
          preparazione: 'Bowl completo con pollo grigliato, quinoa e verdure fresche'
        },
        {
          nome: 'Risotto Fitness',
          calorie: 520, proteine: 35, carboidrati: 45, grassi: 20,
          ingredienti: ['90g riso integrale', '100g pollo', '80g zucchine', '30g parmigiano'],
          preparazione: 'Risotto cremoso con pollo e zucchine, versione fitness'
        },
        {
          nome: 'Salmone Teriyaki Bowl',
          calorie: 460, proteine: 38, carboidrati: 32, grassi: 22,
          ingredienti: ['130g salmone', '100g riso venere', '80g edamame', 'Salsa teriyaki'],
          preparazione: 'Salmone teriyaki con riso venere ed edamame, sapori orientali'
        },
        {
          nome: 'Buddha Bowl Proteico',
          calorie: 440, proteine: 32, carboidrati: 38, grassi: 19,
          ingredienti: ['100g tofu', '70g quinoa', '80g ceci', '100g verdure miste', 'Tahina'],
          preparazione: 'Bowl vegetariano completo con tofu, quinoa e verdure colorate'
        }
      ],
      cena: [
        {
          nome: 'Lean Salmon Plate',
          calorie: 420, proteine: 35, carboidrati: 20, grassi: 20,
          ingredienti: ['130g salmone', '100g broccoli', '80g patate dolci'],
          preparazione: 'Salmone con verdure e carboidrati complessi per il recovery'
        },
        {
          nome: 'Tagliata Fitness',
          calorie: 390, proteine: 38, carboidrati: 15, grassi: 18,
          ingredienti: ['120g tagliata manzo', '80g rucola', '60g pomodorini', '20g grana'],
          preparazione: 'Tagliata su letto di rucola con pomodorini e grana'
        },
        {
          nome: 'Curry di Pollo Light',
          calorie: 410, proteine: 36, carboidrati: 25, grassi: 16,
          ingredienti: ['120g pollo', '60g riso basmati', '100g verdure curry', 'Latte cocco light'],
          preparazione: 'Curry leggero con pollo e verdure, ricco di sapore'
        },
        {
          nome: 'Orata Mediterranean',
          calorie: 380, proteine: 34, carboidrati: 18, grassi: 17,
          ingredienti: ['140g orata', '80g verdure grigliate', '60g patate novelle', 'Erbe mediterrane'],
          preparazione: 'Orata al forno con verdure mediterranee e patate novelle'
        }
      ]
    };
    
    // 🎯 SPUNTINI VARIATI
    const spuntiniVariations = [
      {
        nome: 'Protein Greek Yogurt',
        calorie: 180, proteine: 20, carboidrati: 15, grassi: 3,
        ingredienti: ['150g yogurt greco', '80g frutti di bosco', '15g granola proteica'],
        preparazione: 'Yogurt greco con frutti di bosco e granola per uno spuntino proteico'
      },
      {
        nome: 'Energy Balls',
        calorie: 170, proteine: 12, carboidrati: 18, grassi: 8,
        ingredienti: ['20g proteine', '30g datteri', '15g mandorle', '10g cacao'],
        preparazione: 'Palline energetiche con proteine e frutta secca'
      },
      {
        nome: 'Hummus Veggie',
        calorie: 160, proteine: 8, carboidrati: 20, grassi: 6,
        ingredienti: ['80g hummus', '100g verdure crude', '10g semi girasole'],
        preparazione: 'Hummus cremoso con verdure croccanti e semi'
      },
      {
        nome: 'Protein Smoothie',
        calorie: 190, proteine: 18, carboidrati: 16, grassi: 5,
        ingredienti: ['25g proteine whey', '1/2 banana', '200ml latte vegetale'],
        preparazione: 'Smoothie proteico cremoso e rinfrescante'
      }
    ];
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {} as any
      };
      
      // 🎨 SELEZIONE VARIETÀ BASATA SU PREFERENZA UTENTE
      if (varieta === 'diversi') {
        // Pasti diversi per ogni giorno
        day.meals.colazione = {
          ...mealVariations.colazione[i % mealVariations.colazione.length],
          tempo: '15 min', porzioni: 1, fitnessScore: 88, tipoCucina: 'fitness', difficolta: 'facile', rating: 4.5
        };
        day.meals.pranzo = {
          ...mealVariations.pranzo[i % mealVariations.pranzo.length],
          tempo: '20 min', porzioni: 1, fitnessScore: 92, tipoCucina: 'fitness', difficolta: 'medio', rating: 4.7
        };
        day.meals.cena = {
          ...mealVariations.cena[i % mealVariations.cena.length],
          tempo: '25 min', porzioni: 1, fitnessScore: 85, tipoCucina: 'fitness', difficolta: 'medio', rating: 4.3
        };
      } else {
        // Stessi pasti per tutti i giorni (ripetuti)
        day.meals.colazione = {
          ...mealVariations.colazione[0],
          tempo: '15 min', porzioni: 1, fitnessScore: 88, tipoCucina: 'fitness', difficolta: 'facile', rating: 4.5
        };
        day.meals.pranzo = {
          ...mealVariations.pranzo[0],
          tempo: '20 min', porzioni: 1, fitnessScore: 92, tipoCucina: 'fitness', difficolta: 'medio', rating: 4.7
        };
        day.meals.cena = {
          ...mealVariations.cena[0],
          tempo: '25 min', porzioni: 1, fitnessScore: 85, tipoCucina: 'fitness', difficolta: 'medio', rating: 4.3
        };
      }
      
      // Aggiungi spuntini FITNESS variati
      if (numPasti >= 4) {
        day.meals.spuntino1 = {
          ...spuntiniVariations[i % spuntiniVariations.length],
          tempo: '5 min', porzioni: 1, fitnessScore: 85, tipoCucina: 'fitness', difficolta: 'facile', rating: 4.1
        };
      }
      
      if (numPasti >= 5) {
        day.meals.spuntino2 = {
          nome: 'Power Shake',
          calorie: 250, proteine: 25, carboidrati: 20, grassi: 8,
          tempo: '2 min', porzioni: 1,
          ingredienti: ['30g proteine whey', '1 banana', '15g burro mandorle', '200ml acqua'],
          preparazione: 'Shake proteico post-workout completo per il recovery',
          fitnessScore: 90, tipoCucina: 'fitness', difficolta: 'facile', rating: 4.4
        };
      }
      
      if (numPasti >= 6) {
        day.meals.spuntino3 = {
          nome: 'Night Protein Snack',
          calorie: 160, proteine: 15, carboidrati: 8, grassi: 6,
          tempo: '5 min', porzioni: 1,
          ingredienti: ['100g ricotta light', '10g noci', 'Cannella'],
          preparazione: 'Ricotta con noci per proteine a lento rilascio durante la notte',
          fitnessScore: 78, tipoCucina: 'italiana', difficolta: 'facile', rating: 4.0
        };
      }
      
      console.log(`✅ Day ${i + 1} meals created:`, Object.keys(day.meals));
      days.push(day);
    }
    
    console.log(`🎉 Fallback plan created with ${days.length} days and variety: ${varieta}`);
    return { days };
  };

  // 🔧 Utility functions
  const parseAllergies = (allergie: string[]): string[] => {
    if (!allergie || !Array.isArray(allergie)) return [];
    
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

  // 💾 SALVA IN AIRTABLE - FUNZIONE CORRETTA CON MAPPING
  const saveToAirtable = async (plan: any, formData: any) => {
    console.log('💾 Attempting to save to Airtable...');
    console.log('📝 Form data for save:', formData);
    
    try {
      // 🔧 MAPPING CORRETTO PER CAMPI SELECT
      const goalMapping: { [key: string]: string } = {
        'dimagrimento': 'Dimagrimento', 
        'aumento-massa': 'Aumento massa',
        'mantenimento': 'Mantenimento',
        'definizione': 'Definizione'
      };

      const activityMapping: { [key: string]: string } = {
        'sedentario': 'sedentario',
        'leggero': 'leggero',
        'moderato': 'moderato', 
        'intenso': 'intenso',
        'molto_intenso': 'molto intenso'
      };

      const genderMapping: { [key: string]: string } = {
        'maschio': 'maschio',
        'femmina': 'femmina',
        'uomo': 'maschio',
        'donna': 'femmina'
      };

      // 🔧 PREPARA DATI CON MAPPING CORRETTO
      const mappedData = {
        nome: formData.nome || '',
        email: sessionStorage.getItem('userAuth') || formData.email || '',
        age: formData.eta || '',
        weight: formData.peso || '',
        height: formData.altezza || '',
        gender: genderMapping[formData.sesso] || formData.sesso || '',
        activity_level: activityMapping[formData.attivita] || formData.attivita || '',
        goal: goalMapping[formData.obiettivo] || formData.obiettivo || '',
        duration: formData.durata || '',
        meals_per_day: formData.pasti || '',
        exclusions: Array.isArray(formData.allergie) ? formData.allergie.join(', ') : formData.allergie || '',
        foods_at_home: Array.isArray(formData.preferenze) ? formData.preferenze.join(', ') : formData.preferenze || '',
        phone: formData.telefono || ''
      };

      console.log('📤 Mapped data for Airtable:', mappedData);

      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveMealRequest',
          data: mappedData
        })
      });
      
      console.log('📡 Airtable response status:', response.status);
      const result = await response.json();
      console.log('📊 Airtable response data:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Saved to Airtable successfully:', result.recordId);
        return { success: true, recordId: result.recordId };
      } else {
        console.error('❌ Airtable save failed:', result.error);
        console.error('❌ Error details:', result.details);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Airtable save error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
        console.log('🔥 Backend calculated calories:', result.metadata?.dailyTarget);
        
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
        
        // 🔥 FIX CALORIE: FORZA LE CALORIE DAL BACKEND - VERSIONE CORRETTA
        if (result.metadata?.dailyTarget && enrichedPlan?.days) {
          const targetCalories = result.metadata.dailyTarget;
          console.log('🔧 FORCING frontend calories to match backend:', targetCalories);
          
          enrichedPlan.days.forEach((day: any) => {
            // Calcola il totale attuale
            let currentTotal = 0;
            Object.values(day.meals).forEach((meal: any) => {
              currentTotal += meal.calorie || 0;
            });
            
            console.log(`📊 Day ${day.day}: Current ${currentTotal} kcal, Target ${targetCalories} kcal`);
            
            // 🔧 FIX: SCALA SEMPRE SE DIVERSO DAL TARGET (non solo se < 50%)
            if (Math.abs(currentTotal - targetCalories) > 100) {
              const scaleFactor = targetCalories / Math.max(currentTotal, 1);
              console.log(`🔧 Scaling day ${day.day} calories by factor:`, scaleFactor.toFixed(2));
              
              Object.values(day.meals).forEach((meal: any) => {
                if (meal) {
                  const oldCalories = meal.calorie;
                  meal.calorie = Math.round(meal.calorie * scaleFactor);
                  meal.proteine = Math.round(meal.proteine * scaleFactor);
                  meal.carboidrati = Math.round(meal.carboidrati * scaleFactor);
                  meal.grassi = Math.round(meal.grassi * scaleFactor);
                  console.log(`  📈 ${meal.nome}: ${oldCalories} → ${meal.calorie} kcal`);
                }
              });
              
              // Verifica finale
              let newTotal = 0;
              Object.values(day.meals).forEach((meal: any) => {
                newTotal += meal.calorie || 0;
              });
              console.log(`✅ Day ${day.day} final total: ${newTotal} kcal`);
            } else {
              console.log(`✅ Day ${day.day} calories already correct: ${currentTotal} kcal`);
            }
          });
        }
        
        setParsedPlan(enrichedPlan);
        
        const completeDocument = generateCompleteDocument(enrichedPlan, formData);
        setGeneratedPlan(completeDocument);
        setShowPreview(true);
        
        // 🔧 STEP 3: SALVA IN AIRTABLE CON MAPPING CORRETTO
        console.log('💾 Saving to Airtable with correct mapping...');
        try {
          const saveResult = await saveToAirtable(enrichedPlan, formData);
          if (saveResult.success) {
            console.log('✅ Successfully saved to Airtable:', saveResult.recordId);
          } else {
            console.log('❌ Failed to save to Airtable:', saveResult.error);
          }
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
      
      // 🔄 FALLBACK: Piano con ricette FITNESS CON VARIETÀ
      const fallbackPlan = createFallbackPlan(formData);
      setParsedPlan(fallbackPlan);
      
      const completeDocument = generateCompleteDocument(fallbackPlan, formData);
      setGeneratedPlan(completeDocument);
      setShowPreview(true);
      
      // 🔧 SALVA ANCHE IL FALLBACK
      try {
        const saveResult = await saveToAirtable(fallbackPlan, formData);
        if (saveResult.success) {
          console.log('✅ Fallback plan saved to Airtable:', saveResult.recordId);
        }
      } catch (airtableError) {
        console.log('⚠️ Fallback save error:', airtableError);
      }
      
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
          Generazione meal prep FITNESS-OTTIMIZZATA, Lista della Spesa Intelligente e Ricette con Priorità Fitness.
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

      {/* How it Works - SOSTITUITO CON COMPONENTE PULITO */}
      <HowItWorksSection />

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
                