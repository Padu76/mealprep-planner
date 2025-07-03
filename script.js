let currentRequestId = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded. Initializing event listeners.');

  const form = document.getElementById('meal-prep-form-element');
  const loader = document.getElementById('loading-overlay');
  const mealplanOutput = document.getElementById('mealplan-output');
  const dashboardContainer = document.getElementById('dashboard-container');
  const landingPage = document.getElementById('landing-page');

  // Funzione per mostrare/nascondere sezioni
  function showSection(section) {
    landingPage.classList.add('hidden');
    dashboardContainer.classList.add('hidden');
    section.classList.remove('hidden');
  }

  // Inizializza la pagina in base all'hash
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

  // Utility per leggere valore input con sicurezza
  const getInputValue = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  // Salva richiesta in localStorage
  function saveRequest(request) {
    const requests = JSON.parse(localStorage.getItem('mealPrepRequests') || '[]');
    requests.push(request);
    localStorage.setItem('mealPrepRequests', JSON.stringify(requests));
  }

  // Carica richieste da localStorage
  function loadRequests() {
    return JSON.parse(localStorage.getItem('mealPrepRequests') || '[]');
  }

  // Carica dashboard
  function loadDashboard() {
    const requests = loadRequests();
    const tbody = document.getElementById('requests-table-body');
    tbody.innerHTML = '';

    requests.forEach((req, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${req.email || ''}</td>
        <td>${req.goal || ''}</td>
        <td>${req.duration || ''} giorni</td>
        <td>${req.status || 'In attesa'}</td>
        <td><button data-index="${index}" class="btn btn-details">Dettagli</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Event listener bottoni dettagli
    document.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.getAttribute('data-index');
        showRequestDetails(idx);
      });
    });
  }

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
      <p><strong>Età:</strong> ${req.age}</p>
      <p><strong>Peso:</strong> ${req.weight} kg</p>
      <p><strong>Altezza:</strong> ${req.height} cm</p>
      <p><strong>Genere:</strong> ${req.gender}</p>
      <p><strong>Livello attività:</strong> ${req.activity_level}</p>
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
      const response = await fetch('/.netlify/functions/mealplanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestData }),
      });

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

  // Inizializza dashboard se hash è #dashboard
  if (window.location.hash === '#dashboard') {
    loadDashboard();
  }
});


