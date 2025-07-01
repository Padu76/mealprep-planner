document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('id');

    if (!requestId) {
        document.getElementById('request-details').innerText = 'ID richiesta mancante!';
        return;
    }

    // Recupera le richieste salvate nel localStorage
    const requests = JSON.parse(localStorage.getItem('mealRequests')) || [];
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        document.getElementById('request-details').innerText = 'Richiesta non trovata!';
        return;
    }

    // Mostra i dettagli della richiesta
    const details = `
        <p><strong>ID:</strong> ${request.id}</p>
        <p><strong>Data:</strong> ${request.timestamp}</p>
        <p><strong>Email:</strong> ${request.email}</p>
        <p><strong>Obiettivo:</strong> ${request.goal}</p>
        <p><strong>Durata:</strong> ${request.duration}</p>
        <p><strong>Pasti al giorno:</strong> ${request.mealsPerDay}</p>
        <p><strong>Esclusioni:</strong> ${request.restrictions || 'Nessuna'}</p>
        <p><strong>Persone:</strong> ${request.people}</p>
        <button onclick="generateMealPlan('${request.id}')">Genera Piano Pasti</button>
    `;
    document.getElementById('request-details').innerHTML = details;
});

function generateMealPlan(id) {
    // Recupera le richieste salvate
    const requests = JSON.parse(localStorage.getItem('mealRequests')) || [];
    const request = requests.find(r => r.id === id);

    if (!request) {
        alert('Richiesta non trovata!');
        return;
    }

    // Costruisci il prompt per l'AI
    const prompt = `
Sei un Meal-Prep Planner professionista. Genera un piano dettagliato di preparazione pasti in base a:
- Obiettivo: ${request.goal}
- Numero di giorni: ${request.duration}
- Numero pasti al giorno: ${request.mealsPerDay}
- Esclusioni alimentari: ${request.restrictions}
- Numero di persone: ${request.people}

Crea:
1) Lista ricette con quantità precise per ogni pasto.
2) Lista spesa ottimizzata con categorie.
3) Istruzioni di preparazione passo-passo per cucinare tutto in un'unica sessione di meal prep.

Il piano deve essere facile da seguire e in italiano.
`;

    // Chiamata alla funzione serverless
    fetch('/.netlify/functions/mealplanner', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ prompt: prompt })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result) {
            document.getElementById('request-details').innerHTML += `
                <h3>Piano pasti generato:</h3>
                <pre style="white-space:pre-wrap;">${data.result}</pre>
            `;
            alert('Piano pasti generato con successo!');
        } else {
            alert('Errore nella generazione del piano.');
        }
    })
    .catch(err => {
        console.error(err);
        alert('Errore durante la chiamata al server.');
    });
}
