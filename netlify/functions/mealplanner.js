// netlify/functions/mealplanner.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Gestisci solo richieste POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { requestData } = JSON.parse(event.body);
    
    if (!requestData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing request data' })
      };
    }

    // Costruisci il prompt per Claude
    const prompt = createMealPrepPrompt(requestData);

    // Chiama l'API di Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY, // Cambiato da ANTHROPIC_API_KEY
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022', // Modello aggiornato
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Errore API Claude:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Errore API Claude: ${response.status}`,
          details: errorData
        })
      };
    }

    const claudeResponse = await response.json();
    
    // Estrai il contenuto della risposta
    const mealPlanContent = claudeResponse.content[0].text;
    
    // Prova a parsare il JSON dal contenuto
    let mealPlan;
    try {
      // Cerca il JSON nella risposta (potrebbe essere dentro blocchi di codice)
      const jsonMatch = mealPlanContent.match(/```json\n([\s\S]*?)\n```/) || 
                       mealPlanContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, mealPlanContent];
      
      mealPlan = JSON.parse(jsonMatch[1] || mealPlanContent);
    } catch (parseError) {
      console.error('Errore nel parsing del JSON:', parseError);
      console.log('Contenuto ricevuto:', mealPlanContent);
      
      // Se il parsing fallisce, crea una struttura di base
      mealPlan = createFallbackPlan(requestData, mealPlanContent);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        mealPlan: mealPlan,
        success: true 
      })
    };

  } catch (error) {
    console.error('Errore nella funzione mealplanner:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Errore interno del server',
        details: error.message
      })
    };
  }
};

function createMealPrepPrompt(data) {
  return `
Crea un piano meal prep personalizzato per un utente con queste caratteristiche:

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
    "ingrediente 2 - quantità",
    "ingrediente 3 - quantità"
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
    "Consiglio 2",
    "Consiglio 3"
  ]
}
\`\`\`

Assicurati che il JSON sia perfettamente formattato e valido.
`;
}

function createFallbackPlan(data, rawContent) {
  // Piano di fallback se il parsing JSON fallisce
  return {
    shoppingList: [
      "Pollo - 1kg",
      "Riso integrale - 500g",
      "Broccoli - 500g",
      "Olio d'oliva - 250ml",
      "Uova - 12 pezzi"
    ],
    recipes: [
      {
        day: "Giorno 1",
        meals: [
          {
            type: "Pranzo",
            name: "Pollo con riso e verdure",
            ingredients: ["150g pollo", "80g riso", "100g broccoli"],
            instructions: "Cuoci il pollo in padella, prepara il riso e cuoci i broccoli al vapore.",
            calories: Math.round(data.calories / data.meals_per_day),
            protein: "30g",
            carbs: "40g", 
            fat: "15g"
          }
        ]
      }
    ],
    nutritionSummary: {
      totalCaloriesPerDay: data.calories,
      proteinPerDay: "120g",
      carbsPerDay: "200g",
      fatPerDay: "80g"
    },
    mealPrepTips: [
      "Prepara tutto la domenica per la settimana",
      "Usa contenitori di vetro per conservare i pasti",
      "Varia le spezie per non annoiarti"
    ],
    note: "Piano generato automaticamente - contenuto originale: " + rawContent.substring(0, 200)
  };
}