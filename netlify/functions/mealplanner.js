// netlify/functions/mealplanner.js
const OpenAI = require('openai');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo non consentito' };
  }

  try {
    const { requestData } = JSON.parse(event.body);

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error("Errore: OPENAI_API_KEY non configurata nelle variabili d'ambiente di Netlify.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Chiave API OpenAI non configurata correttamente." }),
      };
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const safeJoin = (arr, separator = ', ') => {
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.join(separator);
      }
      return 'Nessuna';
    };

    const prompt = `Genera un piano pasti dettagliato per ${requestData.duration} giorni.
Utente: Età ${requestData.age}, Peso ${requestData.weight}kg, Altezza ${requestData.height}cm, Sesso ${requestData.gender}, Livello Attività ${requestData.activity_level}.
Obiettivo: ${requestData.goal}. Calorie giornaliere stimate: ${requestData.calories} kcal.
Dieta: ${requestData.diet}.
Esclusioni alimentari: ${safeJoin(requestData.exclusions)}.
Cibi già a casa: ${safeJoin(requestData.foods_at_home)}.
Pasti al giorno: ${requestData.meals_per_day}.

Per ogni giorno, includi ${requestData.meals_per_day} pasti (Colazione, Pranzo, Cena, Spuntino, etc.).
Per ogni pasto, fornisci:
- Nome del pasto
- Lista ingredienti (con quantità stimate, es. "100g petto di pollo")
- Istruzioni passo-passo per la preparazione.

Alla fine, fornisci una lista della spesa consolidata per tutti i giorni, raggruppando gli ingredienti.
Assicurati che le ricette siano adatte all'obiettivo calorico e alle preferenze/esclusioni.
Il formato di output deve essere SOLO un oggetto JSON valido, senza testo aggiuntivo prima o dopo.
Formato JSON richiesto:
{
  "recipes": [
    {
      "day": "Lunedì",
      "meals": [
        {
          "type": "Colazione",
          "name": "Nome Ricetta",
          "ingredients": ["ingrediente 1", "ingrediente 2"],
          "instructions": "Istruzioni passo-passo"
        }
      ]
    }
  ],
  "shoppingList": ["ingrediente A", "ingrediente B"]
}`;

    console.log(`🚀 Chiamata OpenAI in corso per richiesta ID: ${requestData.id}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Sei un assistente per generare un piano meal prep personalizzato. La tua risposta deve essere solo un oggetto JSON valido, senza testo aggiuntivo prima o dopo."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log(`✅ Risposta OpenAI ricevuta per ID: ${requestData.id}`);
    const mealPlanContent = response.choices[0].message.content;

    let mealPlanParsed;
    try {
      mealPlanParsed = JSON.parse(mealPlanContent);
    } catch (parseError) {
      console.error("Errore nel parsing JSON dalla risposta OpenAI:", parseError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "L'AI non ha restituito un JSON valido.", rawResponse: mealPlanContent }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealPlan: mealPlanParsed }),
    };
  } catch (error) {
    console.error(`❌ Errore nella funzione mealplanner:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Errore interno nella funzione" }),
    };
  }
};

