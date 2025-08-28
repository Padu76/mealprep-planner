import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_MEAL_REQUESTS_TABLE = 'Meal_Requests';
const AIRTABLE_MEAL_PLANS_TABLE = 'meal_plans';
const AIRTABLE_RECIPES_AI_TABLE = 'recipes_ai'; // ✅ NUOVO: Tabella ricette AI
const AIRTABLE_USER_FAVORITES_TABLE = 'user_favorites'; // ✅ NUOVO: Tabella preferiti

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, email, table, fields, recordId } = body;

    console.log('🔍 Airtable API called with action:', action);
    console.log('🔍 Table requested:', table);
    console.log('🔍 Request data:', data || fields);

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { success: false, error: 'Missing Airtable configuration' },
        { status: 500 }
      );
    }

    // ✅ ACTIONS UNIFICATE - Dashboard + Ricette AI
    switch (action) {
      // Dashboard meal_plans actions
      case 'read':
        return await readRecords(table || 'meal_plans');
      
      case 'create':
        return await createRecord(table || 'meal_plans', fields || data);
      
      case 'delete':
        return await deleteRecord(table || 'meal_plans', recordId);

      // ✅ NUOVE: Ricette AI actions
      case 'saveAiRecipe':
        return await saveAiRecipe(data);
      
      case 'getAiRecipes':
        return await getAiRecipes();
      
      case 'saveFavorite':
        return await saveFavorite(data);
      
      case 'getFavorites':
        return await getFavorites(data.userId || 'default');
      
      case 'removeFavorite':
        return await removeFavorite(data);

      // Esistenti meal requests actions
      case 'saveMealRequest':
        return await saveMealRequest(data);
      
      case 'saveMealPlan':
        return await saveMealPlan(data);
      
      case 'getUserPlans':
        return await getUserPlans(email);

      case 'getMealRequests':
        return await getMealRequests();

      case 'getDashboardMetrics':
        return await getDashboardMetrics();

      case 'getUserMealRequests':
        return await getUserMealRequests(data);

      case 'updateStatus':
        return await updateStatus(data);

      case 'testConnection':
        return await testConnection();
      
      default:
        console.log('❌ Unknown action:', action);
        return NextResponse.json(
          { success: false, error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Airtable API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, recordId, table } = body;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { success: false, error: 'Missing Airtable configuration' },
        { status: 500 }
      );
    }

    if (action === 'deletePlan') {
      return await deletePlan(recordId);
    }

    if (action === 'delete') {
      return await deleteRecord(table || 'meal_plans', recordId);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid delete action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Airtable DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ===== ✅ NUOVE FUNZIONI RICETTE AI =====

// 💾 SALVA RICETTA AI - Con tutti i campi della struttura CSV
async function saveAiRecipe(data: any) {
  try {
    console.log('🤖 Saving AI recipe with data:', data);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_RECIPES_AI_TABLE}`;
    
    // ✅ MAPPING COMPLETO per tutti i campi CSV
    const cleanedData: any = {
      // Campi base
      nome: String(data.nome || ''),
      categoria: String(data.categoria || 'pranzo'),
      difficolta: String(data.difficolta || 'medio'),
      tempoPreparazione: Number(data.tempoPreparazione || 30),
      porzioni: Number(data.porzioni || 1),
      
      // Macronutrienti
      calorie: Number(data.calorie || 0),
      proteine: Number(data.proteine || 0),
      carboidrati: Number(data.carboidrati || 0),
      grassi: Number(data.grassi || 0),
      
      // Contenuti (array come stringhe separate da |)
      ingredienti: Array.isArray(data.ingredienti) ? data.ingredienti.join('|') : String(data.ingredienti || ''),
      preparazione: String(data.preparazione || ''),
      
      // Fitness specifici
      macro_focus: String(data.macro_focus || 'balanced'),
      fonte: 'ai_generated',
      rating: Number(data.rating || 4.7),
      reviewCount: Number(data.reviewCount || 1),
      createdAt: new Date().toISOString(),
      
      // ✅ NUOVI CAMPI FITNESS della struttura CSV
      fonte_fitness: String(data.fonte_fitness || 'nutrizionista_sportivo'),
      timing_workout: String(data.timing_workout || 'any_time'),
      fitness_benefits: String(data.fitness_benefits || 'Performance ottimizzata'),
      timing_notes: String(data.timing_notes || 'Consumare secondo necessità'),
      international_origin: String(data.international_origin || 'Database fitness internazionale'),
      performance_score: Number(data.performance_score || 85)
    };
    
    // Array fields (converti in string)
    if (Array.isArray(data.tipoDieta)) {
      cleanedData.tipoDieta = data.tipoDieta.join(',');
    } else {
      cleanedData.tipoDieta = String(data.tipoDieta || 'balanced');
    }
    
    if (Array.isArray(data.obiettivo_fitness)) {
      cleanedData.obiettivo_fitness = data.obiettivo_fitness.join(',');
    } else {
      cleanedData.obiettivo_fitness = String(data.obiettivo_fitness || 'maintenance');
    }
    
    if (Array.isArray(data.tags)) {
      cleanedData.tags = data.tags.join(',');
    } else {
      cleanedData.tags = String(data.tags || 'ai_generated,fitness');
    }

    console.log('🧹 Final AI recipe data for Airtable:', cleanedData);

    const response = await fetch(tableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: cleanedData
      })
    });

    const responseText = await response.text();
    console.log('📡 AI Recipe save response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable saveAiRecipe Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save AI recipe to Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ AI Recipe saved successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'AI recipe saved successfully'
    });

  } catch (error) {
    console.error('💥 Error saving AI recipe:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save AI recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 📋 GET RICETTE AI
async function getAiRecipes() {
  try {
    console.log('📋 Getting AI recipes...');
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_RECIPES_AI_TABLE}`;
    const url = `${tableUrl}?sort[0][field]=createdAt&sort[0][direction]=desc&maxRecords=100`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('📡 AI recipes response status:', response.status);

    if (!response.ok) {
      // Se tabella non esiste, ritorna array vuoto
      if (response.status === 404) {
        console.log('⚠️ AI recipes table not found, returning empty array');
        return NextResponse.json({
          success: true,
          records: []
        });
      }

      console.error('❌ Airtable getAiRecipes Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get AI recipes',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log(`✅ Retrieved ${result.records?.length || 0} AI recipes`);

    return NextResponse.json({
      success: true,
      records: result.records || []
    });

  } catch (error) {
    console.error('💥 Error getting AI recipes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get AI recipes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ❤️ SALVA PREFERITO
async function saveFavorite(data: any) {
  try {
    console.log('❤️ Saving favorite:', data);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_USER_FAVORITES_TABLE}`;
    
    const cleanedData = {
      userId: String(data.userId || 'default'),
      recipeId: String(data.recipeId || ''),
      recipeName: String(data.recipeName || ''),
      createdAt: new Date().toISOString()
    };

    const response = await fetch(tableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: cleanedData
      })
    });

    const responseText = await response.text();
    console.log('📡 Favorite save response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable saveFavorite Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save favorite',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Favorite saved successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Favorite saved successfully'
    });

  } catch (error) {
    console.error('💥 Error saving favorite:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save favorite',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 📋 GET PREFERITI
async function getFavorites(userId: string) {
  try {
    console.log('📋 Getting favorites for user:', userId);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_USER_FAVORITES_TABLE}`;
    const filterFormula = `{userId} = "${userId}"`;
    const encodedFormula = encodeURIComponent(filterFormula);
    const url = `${tableUrl}?filterByFormula=${encodedFormula}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('📡 Favorites response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          records: []
        });
      }

      console.error('❌ Airtable getFavorites Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get favorites',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log(`✅ Retrieved ${result.records?.length || 0} favorites`);

    return NextResponse.json({
      success: true,
      records: result.records || []
    });

  } catch (error) {
    console.error('💥 Error getting favorites:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get favorites',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 🗑️ RIMUOVI PREFERITO
async function removeFavorite(data: any) {
  try {
    console.log('🗑️ Removing favorite:', data);
    
    const { userId, recipeId } = data;
    
    // Prima trova il record
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_USER_FAVORITES_TABLE}`;
    const filterFormula = `AND({userId} = "${userId}", {recipeId} = "${recipeId}")`;
    const encodedFormula = encodeURIComponent(filterFormula);
    const findUrl = `${tableUrl}?filterByFormula=${encodedFormula}`;
    
    const findResponse = await fetch(findUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!findResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Failed to find favorite record'
      }, { status: findResponse.status });
    }

    const findResult = await findResponse.json();
    
    if (!findResult.records || findResult.records.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Favorite not found or already removed'
      });
    }

    // Elimina il record trovato
    const recordId = findResult.records[0].id;
    const deleteResponse = await fetch(`${tableUrl}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ Airtable removeFavorite Error:', errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to remove favorite',
          details: errorText 
        },
        { status: deleteResponse.status }
      );
    }

    console.log('✅ Favorite removed successfully:', recordId);

    return NextResponse.json({
      success: true,
      message: 'Favorite removed successfully'
    });

  } catch (error) {
    console.error('💥 Error removing favorite:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to remove favorite',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ===== FUNZIONI ESISTENTI (invariate) =====

// 📖 READ RECORDS - Nuova funzione per dashboard
async function readRecords(tableName: string) {
  try {
    console.log('📖 Reading records from table:', tableName);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${tableName}`;
    const url = `${tableUrl}?sort[0][field]=createdAt&sort[0][direction]=desc&maxRecords=100`;
    
    console.log('🔗 Read URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('📡 Read response status:', response.status);

    if (!response.ok) {
      // Se la tabella non esiste, crea una risposta vuota
      if (response.status === 404) {
        console.log('⚠️ Table not found, returning empty records');
        return NextResponse.json({
          success: true,
          records: [],
          message: 'Table not found - empty result'
        });
      }

      console.error('❌ Airtable read Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to read from Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log(`✅ Read ${result.records?.length || 0} records from ${tableName}`);

    return NextResponse.json({
      success: true,
      records: result.records || [],
      total: result.records?.length || 0
    });

  } catch (error) {
    console.error('💥 Error reading records:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to read records',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 💾 CREATE RECORD - Nuova funzione per dashboard
async function createRecord(tableName: string, fields: any) {
  try {
    console.log('💾 Creating record in table:', tableName);
    console.log('📄 Fields to create:', fields);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${tableName}`;
    
    const response = await fetch(tableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: fields
      })
    });

    const responseText = await response.text();
    console.log('📡 Create response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable create Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create record in Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Record created successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      record: result,
      message: 'Record created successfully'
    });

  } catch (error) {
    console.error('💥 Error creating record:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create record',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 🗑️ DELETE RECORD - Nuova funzione per dashboard
async function deleteRecord(tableName: string, recordId: string) {
  try {
    console.log('🗑️ Deleting record:', recordId, 'from table:', tableName);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${tableName}`;
    
    const response = await fetch(`${tableUrl}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      }
    });

    const responseText = await response.text();
    console.log('📡 Delete response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable delete Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete record from Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Record deleted successfully:', recordId);

    return NextResponse.json({
      success: true,
      deletedId: result.id,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error deleting record:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete record',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ===== RESTO DELLE FUNZIONI ESISTENTI (invariate) =====

// 🧪 TEST CONNECTION - SEMPLIFICATO
async function testConnection() {
  try {
    console.log('🔗 Testing Airtable connection...');
    
    const testUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}?maxRecords=1`;
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log('📡 Airtable test response status:', response.status);
    console.log('📄 Airtable test response body:', responseText);
    
    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ Airtable connection successful');
      return NextResponse.json({
        success: true,
        message: 'Airtable connection working',
        status: 'connected',
        recordsFound: result.records?.length || 0,
        tableName: AIRTABLE_MEAL_REQUESTS_TABLE
      });
    } else {
      console.log('❌ Airtable connection failed:', responseText);
      return NextResponse.json({
        success: false,
        error: 'Airtable connection failed',
        status: response.status,
        details: responseText,
        tableName: AIRTABLE_MEAL_REQUESTS_TABLE
      }, { status: response.status });
    }
  } catch (connectionError) {
    console.log('❌ Airtable network error:', connectionError);
    return NextResponse.json({
      success: false,
      error: 'Network error connecting to Airtable',
      details: connectionError instanceof Error ? connectionError.message : 'Unknown error'
    }, { status: 500 });
  }
}

// [RESTO DELLE FUNZIONI ESISTENTI INVARIATE - saveMealRequest, saveMealPlan, getUserPlans, etc.]
// Mantengo il codice esistente per non rompere la compatibilità

// 💾 SALVA RICHIESTA MEAL PLAN - SEMPLIFICATO PER DEBUG
async function saveMealRequest(data: any) {
  try {
    console.log('💾 Saving meal request with data:', data);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;
    
    // Dati minimi obbligatori per evitare 422
    const cleanedData = {
      Nome: String(data.nome || data.name || 'Utente'),
      Email: String(data.email || 'noemail@test.com'),
      Status: 'In attesa',
      Source: 'Website Form'
    };
    
    // Aggiungi solo campi se presenti
    if (data.age || data.eta) cleanedData.Age = Number(data.age || data.eta);
    if (data.weight || data.peso) cleanedData.Weight = Number(data.weight || data.peso);
    if (data.height || data.altezza) cleanedData.Height = Number(data.height || data.altezza);
    if (data.gender || data.sesso) cleanedData.Gender = String(data.gender || data.sesso);
    if (data.activity_level || data.attivita) cleanedData.Activity_Level = String(data.activity_level || data.attivita);
    if (data.goal || data.obiettivo) cleanedData.Goal = String(data.goal || data.obiettivo);
    if (data.duration || data.durata) cleanedData.Duration = Number(data.duration || data.durata);
    if (data.meals_per_day || data.pasti) cleanedData.Meals_Per_Day = Number(data.meals_per_day || data.pasti);
    if (data.exclusions) cleanedData.Exclusions = String(data.exclusions);
    if (data.foods_at_home) cleanedData.Foods_At_Home = String(data.foods_at_home);
    if (data.phone || data.telefono) cleanedData.Phone = String(data.phone || data.telefono);

    console.log('🧹 Cleaned data for Airtable:', cleanedData);

    const response = await fetch(tableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: cleanedData
      })
    });

    const responseText = await response.text();
    console.log('📡 Save response status:', response.status);
    console.log('📄 Save response body:', responseText);

    if (!response.ok) {
      console.error('❌ Airtable API Error Response:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save to Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Meal request saved successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Meal request saved successfully'
    });

  } catch (error) {
    console.error('💥 Error saving meal request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save meal request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 💾 SALVA PIANO COMPLETO - CON MAPPING CORRETTO CAMPI AIRTABLE
async function saveMealPlan(data: any) {
  try {
    console.log('📋 Saving meal plan with data:', data);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;
    
    // SOLO CAMPI ESISTENTI IN AIRTABLE - MAPPING DIRETTO
    const cleanedData = {
      Nome: String(data.nome || data.name || 'Utente'),
      Email: String(data.email || 'noemail@test.com'),
      Status: 'Piano generato',
      Source: 'Website Form'
    };
    
    // CAMPI NUMERICI - solo se presenti
    if (data.age !== undefined && !isNaN(data.age)) cleanedData.Age = Number(data.age);
    if (data.weight !== undefined && !isNaN(data.weight)) cleanedData.Weight = Number(data.weight);
    if (data.height !== undefined && !isNaN(data.height)) cleanedData.Height = Number(data.height);
    if (data.duration !== undefined && !isNaN(data.duration)) cleanedData.Duration = Number(data.duration);
    if (data.meals_per_day !== undefined && !isNaN(data.meals_per_day)) cleanedData.Meals_Per_Day = Number(data.meals_per_day);
    if (data.bmr !== undefined && !isNaN(data.bmr)) cleanedData.BMR = Number(data.bmr);
    if (data.total_calories !== undefined && !isNaN(data.total_calories)) cleanedData.Calculated_Calories = Number(data.total_calories);
    
    // CAMPI TESTUALI - solo se presenti
    if (data.gender) cleanedData.Gender = String(data.gender);
    if (data.activity_level) cleanedData.Activity_Level = String(data.activity_level);
    if (data.phone) cleanedData.Phone = String(data.phone);
    if (data.exclusions) cleanedData.Exclusions = String(data.exclusions);
    if (data.foods_at_home) cleanedData.Foods_At_Home = String(data.foods_at_home);
    
    // CAMPI SELECT - solo valori esistenti in Airtable
    if (data.goal) {
      const validGoals = ['dimagrimento', 'mantenimento', 'aumento massa', 'Perdita peso'];
      if (validGoals.includes(data.goal)) {
        cleanedData.Goal = String(data.goal);
      }
    }
    
    if (data.diet_type) {
      const validDietTypes = ['bilanciata', 'vegetariana', 'vegana', 'low_carb'];
      if (validDietTypes.includes(data.diet_type)) {
        cleanedData.Diet_Type = String(data.diet_type);
      }
    }
    
    // PIANO DETTAGLI - solo se presente
    if (data.plan_details) {
      cleanedData.Meal_Plan = String(data.plan_details);
    }

    console.log('🧹 Final cleaned data for Airtable:', cleanedData);

    const response = await fetch(tableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: cleanedData
      })
    });

    const responseText = await response.text();
    console.log('📡 Plan save response status:', response.status);
    console.log('📄 Plan save response body:', responseText);

    if (!response.ok) {
      console.error('❌ Airtable saveMealPlan Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save meal plan to Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Meal plan saved successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Meal plan saved successfully'
    });

  } catch (error) {
    console.error('💥 Error saving meal plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 📊 CARICA PIANI UTENTE - FIX 422
async function getUserPlans(email: string) {
  try {
    console.log('👤 Getting user plans for email:', email);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;
    
    let url = `${tableUrl}?sort[0][field]=Created&sort[0][direction]=desc&maxRecords=50`;
    
    if (email && email !== 'default@user.com' && email !== 'noemail@test.com') {
      const filterFormula = encodeURIComponent(`{Email} = "${email}"`);
      url = `${tableUrl}?filterByFormula=${filterFormula}&sort[0][field]=Created&sort[0][direction]=desc`;
    }

    console.log('🔗 Request URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const responseText = await response.text();
    console.log('📡 getUserPlans response status:', response.status);
    console.log('📄 getUserPlans response body:', responseText.substring(0, 500) + '...');

    if (!response.ok) {
      console.error('❌ Airtable getUserPlans Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch user plans',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    
    const plans = result.records?.map((record: any) => ({
      id: record.id,
      created_time: record.createdTime,
      nome: record.fields?.Nome || '',
      email: record.fields?.Email || '',
      age: record.fields?.Age || '',
      weight: record.fields?.Weight || '',
      height: record.fields?.Height || '',
      gender: record.fields?.Gender || '',
      activity_level: record.fields?.Activity_Level || '',
      goal: record.fields?.Goal || '',
      diet_type: record.fields?.Diet_Type || '',
      duration: record.fields?.Duration || '',
      meals_per_day: record.fields?.Meals_Per_Day || '',
      exclusions: record.fields?.Exclusions || '',
      foods_at_home: record.fields?.Foods_At_Home || '',
      phone: record.fields?.Phone || '',
      plan_details: record.fields?.Meal_Plan || '',
      total_calories: record.fields?.Calculated_Calories || 0,
      bmr: record.fields?.BMR || 0,
      status: record.fields?.Status || 'In attesa'
    })) || [];

    console.log(`✅ Fetched ${plans.length} plans for email: ${email}`);

    return NextResponse.json({
      success: true,
      plans: plans,
      count: plans.length
    });

  } catch (error) {
    console.error('💥 Error fetching user plans:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch user plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 📋 GET MEAL REQUESTS (per dashboard admin) - FIX 422 DEFINITIVO
async function getMealRequests() {
  try {
    console.log('📋 Getting all meal requests for admin dashboard...');
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;
    
    // URL SEMPLIFICATA per evitare errori di filtro
    const url = `${tableUrl}?maxRecords=100`;
    console.log('🔗 Simple URL for getMealRequests:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log('📡 getMealRequests response status:', response.status);
    console.log('📄 getMealRequests response length:', responseText.length);

    if (!response.ok) {
      console.error('❌ Airtable getMealRequests Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get from Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Raw Airtable records count:', result.records?.length || 0);
    
    // MAPPING SEMPLIFICATO - SOLO CAMPI ESISTENTI
    const formattedRecords = result.records?.map((record: any) => {
      console.log('📄 Processing record fields:', Object.keys(record.fields || {}));
      
      return {
        id: record.id,
        fields: {
          // CAMPI OBBLIGATORI
          Nome: record.fields?.Nome || '',
          Email: record.fields?.Email || '',
          Status: record.fields?.Status || 'In attesa',
          Source: record.fields?.Source || 'Manual',
          
          // CAMPI NUMERICI (se esistenti)
          ...(record.fields?.Age && { Age: record.fields.Age }),
          ...(record.fields?.Weight && { Weight: record.fields.Weight }),
          ...(record.fields?.Height && { Height: record.fields.Height }),
          ...(record.fields?.Duration && { Duration: record.fields.Duration }),
          ...(record.fields?.Meals_Per_Day && { Meals_Per_Day: record.fields.Meals_Per_Day }),
          ...(record.fields?.BMR && { BMR: record.fields.BMR }),
          ...(record.fields?.Calculated_Calories && { Calculated_Calories: record.fields.Calculated_Calories }),
          
          // CAMPI TESTUALI (se esistenti)
          ...(record.fields?.Gender && { Gender: record.fields.Gender }),
          ...(record.fields?.Activity_Level && { Activity_Level: record.fields.Activity_Level }),
          ...(record.fields?.Goal && { Goal: record.fields.Goal }),
          ...(record.fields?.Diet_Type && { Diet_Type: record.fields.Diet_Type }),
          ...(record.fields?.Phone && { Phone: record.fields.Phone }),
          ...(record.fields?.Exclusions && { Exclusions: record.fields.Exclusions }),
          ...(record.fields?.Foods_At_Home && { Foods_At_Home: record.fields.Foods_At_Home }),
          ...(record.fields?.Meal_Plan && { Meal_Plan: record.fields.Meal_Plan })
        },
        createdTime: record.createdTime || ''
      };
    }) || [];

    console.log(`✅ Formatted ${formattedRecords.length} records for admin dashboard`);

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      total: formattedRecords.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error getting meal requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Network error getting from Airtable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 📊 GET DASHBOARD METRICS - INVARIATO (funziona)
async function getDashboardMetrics() {
  try {
    console.log('📊 Getting dashboard metrics...');
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;
    
    const response = await fetch(tableUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log('📡 Metrics response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable getDashboardMetrics Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get metrics from Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    const records = result.records || [];
    
    // Calcola metriche
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const totalRequests = records.length;
    let todayRequests = 0;
    let weekRequests = 0;
    let monthRequests = 0;
    let completedRequests = 0;
    let processingRequests = 0;
    let pendingRequests = 0;

    const goalCounts: { [key: string]: number } = {};
    const activityCounts: { [key: string]: number } = {};

    records.forEach((record: any) => {
      const fields = record.fields || {};
      
      const createdDate = record.createdTime || '';
      const dateOnly = createdDate.split('T')[0];
      
      if (dateOnly === today) todayRequests++;
      if (dateOnly >= thisWeek) weekRequests++;
      if (dateOnly >= thisMonth) monthRequests++;
      
      const status = fields.Status || 'In attesa';
      if (status === 'Piano generato' || status === 'Completato') {
        completedRequests++;
      } else if (status === 'Elaborazione' || status === 'In corso') {
        processingRequests++;
      } else {
        pendingRequests++;
      }

      const goal = fields.Goal || 'Non specificato';
      goalCounts[goal] = (goalCounts[goal] || 0) + 1;

      const activity = fields.Activity_Level || 'Non specificato';
      activityCounts[activity] = (activityCounts[activity] || 0) + 1;
    });

    const conversionRate = totalRequests > 0 ? 
      ((completedRequests / totalRequests) * 100) : 0;

    const metrics = {
      totalRequests,
      todayRequests,
      weekRequests,
      monthRequests,
      completedRequests,
      processingRequests,
      pendingRequests,
      conversionRate: Math.round(conversionRate * 10) / 10,
      successRate: Math.round(conversionRate * 10) / 10,
      goalDistribution: goalCounts,
      activityDistribution: activityCounts,
      avgRequestsPerDay: totalRequests > 0 ? Math.round((totalRequests / 30) * 10) / 10 : 0,
      growthRate: weekRequests > 0 ? Math.round(((weekRequests - todayRequests) / weekRequests) * 100) : 0,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Dashboard metrics calculated successfully');

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error getting dashboard metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Network error getting metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 👤 GET USER MEAL REQUESTS - SEMPLIFICATO
async function getUserMealRequests(data: any) {
  try {
    const { email } = data;
    console.log('👤 Getting user meal requests for:', email);
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email required'
      }, { status: 400 });
    }

    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;

    const filterFormula = `{Email} = "${email}"`;
    const encodedFormula = encodeURIComponent(filterFormula);
    const url = `${tableUrl}?filterByFormula=${encodedFormula}&sort[0][field]=Created&sort[0][direction]=desc`;
    
    console.log('🔗 User requests URL:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log('📡 User requests response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable getUserMealRequests Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get user data from Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    
    const formattedRecords = result.records?.map((record: any) => ({
      id: record.id,
      fields: {
        Nome: record.fields?.Nome || '',
        Email: record.fields?.Email || '',
        Age: record.fields?.Age || '',
        Weight: record.fields?.Weight || '',
        Height: record.fields?.Height || '',
        Gender: record.fields?.Gender || '',
        Activity_Level: record.fields?.Activity_Level || '',
        Goal: record.fields?.Goal || '',
        Diet_Type: record.fields?.Diet_Type || '',
        Duration: record.fields?.Duration || '',
        Meals_Per_Day: record.fields?.Meals_Per_Day || '',
        Exclusions: record.fields?.Exclusions || '',
        Foods_At_Home: record.fields?.Foods_At_Home || '',
        Phone: record.fields?.Phone || '',
        Status: record.fields?.Status || 'In attesa',
        Source: record.fields?.Source || 'Manual'
      },
      createdTime: record.createdTime || ''
    })) || [];
    
    console.log(`✅ Retrieved ${formattedRecords.length} records for user ${email}`);
    
    return NextResponse.json({
      success: true,
      records: formattedRecords,
      total: formattedRecords.length,
      userEmail: email
    });

  } catch (error) {
    console.error('💥 Error getting user meal requests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Network error getting user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 🔧 UPDATE STATUS
async function updateStatus(data: any) {
  try {
    const { recordId, newStatus } = data;
    console.log('🔧 Updating status for record:', recordId, 'to:', newStatus);
    
    if (!recordId || !newStatus) {
      return NextResponse.json({
        success: false,
        error: 'Record ID and new status required'
      }, { status: 400 });
    }

    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;

    const response = await fetch(`${tableUrl}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Status: newStatus
        }
      })
    });

    const responseText = await response.text();
    console.log('📡 Update status response:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable updateStatus Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update status',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Status updated successfully:', result.id);

    return NextResponse.json({
      success: true,
      message: 'Status updated',
      recordId: result.id,
      newStatus: newStatus
    });

  } catch (error) {
    console.error('💥 Error updating status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Network error updating status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 🗑️ ELIMINA PIANO (funzione legacy)
async function deletePlan(recordId: string) {
  try {
    console.log('🗑️ Deleting plan:', recordId);
    
    const tableUrl = `${AIRTABLE_BASE_URL}/${AIRTABLE_MEAL_REQUESTS_TABLE}`;
    
    const response = await fetch(`${tableUrl}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      }
    });

    const responseText = await response.text();
    console.log('📡 Delete response status:', response.status);

    if (!response.ok) {
      console.error('❌ Airtable deletePlan Error:', responseText);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete plan from Airtable',
          status: response.status,
          details: responseText 
        },
        { status: response.status }
      );
    }

    const result = JSON.parse(responseText);
    console.log('✅ Plan deleted successfully:', recordId);

    return NextResponse.json({
      success: true,
      deletedId: result.id,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('💥 Error deleting plan:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 🔧 GET method per status check
export async function GET() {
  return NextResponse.json({
    status: 'Airtable API is running',
    mealRequestsTable: AIRTABLE_MEAL_REQUESTS_TABLE,
    mealPlansTable: AIRTABLE_MEAL_PLANS_TABLE,
    recipesAiTable: AIRTABLE_RECIPES_AI_TABLE, // ✅ NUOVO
    userFavoritesTable: AIRTABLE_USER_FAVORITES_TABLE, // ✅ NUOVO
    availableActions: [
      // Dashboard actions
      'read', 'create', 'delete',
      // ✅ NUOVE: Ricette AI actions
      'saveAiRecipe', 'getAiRecipes', 'saveFavorite', 'getFavorites', 'removeFavorite',
      // Legacy actions  
      'testConnection',
      'saveMealRequest', 
      'saveMealPlan',
      'getUserPlans',
      'getMealRequests',
      'getDashboardMetrics',
      'getUserMealRequests',
      'updateStatus'
    ],
    timestamp: new Date().toISOString(),
    version: '7.0.0-ai-recipes-support' // ✅ AGGIORNATO
  });
}