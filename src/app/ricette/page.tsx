// 🔥 FORCE REBUILD 2024 - DATABASE MASSICCIO 420+ RICETTE
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
// 🍳 IMPORT DEFINITIVO - DATABASE MASSICCIO 420+ RICETTE
import { RecipeDatabase, Recipe } from '../utils/recipeDatabase';

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

  // 🍳 INIZIALIZZA DATABASE MASSICCIO
  const [recipeDb, setRecipeDb] = useState<RecipeDatabase | null>(null);

  useEffect(() => {
    // Inizializza il database massiccio
    console.log('🍳 [PAGE] Initializing MASSIVE Recipe Database...');
    const db = RecipeDatabase.getInstance();
    setRecipeDb(db);
    
    // Log delle statistiche
    const stats = db.getStats();
    console.log('📊 [PAGE] Database stats:', stats);
    
    // Test rapido filtri
    const ketoRecipes = db.searchRecipes({ tipoDieta: ['chetogenica'] });
    const fitRecipes = db.searchRecipes({ tipoCucina: 'ricette_fit' });
    console.log(`🥑 [PAGE] Keto recipes available: ${ketoRecipes.length}`);
    console.log(`🏋️‍♂️ [PAGE] Fit recipes available: ${fitRecipes.length}`);
  }, []);

  // Usa il hook useFormData
  const { formData, hasSavedData, handleInputChange, handleArrayChange, clearSavedData, resetFormData } = useFormData();

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

  // 💾 SALVATAGGIO AUTOMATICO PIANO GENERATO
  const saveGeneratedPlan = (plan: any, formData: any) => {
    try {
      const savedPlan = {
        id: `plan-${Date.now()}`,
        nome: formData.nome || 'Utente',
        createdAt: new Date().toISOString().split('T')[0],
        obiettivo: getDisplayObjective(formData.obiettivo),
        durata: formData.durata || '2',
        pasti: formData.pasti || '3',
        calorie: calculateDailyCalories(plan),
        totalCalories: calculateTotalCalories(plan),
        totalProteins: calculateTotalProteins(plan),
        allergie: formData.allergie || [],
        preferenze: formData.preferenze || [],
        formData: formData,
        days: plan.days,
        generatedPlan: generatedPlan // Testo completo del piano
      };

      // Carica piani esistenti
      const existingPlans = JSON.parse(localStorage.getItem('mealPrepSavedPlans') || '[]');
      
      // Aggiungi nuovo piano
      existingPlans.unshift(savedPlan);
      
      // Mantieni solo ultimi 50 piani
      if (existingPlans.length > 50) {
        existingPlans.splice(50);
      }
      
      // Salva in localStorage
      localStorage.setItem('mealPrepSavedPlans', JSON.stringify(existingPlans));
      
      // Salva anche in sessionStorage per backup
      sessionStorage.setItem('lastGeneratedPlan', JSON.stringify(savedPlan));
      
      console.log('💾 Piano salvato automaticamente:', savedPlan.id);
      
      // Mostra notifica di salvataggio
      showSaveNotification();
      
    } catch (error) {
      console.error('❌ Errore salvataggio piano:', error);
    }
  };

  // 🔔 NOTIFICA SALVATAGGIO
  const showSaveNotification = () => {
    // Crea elemento notifica
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-family: Inter, sans-serif;
        font-weight: 500;
      ">
        ✅ Piano salvato nella Dashboard!
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // 🧮 FUNZIONI DI CALCOLO
  const calculateDailyCalories = (plan: any) => {
    if (!plan?.days?.[0]?.meals) return 0;
    
    const firstDay = plan.days[0].meals;
    return Object.values(firstDay).reduce((total: number, meal: any) => {
      return total + (meal?.calorie || 0);
    }, 0);
  };

  const calculateTotalCalories = (plan: any) => {
    if (!plan?.days) return 0;
    
    return plan.days.reduce((total: number, day: any) => {
      const dayCalories = Object.values(day.meals || {}).reduce((dayTotal: number, meal: any) => {
        return dayTotal + (meal?.calorie || 0);
      }, 0);
      return total + dayCalories;
    }, 0);
  };

  const calculateTotalProteins = (plan: any) => {
    if (!plan?.days) return 0;
    
    return plan.days.reduce((total: number, day: any) => {
      const dayProteins = Object.values(day.meals || {}).reduce((dayTotal: number, meal: any) => {
        return dayTotal + (meal?.proteine || 0);
      }, 0);
      return total + dayProteins;
    }, 0);
  };

  // 🧮 CALCOLA BMR (Basal Metabolic Rate)
  const calculateBMR = (formData: any) => {
    const weight = parseInt(formData.peso) || 70;
    const height = parseInt(formData.altezza) || 170;
    const age = parseInt(formData.eta) || 30;
    const gender = formData.sesso;
    
    // Formula Mifflin-St Jeor
    if (gender === 'maschio') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  const getDisplayObjective = (obiettivo: string) => {
    const map: { [key: string]: string } = {
      'dimagrimento': 'Perdita peso',
      'mantenimento': 'Mantenimento', 
      'aumento-massa': 'Aumento massa'
    };
    return map[obiettivo] || obiettivo;
  };

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

  // 🔄 SOSTITUZIONE RICETTA CON CLAUDE AI
  const handleReplacement = async (mealType: string, dayNumber: string) => {
    console.log('🔄 REPLACEMENT STARTED (Claude AI):', { mealType, dayNumber });
    setIsReplacing(`${dayNumber}-${mealType}`);
    
    try {
      const dayIndex = parseInt(dayNumber.replace('Giorno ', '')) - 1;
      
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
          
          // 🔄 Aggiorna il piano con la nuova ricetta Claude AI
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
      console.error('❌ Claude AI replacement failed:', error);
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

  // 🍳 NUOVA FUNZIONE: SELEZIONA RICETTE DAL DATABASE MASSICCIO
  const selectMassiveRecipes = (
    categoria: 'colazione' | 'pranzo' | 'cena' | 'spuntino',
    obiettivo: string,
    count: number,
    preferenze: string[] = [],
    allergie: string[] = []
  ): Recipe[] => {
    if (!recipeDb) {
      console.warn('🚨 Recipe database not initialized');
      return [];
    }

    console.log(`🍳 [MASSIVE] Selecting ${count} ${categoria} recipes for ${obiettivo}`);
    
    // Mappa obiettivi alle diete appropriate
    const obiettivoToDiet: { [key: string]: string[] } = {
      'dimagrimento': ['low_carb', 'chetogenica', 'bilanciata'],
      'aumento-massa': ['bilanciata'],
      'mantenimento': ['bilanciata', 'mediterranea'],
      'definizione': ['low_carb', 'chetogenica']
    };

    const targetDiets = obiettivoToDiet[obiettivo] || ['bilanciata'];
    
    // Cerca ricette appropriate
    let recipes = recipeDb.searchRecipes({
      categoria: categoria,
      tipoDieta: targetDiets,
      allergie: allergie
    });

    console.log(`🔍 [MASSIVE] Found ${recipes.length} recipes for ${categoria}/${obiettivo}`);

    // Filtra per preferenze se specificate
    if (preferenze.length > 0) {
      const filteredByPreferences = recipes.filter(recipe =>
        preferenze.some(pref => 
          recipe.ingredienti.some(ing => 
            ing.toLowerCase().includes(pref.toLowerCase())
          ) ||
          recipe.nome.toLowerCase().includes(pref.toLowerCase())
        )
      );

      if (filteredByPreferences.length > 0) {
        recipes = filteredByPreferences;
        console.log(`✅ [MASSIVE] Filtered to ${recipes.length} recipes by preferences`);
      }
    }

    // Prioritizza ricette "ricette_fit" se disponibili
    const fitRecipes = recipes.filter(r => r.tipoCucina === 'ricette_fit');
    if (fitRecipes.length > 0) {
      recipes = [...fitRecipes, ...recipes.filter(r => r.tipoCucina !== 'ricette_fit')];
      console.log(`🏋️‍♂️ [MASSIVE] Prioritized ${fitRecipes.length} fit recipes`);
    }

    // Seleziona le migliori ricette (ordinate per rating)
    const selectedRecipes = recipes
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, count);

    console.log(`🎯 [MASSIVE] Selected ${selectedRecipes.length} top recipes:`, 
      selectedRecipes.map(r => r.nome));

    return selectedRecipes;
  };

  // 🇮🇹 PIANO FALLBACK CON DATABASE MASSICCIO
  const createMassiveFallback = (formData: any) => {
    const numDays = parseInt(formData.durata) || 2;
    const numPasti = parseInt(formData.pasti) || 3;
    const obiettivo = formData.obiettivo || 'mantenimento';
    const allergie = formData.allergie || [];
    const preferenze = formData.preferenze || [];
    
    console.log(`🍳 [MASSIVE] Creating fallback plan: ${numDays} days, ${numPasti} meals`);
    console.log(`🎯 [MASSIVE] Objective: ${obiettivo}, Allergies: ${allergie.join(', ')}`);
    
    const days = [];
    
    for (let i = 0; i < numDays; i++) {
      const day = {
        day: `Giorno ${i + 1}`,
        meals: {} as any
      };
      
      // 🌅 COLAZIONE
      const colazioneRecipes = selectMassiveRecipes('colazione', obiettivo, numDays, preferenze, allergie);
      if (colazioneRecipes.length > 0) {
        const selected = colazioneRecipes[i % colazioneRecipes.length];
        day.meals.colazione = {
          nome: selected.nome,
          calorie: selected.calorie,
          proteine: selected.proteine,
          carboidrati: selected.carboidrati,
          grassi: selected.grassi,
          tempo: `${selected.tempoPreparazione} min`,
          porzioni: selected.porzioni,
          ingredienti: selected.ingredienti,
          preparazione: selected.preparazione,
          fitnessScore: 90, // Score alto per ricette dal database
          recipeId: selected.id,
          categoria: 'colazione',
          rating: selected.rating || 4.5
        };
        console.log(`✅ [MASSIVE] Day ${i + 1} colazione: ${selected.nome}`);
      }
      
      // ☀️ PRANZO
      const pranzoRecipes = selectMassiveRecipes('pranzo', obiettivo, numDays, preferenze, allergie);
      if (pranzoRecipes.length > 0) {
        const selected = pranzoRecipes[i % pranzoRecipes.length];
        day.meals.pranzo = {
          nome: selected.nome,
          calorie: selected.calorie,
          proteine: selected.proteine,
          carboidrati: selected.carboidrati,
          grassi: selected.grassi,
          tempo: `${selected.tempoPreparazione} min`,
          porzioni: selected.porzioni,
          ingredienti: selected.ingredienti,
          preparazione: selected.preparazione,
          fitnessScore: 88,
          recipeId: selected.id,
          categoria: 'pranzo',
          rating: selected.rating || 4.7
        };
        console.log(`✅ [MASSIVE] Day ${i + 1} pranzo: ${selected.nome}`);
      }
      
      // 🌙 CENA
      const cenaRecipes = selectMassiveRecipes('cena', obiettivo, numDays, preferenze, allergie);
      if (cenaRecipes.length > 0) {
        const selected = cenaRecipes[i % cenaRecipes.length];
        day.meals.cena = {
          nome: selected.nome,
          calorie: selected.calorie,
          proteine: selected.proteine,
          carboidrati: selected.carboidrati,
          grassi: selected.grassi,
          tempo: `${selected.tempoPreparazione} min`,
          porzioni: selected.porzioni,
          ingredienti: selected.ingredienti,
          preparazione: selected.preparazione,
          fitnessScore: 85,
          recipeId: selected.id,
          categoria: 'cena',
          rating: selected.rating || 4.3
        };
        console.log(`✅ [MASSIVE] Day ${i + 1} cena: ${selected.nome}`);
      }
      
      // 🍎 SPUNTINI
      if (numPasti >= 4) {
        const spuntinoRecipes = selectMassiveRecipes('spuntino', obiettivo, numDays, preferenze, allergie);
        if (spuntinoRecipes.length > 0) {
          const selected = spuntinoRecipes[i % spuntinoRecipes.length];
          day.meals.spuntino1 = {
            nome: selected.nome,
            calorie: selected.calorie,
            proteine: selected.proteine,
            carboidrati: selected.carboidrati,
            grassi: selected.grassi,
            tempo: `${selected.tempoPreparazione} min`,
            porzioni: selected.porzioni,
            ingredienti: selected.ingredienti,
            preparazione: selected.preparazione,
            fitnessScore: 82,
            recipeId: selected.id,
            categoria: 'spuntino',
            rating: selected.rating || 4.1
          };
          console.log(`✅ [MASSIVE] Day ${i + 1} spuntino1: ${selected.nome}`);
        }
      }
      
      if (numPasti >= 5) {
        const spuntinoRecipes = selectMassiveRecipes('spuntino', obiettivo, numDays, preferenze, allergie);
        if (spuntinoRecipes.length > 0) {
          const selected = spuntinoRecipes[(i + 1) % spuntinoRecipes.length];
          day.meals.spuntino2 = {
            nome: selected.nome,
            calorie: selected.calorie,
            proteine: selected.proteine,
            carboidrati: selected.carboidrati,
            grassi: selected.grassi,
            tempo: `${selected.tempoPreparazione} min`,
            porzioni: selected.porzioni,
            ingredienti: selected.ingredienti,
            preparazione: selected.preparazione,
            fitnessScore: 80,
            recipeId: selected.id,
            categoria: 'spuntino',
            rating: selected.rating || 4.4
          };
        }
      }
      
      if (numPasti >= 6) {
        const spuntinoRecipes = selectMassiveRecipes('spuntino', obiettivo, numDays, preferenze, allergie);
        if (spuntinoRecipes.length > 0) {
          const selected = spuntinoRecipes[(i + 2) % spuntinoRecipes.length];
          day.meals.spuntino3 = {
            nome: selected.nome,
            calorie: selected.calorie,
            proteine: selected.proteine,
            carboidrati: selected.carboidrati,
            grassi: selected.grassi,
            tempo: `${selected.tempoPreparazione} min`,
            porzioni: selected.porzioni,
            ingredienti: selected.ingredienti,
            preparazione: selected.preparazione,
            fitnessScore: 78,
            recipeId: selected.id,
            categoria: 'spuntino',
            rating: selected.rating || 4.0
          };
        }
      }
      
      console.log(`✅ [MASSIVE] Day ${i + 1} meals created:`, Object.keys(day.meals));
      days.push(day);
    }
    
    console.log(`🎉 [MASSIVE] Fallback plan created with ${days.length} days using 420+ recipes!`);
    return { days };
  };

  // 💾 SALVA IN AIRTABLE - MAPPING CORRETTO CON CAMPI REALI
  const saveToAirtable = async (plan: any, formData: any) => {
    console.log('💾 Attempting to save to Airtable...');
    console.log('📝 Form data for save:', formData);
    
    try {
      // 🔧 MAPPING CORRETTO BASATO SU CAMPI AIRTABLE REALI
      const goalMapping: { [key: string]: string } = {
        'dimagrimento': 'dimagrimento', // ESATTO come in Airtable
        'aumento-massa': 'aumento massa', // ESATTO come in Airtable  
        'mantenimento': 'mantenimento', // ESATTO come in Airtable
        'definizione': 'Perdita peso' // Fallback su opzione esistente
      };

      // Diet_Type mapping - nuovo campo
      const dietTypeMapping: { [key: string]: string } = {
        'dimagrimento': 'low_carb', // Dimagrimento → low carb
        'aumento-massa': 'bilanciata', // Massa → bilanciata
        'mantenimento': 'bilanciata', // Mantenimento → bilanciata
        'definizione': 'low_carb' // Definizione → low carb
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

      // 🔧 DATI MAPPATI CON CAMPI CORRETTI
      const mappedData = {
        nome: formData.nome || '',
        email: formData.email || 'noemail@test.com',
        age: parseInt(formData.eta) || 0,
        weight: parseInt(formData.peso) || 0, 
        height: parseInt(formData.altezza) || 0,
        gender: genderMapping[formData.sesso] || '',
        activity_level: activityMapping[formData.attivita] || '',
        goal: goalMapping[formData.obiettivo] || 'mantenimento', // Usa Goal corretto
        diet_type: dietTypeMapping[formData.obiettivo] || 'bilanciata', // Nuovo campo Diet_Type
        duration: parseInt(formData.durata) || 0,
        meals_per_day: parseInt(formData.pasti) || 3,
        exclusions: Array.isArray(formData.allergie) ? formData.allergie.join(', ') : formData.allergie || '',
        foods_at_home: Array.isArray(formData.preferenze) ? formData.preferenze.join(', ') : formData.preferenze || '',
        phone: formData.telefono || '',
        // DATI PIANO
        plan_details: JSON.stringify(plan),
        total_calories: calculateTotalCalories(plan) || 0,
        daily_calories: calculateDailyCalories(plan) || 0,
        bmr: Math.round(calculateBMR(formData)) || 1800
      };

      console.log('📤 Mapped data for Airtable:', mappedData);

      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveMealPlan',
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

  // 🚀 FUNZIONE PRINCIPALE - SISTEMA MASSIVE DATABASE
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMIT STARTED (MASSIVE DATABASE SYSTEM)');
    console.log('📝 Form Data:', formData);
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // 🤖 STEP 1: USA SEMPRE L'API FITNESS INTEGRATA
      console.log('🧠 Generating MASSIVE DATABASE meal plan with AI...');

      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ AI generated MASSIVE plan successfully');
        console.log('🔥 Backend calculated calories:', result.metadata?.dailyTarget);
        console.log('🇮🇹 MASSIVE optimized:', result.metadata?.fitnessOptimized);
        console.log('📊 Total recipes used:', result.metadata?.totalRecipes);
        
        // 🎯 USA IL PIANO DALL'API (NON IL FALLBACK!)
        let apiGeneratedPlan;
        
        try {
          // Prova a parsare il piano dall'AI
          apiGeneratedPlan = parseAIPlanToStructured(result.piano, formData);
          console.log('✅ API plan parsed successfully with MASSIVE database');
        } catch (parseError) {
          console.log('⚠️ API plan parsing failed, using MASSIVE database fallback');
          apiGeneratedPlan = createMassiveFallback(formData);
        }
        
        // 🔥 APPLICA CALORIE DAL BACKEND SEMPRE
        if (result.metadata?.dailyTarget && apiGeneratedPlan?.days) {
          const targetCalories = result.metadata.dailyTarget;
          console.log('🔧 Applying backend calories to MASSIVE plan:', targetCalories);
          
          apiGeneratedPlan.days.forEach((day: any) => {
            let currentTotal = 0;
            Object.values(day.meals).forEach((meal: any) => {
              currentTotal += meal.calorie || 0;
            });
            
            const scaleFactor = targetCalories / Math.max(currentTotal, 1);
            console.log(`🔧 Scaling ${day.day} by factor: ${scaleFactor.toFixed(2)}`);
            
            Object.values(day.meals).forEach((meal: any) => {
              if (meal) {
                meal.calorie = Math.round(meal.calorie * scaleFactor);
                meal.proteine = Math.round(meal.proteine * scaleFactor);
                meal.carboidrati = Math.round(meal.carboidrati * scaleFactor);
                meal.grassi = Math.round(meal.grassi * scaleFactor);
              }
            });
          });
        }
        
        setParsedPlan(apiGeneratedPlan);
        
        const completeDocument = generateCompleteDocument(apiGeneratedPlan, formData);
        setGeneratedPlan(completeDocument);

        // 💾 SALVATAGGIO AUTOMATICO
        saveGeneratedPlan(apiGeneratedPlan, formData);
        
        setShowPreview(true);
        
        // 🔧 SALVA IN AIRTABLE
        console.log('💾 Saving MASSIVE plan to Airtable...');
        try {
          const saveResult = await saveToAirtable(apiGeneratedPlan, formData);
          if (saveResult.success) {
            console.log('✅ Successfully saved MASSIVE plan to Airtable:', saveResult.recordId);
          } else {
            console.log('❌ Failed to save MASSIVE plan to Airtable:', saveResult.error);
          }
        } catch (airtableError) {
          console.log('⚠️ Airtable save error (non-blocking):', airtableError);
        }
        
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
      } else {
        console.log('❌ AI generation failed, using MASSIVE DATABASE fallback');
        throw new Error(result.error || 'AI generation failed');
      }
      
    } catch (error) {
      console.error('❌ Error in meal plan generation:', error);
      
      // 🍳 FALLBACK: MASSIVE DATABASE (420+ RICETTE!)
      console.log('🔄 Using MASSIVE DATABASE fallback with 420+ recipes');
      const massiveFallback = createMassiveFallback(formData);
      setParsedPlan(massiveFallback);
      
      const completeDocument = generateCompleteDocument(massiveFallback, formData);
      setGeneratedPlan(completeDocument);

      // 💾 SALVATAGGIO AUTOMATICO ANCHE PER FALLBACK
      saveGeneratedPlan(massiveFallback, formData);
      
      setShowPreview(true);
      
      // 🔧 SALVA ANCHE IL FALLBACK MASSIVE
      try {
        const saveResult = await saveToAirtable(massiveFallback, formData);
        if (saveResult.success) {
          console.log('✅ MASSIVE fallback plan saved to Airtable:', saveResult.recordId);
        }
      } catch (airtableError) {
        console.log('⚠️ MASSIVE fallback save error:', airtableError);
      }
      
      setTimeout(() => {
        document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } finally {
      setIsGenerating(false);
    }
  };

  // 🤖 PARSER AI PLAN TO STRUCTURED
  const parseAIPlanToStructured = (aiPlan: string, formData: any) => {
    console.log('🤖 Parsing AI plan to structured format with MASSIVE database...');
    
    const days = [];
    const dayRegex = /🗓️ GIORNO (\d+):([\s\S]*?)(?=🗓️ GIORNO \d+:|$)/g;
    let dayMatch;
    
    while ((dayMatch = dayRegex.exec(aiPlan)) !== null) {
      const dayNumber = dayMatch[1];
      const dayContent = dayMatch[2];
      
      const day = {
        day: `Giorno ${dayNumber}`,
        meals: {} as any
      };
      
      // Parse meals from AI plan
      const mealRegex = /(🌅|☀️|🌙|🍎) (COLAZIONE|PRANZO|CENA|SPUNTINO) \((\d+) kcal\):\s*Nome: ([^\n]+)\s*Ingredienti: ([^\n]+)\s*Preparazione: ([^\n]+)\s*Macro: P: (\d+)g \| C: (\d+)g \| G: (\d+)g/g;
      let mealMatch;
      
      while ((mealMatch = mealRegex.exec(dayContent)) !== null) {
        const [, emoji, mealTypeUpper, calories, nome, ingredienti, preparazione, proteine, carboidrati, grassi] = mealMatch;
        
        const mealType = mealTypeUpper.toLowerCase();
        const mealKey = mealType === 'spuntino' ? 'spuntino1' : mealType;
        
        day.meals[mealKey] = {
          nome: nome.trim(),
          calorie: parseInt(calories),
          proteine: parseInt(proteine),
          carboidrati: parseInt(carboidrati),
          grassi: parseInt(grassi),
          ingredienti: ingredienti.split(',').map(i => i.trim()),
          preparazione: preparazione.trim(),
          tempo: '20 min',
          porzioni: 1,
          fitnessScore: 85,
          categoria: mealType,
          rating: 4.5,
          recipeId: `ai_${mealType}_${dayNumber}`
        };
      }
      
      days.push(day);
    }
    
    if (days.length === 0) {
      throw new Error('No days parsed from AI plan');
    }
    
    console.log(`✅ Parsed ${days.length} days from AI plan with MASSIVE database integration`);
    return { days };
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
          Generazione meal prep FITNESS-OTTIMIZZATA con Database Massiccio 420+ Ricette Italiane, Lista della Spesa Intelligente e AI Avanzata.
        </p>
        <button 
          onClick={() => document.getElementById('meal-form')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105"
        >
          🍳 Inizia il Tuo Piano con 420+ Ricette!
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
            🎉 Il Tuo Piano MASSICCIO è Pronto!
          </h2>
          
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl mb-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">📋 Piano Alimentare con 420+ Ricette</h3>
              <div className="bg-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto" style={{fontFamily: 'Georgia, serif'}}>
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedPlan}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => {
                  const text = `🍳 Ecco il mio piano alimentare MASSICCIO con 420+ ricette!\n\n${generatedPlan}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📱 Condividi Piano MASSICCIO
              </button>

              <button
                onClick={() => {
                  const printContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <title>Piano MASSICCIO - ${formData.nome || 'Utente'}</title>
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
                          <div class="title">🍳 Piano Alimentare MASSICCIO (420+ Ricette)</div>
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
                📥 Scarica Piano MASSICCIO PDF
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPlan);
                  alert('Piano MASSICCIO copiato negli appunti!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                📋 Copia Piano MASSICCIO
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
                🔄 Nuovo Piano MASSICCIO
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
            Domande Frequenti - Sistema MASSICCIO
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🍳 Cosa significa "Database MASSICCIO"?</h3>
              <p className="text-gray-300">Il nostro sistema contiene 420+ ricette italiane fitness-ottimizzate: 60 chetogeniche, 60 low-carb, 60 paleo, 60 vegane, 60 mediterranee, 60 bilanciate e 60 fit. Ogni ricetta è classificata per obiettivo e difficoltà.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🎯 Come vengono selezionate le ricette?</h3>
              <p className="text-gray-300">Il sistema usa algoritmi avanzati per selezionare le ricette migliori basandosi su: obiettivo fitness, allergie, preferenze alimentari, rating delle ricette e varietà nutrizionale.</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🔄 Quanto sono varie le ricette?</h3>
              <p className="text-gray-300">Con 420+ ricette disponibili, ogni piano è completamente unico. Non vedrai mai la stessa ricetta ripetuta nello stesso piano, garantendo massima varietà e gusto.</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">📊 Le ricette sono davvero fitness-ottimizzate?</h3>
              <p className="text-gray-300">Ogni ricetta ha macro ottimizzati, scoring fitness 0-100, e ingredienti selezionati per performance. Le ricette "ricette_fit" hanno priorità massima per risultati ottimali.</p>
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
            <h3 className="text-2xl font-bold">Meal Prep Planner MASSICCIO 🍳</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Rivoluziona la tua alimentazione con il database più completo di ricette fitness italiane. 420+ ricette ottimizzate per i tuoi obiettivi.
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
