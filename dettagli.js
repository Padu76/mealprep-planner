document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('id');

    if (!requestId) {
        document.getElementById('request-details').innerText = 'ID richiesta mancante!';
        return;
    }

    // Recupera le richieste dal localStorage (o dal tuo backend/database)
    const requests = JSON.parse(localStorage.getItem('mealRequests')) || [];
    const request = requests.find(r => r.id === requestId);

    if (!request) {
        document.getElementById('request-details').innerText = 'Richiesta non trovata!';
        return;
    }

    // Mostra i dettagli
    const details = `
        <p><strong>ID:</strong> ${request.id}</p>
        <p><strong>Data:</strong> ${request.timestamp}</p>
        <p><strong>Email:</strong> ${request.email}</p>
        <p><strong>Obiettivo:</strong> ${request.goal}</p>
        <p><strong>Durata:</strong> ${request.duration}</p>
        <p><strong>Pasti al giorno:</strong> ${request.mealsPerDay}</p>
        <!-- Aggiungi qui altre info -->
        <button onclick="generateMealPlan('${request.id}')">Genera Piano Pasti</button>
    `;
    document.getElementById('request-details').innerHTML = details;
});

// Genera il piano pasti
function generateMealPlan(id) {
    alert('Qui integreremo la chiamata alla funzione serverless per generare il piano per ID: ' + id);
}
