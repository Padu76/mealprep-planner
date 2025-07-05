// netlify/functions/mealplanner.js

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Gestisci solo richieste POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Inizio elaborazione richiesta...');
    
    const { requestData } = JSON.parse(event.body);
    
    if (!requestData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request data' })
      };
    }

    console.log('Dati ricevuti:', JSON.stringify(requestData, null, 2));

    // Verifica chiave API
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY non trovata');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API Key non configurata' })
      };
    }

    // Costruisci il prompt per Claude
    const prompt = createMealPrepPrompt(requestData);
    console.log('Prompt creato, lunghezza:', prompt.length);

    // Chiama l'API di Claude con fetch nativo
    console.log('Chiamata API Claude...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Errore API Claude:', response.status, errorText);
      
      // Ritorna piano di fallback invece di errore
      const fallbackPlan = createFallbackPlan(requestData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          mealPlan: fallbackPlan,
          success: true,
          note: 'Piano generato con sistema di backup'
        })
      };
    }

    const claudeResponse = await response.json();
    console.log('Claude response ricevuta');
    
    // Estrai il contenuto della risposta
    const mealPlanContent = claudeResponse.content[0].text;
    console.log('Contenuto estratto, lunghezza:', mealPlanContent.length);
    
    // Prova a parsare il JSON dal contenuto
    let mealPlan;
    try {
      // Cerca il JSON nella risposta
      const jsonMatch = mealPlanContent.match(/```json\n([\s\S]*?)\n```/) || 
                       mealPlanContent.match(/```\n([\s\S]*?)\n```/) ||
                       mealPlanContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('JSON parsato con successo');
      } else {
        throw new Error('JSON non trovato nella risposta');
      }
    } catch (parseError) {
      console.error('Errore nel parsing del JSON:', parseError.message);
      console.log('Contenuto ricevuto primi 500 char:', mealPlanContent.substring(0, 500));
      
      // Se il parsing fallisce, crea una struttura di base
      mealPlan = createFallbackPlan(requestData);
    }

    console.log('Piano meal prep generato con successo');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        mealPlan: mealPlan,
        success: true 
      })
    };

  } catch (error) {
    console.error('Errore nella funzione mealplanner:', error);
    
    // In caso di errore, restituisci sempre un piano di fallback
    try {
      const requestData = JSON.parse(event.body).requestData;
      const fallbackPlan = createFallbackPlan(requestData);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          mealPlan: fallbackPlan,
          success: true,
          note: 'Piano generato con sistema di emergenza'
        })
      };
    } catch (fallbackError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Errore interno del server',
          details: error.message
        })
      };
    }
  }
};

function createMealPrepPrompt(data) {
  return `Crea un piano meal prep personalizzato per un utente con queste caratteristiche:

**DATI UTENTE:**
- Età: ${data.age} anni
- Peso: ${data.weight} kg
- Altezza: ${data.height} cm
- Sesso: ${data.gender}
- Livello attività: ${data.activity_level}
- Obiettivo: ${data.goal}
- Durata meal prep: ${data.duration} giorni
- Pasti al giorno: ${data.meals_per_day}
- Tipo di dieta: ${data.diet}
- Calorie giornaliere target: ${data.calories} kcal
- Esclusioni alimentari: ${data.exclusions?.join(', ') || 'Nessuna'}
- Alimenti già disponibili: ${data.foods_at_home?.join(', ') || 'Nessuno'}

**ISTRUZIONI:**
1. Crea un piano meal prep pratico e realistico
2. Considera gli alimenti già disponibili per ridurre gli sprechi
3. Rispetta tutte le esclusioni alimentari
4. Bilancia i macronutrienti secondo l'obiettivo
5. Fornisci ricette semplici e veloci da preparare
6. Calcola le porzioni per il numero di giorni richiesto

**FORMATO RISPOSTA:**
Rispondi SOLO con un JSON valido in questo formato:

\`\`\`json
{
  "shoppingList": [
    "ingrediente 1 - quantità",
    "ingrediente 2 - quantità"
  ],
  "recipes": [
    {
      "day": "Giorno 1",
      "meals": [
        {
          "type": "Colazione",
          "name": "Nome piatto",
          "ingredients": ["ingrediente 1", "ingrediente 2"],
          "instructions": "Istruzioni dettagliate di preparazione",
          "calories": 400,
          "protein": "25g",
          "carbs": "45g",
          "fat": "15g"
        }
      ]
    }
  ],
  "nutritionSummary": {
    "totalCaloriesPerDay": ${data.calories},
    "proteinPerDay": "XXXg",
    "carbsPerDay": "XXXg", 
    "fatPerDay": "XXXg"
  },
  "mealPrepTips": [
    "Consiglio 1",
    "Consiglio 2"
  ]
}
\`\`\`

Assicurati che il JSON sia perfettamente formattato e valido.`;
}

function createFallbackPlan(data) {
  // Piano di fallback dettagliato
  const caloriesPerMeal = Math.round(data.calories / data.meals_per_day);
  
  const mealTypes = [];
  if (data.meals_per_day >= 1) mealTypes.push("Colazione");
  if (data.meals_per_day >= 2) mealTypes.push("Pranzo");
  if (data.meals_per_day >= 3) mealTypes.push("Cena");
  if (data.meals_per_day >= 4) mealTypes.push("Spuntino");

  const recipes = [];
  
  for (let day = 1; day <= data.duration; day++) {
    const dayMeals = [];
    
    mealTypes.forEach((mealType, index) => {
      let meal;
      
      if (mealType === "Colazione") {
        meal = {
          type: "Colazione",
          name: "Avena con frutta e noci",
          ingredients: ["50g avena", "200ml latte", "1 banana", "10g noci"],
          instructions: "Cuoci l'avena nel latte, aggiungi banana a fette e noci tritate.",
          calories: caloriesPerMeal,
          protein: "15g",
          carbs: "45g",
          fat: "12g"
        };
      } else if (mealType === "Pranzo") {
        meal = {
          type: "Pranzo", 
          name: "Pollo con riso e verdure",
          ingredients: ["120g petto di pollo", "80g riso integrale", "150g verdure miste"],
          instructions: "Griglia il pollo, cuoci il riso e salte le verdure con poco olio.",
          calories: caloriesPerMeal,
          protein: "35g",
          carbs: "50g",
          fat: "8g"
        };
      } else if (mealType === "Cena") {
        meal = {
          type: "Cena",
          name: "Salmone con patate dolci",
          ingredients: ["100g salmone", "150g patate dolci", "100g broccoli"],
          instructions: "Cuoci il salmone al forno, arrostisci le patate dolci e cuoci i broccoli al vapore.",
          calories: caloriesPerMeal,
          protein: "30g",
          carbs: "35g",
          fat: "15g"
        };
      } else {
        meal = {
          type: "Spuntino",
          name: "Yogurt greco con miele",
          ingredients: ["150g yogurt greco", "1 cucchiaio miele", "10g mandorle"],
          instructions: "Mescola yogurt e miele, aggiungi mandorle tritate.",
          calories: caloriesPerMeal,
          protein: "15g",
          carbs: "20g",
          fat: "8g"
        };
      }
      
      dayMeals.push(meal);
    });
    
    recipes.push({
      day: `Giorno ${day}`,
      meals: dayMeals
    });
  }

  return {
    shoppingList: [
      "Avena - 350g",
      "Latte - 1.5L", 
      "Banane - 6 pezzi",
      "Noci - 100g",
      "Petto di pollo - 800g",
      "Riso integrale - 500g",
      "Verdure miste surgelate - 1kg",
      "Salmone - 600g",
      "Patate dolci - 1kg",
      "Broccoli - 800g",
      "Yogurt greco - 1kg",
      "Miele - 1 barattolo",
      "Mandorle - 100g",
      "Olio extravergine - 250ml"
    ],
    recipes: recipes,
    nutritionSummary: {
      totalCaloriesPerDay: data.calories,
      proteinPerDay: "120g",
      carbsPerDay: Math.round(data.calories * 0.45 / 4) + "g",
      fatPerDay: Math.round(data.calories * 0.25 / 9) + "g"
    },
    mealPrepTips: [
      "Prepara tutto la domenica per risparmiare tempo durante la settimana",
      "Usa contenitori di vetro per conservare meglio i pasti",
      "Congela le porzioni in eccesso per la settimana successiva",
      "Varia le spezie per non annoiarti con i sapori",
      "Prepara le verdure la sera prima per velocizzare la cottura"
    ]
  };
}