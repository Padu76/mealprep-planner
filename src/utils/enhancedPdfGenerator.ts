// Enhanced PDF Generator for Meal Prep Plans
// Sostituisce la funzione generateCompleteDocument esistente

export function generateEnhancedPDF(parsedPlan: any, formData: any): string {
  const today = new Date().toLocaleDateString('it-IT');
  const totalDays = parsedPlan.days.length;
  
  // Calcola statistiche
  const firstDay = parsedPlan.days[0].meals;
  const orderedMeals = getAllMealsInOrder(firstDay);
  const dailyCalories = orderedMeals.reduce((sum: number, { meal }: any) => sum + meal.calorie, 0);
  const totalCalories = dailyCalories * totalDays;
  
  // Genera lista spesa con totali
  const shoppingList = generateShoppingListWithTotals(parsedPlan);
  
  // Genera cronologia preparazione
  const prepTimeline = generatePrepTimeline(parsedPlan, formData);
  
  return `
📋 PIANIFICAZIONE MEAL PREP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 DATI PERSONALI
• Nome: ${formData.nome}
• Età: ${formData.eta} anni | Sesso: ${formData.sesso}
• Peso: ${formData.peso} kg | Altezza: ${formData.altezza} cm
• Attività: ${formData.attivita} | Obiettivo: ${formData.obiettivo}

🎯 RIEPILOGO PIANIFICAZIONE
• Durata: ${totalDays} giorni | Pasti: ${formData.pasti} al giorno
• Calorie totali: ${totalCalories.toLocaleString('it-IT')} kcal
• Media giornaliera: ${dailyCalories.toLocaleString('it-IT')} kcal/giorno
• Tipo: ${formData.varieta === 'ripetuti' ? 'Stessi pasti tutti i giorni' : 'Pasti diversi per giorno'}
• Allergie: ${formData.allergie || 'Nessuna'}
• Preferenze: ${formData.preferenze || 'Nessuna'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 LISTA SPESA CONSOLIDATA (CON TOTALI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${shoppingList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ CRONOLOGIA PREPARAZIONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${prepTimeline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 PROGRAMMA SETTIMANALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${generateDailySchedule(parsedPlan)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍳 RICETTE DETTAGLIATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${generateDetailedRecipes(parsedPlan)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 CONSIGLI MEAL PREP PRO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 PREPARAZIONE OTTIMALE:
• Domenica: Lavaggio e taglio verdure, marinatura carni
• Lunedì: Cottura cereali e legumi, preparazione salse
• Martedì: Assemblaggio contenitori, etichettatura
• Ogni giorno: Controllo freschezza, rotazione contenitori

🥗 CONSERVAZIONE AVANZATA:
• Contenitori ermetici in vetro: 4-5 giorni in frigo
• Separare condimenti umidi: aggiungere al momento
• Congelare porzioni extra: fino a 3 mesi
• Etichette con data e contenuto: sempre!

🔄 VARIAZIONI CONSIGLIATE:
• Sostituzioni verdure: broccoli ↔ cavolfiori, spinaci ↔ rucola
• Proteine alternative: pollo ↔ tacchino, manzo ↔ vitello
• Cereali intercambiabili: quinoa ↔ riso integrale, pasta ↔ farro

📊 TRACCIAMENTO PROGRESSI:
• Pesa ingredienti per precisione nutrizionale
• Monitora energia e sazietà post-pasto
• Adatta porzioni in base ai risultati
• Registra ricette preferite per ripetere

🏷️ ETICHETTE CONTENITORI:
┌─────────────────────────────────────┐
│ RICETTA: _______________________    │
│ DATA PREP: ____________________     │
│ SCADENZA: _____________________     │
│ CALORIE: ______________________     │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🍽 Buona Pianificazione Meal Prep!

Generato da Meal Prep Planner Pro - ${today}
Il tuo assistente intelligente per una alimentazione sana e organizzata

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// Funzione per ottenere pasti in ordine
function getAllMealsInOrder(dayMeals: any) {
  const meals = [];
  meals.push({ key: 'colazione', meal: dayMeals.colazione, emoji: '🌅', nome: 'COLAZIONE' });
  if (dayMeals.spuntino1) meals.push({ key: 'spuntino1', meal: dayMeals.spuntino1, emoji: '🍎', nome: 'SPUNTINO MATTINA' });
  meals.push({ key: 'pranzo', meal: dayMeals.pranzo, emoji: '☀️', nome: 'PRANZO' });
  if (dayMeals.spuntino2) meals.push({ key: 'spuntino2', meal: dayMeals.spuntino2, emoji: '🥤', nome: 'SPUNTINO POMERIGGIO' });
  meals.push({ key: 'cena', meal: dayMeals.cena, emoji: '🌙', nome: 'CENA' });
  if (dayMeals.spuntino3) meals.push({ key: 'spuntino3', meal: dayMeals.spuntino3, emoji: '🌆', nome: 'SPUNTINO SERA' });
  return meals;
}

// Genera lista spesa con totali
function generateShoppingListWithTotals(parsedPlan: any): string {
  const ingredients: { [key: string]: { count: number; category: string; baseQuantity: string } } = {};
  
  parsedPlan.days.forEach((dayData: any) => {
    const dayMeals = getAllMealsInOrder(dayData.meals);
    dayMeals.forEach(({ meal }: any) => {
      meal.ingredienti.forEach((ingrediente: string) => {
        const cleanIngredient = ingrediente.trim();
        if (ingredients[cleanIngredient]) {
          ingredients[cleanIngredient].count += 1;
        } else {
          ingredients[cleanIngredient] = {
            count: 1,
            category: categorizeIngredient(cleanIngredient),
            baseQuantity: extractQuantity(cleanIngredient)
          };
        }
      });
    });
  });

  const categorized = Object.entries(ingredients).reduce((acc: any, [ingredient, { count, category, baseQuantity }]) => {
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ingredient, count, baseQuantity });
    return acc;
  }, {});

  let shoppingText = '';
  Object.entries(categorized).forEach(([category, items]: [string, any[]]) => {
    shoppingText += `${category}\n`;
    items.forEach(({ ingredient, count, baseQuantity }) => {
      const totalQuantity = calculateTotalQuantity(baseQuantity, count);
      const multiplier = count > 1 ? ` (${count}x)` : '';
      const total = totalQuantity ? ` → TOTALE: ${totalQuantity}` : '';
      shoppingText += `☐ ${ingredient}${multiplier}${total}\n`;
    });
    shoppingText += '\n';
  });

  return shoppingText;
}

// Estrae quantità da ingrediente
function extractQuantity(ingredient: string): string {
  const match = ingredient.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cucchiai|cucchiaini|fette|pz|pezzi)/i);
  return match ? `${match[1]}${match[2]}` : '';
}

// Calcola quantità totale
function calculateTotalQuantity(baseQuantity: string, multiplier: number): string {
  if (!baseQuantity) return '';
  
  const match = baseQuantity.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|cucchiai|cucchiaini|fette|pz|pezzi)/i);
  if (!match) return '';
  
  const quantity = parseFloat(match[1]);
  const unit = match[2];
  const total = quantity * multiplier;
  
  if (unit.toLowerCase() === 'g' && total >= 1000) {
    return `${(total / 1000).toFixed(1)}kg`;
  }
  if (unit.toLowerCase() === 'ml' && total >= 1000) {
    return `${(total / 1000).toFixed(1)}l`;
  }
  
  return `${total}${unit}`;
}

// Categorizza ingrediente
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase();
  if (lower.includes('pomodoro') || lower.includes('sedano') || lower.includes('carota') || 
      lower.includes('cipolla') || lower.includes('aglio') || lower.includes('funghi') || 
      lower.includes('rucola') || lower.includes('spinaci') || lower.includes('broccoli')) {
    return '🥬 VERDURE E ORTAGGI';
  }
  if (lower.includes('manzo') || lower.includes('pollo') || lower.includes('pesce') || 
      lower.includes('salmone') || lower.includes('tonno')) {
    return '🍖 CARNE E PESCE';
  }
  if (lower.includes('uovo') || lower.includes('parmigiano') || lower.includes('yogurt') || 
      lower.includes('latte') || lower.includes('formaggio')) {
    return '🥛 LATTICINI E UOVA';
  }
  if (lower.includes('pane') || lower.includes('pasta') || lower.includes('fagioli') || 
      lower.includes('quinoa') || lower.includes('riso') || lower.includes('avena')) {
    return '🌾 CEREALI E LEGUMI';
  }
  return '🥑 FRUTTA E ALTRO';
}

// Genera cronologia preparazione
function generatePrepTimeline(parsedPlan: any, formData: any): string {
  const duration = parseInt(formData.durata);
  let timeline = '';
  
  timeline += `📅 GIORNO -1 (DOMENICA - PREP DAY)
• 🛒 Spesa: Acquista tutti gli ingredienti della lista
• 🔪 Prep verdure: Lava, taglia e conserva in contenitori
• 🥩 Marinatura: Prepara marinature per carni (se presenti)
• 📦 Organizza: Prepara contenitori e etichette

📅 GIORNO 0 (LUNEDÌ - COOKING DAY)
• 🍳 Cottura base: Cereali, legumi, proteine principali
• 🥗 Assemblaggio: Monta i pasti nei contenitori
• 🏷️ Etichettatura: Data, contenuto, scadenza
• ❄️ Conservazione: Frigo per 3-4 giorni, freezer per il resto

`;

  for (let i = 1; i <= duration; i++) {
    timeline += `📅 GIORNO ${i} (CONSUMO)
• 🔥 Riscaldamento: 60-90 secondi microonde o padella
• 🍽️ Consumo: Segui programma pasti
• ✅ Check: Verifica qualità e freschezza

`;
  }

  return timeline;
}

// Genera programma giornaliero
function generateDailySchedule(parsedPlan: any): string {
  let schedule = '';
  
  parsedPlan.days.forEach((dayData: any, index: number) => {
    const dayMeals = getAllMealsInOrder(dayData.meals);
    const dayTotal = dayMeals.reduce((sum: number, { meal }: any) => sum + meal.calorie, 0);
    
    schedule += `${dayData.day} ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`;
    
    dayMeals.forEach(({ meal, emoji, nome }: any) => {
      schedule += `${emoji} ${nome}: ${meal.nome}\n`;
      schedule += `🔥 ${meal.calorie} kcal | 🥩 ${meal.proteine}g | 🍞 ${meal.carboidrati}g | 🥑 ${meal.grassi}g\n\n`;
    });
    
    schedule += `📊 TOTALE GIORNO: ${dayTotal} kcal\n\n`;
  });
  
  return schedule;
}

// Genera ricette dettagliate
function generateDetailedRecipes(parsedPlan: any): string {
  const allRecipes = new Set<string>();
  let recipes = '';
  
  // Raccogli ricette uniche
  parsedPlan.days.forEach((dayData: any) => {
    const dayMeals = getAllMealsInOrder(dayData.meals);
    dayMeals.forEach(({ meal }: any) => {
      allRecipes.add(meal.nome);
    });
  });
  
  // Trova la ricetta completa per ogni nome unico
  allRecipes.forEach(recipeName => {
    const recipe = parsedPlan.days.flatMap((dayData: any) => 
      getAllMealsInOrder(dayData.meals)
    ).find(({ meal }: any) => meal.nome === recipeName)?.meal;
    
    if (recipe) {
      recipes += `🍽 ${recipe.nome.toUpperCase()}\n`;
      recipes += `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`;
      
      recipes += `📊 VALORI NUTRIZIONALI:\n`;
      recipes += `• Calorie: ${recipe.calorie} kcal\n`;
      recipes += `• Proteine: ${recipe.proteine}g\n`;
      recipes += `• Carboidrati: ${recipe.carboidrati}g\n`;
      recipes += `• Grassi: ${recipe.grassi}g\n\n`;
      
      recipes += `🛒 INGREDIENTI:\n`;
      recipe.ingredienti.forEach((ing: string, idx: number) => {
        recipes += `${idx + 1}. ${ing}\n`;
      });
      recipes += '\n';
      
      recipes += `🔧 PREPARAZIONE:\n`;
      recipes += `${recipe.preparazione}\n\n`;
      
      recipes += `⏱️ TEMPO PREPARAZIONE: ${recipe.tempo}\n`;
      recipes += `🍽 PORZIONI: ${recipe.porzioni} persona\n\n`;
      
      recipes += `📦 MEAL PREP TIPS:\n`;
      recipes += `• Conservazione: 3-4 giorni in frigo, 3 mesi in freezer\n`;
      recipes += `• Riscaldamento: 60-90 secondi microonde a media potenza\n`;
      recipes += `• Batch cooking: Moltiplica ingredienti per preparare più porzioni\n\n`;
    }
  });
  
  return recipes;
}