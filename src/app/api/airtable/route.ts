import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Meal_Requests';

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, email } = body;

    console.log('🔍 Airtable API called with action:', action);
    console.log('📝 Request data:', data);

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { success: false, error: 'Missing Airtable configuration' },
        { status: 500 }
      );
    }

    switch (action) {
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
    const { action, recordId } = body;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { success: false, error: 'Missing Airtable configuration' },
        { status: 500 }
      );
    }

    if (action === 'deletePlan') {
      return await deletePlan(recordId);
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

// 🧪 TEST CONNECTION - SEMPLIFICATO
async function testConnection() {
  try {
    console.log('🔗 Testing Airtable connection...');
    
    const response = await fetch(`${AIRTABLE_BASE_URL}?maxRecords=1`, {
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
        tableName: AIRTABLE_TABLE_NAME
      });
    } else {
      console.log('❌ Airtable connection failed:', responseText);
      return NextResponse.json({
        success: false,
        error: 'Airtable connection failed',
        status: response.status,
        details: responseText,
        tableName: AIRTABLE_TABLE_NAME
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

// 💾 SALVA RICHIESTA MEAL PLAN - SEMPLIFICATO PER DEBUG
async function saveMealRequest(data: any) {
  try {
    console.log('💾 Saving meal request with data:', data);
    
    // Dati minimi obbligatori per evitare 422 - MAPPING CORRETTO AIRTABLE
    const cleanedData = {
      Nome: String(data.nome || data.name || 'Utente'),
      Email: String(data.email || 'noemail@test.com'),
      Status: 'In attesa',
      Source: 'Website Form'
    };
    
    // Aggiungi solo campi se presenti - NOMI CORRETTI DA AIRTABLE
    if (data.age || data.eta) cleanedData.Age = Number(data.age || data.eta);
    if (data.weight || data.peso) cleanedData.Weight = Number(data.weight || data.peso);
    if (data.height || data.altezza) cleanedData.Height = Number(data.height || data.altezza);
    if (data.gender || data.sesso) cleanedData.Gender = String(data.gender || data.sesso);
    if (data.activity_level || data.attivita) cleanedData.Activity_Level = String(data.activity_level || data.attivita);
    if (data.goal || data.obiettivo) cleanedData.Diet_Type = String(data.goal || data.obiettivo); // FIX: Goal → Diet_Type
    if (data.duration || data.durata) cleanedData.Duration = Number(data.duration || data.durata);
    if (data.meals_per_day || data.pasti) cleanedData.Meals_Per_Day = Number(data.meals_per_day || data.pasti);
    if (data.exclusions) cleanedData.Exclusions = String(data.exclusions);
    if (data.foods_at_home) cleanedData.Foods_At_Home = String(data.foods_at_home);
    if (data.phone || data.telefono) cleanedData.Phone = String(data.phone || data.telefono);

    console.log('🧹 Cleaned data for Airtable:', cleanedData);

    const response = await fetch(AIRTABLE_BASE_URL, {
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

// 💾 SALVA PIANO COMPLETO - SEMPLIFICATO
async function saveMealPlan(data: any) {
  try {
    console.log('📋 Saving meal plan with data:', data);
    
    // Dati minimi per piano - MAPPING CORRETTO AIRTABLE
    const cleanedData = {
      Nome: String(data.nome || data.name || 'Utente'),
      Email: String(data.email || 'noemail@test.com'),
      Status: 'Piano generato',
      Source: 'Website Form'
    };
    
    // Aggiungi dati del piano se presenti - NOMI CORRETTI DA AIRTABLE
    if (data.plan_details) cleanedData.Meal_Plan = String(data.plan_details); // FIX: Plan_Details → Meal_Plan
    if (data.total_calories || data.daily_calories) {
      cleanedData.Calculated_Calories = Number(data.total_calories || data.daily_calories || 0); // FIX: Total_Calories → Calculated_Calories
    }
    if (data.bmr) cleanedData.BMR = Number(data.bmr);
    
    // Dati utente opzionali - NOMI CORRETTI
    if (data.age || data.eta) cleanedData.Age = Number(data.age || data.eta);
    if (data.weight || data.peso) cleanedData.Weight = Number(data.weight || data.peso);
    if (data.height || data.altezza) cleanedData.Height = Number(data.height || data.altezza);
    if (data.gender || data.sesso) cleanedData.Gender = String(data.gender || data.sesso);
    if (data.activity_level || data.attivita) cleanedData.Activity_Level = String(data.activity_level || data.attivita);
    if (data.goal || data.obiettivo) cleanedData.Diet_Type = String(data.goal || data.obiettivo); // FIX: Goal → Diet_Type
    if (data.duration || data.durata) cleanedData.Duration = Number(data.duration || data.durata);
    if (data.meals_per_day || data.pasti) cleanedData.Meals_Per_Day = Number(data.meals_per_day || data.pasti);
    if (data.exclusions) cleanedData.Exclusions = String(data.exclusions);
    if (data.foods_at_home) cleanedData.Foods_At_Home = String(data.foods_at_home);

    console.log('🧹 Cleaned plan data for Airtable:', cleanedData);

    const response = await fetch(AIRTABLE_BASE_URL, {
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
    
    let url = `${AIRTABLE_BASE_URL}?sort[0][field]=Created&sort[0][direction]=desc&maxRecords=50`;
    
    if (email && email !== 'default@user.com' && email !== 'noemail@test.com') {
      const filterFormula = encodeURIComponent(`{Email} = "${email}"`);
      url = `${AIRTABLE_BASE_URL}?filterByFormula=${filterFormula}&sort[0][field]=Created&sort[0][direction]=desc`;
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
      goal: record.fields?.Diet_Type || '', // FIX: Goal → Diet_Type
      duration: record.fields?.Duration || '',
      meals_per_day: record.fields?.Meals_Per_Day || '',
      exclusions: record.fields?.Exclusions || '',
      foods_at_home: record.fields?.Foods_At_Home || '',
      phone: record.fields?.Phone || '',
      plan_details: record.fields?.Meal_Plan || '', // FIX: Plan_Details → Meal_Plan
      total_calories: record.fields?.Calculated_Calories || 0, // FIX: Total_Calories → Calculated_Calories
      daily_calories: record.fields?.Calculated_Calories || 0,
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
    
    // URL SEMPLIFICATA per evitare errori di filtro
    const url = `${AIRTABLE_BASE_URL}?maxRecords=100`;
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
      console.log('🔍 Processing record fields:', Object.keys(record.fields || {}));
      
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
    
    const response = await fetch(AIRTABLE_BASE_URL, {
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

      const goal = fields.Diet_Type || 'Non specificato'; // FIX: Goal → Diet_Type
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

    const filterFormula = `{Email} = "${email}"`;
    const encodedFormula = encodeURIComponent(filterFormula);
    const url = `${AIRTABLE_BASE_URL}?filterByFormula=${encodedFormula}&sort[0][field]=Created&sort[0][direction]=desc`;
    
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
        Diet_Type: record.fields?.Diet_Type || '', // FIX: Goal → Diet_Type
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

    const response = await fetch(`${AIRTABLE_BASE_URL}/${recordId}`, {
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

// 🗑️ ELIMINA PIANO
async function deletePlan(recordId: string) {
  try {
    console.log('🗑️ Deleting plan:', recordId);
    
    const response = await fetch(`${AIRTABLE_BASE_URL}/${recordId}`, {
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
    tableName: AIRTABLE_TABLE_NAME,
    availableActions: [
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
    version: '4.0.0-debug'
  });
}