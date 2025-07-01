document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generatePlanBtn");
  const mealPlanContainer = document.getElementById("mealPlanContainer");

  generateBtn.addEventListener("click", async () => {
    const requestId = document.getElementById("requestId").textContent;
    console.log("🚀 Generazione piano per ID:", requestId);

    try {
      // Mostra caricamento
      mealPlanContainer.innerHTML = "<p>Generazione piano in corso...</p>";

      const response = await fetch("/.netlify/functions/mealplanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      console.log("📨 Response raw:", response);

      if (!response.ok) {
        throw new Error(`Errore HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Risposta generazione:", data);

      if (data.success && data.mealPlan) {
        // Mostra il piano generato
        mealPlanContainer.innerHTML = `<pre>${data.mealPlan}</pre>`;

        // Aggiorna stato richiesta nella dashboard (opzionale)
        // Puoi aggiornare un DB/firestore o localStorage se necessario.
      } else {
        mealPlanContainer.innerHTML = `<p>Errore: ${data.error || "Impossibile generare il piano."}</p>`;
      }
    } catch (error) {
      console.error("❌ Errore nella generazione:", error);
      mealPlanContainer.innerHTML = "<p>Si è verificato un errore durante la generazione del piano.</p>";
    }
  });
});
