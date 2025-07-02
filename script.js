console.log("Script loaded and parsed successfully."); // Added for debugging
// Global variable to store the currently viewed request ID in the dashboard modal
let currentRequestId = null;

// --- Utility Functions ---

/**
 * Shows a custom modal message.
 * @param {string} title - The title of the message.
 * @param {string} message - The content of the message.
 */
function showMessage(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('message-modal').classList.remove('hidden');
}

/**
 * Hides the custom modal message.
 */
function hideMessage() {
    document.getElementById('modal-close-button').click(); // Use the button's click handler
}

/**
 * Shows the loading overlay.
 */
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

/**
 * Hides the loading overlay.
 */
function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

/**
 * Calculates Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation.
 * @param {number} weightKg - Weight in kilograms.
 * @param {number} heightCm - Height in centimeters.
 * @param {number} ageYears - Age in years.
 * @param {string} gender - 'male' or 'female'.
 * @returns {number} BMR in calories.
 */
function calculateBMR(weightKg, heightCm, ageYears, gender) {
    if (gender === 'male') {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
    } else if (gender === 'female') {
        return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
    }
    return 0;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on BMR and activity level.
 * @param {number} bmr - Basal Metabolic Rate.
 * @param {string} activityLevel - Activity level ('sedentary', 'lightly_active', etc.).
 * @returns {number} TDEE in calories.
 */
function calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderatamente_active: 1.55,
        very_active: 1.725,
        extra_active: 1.9
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
}

/**
 * Adjusts TDEE based on the user's goal.
 * @param {number} tdee - Total Daily Energy Expenditure.
 * @param {string} goal - User's goal ('weight_loss', 'muscle_gain', 'maintenance').
 * @returns {number} Adjusted daily calorie intake.
 */
function adjustCaloriesForGoal(tdee, goal) {
    switch (goal) {
        case 'weight_loss':
            return tdee - 500; // Deficit for weight loss
        case 'muscle_gain':
            return tdee + 300; // Surplus for muscle gain
        case 'maintenance':
        default:
            return tdee;
    }
}

/**
 * Generates a PDF document from meal plan data.
 * @param {object} planData - The meal plan data including recipes and shopping list.
 * @param {object} userInfo - User information for the PDF header.
 */
function generatePdf(planData, userInfo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(255, 127, 0); // Orange
    doc.text("Il Tuo Piano Pasti Personalizzato", 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Gray
    doc.text(`Generato per: ${userInfo.email || 'N/A'}`, 105, y, { align: 'center' });
    y += 7;
    doc.text(`Obiettivo: ${userInfo.goal || 'N/A'} | Durata: ${userInfo.duration || 'N/A'} giorni`, 105, y, { align: 'center' });
    y += 15;

    // Shopping List
    doc.setFontSize(18);
    doc.setTextColor(255, 127, 0); // Orange
    doc.text("Lista della Spesa", 14, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50); // Dark Gray

    if (planData.shoppingList && planData.shoppingList.length > 0) {
        planData.shoppingList.forEach(item => {
            if (y > 280) { // Check for page break
                doc.addPage();
                y = 20;
            }
            doc.text(`- ${item}`, 20, y);
            y += 7;
        });
    } else {
        doc.text("Nessun articolo nella lista della spesa.", 20, y);
        y += 7;
    }
    y += 10;

    // Recipes
    doc.setFontSize(18);
    doc.setTextColor(255, 127, 0); // Orange
    doc.text("Ricette Dettagliate", 14, y);
    y += 10;

    if (planData.recipes && planData.recipes.length > 0) {
        planData.recipes.forEach(dayPlan => {
            if (y > 270) { // Check for page break before a new day
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0); // Black
            doc.text(`Giorno: ${dayPlan.day}`, 14, y);
            y += 8;

            dayPlan.meals.forEach(meal => {
                if (y > 260) { // Check for page break before a new meal
                    doc.addPage();
                    y = 20;
                }
                doc.setFontSize(12);
                doc.setTextColor(50, 50, 50); // Dark Gray
                doc.text(`${meal.type}: ${meal.name}`, 20, y);
                y += 7;

                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80); // Lighter Gray
                doc.text("Ingredienti:", 25, y);
                y += 5;
                meal.ingredients.forEach(ingredient => {
                    if (y > 280) { doc.addPage(); y = 20; }
                    doc.text(`- ${ingredient}`, 30, y);
                    y += 5;
                });
                y += 3;
                doc.text("Istruzioni:", 25, y);
                y += 5;
                const instructionsLines = doc.splitTextToSize(meal.instructions, 170); // Max width for text
                instructionsLines.forEach(line => {
                    if (y > 280) { doc.addPage(); y = 20; }
                    doc.text(line, 30, y);
                    y += 5;
                });
                y += 8;
            });
        });
    } else {
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text("Nessuna ricetta disponibile.", 20, y);
    }

    const pdfDataUri = doc.output('datauristring');
    document.getElementById('pdf-frame').src = pdfDataUri;
    document.getElementById('pdf-download-link').href = pdfDataUri;
    document.getElementById('pdf-viewer-modal').classList.remove('hidden');
}

// --- Local Storage Functions ---
/**
 * Loads requests from local storage.
 * @returns {Array} An array of meal prep request objects.
 */
function getRequestsFromLocalStorage() {
    try {
        const requests = localStorage.getItem('mealPrepRequests');
        return requests ? JSON.parse(requests) : [];
    } catch (e) {
        console.error("Errore nel recupero dati da localStorage:", e);
        return [];
    }
}

/**
 * Saves requests to local storage.
 * @param {Array} requests - The array of meal prep request objects to save.
 */
function saveRequestsToLocalStorage(requests) {
    try {
        localStorage.setItem('mealPrepRequests', JSON.stringify(requests));
    } catch (e) {
        console.error("Errore nel salvataggio dati in localStorage:", e);
        showMessage('Errore di Salvataggio', 'Impossibile salvare i dati localmente. La memoria del browser potrebbe essere piena o ci sono restrizioni.');
    }
}

// --- Landing Page Logic ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing event listeners.");

    document.getElementById('meal-prep-form-element').addEventListener('submit', async function(event) {
        event.preventDefault();
        showLoading();

        // Get selected allergies
        const selectedAllergies = Array.from(document.querySelectorAll('input[name="allergies"]:checked'))
                                    .map(cb => cb.value);
        const otherAllergiesElement = document.getElementById('other_allergies');
        const otherAllergiesText = otherAllergiesElement ? otherAllergiesElement.value.trim() : '';

        if (otherAllergiesText) {
            selectedAllergies.push(...otherAllergiesText.split(',').map(s => s.trim()).filter(s => s));
        }

        // Get selected preferences
        const selectedPreferences = Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
                                        .map(cb => cb.value);
        const otherPreferencesElement = document.getElementById('other_preferences');
        const otherPreferencesText = otherPreferencesElement ? otherPreferencesElement.value.trim() : '';

        if (otherPreferencesText) {
            selectedPreferences.push(...otherPreferencesText.split(',').map(s => s.trim()).filter(s => s));
        }

        // Get selected meal types
        const selectedMealTypes = Array.from(document.querySelectorAll('input[name="meal_types_to_include"]:checked'))
                                        .map(cb => cb.value);


        // Collect form data
        const formData = {
            id: crypto.randomUUID(), // Generate a unique ID for the request
            duration: parseInt(document.getElementById('duration').value),
            goal: document.getElementById('goal').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseFloat(document.getElementById('weight').value),
            height: parseFloat(document.getElementById('height').value),
            gender: document.getElementById('gender').value,
            activity_level: document.getElementById('activity_level').value,
            meals_per_day: parseInt(document.getElementById('meals_per_day').value),
            diet: document.getElementById('diet').value,
            allergies: selectedAllergies, // New field
            preferences: selectedPreferences, // New field
            cooking_skill_level: document.getElementById('cooking_skill_level').value, // New field
            equipment_available: document.getElementById('equipment_available').value.split(',').map(s => s.trim()).filter(s => s), // New field
            family_members: parseInt(document.getElementById('family_members').value), // New field
            specific_goals: document.getElementById('specific_goals').value.trim(), // New field
            meal_types_to_include: selectedMealTypes, // New field
            dietary_notes: document.getElementById('dietary_notes').value.trim(), // New field
            exclusions: [], // Removed 'exclusions' from HTML, so initialize as empty
            foods_at_home: [], // Removed 'foods_at_home' from HTML, so initialize as empty
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            timestamp: new Date().toISOString(),
            status: 'Da elaborare', // Initial status
            mealPlan: null // Placeholder for generated plan
        };

        // Basic validation
        if (!formData.duration || !formData.goal || !formData.age || !formData.weight || !formData.height || !formData.gender || !formData.activity_level || !formData.meals_per_day || !formData.diet || !formData.email) {
            hideLoading();
            showMessage('Errore di Validazione', 'Per favor, compila tutti i campi obbligatori.');
            return;
        }

        // Calculate calories
        const bmr = calculateBMR(formData.weight, formData.height, formData.age, formData.gender);
        const tdee = calculateTDEE(bmr, formData.activity_level);
        const dailyCalories = adjustCaloriesForGoal(tdee, formData.goal);
        formData.calories = Math.round(dailyCalories); // Store calculated calories

        try {
            let requests = getRequestsFromLocalStorage();
            requests.push(formData);
            saveRequestsToLocalStorage(requests);

            showMessage('Richiesta Inviata!', 'La tua richiesta di piano pasti è stata inviata con successo e salvata localmente. Puoi vederla nella dashboard.');
            document.getElementById('meal-prep-form-element').reset(); // Clear the form
        } catch (e) {
            console.error("Errore nell'aggiunta del documento a localStorage: ", e);
            showMessage('Errore', 'Si è verificato un errore durante l\'invio della richiesta. Riprova più tardi.');
        } finally {
            hideLoading();
        }
    });

    document.getElementById('modal-close-button').addEventListener('click', hideMessage);

    // --- Dashboard Logic ---

    // Function to show the correct section (landing or dashboard)
    function showSection(sectionId) {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('dashboard-container').classList.add('hidden');
        document.getElementById(sectionId).classList.remove('hidden');
        // Scroll to top when changing section
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Handle URL hash for dashboard access
    window.addEventListener('hashchange', () => {
        if (window.location.hash === '#dashboard') {
            showSection('dashboard-container');
            loadRequests();
        } else {
            showSection('landing-page');
        }
    });

    // Initial check on page load
    if (window.location.hash === '#dashboard') {
        showSection('dashboard-container');
        loadRequests();
    } else {
        showSection('landing-page');
    }


    /**
     * Loads and displays requests in the dashboard table from local storage.
     */
    function loadRequests() {
        let requests = getRequestsFromLocalStorage();

        // Apply filters
        const filterDate = document.getElementById('filter-date').value;
        const filterStatus = document.getElementById('filter-status').value;

        let filteredRequests = requests.filter(request => {
            let match = true;
            if (filterDate) {
                const requestDate = new Date(request.timestamp).toISOString().split('T')[0];
                if (requestDate !== filterDate) {
                    match = false;
                }
            }
            if (filterStatus && filterStatus !== '') {
                if (request.status !== filterStatus) {
                    match = false;
                }
            }
            return match;
        });

        // Sort by timestamp descending
        filteredRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const requestsTableBody = document.getElementById('requests-table-body');
        requestsTableBody.innerHTML = ''; // Clear existing rows

        if (filteredRequests.length === 0) {
            requestsTableBody.innerHTML = `<tr><td colspan="5" class="py-4 px-4 text-center text-gray-500">Nessuna richiesta trovata.</td></tr>`;
            return;
        }

        filteredRequests.forEach((data) => {
            const row = document.createElement('tr');
            row.classList.add('hover:bg-gray-50');

            const timestampDate = new Date(data.timestamp);
            const formattedDate = timestampDate.toLocaleDateString('it-IT', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            row.innerHTML = `
                <td class="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900 rounded-bl-lg">${String(data.id).substring(0, 8)}...</td>
                <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">${formattedDate}</td>
                <td class="py-3 px-4 whitespace-nowrap text-sm text-gray-700">${data.email}</td>
                <td class="py-3 px-4 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.status === 'Inviato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${data.status}
                    </span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap text-sm font-medium rounded-br-lg">
                    <button data-id="${data.id}" class="view-details-btn bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-full text-xs transition duration-300 mr-2">Dettagli</button>
                </td>
            `;
            requestsTableBody.appendChild(row);
        });

        // Add event listeners for view details buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const requestId = e.target.dataset.id;
                currentRequestId = requestId; // Store for modal actions
                showRequestDetails(requestId);
            });
        });
    }

    // Filter event listeners
    document.getElementById('filter-date').addEventListener('change', loadRequests);
    document.getElementById('filter-status').addEventListener('change', loadRequests);
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.getElementById('filter-date').value = '';
        document.getElementById('filter-status').value = '';
        loadRequests();
    });

    /**
     * Shows the details of a specific request in a modal.
     * @param {string} requestId - The ID of the request document.
     */
    async function showRequestDetails(requestId) {
        showLoading();
        try {
            let requests = getRequestsFromLocalStorage();
            const data = requests.find(req => req.id === requestId);

            if (data) {
                const detailsContent = document.getElementById('request-details-content');
                detailsContent.innerHTML = `
                    <p><strong>ID Richiesta:</strong> ${String(data.id).substring(0, 8)}...</p>
                    <p><strong>Data Richiesta:</strong> ${new Date(data.timestamp).toLocaleString('it-IT')}</p>
                    <p><strong>Stato:</strong> <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.status === 'Inviato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${data.status}</span></p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Telefono:</strong> ${data.phone || 'N/A'}</p>
                    <p><strong>Età:</strong> ${data.age} anni</p>
                    <p><strong>Peso:</strong> ${data.weight} kg</p>
                    <p><strong>Altezza:</strong> ${data.height} cm</p>
                    <p><strong>Sesso:</strong> ${data.gender === 'male' ? 'Uomo' : 'Donna'}</p>
                    <p><strong>Livello Attività:</strong> ${data.activity_level}</p>
                    <p><strong>Obiettivo:</strong> ${data.goal}</p>
                    <p><strong>Durata Meal Prep:</strong> ${data.duration} giorni</p>
                    <p><strong>Dieta Scelta:</strong> ${data.diet}</p>
                    <p><strong>Allergie:</strong> ${data.allergies.join(', ') || 'Nessuna'}</p>
                    <p><strong>Preferenze:</strong> ${data.preferences.join(', ') || 'Nessuna'}</p>
                    <p><strong>Livello Abilità Cucina:</strong> ${data.cooking_skill_level || 'N/A'}</p>
                    <p><strong>Attrezzatura Disponibile:</strong> ${data.equipment_available.join(', ') || 'Nessuna'}</p>
                    <p><strong>Persone per il Piano:</strong> ${data.family_members || 'N/A'}</p>
                    <p><strong>Obiettivi Specifici:</strong> ${data.specific_goals || 'N/A'}</p>
                    <p><strong>Tipi Pasti Inclusi:</strong> ${data.meal_types_to_include.join(', ') || 'N/A'}</p>
                    <p><strong>Note Dietetiche Aggiuntive:</strong> ${data.dietary_notes || 'N/A'}</p>
                    <p><strong>Cibi in Casa:</strong> ${data.foods_at_home.join(', ') || 'Nessuno'}</p>
                    <p><strong>Calorie Giornaliere Stimate:</strong> ${data.calories} kcal</p>
                `;

                // Show/hide buttons based on plan existence
                const generateBtn = document.getElementById('generate-plan-button');
                const viewBtn = document.getElementById('view-plan-button');
                const markCompletedBtn = document.getElementById('mark-completed-button');

                if (data.mealPlan) {
                    generateBtn.classList.add('hidden');
                    viewBtn.classList.remove('hidden');
                    markCompletedBtn.classList.remove('hidden'); // Always show mark completed if plan exists
                } else {
                    generateBtn.classList.remove('hidden');
                    viewBtn.classList.add('hidden');
                    markCompletedBtn.classList.add('hidden'); // Hide mark completed if no plan yet
                }

                document.getElementById('request-details-modal').classList.remove('hidden');
            } else {
                showMessage('Errore', 'Richiesta non trovata.');
            }
        } catch (error) {
            console.error("Errore nel recupero dei dettagli della richiesta: ", error);
            showMessage('Errore', 'Impossibile caricare i dettagli della richiesta.');
        } finally {
            hideLoading();
        }
    }

    document.getElementById('request-details-close-button').addEventListener('click', () => {
        document.getElementById('request-details-modal').classList.add('hidden');
        currentRequestId = null; // Clear current request ID
    });

    document.getElementById('pdf-viewer-close-button').addEventListener('click', () => {
        document.getElementById('pdf-viewer-modal').classList.add('hidden');
        document.getElementById('pdf-frame').src = ''; // Clear PDF content
    });

    // --- Dashboard Action Buttons ---

    document.getElementById('generate-plan-button').addEventListener('click', async () => {
        if (!currentRequestId) {
            showMessage('Errore', 'Nessuna richiesta selezionata per la generazione del piano.');
            return;
        }

        showLoading();
        try {
            let requests = getRequestsFromLocalStorage();
            let requestIndex = requests.findIndex(req => req.id === currentRequestId);

            if (requestIndex === -1) {
                showMessage('Errore', 'Richiesta non trovata per la generazione del piano.');
                hideLoading();
                return;
            }
            let requestData = requests[requestIndex];

            // Prepare data to send to Netlify Function
            const payloadToFunction = {
                requestData: requestData
            };

            console.log("Inizio chiamata alla Netlify Function /mealplanner con payload:", payloadToFunction);
            const response = await fetch('/.netlify/functions/mealplanner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadToFunction)
            });

            console.log("Risposta HTTP raw dalla Netlify Function:", response);

            if (!response.ok) {
                const errorBody = await response.json(); // Assuming Netlify function returns JSON error
                throw new Error(`Errore HTTP ${response.status}: ${errorBody.error || 'Errore sconosciuto dalla funzione.'}`);
            }

            const result = await response.json();
            console.log("Risposta JSON completa dalla Netlify Function:", result);

            if (result.mealPlan) {
                const generatedPlan = result.mealPlan;
                console.log("Piano generato (oggetto JS) dalla funzione:", generatedPlan);

                // Update local storage with the generated plan and status
                requests[requestIndex].mealPlan = generatedPlan;
                requests[requestIndex].status = 'Inviato';
                saveRequestsToLocalStorage(requests);

                showMessage('Piano Generato!', 'Il piano pasti è stato generato e salvato localmente. Puoi visualizzarlo ora.');
                // Refresh details to reflect changes
                showRequestDetails(currentRequestId);
                loadRequests(); // Refresh dashboard table
            } else {
                console.error("Struttura della risposta dalla Netlify Function inattesa:", result);
                showMessage('Errore Generazione', 'Impossibile generare il piano pasti. Struttura della risposta inattesa dalla funzione.');
            }

        } catch (error) {
            console.error("Errore durante la generazione del piano pasti:", error);
            showMessage('Errore Generazione', `Si è verificato un errore: ${error.message}. Controlla la console per maggiori dettagli e riprova.`);
        } finally {
            hideLoading();
        }
    });

    document.getElementById('view-plan-button').addEventListener('click', async () => {
        if (!currentRequestId) {
            showMessage('Errore', 'Nessuna richiesta selezionata per la visualizzazione del piano.');
            return;
        }

        showLoading();
        try {
            let requests = getRequestsFromLocalStorage();
            const data = requests.find(req => req.id === currentRequestId);

            if (data && data.mealPlan) {
                generatePdf(data.mealPlan, data); // Pass user info for PDF header
            } else {
                showMessage('Errore', 'Nessun piano pasti trovato per questa richiesta. Genera prima il piano.');
            }
        } catch (error) {
            console.error("Errore durante la visualizzazione del piano pasti:", error);
            showMessage('Errore', 'Impossibile visualizzare il piano pasti.');
        } finally {
            hideLoading();
        }
    });

    document.getElementById('mark-completed-button').addEventListener('click', async () => {
        if (!currentRequestId) {
            showMessage('Errore', 'Nessuna richiesta selezionata per l\'aggiornamento dello stato.');
            return;
        }

        showLoading();
        try {
            let requests = getRequestsFromLocalStorage();
            let requestIndex = requests.findIndex(req => req.id === currentRequestId);

            if (requestIndex !== -1) {
                requests[requestIndex].status = 'Inviato'; // Or 'Completato' as per your preference
                saveRequestsToLocalStorage(requests);
                showMessage('Stato Aggiornato', 'Richiesta segnata come "Inviato".');
                document.getElementById('request-details-modal').classList.add('hidden'); // Close modal
                loadRequests(); // Refresh table
            } else {
                showMessage('Errore', 'Richiesta non trovata per l\'aggiornamento dello stato.');
            }
        } catch (error) {
            console.error("Errore durante l'aggiornamento dello stato:", error);
            showMessage('Errore Aggiornamento', 'Impossibile aggiornare lo stato della richiesta.');
        } finally {
            hideLoading();
        }
    });

    document.getElementById('export-csv').addEventListener('click', async () => {
        showLoading();
        try {
            let requests = getRequestsFromLocalStorage();

            let csvContent = "ID Richiesta,Data Richiesta,Email,Telefono,Età,Peso,Altezza,Sesso,Livello Attività,Obiettivo,Durata,Dieta,Allergie,Preferenze,Livello Abilità Cucina,Attrezzatura Disponibile,Persone per il Piano,Obiettivi Specifici,Tipi Pasti Inclusi,Note Dietetiche Aggiuntive,Cibi in Casa,Pasti al Giorno,Calorie Stimate,Stato,Piano Pasti\n";

            requests.forEach((data) => {
                const row = [
                    data.id,
                    new Date(data.timestamp).toLocaleString('it-IT'),
                    data.email,
                    data.phone || '',
                    data.age,
                    data.weight,
                    data.height,
                    data.gender,
                    data.activity_level,
                    data.goal,
                    data.duration,
                    data.diet,
                    data.allergies.join('; '), // New field
                    data.preferences.join('; '), // New field
                    data.cooking_skill_level || '', // New field
                    data.equipment_available.join('; '), // New field
                    data.family_members || '', // New field
                    data.specific_goals || '', // New field
                    data.meal_types_to_include.join('; '), // New field
                    data.dietary_notes || '', // New field
                    data.foods_at_home.join('; '),
                    data.meals_per_day,
                    data.calories,
                    data.status,
                    data.mealPlan ? 'Generato' : 'Non Generato'
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); // Handle commas and quotes

                csvContent += row + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) { // Feature detection for download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'richieste_meal_prep.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                showMessage('Esporta CSV', 'Il tuo browser non supporta il download diretto. Copia il testo qui sotto:\n\n' + csvContent);
            }
            showMessage('Esportazione Completata', 'I dati sono stati esportati in un file CSV.');
        } catch (error) {
            console.error("Errore durante l'esportazione CSV:", error);
            showMessage('Errore Esportazione', 'Impossibile esportare i dati in CSV.');
        } finally {
            hideLoading();
        }
    });
}); // End DOMContentLoaded
