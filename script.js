<<<<<<< HEAD
let currentRequestId = null;
let currentRequestId = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('?? Meal Prep Planner inizializzato');
=======
let currentRequestId = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded. Initializing event listeners.');
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62

  const form = document.getElementById('meal-prep-form-element');
  const loader = document.getElementById('loading-overlay');
  const mealplanOutput = document.getElementById('mealplan-output');
  const dashboardContainer = document.getElementById('dashboard-container');
  const landingPage = document.getElementById('landing-page');

<<<<<<< HEAD
  // Utility per mostrare messaggi
  function showMessage(message, type = 'info') {
    const modal = document.getElementById('message-modal');
    const messageText = document.getElementById('message-text');
    messageText.textContent = message;
    messageText.className = type === 'error' ? 'text-red-600' : 'text-green-600';
    modal.classList.remove('hidden');
  }

  // Chiudi modale messaggio
  document.getElementById('message-close').addEventListener('click', () => {
    document.getElementById('message-modal').classList.add('hidden');
  });

  // Funzione per mostrare/nascondere sezioni
  function showSection(section) {
    landingPage.classList.add('hidden');
    dashboardContainer.classList.add('hidden');
    section.classList.remove('hidden');
  }

  // Gestione navigazione
=======
  // Funzione per mostrare/nascondere sezioni
  function showSection(section) {
    landingPage.classList.add('hidden');
    dashboardContainer.classList.add('hidden');
    section.classList.remove('hidden');
  }

  // Inizializza la pagina in base all'hash
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
  function handleHashChange() {
    const hash = window.location.hash || '#landing-page';
    if (hash === '#dashboard') {
      showSection(dashboardContainer);
      loadDashboard();
    } else {
      showSection(landingPage);
    }
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

<<<<<<< HEAD
  // Utility per leggere input
=======
  // Utility per leggere valore input con sicurezza
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
  const getInputValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

<<<<<<< HEAD
  // Gestione localStorage
  function saveRequest(request) {
    const requests = JSON.parse(localStorage.getItem('mealPrepRequests') || '[]');
    request.id = Date.now(); // ID univoco
    requests.push(request);
    localStorage.setItem('mealPrepRequests', JSON.stringify(requests));
    return request.id;
  }

=======
  // Salva richiesta in localStorage
  function saveRequest(request) {
    const requests = JSON.parse(localStorage.getItem('mealPrepRequests') || '[]');
    requests.push(request);
    localStorage.setItem('mealPrepRequests', JSON.stringify(requests));
  }

  // Carica richieste da localStorage
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
  function loadRequests() {
    return JSON.parse(localStorage.getItem('mealPrepRequests') || '[]');
  }

<<<<<<< HEAD
  function updateRequestStatus(id, status, mealPlan = null) {
    const requests = loadRequests();
    const requestIndex = requests.findIndex(req => req.id === id);
    if (requestIndex !== -1) {
      requests[requestIndex].status = status;
      if (mealPlan) {
        requests[requestIndex].mealPlan = mealPlan;
        requests[requestIndex].generatedAt = new Date().toISOString();
      }
      localStorage.setItem('mealPrepRequests', JSON.stringify(requests));
    }
  }

=======
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
  // Carica dashboard
  function loadDashboard() {
    const requests = loadRequests();
    const tbody = document.getElementById('requests-table-body');
    tbody.innerHTML = '';

<<<<<<< HEAD
    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Nessuna richiesta trovata</td></tr>';
      return;
    }

    requests.forEach((req, index) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50';
      
      const statusBadge = getStatusBadge(req.status);
      const createdAt = new Date(req.created_at).toLocaleDateString('it-IT');
      
      tr.innerHTML = `
        <td class="p-2 border border-gray-300">${index + 1}</td>
        <td class="p-2 border border-gray-300">${req.email || 'N/A'}</td>
        <td class="p-2 border border-gray-300">${req.goal || 'N/A'}</td>
        <td class="p-2 border border-gray-300">${req.duration || 'N/A'}</td>
        <td class="p-2 border border-gray-300">${statusBadge}</td>
        <td class="p-2 border border-gray-300">
          <button data-id="${req.id}" class="btn-details bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">
            Dettagli
          </button>
          ${req.mealPlan ? `<button data-id="${req.id}" class="btn-view-plan bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Piano</button>` : ''}
        </td>
=======
    requests.forEach((req, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${req.email || ''}</td>
        <td>${req.goal || ''}</td>
        <td>${req.duration || ''} giorni</td>
        <td>${req.status || 'In attesa'}</td>
        <td><button data-index="${index}" class="btn btn-details">Dettagli</button></td>
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
      `;
      tbody.appendChild(tr);
    });

<<<<<<< HEAD
    // Event listeners
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        showRequestDetails(id);
      });
    });

    document.querySelectorAll('.btn-view-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        showMealPlan(id);
=======
    // Event listener bottoni dettagli
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        showRequestDetails(idx);
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
      });
    });
  }

<<<<<<< HEAD
  function getStatusBadge(status) {
    const badges = {
      'In attesa': '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">In attesa</span>',
      'Elaborazione': '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Elaborazione</span>',
      'Piano generato': '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Completato</span>',
      'Errore': '<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Errore</span>'
    };
    return badges[status] || badges['In attesa'];
  }

  // Mostra dettagli richiesta
  function showRequestDetails(id) {
    const requests = loadRequests();
    const req = requests.find(r => r.id === id);
    if (!req) return showMessage('Richiesta non trovata', 'error');

    currentRequestId = id;

    const modalContent = document.getElementById('request-details-content');
    modalContent.innerHTML = `
      <h3 class="text-lg font-bold mb-4">Dettagli richiesta #${id}</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div><strong>Email:</strong> ${req.email}</div>
        <div><strong>Telefono:</strong> ${req.phone || 'N/A'}</div>
        <div><strong>Obiettivo:</strong> ${req.goal}</div>
        <div><strong>Durata:</strong> ${req.duration} giorni</div>
        <div><strong>Et…:</strong> ${req.age} anni</div>
        <div><strong>Peso:</strong> ${req.weight} kg</div>
        <div><strong>Altezza:</strong> ${req.height} cm</div>
        <div><strong>Genere:</strong> ${req.gender}</div>
        <div><strong>Attivit…:</strong> ${req.activity_level}</div>
        <div><strong>Pasti/giorno:</strong> ${req.meals_per_day}</div>
        <div><strong>Dieta:</strong> ${req.diet || 'Standard'}</div>
        <div><strong>Stato:</strong> ${req.status || 'In attesa'}</div>
      </div>
      <div class="mt-4">
        <div><strong>Esclusioni:</strong> ${req.exclusions?.join(', ') || 'Nessuna'}</div>
        <div><strong>Cibi disponibili:</strong> ${req.foods_at_home?.join(', ') || 'Nessuno'}</div>
      </div>
      <div class="mt-4 text-xs text-gray-500">
        Creata il: ${new Date(req.created_at).toLocaleString('it-IT')}
      </div>
    `;

    // Mostra/nascondi bottone genera piano
    const generateBtn = document.getElementById('generate-plan-button');
    if (req.status === 'Piano generato') {
      generateBtn.textContent = 'Piano gi… generato';
      generateBtn.disabled = true;
      generateBtn.className = 'mt-4 px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed';
    } else {
      generateBtn.textContent = 'Genera Piano';
      generateBtn.disabled = false;
      generateBtn.className = 'mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700';
    }

    document.getElementById('request-details-modal').classList.remove('hidden');
  }

  // Mostra piano generato
  function showMealPlan(id) {
    const requests = loadRequests();
    const req = requests.find(r => r.id === id);
    if (!req || !req.mealPlan) return showMessage('Piano non disponibile', 'error');

    // Genera PDF del piano
    generateMealPlanPDF(req.mealPlan, req.email);
  }

  // Genera PDF del piano pasti
  function generateMealPlanPDF(mealPlan, email) {
    const pdfContent = `
      <html>
      <head>
        <title>Piano Meal Prep - ${email}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .day { margin-bottom: 30px; page-break-inside: avoid; }
          .day h2 { color: #FF7F00; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .meal { margin-bottom: 20px; padding: 15px; border-left: 4px solid #4CAF50; background: #f9f9f9; }
          .meal h3 { margin: 0 0 10px 0; color: #2E7D32; }
          .ingredients { margin: 10px 0; }
          .ingredients ul { margin: 5px 0; padding-left: 20px; }
          .shopping-list { margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 5px; }
          .shopping-list h2 { color: #333; }
          .category { margin-bottom: 15px; }
          .category h3 { color: #666; margin-bottom: 5px; }
          .prep-tips { margin-top: 30px; padding: 15px; background: #e8f5e8; border-radius: 5px; }
          .nutrition { margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; }
          .nutrition div { display: inline-block; margin-right: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Piano Meal Prep Personalizzato</h1>
          <p>Generato per: ${email}</p>
          <p>Durata: ${mealPlan.totalDays} giorni | Target calorico: ${mealPlan.dailyCalories} kcal/giorno</p>
        </div>

        ${mealPlan.recipes.map(day => `
          <div class="day">
            <h2>Giorno ${day.day} - ${day.dayName}</h2>
            ${day.meals.map(meal => `
              <div class="meal">
                <h3>${meal.type}: ${meal.name}</h3>
                <div class="ingredients">
                  <strong>Ingredienti:</strong>
                  <ul>
                    ${meal.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                  </ul>
                </div>
                <div><strong>Preparazione:</strong> ${meal.instructions}</div>
                <div><strong>Calorie:</strong> ${meal.calories} kcal | <strong>Tempo:</strong> ${meal.prepTime}</div>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <div class="shopping-list">
          <h2>Lista della Spesa</h2>
          ${Object.entries(mealPlan.shoppingList).map(([category, items]) => `
            <div class="category">
              <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <ul>
                ${items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        ${mealPlan.prepInstructions ? `
          <div class="prep-tips">
            <h2>Consigli per la Preparazione</h2>
            <ul>
              ${mealPlan.prepInstructions.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${mealPlan.nutritionSummary ? `
          <div class="nutrition">
            <h2>Riepilogo Nutrizionale Giornaliero</h2>
            <div><strong>Calorie:</strong> ${mealPlan.nutritionSummary.avgCaloriesPerDay}</div>
            <div><strong>Proteine:</strong> ${mealPlan.nutritionSummary.avgProteinPerDay}</div>
            <div><strong>Carboidrati:</strong> ${mealPlan.nutritionSummary.avgCarbsPerDay}</div>
            <div><strong>Grassi:</strong> ${mealPlan.nutritionSummary.avgFatPerDay}</div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    // Mostra PDF in modal
    const pdfFrame = document.getElementById('pdf-frame');
    pdfFrame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(pdfContent);
    document.getElementById('pdf-viewer-modal').classList.remove('hidden');
  }

  // Chiudi modali
  document.getElementById('request-details-close').addEventListener('click', () => {
    document.getElementById('request-details-modal').classList.add('hidden');
  });

  document.getElementById('pdf-viewer-close').addEventListener('click', () => {
    document.getElementById('pdf-viewer-modal').classList.add('hidden');
  });

  // Submit form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validazione
    const email = getInputValue('email');
    const goal = getInputValue('goal');
    const age = parseInt(getInputValue('age'));
    const weight = parseFloat(getInputValue('weight'));
    const height = parseFloat(getInputValue('height'));

    if (!email) return showMessage('Inserisci la tua email', 'error');
    if (!goal) return showMessage('Seleziona un obiettivo', 'error');
    if (!age || age < 1 || age > 120) return showMessage('Et… non valida', 'error');
    if (!weight || weight < 20 || weight > 300) return showMessage('Peso non valido', 'error');
    if (!height || height < 100 || height > 250) return showMessage('Altezza non valida', 'error');

    // Costruisci richiesta
    const request = {
      duration: getInputValue('duration'),
      goal: goal,
      age: age,
      weight: weight,
      height: height,
      gender: getInputValue('gender'),
      activity_level: getInputValue('activity_level'),
      meals_per_day: getInputValue('meals_per_day'),
      diet: getInputValue('diet'),
      exclusions: getInputValue('exclusions').split(',').map(s => s.trim()).filter(Boolean),
      foods_at_home: getInputValue('foods_at_home').split(',').map(s => s.trim()).filter(Boolean),
      email: email,
      phone: getInputValue('phone'),
      status: 'In attesa',
      created_at: new Date().toISOString(),
    };

    // Salva in localStorage
    const requestId = saveRequest(request);
    
    showMessage('Richiesta salvata con successo! Vai alla dashboard per generare il piano.');
    
    // Resetta form
    form.reset();
    
    // Aggiorna dashboard
    loadDashboard();
  });

  // Genera piano dal dettaglio
  document.getElementById('generate-plan-button').addEventListener('click', async () => {
    if (currentRequestId === null) return showMessage('Seleziona prima una richiesta', 'error');

    const requests = loadRequests();
    const requestData = requests.find(r => r.id === currentRequestId);
    if (!requestData) return showMessage('Richiesta non trovata', 'error');

    // Aggiorna stato a "elaborazione"
    updateRequestStatus(currentRequestId, 'Elaborazione');
    loadDashboard();

    loader.classList.remove('hidden');
    document.getElementById('request-details-modal').classList.add('hidden');

    try {
      console.log('?? Chiamata a Claude API...');
      
=======
  // Mostra dettagli richiesta
  function showRequestDetails(index) {
    const requests = loadRequests();
    const req = requests[index];
    if (!req) return alert('Richiesta non trovata');

    currentRequestId = index;

    const modalContent = document.getElementById('request-details-content');
    modalContent.innerHTML = `
      <p><strong>Email:</strong> ${req.email}</p>
      <p><strong>Obiettivo:</strong> ${req.goal}</p>
      <p><strong>Durata:</strong> ${req.duration} giorni</p>
      <p><strong>EtÃ :</strong> ${req.age}</p>
      <p><strong>Peso:</strong> ${req.weight} kg</p>
      <p><strong>Altezza:</strong> ${req.height} cm</p>
      <p><strong>Genere:</strong> ${req.gender}</p>
      <p><strong>Livello attivitÃ :</strong> ${req.activity_level}</p>
      <p><strong>Numero pasti al giorno:</strong> ${req.meals_per_day}</p>
      <p><strong>Dieta:</strong> ${req.diet}</p>
      <p><strong>Esclusioni:</strong> ${req.exclusions.join(', ')}</p>
      <p><strong>Cibi a casa:</strong> ${req.foods_at_home.join(', ')}</p>
      <p><strong>Stato:</strong> ${req.status || 'In attesa'}</p>
    `;

    document.getElementById('request-details-modal').classList.remove('hidden');
  }

  // Chiudi modale dettagli
  document.getElementById('request-details-close').addEventListener('click', () => {
    document.getElementById('request-details-modal').classList.add('hidden');
  });

  // Gestisci submit form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Leggi valori input
    const duration = getInputValue('duration');
    const goal = getInputValue('goal');
    const age = parseInt(getInputValue('age'), 10);
    const weight = parseFloat(getInputValue('weight'));
    const height = parseFloat(getInputValue('height'));
    const gender = getInputValue('gender');
    const activity_level = getInputValue('activity_level');
    const meals_per_day = getInputValue('meals_per_day');
    const diet = getInputValue('diet');
    const exclusions = getInputValue('exclusions').split(',').map(s => s.trim()).filter(Boolean);
    const foods_at_home = getInputValue('foods_at_home').split(',').map(s => s.trim()).filter(Boolean);
    const email = getInputValue('email');
    const phone = getInputValue('phone');

    // Validazione minima
    if (!email) return alert('Inserisci la tua email');
    if (!goal) return alert('Seleziona un obiettivo');

    // Costruisci richiesta
    const request = {
      duration, goal, age, weight, height, gender,
      activity_level, meals_per_day, diet,
      exclusions, foods_at_home, email, phone,
      status: 'In attesa',
      created_at: new Date().toISOString(),
    };

    // Salva in localStorage
    saveRequest(request);

    alert('Richiesta salvata con successo!');

    // Resetta form
    form.reset();

    // Vai a dashboard
    window.location.hash = '#dashboard';
    loadDashboard();
  });

  // Bottone genera piano dal dettaglio
  document.getElementById('generate-plan-button').addEventListener('click', async () => {
    if (currentRequestId === null) return alert('Seleziona prima una richiesta');

    const requests = loadRequests();
    const requestData = requests[currentRequestId];
    if (!requestData) return alert('Richiesta non trovata');

    loader.classList.remove('hidden');

    try {
>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
      const response = await fetch('/.netlify/functions/mealplanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestData }),
      });

<<<<<<< HEAD
      const json = await response.json();
      
      if (!response.ok) {
        throw new Error(json.error || `Errore HTTP ${response.status}`);
      }

      if (!json.success) {
        throw new Error(json.error || 'Errore nella generazione del piano');
      }

      // Aggiorna stato e salva piano
      updateRequestStatus(currentRequestId, 'Piano generato', json.mealPlan);
      
      loader.classList.add('hidden');
      loadDashboard();
      
      showMessage('? Piano generato con successo! Clicca "Piano" per visualizzarlo.');

    } catch (error) {
      console.error('? Errore:', error);
      updateRequestStatus(currentRequestId, 'Errore');
      loader.classList.add('hidden');
      loadDashboard();
      showMessage('Errore nella generazione del piano: ' + error.message, 'error');
    }
  });

  // Inizializza
  if (window.location.hash === '#dashboard') {
    loadDashboard();
  }
});
=======
      if (!response.ok) throw new Error(`Errore dal server: ${response.status}`);

      const json = await response.json();

      // Aggiorna lo stato richiesta
      requests[currentRequestId].status = 'Piano generato';
      localStorage.setItem('mealPrepRequests', JSON.stringify(requests));

      loader.classList.add('hidden');

      // Mostra output (puoi modificare come vuoi, qui esempio semplice)
      mealplanOutput.textContent = JSON.stringify(json.mealPlan, null, 2);

      alert('Piano generato con successo!');

    } catch (error) {
      loader.classList.add('hidden');
      alert('Errore nella generazione del piano: ' + error.message);
    }
  });

  // Inizializza dashboard se hash Ã¨ #dashboard
  if (window.location.hash === '#dashboard') {
    loadDashboard();
  }
});


>>>>>>> d8aa047f00f23d9c2484b51fcfbbf51e50c87c62
