import { FormData } from '../types';

interface Meal {
  nome: string;
  calorie: number;
  proteine: number;
  carboidrati: number;
  grassi: number;
  tempo: string;
  porzioni: number;
  ingredienti: string[];
  preparazione: string;
}

interface DayMeals {
  colazione: Meal;
  spuntino1?: Meal;
  pranzo: Meal;
  spuntino2?: Meal;
  cena: Meal;
  spuntino3?: Meal;
}

interface MealPlan {
  [key: string]: DayMeals;
}

export const generateMealPlanDocument = (
  formData: FormData,
  mealPlan: MealPlan
): string => {
  const currentDate = new Date().toLocaleDateString('it-IT');
  const days = Object.keys(mealPlan);
  const firstDay = mealPlan[days[0]];

  // Funzione per ottenere tutti i pasti in ordine
  const getAllMealsInOrder = (dayMeals: DayMeals) => {
    const meals = [];
    
    meals.push({ key: 'colazione', meal: dayMeals.colazione, emoji: '🌅', nome: 'COLAZIONE' });
    
    if (dayMeals.spuntino1) {
      meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, emoji: '🍎', nome: 'SPUNTINO MATTINA' });
    }
    
    meals.push({ key: 'pranzo', meal: dayMeals.pranzo, emoji: '☀️', nome: 'PRANZO' });
    
    if (dayMeals.spuntino2) {
      meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, emoji: '🥤', nome: 'SPUNTINO POMERIGGIO' });
    }
    
    meals.push({ key: 'cena', meal: dayMeals.cena, emoji: '🌙', nome: 'CENA' });
    
    if (dayMeals.spuntino3) {
      meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, emoji: '🌆', nome: 'SPUNTINO SERA' });
    }
    
    return meals;
  };

  const orderedMeals = getAllMealsInOrder(firstDay);
  const totalCaloriesPerDay = orderedMeals.reduce((sum, { meal }) => sum + meal.calorie, 0);
  const totalCaloriesPlan = totalCaloriesPerDay * days.length;

  // Calcola tutte le ricette uniche per la lista spesa
  const allMeals: Meal[] = [];
  days.forEach(day => {
    const dayMeals = mealPlan[day];
    const dayOrderedMeals = getAllMealsInOrder(dayMeals);
    dayOrderedMeals.forEach(({ meal }) => allMeals.push(meal));
  });

  // Funzione per consolidare gli ingredienti
  const consolidateIngredients = (meals: Meal[]) => {
    const ingredientMap: { [key: string]: { count: number; category: string } } = {};
    
    meals.forEach(meal => {
      meal.ingredienti.forEach(ingrediente => {
        const cleanIngredient = ingrediente.trim();
        if (ingredientMap[cleanIngredient]) {
          ingredientMap[cleanIngredient].count += 1;
        } else {
          ingredientMap[cleanIngredient] = { 
            count: 1, 
            category: categorizeIngredient(cleanIngredient) 
          };
        }
      });
    });

    // Raggruppa per categoria
    const categories: { [key: string]: string[] } = {
      '🥬 VERDURE E ORTAGGI': [],
      '🍖 CARNE E PESCE': [],
      '🥛 LATTICINI E UOVA': [],
      '🌾 CEREALI E LEGUMI': [],
      '🥑 FRUTTA E ALTRO': []
    };

    Object.entries(ingredientMap).forEach(([ingredient, { count, category }]) => {
      const displayText = count > 1 ? `${ingredient}: ${count} pz` : ingredient;
      categories[category].push(`□ ${displayText}`);
    });

    return categories;
  };

  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    if (lower.includes('pomodoro') || lower.includes('sedano') || lower.includes('carota') || 
        lower.includes('cipolla') || lower.includes('aglio') || lower.includes('funghi') || 
        lower.includes('rucola') || lower.includes('verdure') || lower.includes('insalata')) {
      return '🥬 VERDURE E ORTAGGI';
    }
    if (lower.includes('manzo') || lower.includes('pollo') || lower.includes('pesce') || 
        lower.includes('salmone') || lower.includes('tonno') || lower.includes('carne')) {
      return '🍖 CARNE E PESCE';
    }
    if (lower.includes('uovo') || lower.includes('parmigiano') || lower.includes('mozzarella') || 
        lower.includes('yogurt') || lower.includes('latte') || lower.includes('formaggio')) {
      return '🥛 LATTICINI E UOVA';
    }
    if (lower.includes('pane') || lower.includes('pasta') || lower.includes('riso') || 
        lower.includes('fagioli') || lower.includes('lenticchie') || lower.includes('cereali')) {
      return '🌾 CEREALI E LEGUMI';
    }
    return '🥑 FRUTTA E ALTRO';
  };

  const consolidatedIngredients = consolidateIngredients(allMeals);

  return `Piano Meal Prep Personalizzato
Generato il ${currentDate} per ${formData.nome}

📋 Piano meal prep personalizzato
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 DATI UTENTE
• Nome: ${formData.nome}
• Età: ${formData.eta} anni
• Sesso: ${formData.sesso}
• Peso: ${formData.peso} kg
• Altezza: ${formData.altezza} cm
• Livello attività: ${formData.attivita}
• Obiettivo: ${formData.obiettivo}
• Durata piano: ${days.length} ${days.length === 1 ? 'giorno' : 'giorni'}
• Pasti al giorno: ${orderedMeals.length}
• Varietà: Stessi pasti tutti i giorni

🎯 RIEPILOGO PIANO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Totale calorie piano: ${totalCaloriesPlan.toLocaleString('it-IT')} kcal
• Media giornaliera: ${totalCaloriesPerDay.toLocaleString('it-IT')} kcal/giorno
• Numero ricette: ${orderedMeals.length} per giorno
• Allergie/Intolleranze: ${formData.allergie || 'Nessuna'}
• Preferenze: ${formData.preferenze || 'Nessuna'}

🛒 LISTA DELLA SPESA CONSOLIDATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(consolidatedIngredients)
  .filter(([_, items]) => items.length > 0)
  .map(([category, items]) => `${category}\n${items.join('\n')}`)
  .join('\n\n')}

📅 PROGRAMMA GIORNALIERO DETTAGLIATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${days.map((day, index) => {
  const dayMeals = mealPlan[day];
  const dayOrderedMeals = getAllMealsInOrder(dayMeals);
  const dayTotalCalories = dayOrderedMeals.reduce((sum, { meal }) => sum + meal.calorie, 0);
  
  return `GIORNO ${index + 1}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
${dayOrderedMeals.map(({ emoji, nome, meal }) => 
`${emoji} ${nome}: ${meal.nome}
🔥 ${meal.calorie} kcal | 🥩 ${meal.proteine}g | 🍞 ${meal.carboidrati}g | 🥑 ${meal.grassi}g`
).join('\n\n')}

📊 TOTALE GIORNO: ${dayTotalCalories} kcal`;
}).join('\n\n')}

📖 RICETTE PASSO-PASSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Array.from(new Set(allMeals.map(meal => meal.nome)))
  .map(nomeRicetta => {
    const ricetta = allMeals.find(meal => meal.nome === nomeRicetta)!;
    return `🍽 ${nomeRicetta.toUpperCase()}
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

📊 VALORI NUTRIZIONALI:
• Calorie: ${ricetta.calorie} kcal
• Proteine: ${ricetta.proteine}g
• Carboidrati: ${ricetta.carboidrati}g 
• Grassi: ${ricetta.grassi}g

🛒 INGREDIENTI:
${ricetta.ingredienti.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

🔧 PREPARAZIONE:
${ricetta.preparazione}

⏱️ TEMPO PREPARAZIONE: ${ricetta.tempo} 🍽 PORZIONI: ${ricetta.porzioni} ${ricetta.porzioni === 1 ? 'persona' : 'persone'}`;
  })
  .join('\n\n')}

💡 CONSIGLI UTILI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 MEAL PREP:
• Prepara gli ingredienti la domenica per tutta la settimana
• Conserva i pasti in contenitori ermetici in frigorifero
• Alcuni piatti si possono congelare per un uso futuro

🥗 CONSERVAZIONE:
• Massimo 3-4 giorni in frigorifero
• Congela le porzioni che non consumi subito
• Riscalda sempre bene prima del consumo

🍴 VARIAZIONI:
• Puoi sostituire verdure simili (broccoli/cavolfiori)
• Adatta le spezie ai tuoi gusti
• Aggiungi erbe fresche per più sapore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽 Buon appetito e buon meal prep! 
Generated by Meal Prep Planner Pro - ${currentDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};