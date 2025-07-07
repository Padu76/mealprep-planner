// src/app/api/airtable/route.js
// Next.js API Route per Airtable - VERSIONE DEBUG

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  // DEBUG: Log delle variabili environment
  console.log('🔧 DEBUG Environment Variables:');
  console.log('- BASE_ID:', BASE_ID);
  console.log('- TOKEN length:', AIRTABLE_TOKEN ? AIRTABLE_TOKEN.length : 'MISSING');
  console.log('- TOKEN start:', AIRTABLE_TOKEN ? AIRTABLE_TOKEN.substring(0, 15) + '...' : 'MISSING');

  if (!AIRTABLE_TOKEN || !BASE_ID) {
    console.error('❌ Variabili environment mancanti!');
    return Response.json(
      { success: false, error: 'Configurazione Airtable mancante' },
      { status: 500 }
    );
  }

  try {
    switch (action) {
      case 'getRequests':
        return await getMealRequests(AIRTABLE_TOKEN, BASE_ID);
      case 'getDashboardMetrics':
        return await getDashboardMetrics(AIRTABLE_TOKEN, BASE_ID);
      default:
        return await testConnection(AIRTABLE_TOKEN, BASE_ID);
    }
  } catch (error) {
    console.error('❌ Errore API:', error);
    return Response.json(
      { success: false, error: 'Errore interno', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { action, data } = await request.json();
  
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  try {
    switch (action) {
      case 'saveMealRequest':
        return await saveMealRequest(data, AIRTABLE_TOKEN, BASE_ID);
      case 'updateRequestStatus':
        return await updateRequestStatus(data, AIRTABLE_TOKEN, BASE_ID);
      default:
        return Response.json(
          { success: false, error: 'Azione non riconosciuta' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Errore POST:', error);
    return Response.json(
      { success: false, error: 'Errore interno', details: error.message },
      { status: 500 }
    );
  }
}

// === FUNCTIONS ===
async function testConnection(token, baseId) {
  console.log('🔍 Test connessione Airtable Next.js...');
  console.log('🔍 Base ID:', baseId);
  console.log('🔍 Token length:', token ? token.length : 'MISSING');
  console.log('🔍 Token start:', token ? token.substring(0, 15) + '...' : 'MISSING');
  
  const url = `https://api.airtable.com/v0/${baseId}/Meal_Requests?maxRecords=1`;
  console.log('🔍 URL chiamata:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('🔍 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ Errore Airtable:', data);
      throw new Error(data.error?.message || `HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    console.log('✅ Connessione OK, records:', data.records?.length || 0);

    return Response.json({
      success: true,
      message: 'Connessione Airtable attiva (Next.js)',
      connected: true,
      recordsCount: data.records?.length || 0,
      timestamp: new Date().toISOString(),
      debugInfo: {
        baseId,
        responseStatus: response.status,
        url
      }
    });

  } catch (fetchError) {
    console.error('❌ Fetch error:', fetchError);
    throw new Error(`Fetch failed: ${fetchError.message}`);
  }
}

async function getMealRequests(token, baseId) {
  console.log('📊 Caricando meal requests...');

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/Meal_Requests?sort[0][field]=Created_At&sort[0][direction]=desc&maxRecords=100`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Errore recupero dati');
  }

  const requests = data.records?.map(record => ({
    id: record.id,
    email: record.fields?.Email || '',
    phone: record.fields?.Phone || '',
    nome: record.fields?.Nome || '',
    goal: record.fields?.Goal || '',
    duration: Number(record.fields?.Duration) || 0,
    age: Number(record.fields?.Age) || 0,
    weight: Number(record.fields?.Weight) || 0,
    height: Number(record.fields?.Height) || 0,
    gender: record.fields?.Gender || '',
    activity_level: record.fields?.Activity_Level || '',
    meals_per_day: Number(record.fields?.Meals_Per_Day) || 3,
    diet: record.fields?.Diet_Type || '',
    exclusions: parseArray(record.fields?.Exclusions),
    foods_at_home: parseArray(record.fields?.Foods_At_Home),
    calories: Number(record.fields?.Calculated_Calories) || 0,
    bmr: Number(record.fields?.BMR) || 0,
    status: record.fields?.Status || 'In attesa',
    created_at: record.fields?.Created_At || null,
    generated_at: record.fields?.Generated_At || null,
    source: record.fields?.Source || 'Manual',
    mealPlan: parseJSON(record.fields?.Meal_Plan)
  })) || [];

  console.log(`✅ Caricati ${requests.length} meal requests`);

  return Response.json({
    success: true,
    data: requests,
    count: requests.length
  });
}

async function getDashboardMetrics(token, baseId) {
  console.log('📊 Caricando metriche dashboard...');

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/Meal_Requests`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();
  const requests = data.records || [];

  const today = new Date().toISOString().split('T')[0];
  const totalRequests = requests.length;
  
  let todayRequests = 0;
  let completedRequests = 0;
  let processingRequests = 0;

  requests.forEach(record => {
    const fields = record.fields || {};
    
    if (fields.Created_At?.startsWith(today)) {
      todayRequests++;
    }
    
    const status = fields.Status || '';
    if (status === 'Piano generato') {
      completedRequests++;
    } else if (status === 'Elaborazione') {
      processingRequests++;
    }
  });

  const conversionRate = totalRequests > 0 ? 
    ((completedRequests / totalRequests) * 100).toFixed(1) : 0;

  const metrics = {
    totalRequests,
    todayRequests,
    completedRequests,
    processingRequests,
    conversionRate: parseFloat(conversionRate),
    successRate: parseFloat(conversionRate),
    activities: []
  };

  return Response.json({
    success: true,
    data: metrics
  });
}

async function saveMealRequest(requestData, token, baseId) {
  console.log('💾 Salvando meal request...');

  const bmr = calculateBMR(requestData.age, requestData.weight, requestData.height, requestData.gender);
  const calories = calculateCalories(bmr, requestData.activity_level, requestData.goal);

  const airtableRecord = {
    fields: {
      Email: requestData.email || '',
      Phone: requestData.phone || '',
      Nome: requestData.nome || '',
      Goal: requestData.goal || '',
      Duration: parseInt(requestData.duration) || 5,
      Age: parseInt(requestData.age) || 0,
      Weight: parseFloat(requestData.weight) || 0,
      Height: parseFloat(requestData.height) || 0,
      Gender: requestData.gender || '',
      Activity_Level: requestData.activity_level || '',
      Meals_Per_Day: parseInt(requestData.meals_per_day) || 3,
      Diet_Type: requestData.diet || 'bilanciata',
      Exclusions: Array.isArray(requestData.exclusions) ? 
        requestData.exclusions.join(', ') : (requestData.exclusions || ''),
      Foods_At_Home: Array.isArray(requestData.foods_at_home) ? 
        requestData.foods_at_home.join(', ') : (requestData.foods_at_home || ''),
      Calculated_Calories: calories,
      BMR: bmr,
      Status: 'In attesa',
      Created_At: new Date().toISOString().split('T')[0],
      Source: 'Website Form'
    }
  };

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/Meal_Requests`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableRecord)
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Errore salvataggio');
  }

  console.log('✅ Meal request salvata:', result.id);

  return Response.json({
    success: true,
    recordId: result.id,
    message: 'Richiesta salvata con successo',
    calculatedCalories: calories
  }, { status: 201 });
}

async function updateRequestStatus(data, token, baseId) {
  const { recordId, status, mealPlan } = data;

  if (!recordId) {
    throw new Error('Record ID mancante');
  }

  const updateFields = { Status: status };

  if (status === 'Piano generato' && mealPlan) {
    updateFields.Meal_Plan = JSON.stringify(mealPlan);
    updateFields.Generated_At = new Date().toISOString().split('T')[0];
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/Meal_Requests/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: updateFields })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Errore aggiornamento');
  }

  return Response.json({
    success: true,
    message: 'Stato aggiornato con successo'
  });
}

// === UTILITY FUNCTIONS ===
function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function parseJSON(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function calculateBMR(age, weight, height, gender) {
  try {
    if (gender === 'maschio') {
      return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
    } else {
      return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
    }
  } catch {
    return 1500;
  }
}

function calculateCalories(bmr, activityLevel, goal) {
  try {
    const activityMultipliers = {
      'sedentario': 1.2,
      'leggero': 1.375,
      'moderato': 1.55,
      'intenso': 1.725,
      'molto_intenso': 1.9
    };

    const goalMultipliers = {
      'dimagrimento': 0.85,
      'mantenimento': 1.0,
      'aumento_massa': 1.15
    };

    const calories = bmr * (activityMultipliers[activityLevel] || 1.2) * (goalMultipliers[goal] || 1.0);
    return Math.round(calories);
  } catch {
    return 2000;
  }
}