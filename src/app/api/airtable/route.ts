// 🔧 FIX ROUTE.TS - Aggiorna nomi tabella per Meal_Requests

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
      
      // Test con nome tabella corretto: Meal_Requests
      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests?maxRecords=1`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
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
        // Usa nome tabella corretto: Meal_Requests
        const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Nome: data.nome || '',
              Email: data.email || '',
              Age: data.age ? parseInt(data.age) : null,
              Weight: data.weight ? parseFloat(data.weight) : null,
              Height: data.height ? parseFloat(data.height) : null,
              Gender: data.gender || '',
              Activity_Level: data.activity_level || '',
              Goal: data.goal || '',
              Duration: data.duration ? parseInt(data.duration) : null,
              Meals_Per_Day: data.meals_per_day ? parseInt(data.meals_per_day) : null,
              Exclusions: data.exclusions || '',
              Foods_At_Home: data.foods_at_home || '',
              Phone: data.phone || '',
              Created_At: new Date().toISOString(),
              Status: 'In attesa',
              Source: 'Website Form'
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
        // Usa nome tabella corretto: Meal_Requests
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests?sort[0][field]=Created_At&sort[0][direction]=desc`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Retrieved ${result.records?.length || 0} meal requests`);
          
          // Mappa i campi per compatibilità con la dashboard
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
              Created_At: record.fields?.Created_At || '',
              Status: record.fields?.Status || 'In attesa',
              Source: record.fields?.Source || 'Manual'
            }
          })) || [];

          return NextResponse.json({
            success: true,
            records: formattedRecords,
            total: formattedRecords.length
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

    // 📊 GET DASHBOARD METRICS ACTION
    if (action === 'getDashboardMetrics') {
      console.log('📊 Getting dashboard metrics...');
      
      const apiKey = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      
      if (!apiKey || !baseId) {
        return NextResponse.json({
          success: false,
          error: 'Missing Airtable credentials'
        }, { status: 500 });
      }

      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          const records = result.records || [];
          
          // Calcola metriche
          const today = new Date().toISOString().split('T')[0];
          const totalRequests = records.length;
          let todayRequests = 0;
          let completedRequests = 0;
          let processingRequests = 0;

          records.forEach((record: any) => {
            const fields = record.fields || {};
            
            if (fields.Created_At?.startsWith(today)) {
              todayRequests++;
            }
            
            const status = fields.Status || '';
            if (status === 'Piano generato' || status === 'Completato') {
              completedRequests++;
            } else if (status === 'Elaborazione' || status === 'In corso') {
              processingRequests++;
            }
          });

          const conversionRate = totalRequests > 0 ? 
            ((completedRequests / totalRequests) * 100) : 0;

          const metrics = {
            totalRequests,
            todayRequests,
            completedRequests,
            processingRequests,
            conversionRate: Math.round(conversionRate * 10) / 10,
            successRate: Math.round(conversionRate * 10) / 10
          };

          console.log('✅ Dashboard metrics calculated:', metrics);

          return NextResponse.json({
            success: true,
            data: metrics
          });
        } else {
          const errorData = await response.json();
          console.log('❌ Failed to get metrics:', errorData);
          return NextResponse.json({
            success: false,
            error: 'Failed to get metrics from Airtable',
            details: errorData
          }, { status: 400 });
        }
      } catch (metricsError) {
        console.log('❌ Error getting metrics:', metricsError);
        return NextResponse.json({
          success: false,
          error: 'Network error getting metrics',
          details: metricsError instanceof Error ? metricsError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // ❌ AZIONE NON RICONOSCIUTA
    console.log('❌ Unknown action:', action);
    return NextResponse.json({
      success: false,
      error: 'Azione non riconosciuta',
      availableActions: ['testConnection', 'saveMealRequest', 'getMealRequests', 'getDashboardMetrics'],
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
    tableName: 'Meal_Requests',
    availableActions: ['testConnection', 'saveMealRequest', 'getMealRequests', 'getDashboardMetrics'],
    timestamp: new Date().toISOString()
  });
}