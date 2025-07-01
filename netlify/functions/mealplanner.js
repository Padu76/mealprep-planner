// netlify/functions/mealplanner.js
const OpenAI = require('openai');

exports.handler = async (event) => {
  // Assicurati che la funzione sia chiamata con un metodo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metodo non consentito' };
  }

  try {
    // Parsa il corpo della richiesta per ottenere i dati
    const { requestData } = JSON.parse(event.body);

    // Recupera la chiave API di OpenAI dalle variabili d'ambiente di Netlify
    // NON INSERIRE MAI LA CHIAVE QUI DIRETTAMENTE!
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.error("Errore: OPENAI_API_KEY non configurata nelle variabili d'ambiente di Netlify.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Chiave API OpenAI non configurata correttamente." }),
      };
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Costruisci il prompt dettagliato per l'AI
    const prompt = `Genera un piano pasti dettagliato per ${requestData.duration} giorni.
    Utente: Età ${requestData.age}, Peso ${requestData.weight}kg, Altezza ${requestData.height}cm, Sesso ${requestData.gender}, Livello Attività ${requestData.activity_level}.
    Obiettivo: ${requestData.goal}. Calorie giornaliere stimate: ${requestData.calories} kcal.
    Dieta: ${requestData.diet}.
    Allergie alimentari: ${requestData.allergies.join(', ') || 'Nessuna'}.
    Preferenze alimentari: ${requestData.preferences.join(', ') || 'Nessuna'}.
    Livello di abilità in cucina: ${requestData.cooking_skill_level || 'Non specificato'}.
    Attrezzatura da cucina disponibile: ${requestData.equipment_available.join(', ') || 'Non specificata'}.
    Numero di persone per il piano: ${requestData.family_members || '1'}.
    Obiettivi specifici aggiuntivi: ${requestData.specific_goals || 'Nessuno'}.
    Tipi di pasti da includere: ${requestData.meal_types_to_include.join(', ') || 'Colazione, Pranzo, Cena'}.
    Note dietetiche aggiuntive: ${requestData.dietary_notes || 'Nessuna'}.
    Cibi già a casa: ${requestData.foods_at_home.join(', ') || 'Nessuno'}.
    Pasti al giorno: ${requestData.meals_per_day}.

    Per ogni giorno, includi ${requestData.meals_per_day} pasti (Colazione, Pranzo, Cena, Spuntino, etc. a seconda del numero di pasti).
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
                    },
                    // ... altri pasti per Lunedì
                ]
            },
            // ... altri giorni
        ],
        "shoppingList": ["ingrediente A", "ingrediente B", "ingrediente C"]
    }`;

    console.log(`🚀 Chiamata OpenAI in corso per richiesta ID: ${requestData.id}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Puoi scegliere altri modelli come "gpt-3.5-turbo"
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
      response_format: { type: "json_object" } // Richiede output JSON
    });

    console.log(`✅ Risposta OpenAI ricevuta per ID: ${requestData.id}`);
    const mealPlanContent = response.choices[0].message.content;

    // Tenta di parsare il contenuto come JSON
    let mealPlanParsed;
    try {
        mealPlanParsed = JSON.parse(mealPlanContent);
    } catch (parseError) {
        console.error("Errore nel parsing JSON dalla risposta OpenAI:", parseError);
        // Se il parsing fallisce, restituisci il testo grezzo come errore o un messaggio di errore specifico
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
