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
      { success: false, error: 'Internal server error' },
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

// 🧪 TEST CONNECTION
async function testConnection() {
  try {
    const response = await fetch(`${AIRTABLE_BASE_URL}?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Airtable connection successful');
      return NextResponse.json({
        success: true,
        message: 'Airtable connection working',
        status: 'connected',
        recordsFound: result.records?.length || 0,
        tableName: 'Meal_Requests'
      });
    } else {
      const errorData = await response.json();
      console.log('❌ Airtable connection failed:', errorData);
      return NextResponse.json({
        success: false,
        error: 'Airtable connection failed',
        details: errorData,
        tableName: 'Meal_Requests'
      }, { status: 400 });
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

// 💾 SALVA RICHIESTA MEAL PLAN
async function saveMealRequest(data: any) {
  try {
    const response = await fetch(AIRTABLE_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Nome: data.nome || '',
          Email: data.email || 'noemail@test.com',
          Age: data.age || data.eta || '',
          Weight: data.weight || data.peso || '',
          Height: data.height || data.altezza || '',
          Gender: data.gender || data.sesso || '',
          Activity_Level: data.activity_level || data.attivita || '',
          Goal: data.goal || data.obiettivo || '',
          Duration: data.duration || data.durata || '',
          Meals_Per_Day: data.meals_per_day || data.pasti || '',
          Exclusions: data.exclusions || '',
          Foods_At_Home: data.foods_at_home || '',
          Phone: data.phone || data.telefono || '',
          Status: 'In attesa',
          Source: 'Website Form'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable API Error Response:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save to Airtable',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Meal request saved successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Meal request saved successfully'
    });

  } catch (error) {
    console.error('Error saving meal request:', error);
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

// 💾 SALVA PIANO COMPLETO
async function saveMealPlan(data: any) {
  try {
    const response = await fetch(AIRTABLE_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Nome: data.nome || '',
          Email: data.email || 'noemail@test.com',
          Age: data.age || data.eta || '',
          Weight: data.weight || data.peso || '',
          Height: data.height || data.altezza || '',
          Gender: data.gender || data.sesso || '',
          Activity_Level: data.activity_level || data.attivita || '',
          Goal: data.goal || data.obiettivo || '',
          Duration: data.duration || data.durata || '',
          Meals_Per_Day: data.meals_per_day || data.pasti || '',
          Exclusions: data.exclusions || '',
          Foods_At_Home: data.foods_at_home || '',
          Phone: data.phone || data.telefono || '',
          Plan_Details: data.plan_details || '',
          Total_Calories: data.total_calories || 0,
          Daily_Calories: data.daily_calories || 0,
          Plan_Type: 'complete',
          Status: 'Piano generato',
          Source: 'Website Form'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable saveMealPlan Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save meal plan to Airtable',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Meal plan saved successfully:', result.id);

    return NextResponse.json({
      success: true,
      recordId: result.id,
      message: 'Meal plan saved successfully'
    });

  } catch (error) {
    console.error('Error saving meal plan:', error);
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

// 📊 CARICA PIANI UTENTE
async function getUserPlans(email: string) {
  try {
    const filterFormula = email && email !== 'default@user.com' 
      ? encodeURIComponent(`{Email} = "${email}"`)
      : '';
    
    const url = filterFormula 
      ? `${AIRTABLE_BASE_URL}?filterByFormula=${filterFormula}&sort[0][field]=Created&sort[0][direction]=desc`
      : `${AIRTABLE_BASE_URL}?sort[0][field]=Created&sort[0][direction]=desc&maxRecords=20`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable getUserPlans Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch user plans',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    const plans = result.records.map((record: any) => ({
      id: record.id,
      created_time: record.createdTime,
      nome: record.fields.Nome,
      email: record.fields.Email,
      age: record.fields.Age,
      weight: record.fields.Weight,
      height: record.fields.Height,
      gender: record.fields.Gender,
      activity_level: record.fields.Activity_Level,
      goal: record.fields.Goal,
      duration: record.fields.Duration,
      meals_per_day: record.fields.Meals_Per_Day,
      exclusions: record.fields.Exclusions,
      foods_at_home: record.fields.Foods_At_Home,
      phone: record.fields.Phone,
      plan_details: record.fields.Plan_Details,
      total_calories: record.fields.Total_Calories,
      daily_calories: record.fields.Daily_Calories,
      plan_type: record.fields.Plan_Type
    }));

    console.log(`✅ Fetched ${plans.length} plans for email: ${email}`);

    return NextResponse.json({
      success: true,
      plans: plans,
      count: plans.length
    });

  } catch (error) {
    console.error('Error fetching user plans:', error);
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

// 📋 GET MEAL REQUESTS (per dashboard admin)
async function getMealRequests() {
  try {
    const response = await fetch(`${AIRTABLE_BASE_URL}?sort[0][field]=Created&sort[0][direction]=desc`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable getMealRequests Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get from Airtable',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    const formattedRecords = result.records?.map((record: any) => ({
      id: record.id,
      fields: {
        Nome: record.fields?.Nome || '',
        Email: record.fields?.Email || '',
        Age: record.fields?.Age || 0,
        Weight: record.fields?.Weight || 0,
        Height: record.fields?.Height || 0,
        Gender: record.fields?.Gender || '',
        Activity_Level: record.fields?.Activity_Level || '',
        Goal: record.fields?.Goal || '',
        Duration: record.fields?.Duration || 0,
        Meals_Per_Day: record.fields?.Meals_Per_Day || 3,
        Exclusions: record.fields?.Exclusions || '',
        Foods_At_Home: record.fields?.Foods_At_Home || '',
        Phone: record.fields?.Phone || '',
        Status: record.fields?.Status || 'In attesa',
        Source: record.fields?.Source || 'Manual'
      },
      createdTime: record.createdTime || ''
    })) || [];

    console.log(`✅ Retrieved ${formattedRecords.length} meal requests`);

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      total: formattedRecords.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting meal requests:', error);
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

// 📊 GET DASHBOARD METRICS
async function getDashboardMetrics() {
  try {
    const response = await fetch(AIRTABLE_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable getDashboardMetrics Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get metrics from Airtable',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
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

    console.log('✅ Dashboard metrics calculated:', metrics);

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
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

// 👤 GET USER MEAL REQUESTS
async function getUserMealRequests(data: any) {
  try {
    const { email } = data;
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email required'
      }, { status: 400 });
    }

    const filterFormula = `{Email} = "${email}"`;
    const response = await fetch(
      `${AIRTABLE_BASE_URL}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Created&sort[0][direction]=desc`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable getUserMealRequests Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to get user data from Airtable',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    const formattedRecords = result.records?.map((record: any) => ({
      id: record.id,
      fields: {
        Nome: record.fields?.Nome || '',
        Email: record.fields?.Email || '',
        Age: record.fields?.Age || 0,
        Weight: record.fields?.Weight || 0,
        Height: record.fields?.Height || 0,
        Gender: record.fields?.Gender || '',
        Activity_Level: record.fields?.Activity_Level || '',
        Goal: record.fields?.Goal || '',
        Duration: record.fields?.Duration || 0,
        Meals_Per_Day: record.fields?.Meals_Per_Day || 3,
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
    console.error('Error getting user meal requests:', error);
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable updateStatus Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update status',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Status updated successfully:', result.id);

    return NextResponse.json({
      success: true,
      message: 'Status updated',
      recordId: result.id,
      newStatus: newStatus
    });

  } catch (error) {
    console.error('Error updating status:', error);
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
    const response = await fetch(`${AIRTABLE_BASE_URL}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable deletePlan Error:', errorData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete plan from Airtable',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Plan deleted successfully:', recordId);

    return NextResponse.json({
      success: true,
      deletedId: result.id,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting plan:', error);
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
    tableName: 'Meal_Requests',
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
    version: '3.0.0'
  });
}