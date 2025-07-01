async function sendPrompt(promptText) {
  const response = await fetch("/.netlify/functions/mealplanner", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: promptText }),
  });

  const data = await response.json();

  if (data.result) {
    document.getElementById("output").innerHTML = data.result;
  } else {
    document.getElementById("output").innerHTML = "Errore nella generazione del piano.";
  }
}
