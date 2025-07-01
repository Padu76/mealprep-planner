exports.handler = async (event) => {
  try {
    const { requestId } = JSON.parse(event.body);

    console.log(`🚀 Generazione piano per ID: ${requestId}`);

    const openai = new OpenAI();

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Sei un assistente per generare un piano meal prep personalizzato."
        },
        {
          role: "user",
          content: `Crea un meal prep planner per la richiesta con ID ${requestId}.`
        }
      ],
    });

    console.log(`✅ Risposta OpenAI:`, response);

    return {
      statusCode: 200,
      body: JSON.stringify({ mealPlan: response.choices[0].message.content }),
    };
  } catch (error) {
    console.error(`❌ Errore nella funzione mealplanner:`, error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Errore interno nella funzione" }),
    };
  }
};
