// netlify/functions/mealplanner.js
// netlify/functions/mealplanner.js
const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo non consentito' };
  }

  try {
    const { requestData } = JSON.parse(event.body);

    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      console.error("Errore: CLAUDE_API_KEY non configurata nelle variabili d'ambiente di Netlify.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Chiave API Claude non configurata correttamente." }),
      };
    }

    const anthropic = new Anthropic({
      apiKey: claudeApiKey,
    });

    const safeJoin = (arr, separator = ', ') => {
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.join(separator);
      }
      return 'Nessuna';
    };

    // Calcolo calorie stimate con formula di Harris-Benedict
    const calculateCalories = (age, weight, height, gender, activityLevel, goal) => {
      let bmr;
      if (gender === 'maschio') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }

      const activityMultipliers = {
        'sedentario': 1.2,
        'leggero': 1.375,
        'moderato': 1.55,
        'attivo': 1.725,
        'molto attivo': 1.9
      };

      let calories = bmr * (activityMultipliers[activityLevel] || 1.2);

      // Aggiusta per l'obiettivo
      if (goal === 'dimagrimento') calories *= 0.8;
      else if (goal === 'aumento massa') calories *= 1.2;

      return Math.round(calories);
    };

    const estimatedCalories = calculateCalories(
      requestData.age, 
      requestData.weight, 
      requestData.height, 
      requestData.gender, 
      requestData.activity_level, 
      requestData.goal
    );

    const prompt = `Genera un piano meal prep dettagliato per ${requestData.duration} giorni.

PROFILO UTENTE:
- EtÖ: ${requestData.age} anni
- Peso: ${requestData.weight}kg
- Altezza: ${requestData.height}cm
- Genere: ${requestData.gender}
- Livello attivitÖ: ${requestData.activity_level}
- Obiettivo: ${requestData.goal}
- Calorie giornaliere stimate: ${estimatedCalories} kcal
- Pasti al giorno: ${requestData.meals_per_day}
- Tipo dieta: ${requestData.diet || 'Nessuna preferenza'}
- Esclusioni: ${safeJoin(requestData.exclusions)}
- Cibi giÖ disponibili: ${safeJoin(requestData.foods_at_home)}

REQUISITI:
1. Crea ${requestData.meals_per_day} pasti per ogni giorno
2. Ottimizza per ridurre sprechi usando ingredienti comuni
3. Ricette facili e veloci da preparare
4. Adatte all'obiettivo calorico
5. Considera le esclusioni alimentari

FORMATO OUTPUT (solo JSON valido):
{
  "dailyCalories": ${estimatedCalories},
  "totalDays": ${requestData.duration},
  "recipes": [
    {
      "day": 1,
      "dayName": "Lunedç",
      "meals": [
        {
          "type": "Colazione",
          "name": "Nome ricetta",
          "ingredients": [
            "200g ingrediente 1",
            "100g ingrediente 2"
          ],
          "instructions": "Istruzioni step-by-step",
          "calories": 400,
          "prepTime": "10 min"
        }
      ]
    }
  ],
  "shoppingList": {
    "proteine": ["pollo 1kg", "uova 12 pz"],
    "carboidrati": ["riso 500g", "pasta 500g"],
    "verdure": ["broccoli 500g", "spinaci 300g"],
    "condimenti": ["olio evo 250ml", "sale q.b."],
    "altro": ["latte 1L"]
  },
  "prepInstructions": [
    "Domenica: Cuoci tutto il riso per la settimana",
    "Domenica: Prepara le proteine in batch"
  ],
  "nutritionSummary": {
    "avgCaloriesPerDay": ${estimatedCalories},
    "avgProteinPerDay": "120g",
    "avgCarbsPerDay": "180g",
    "avgFatPerDay": "60g"
  }
}

Genera solo il JSON, senza testo aggiuntivo.`;

    console.log(`?? Chiamata Claude API in corso...`);

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log(`? Risposta Claude ricevuta`);
    
    const mealPlanContent = response.content[0].text;

    // Prova a estrarre il JSON se Claude ha aggiunto del testo
    let cleanedContent = mealPlanContent.trim();
    
    // Rimuovi eventuali backticks o prefissi
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n/, '').replace(/\n```$/, '');
    }

    let mealPlanParsed;
    try {
      mealPlanParsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Errore nel parsing JSON dalla risposta Claude:", parseError);
      console.error("Contenuto grezzo:", mealPlanContent);
      
      // Fallback: cerca il JSON nell'output
      const jsonMatch = mealPlanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          mealPlanParsed = JSON.parse(jsonMatch[0]);
        } catch (secondParseError) {
          return {
            statusCode: 500,
            body: JSON.stringify({ 
              error: "L'AI non ha restituito un JSON valido.", 
              rawResponse: mealPlanContent.substring(0, 1000) 
            }),
          };
        }
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            error: "Impossibile estrarre JSON dalla risposta", 
            rawResponse: mealPlanContent.substring(0, 1000) 
          }),
        };
      }
    }

    // Aggiungi metadati della richiesta
    mealPlanParsed.requestInfo = {
      email: requestData.email,
      goal: requestData.goal,
      duration: requestData.duration,
      generatedAt: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ 
        success: true,
        mealPlan: mealPlanParsed 
      }),
    };
  } catch (error) {
    console.error(`? Errore nella funzione mealplanner:`, error);
    return {
      statusCode: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        success: false,
        error: error.message || "Errore interno nella funzione",
        details: error.stack ? error.stack.substring(0, 500) : null
      }),
    };
  }
};