import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Meal_Requests';

const AIRTABLE_BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, email } = body;

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
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
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

// 💾 SALVA RICHIESTA MEAL PLAN (ORIGINALE)
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
          Email: data.email || 'noemail@test.com', // ← FIX: RIMOSSO sessionStorage
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

// 💾 SALVA PIANO COMPLETO (NUOVO)
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
          Email: data.email || 'noemail@test.com', // ← FIX: RIMOSSO sessionStorage
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
          // 🆕 CAMPI PIANO COMPLETO
          Plan_Details: data.plan_details || '',
          Total_Calories: data.total_calories || 0,
          Daily_Calories: data.daily_calories || 0,
          Plan_Type: 'complete', // Distingue da semplici richieste
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

// 📊 CARICA PIANI UTENTE (NUOVO)
async function getUserPlans(email: string) {
  try {
    // Costruisci URL con filtro per email
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
    
    // Trasforma i record Airtable in formato utilizzabile
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

// 🗑️ ELIMINA PIANO (NUOVO)
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