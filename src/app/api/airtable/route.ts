// 🔧 FIX API AIRTABLE ROUTE - Aggiungi all'inizio del tuo /api/airtable/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    console.log('🔍 Airtable API called with action:', action);

    // 🧪 TEST CONNECTION ACTION
    if (action === 'testConnection') {
      console.log('🧪 Testing Airtable connection...');
      
      // Verifica variabili ambiente
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      
      if (!apiKey || !baseId) {
        return NextResponse.json({
          success: false,
          error: 'Missing Airtable credentials',
          details: {
            hasApiKey: !!apiKey,
            hasBaseId: !!baseId
          }
        }, { status: 500 });
      }
      
      // Test semplice: prova a leggere la tabella
      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/MealRequests?maxRecords=1`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ Airtable connection successful');
          return NextResponse.json({
            success: true,
            message: 'Airtable connection working',
            status: 'connected'
          });
        } else {
          const errorData = await response.json();
          console.log('❌ Airtable connection failed:', errorData);
          return NextResponse.json({
            success: false,
            error: 'Airtable connection failed',
            details: errorData
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

    // 💾 SAVE MEAL REQUEST ACTION  
    if (action === 'saveMealRequest') {
      console.log('💾 Saving meal request to Airtable...');
      
      if (!data) {
        return NextResponse.json({
          success: false,
          error: 'No data provided'
        }, { status: 400 });
      }

      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      
      if (!apiKey || !baseId) {
        return NextResponse.json({
          success: false,
          error: 'Missing Airtable credentials'
        }, { status: 500 });
      }

      try {
        const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/MealRequests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              nome: data.nome || '',
              email: data.email || '',
              age: data.age ? parseInt(data.age) : null,
              weight: data.weight ? parseFloat(data.weight) : null,
              height: data.height ? parseFloat(data.height) : null,
              gender: data.gender || '',
              activity_level: data.activity_level || '',
              goal: data.goal || '',
              duration: data.duration ? parseInt(data.duration) : null,
              meals_per_day: data.meals_per_day ? parseInt(data.meals_per_day) : null,
              exclusions: data.exclusions || '',
              foods_at_home: data.foods_at_home || '',
              phone: data.phone || '',
              created_at: new Date().toISOString(),
              status: 'new'
            }
          })
        });

        if (airtableResponse.ok) {
          const result = await airtableResponse.json();
          console.log('✅ Meal request saved successfully');
          return NextResponse.json({
            success: true,
            message: 'Meal request saved',
            recordId: result.id
          });
        } else {
          const errorData = await airtableResponse.json();
          console.log('❌ Failed to save meal request:', errorData);
          return NextResponse.json({
            success: false,
            error: 'Failed to save to Airtable',
            details: errorData
          }, { status: 400 });
        }
      } catch (saveError) {
        console.log('❌ Error saving to Airtable:', saveError);
        return NextResponse.json({
          success: false,
          error: 'Network error saving to Airtable',
          details: saveError instanceof Error ? saveError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // 📋 GET MEAL REQUESTS ACTION
    if (action === 'getMealRequests') {
      console.log('📋 Getting meal requests from Airtable...');
      
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      
      if (!apiKey || !baseId) {
        return NextResponse.json({
          success: false,
          error: 'Missing Airtable credentials'
        }, { status: 500 });
      }

      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/MealRequests?sort[0][field]=created_at&sort[0][direction]=desc`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Retrieved ${result.records?.length || 0} meal requests`);
          return NextResponse.json({
            success: true,
            records: result.records || [],
            total: result.records?.length || 0
          });
        } else {
          const errorData = await response.json();
          console.log('❌ Failed to get meal requests:', errorData);
          return NextResponse.json({
            success: false,
            error: 'Failed to get from Airtable',
            details: errorData
          }, { status: 400 });
        }
      } catch (getError) {
        console.log('❌ Error getting from Airtable:', getError);
        return NextResponse.json({
          success: false,
          error: 'Network error getting from Airtable',
          details: getError instanceof Error ? getError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // ❌ AZIONE NON RICONOSCIUTA
    console.log('❌ Unknown action:', action);
    return NextResponse.json({
      success: false,
      error: 'Azione non riconosciuta',
      availableActions: ['testConnection', 'saveMealRequest', 'getMealRequests'],
      receivedAction: action
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Airtable API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 🔧 GET method per status check
export async function GET() {
  return NextResponse.json({
    status: 'Airtable API is running',
    availableActions: ['testConnection', 'saveMealRequest', 'getMealRequests'],
    timestamp: new Date().toISOString()
  });
}