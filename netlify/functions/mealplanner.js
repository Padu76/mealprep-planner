// netlify/functions/mealplanner.js
const OpenAI = require("openai");
const openai = new OpenAI();

exports.handler = async (event, context) => {
  try {
    const data = JSON.parse(event.body);

    const prompt = `
Sei un Meal-Prep Planner professionale. Genera un piano dettagliato di preparazione pasti in base a:
- Obiettivo: ${data.goal}
- Numero di giorni: ${data.days}
- Numero pasti al giorno: ${data.mealsPerDay}
- Esclusioni alimentari: ${data.restrictions}
- Numero di persone: ${data.people}

Crea:
1) Lista ricette con quantità precise per ogni pasto.
2) Lista spesa ottimizzata con categorie.
3) Istruzioni di preparazione passo-passo per cucinare tutto in un'unica sessione di meal prep.

Il piano deve essere facile da seguire e in italiano.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result: completion.choices[0].message.content }),
    };
  } catch (error) {
    console.error("Mealplanner error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
