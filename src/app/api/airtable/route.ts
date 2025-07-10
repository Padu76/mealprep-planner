// 🔧 /src/app/api/airtable/route.ts - DASHBOARD SYNC FIXATA

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    console.log('🔍 Airtable API called with action:', action);

    // 🧪 TEST CONNECTION ACTION
    if (action === 'testConnection') {
      console.log('🧪 Testing Airtable connection...');
      
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

    // 💾 SAVE MEAL REQUEST ACTION - MAPPING CORRETTO
    if (action === 'saveMealRequest') {
      console.log('💾 Saving meal request to Airtable...');
      console.log('📝 Data received:', data);
      
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
        // 🔧 MAPPING CORRETTO GOAL E ACTIVITY
        const goalMapping: { [key: string]: string } = {
          'perdita-peso': 'perdita peso',
          'dimagrimento': 'dimagrimento',
          'aumento-massa': 'aumento massa',
          'mantenimento': 'mantenimento',
          'definizione': 'definizione',
          
          // Mapping per valori già corretti
          'perdita peso': 'perdita peso',
          'aumento massa': 'aumento massa'
        };

        const activityMapping: { [key: string]: string } = {
          'sedentario': 'sedentario',
          'leggero': 'leggero',
          'moderato': 'moderato',
          'intenso': 'intenso',
          'molto_intenso': 'molto intenso',
          
          // Mapping per valori con spazi
          'molto intenso': 'molto intenso'
        };

        const genderMapping: { [key: string]: string } = {
          'maschio': 'maschio',
          'femmina': 'femmina',
          'uomo': 'maschio',
          'donna': 'femmina'
        };

        // 🔧 PREPARA DATI CON MAPPING CORRETTO
        const airtableFields = {
          Nome: String(data.nome || ''),
          Email: String(data.email || sessionStorage?.getItem('userAuth') || ''),
          Age: data.age ? Number(data.age) : (data.eta ? Number(data.eta) : null),
          Weight: data.weight ? Number(data.weight) : (data.peso ? Number(data.peso) : null),
          Height: data.height ? Number(data.height) : (data.altezza ? Number(data.altezza) : null),
          Gender: genderMapping[String(data.gender || data.sesso || '').toLowerCase()] || String(data.gender || data.sesso || ''),
          Activity_Level: activityMapping[String(data.activity_level || data.attivita || '').toLowerCase()] || String(data.activity_level || data.attivita || ''),
          Goal: goalMapping[String(data.goal || data.obiettivo || '').toLowerCase()] || String(data.goal || data.obiettivo || ''),
          Duration: data.duration ? Number(data.duration) : (data.durata ? Number(data.durata) : null),
          Meals_Per_Day: data.meals_per_day ? Number(data.meals_per_day) : (data.pasti ? Number(data.pasti) : null),
          Exclusions: String(data.exclusions || (Array.isArray(data.allergie) ? data.allergie.join(', ') : data.allergie) || ''),
          Foods_At_Home: String(data.foods_at_home || (Array.isArray(data.preferenze) ? data.preferenze.join(', ') : data.preferenze) || ''),
          Phone: String(data.phone || data.telefono || ''),
          Status: 'In attesa',
          Source: 'Website Form',
          Variety: String(data.varieta || 'diversi')
        };

        // 🔧 NON AGGIUNGIAMO Created_At - Airtable lo gestisce automaticamente
        console.log('📤 Sending to Airtable:', airtableFields);

        const airtableResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: airtableFields
          })
        });

        console.log('📡 Airtable response status:', airtableResponse.status);

        if (airtableResponse.ok) {
          const result = await airtableResponse.json();
          console.log('✅ Meal request saved successfully:', result.id);
          return NextResponse.json({
            success: true,
            message: 'Meal request saved',
            recordId: result.id,
            savedData: airtableFields
          });
        } else {
          const errorData = await airtableResponse.json();
          console.log('❌ Airtable save failed:', errorData);
          
          return NextResponse.json({
            success: false,
            error: 'Failed to save to Airtable',
            details: errorData,
            sentData: airtableFields
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

    // 📋 GET MEAL REQUESTS ACTION - DASHBOARD SYNC
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
        // 🔧 ORDINAMENTO PER CREATED_AT
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests?sort[0][field]=Created_At&sort[0][direction]=desc`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('📡 getMealRequests response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Retrieved ${result.records?.length || 0} meal requests`);
          
          // 🔧 FORMATTA RECORD PER DASHBOARD
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
              Created_At: record.fields?.Created_At || record.createdTime || '',
              Status: record.fields?.Status || 'In attesa',
              Source: record.fields?.Source || 'Manual',
              Variety: record.fields?.Variety || 'diversi'
            },
            createdTime: record.createdTime || ''
          })) || [];

          return NextResponse.json({
            success: true,
            records: formattedRecords,
            total: formattedRecords.length,
            lastUpdated: new Date().toISOString()
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

    // 📊 GET DASHBOARD METRICS ACTION - METRICHE CORRETTE
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
          
          // 🔧 CALCOLA METRICHE ACCURATE
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

          // 🔧 CONTA PER OBIETTIVO
          const goalCounts: { [key: string]: number } = {};
          const activityCounts: { [key: string]: number } = {};

          records.forEach((record: any) => {
            const fields = record.fields || {};
            
            // 🔧 USA CREATED_AT O CREATED_TIME
            const createdDate = fields.Created_At || record.createdTime || '';
            const dateOnly = createdDate.split('T')[0];
            
            if (dateOnly === today) todayRequests++;
            if (dateOnly >= thisWeek) weekRequests++;
            if (dateOnly >= thisMonth) monthRequests++;
            
            // 🔧 CONTA STATUS
            const status = fields.Status || 'In attesa';
            if (status === 'Piano generato' || status === 'Completato') {
              completedRequests++;
            } else if (status === 'Elaborazione' || status === 'In corso') {
              processingRequests++;
            } else {
              pendingRequests++;
            }

            // 🔧 CONTA OBIETTIVI
            const goal = fields.Goal || 'Non specificato';
            goalCounts[goal] = (goalCounts[goal] || 0) + 1;

            // 🔧 CONTA ATTIVITÀ
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
            
            // 🔧 METRICHE AGGIUNTIVE
            goalDistribution: goalCounts,
            activityDistribution: activityCounts,
            avgRequestsPerDay: totalRequests > 0 ? Math.round((totalRequests / 30) * 10) / 10 : 0,
            
            // 🔧 CRESCITA
            growthRate: weekRequests > 0 ? Math.round(((weekRequests - todayRequests) / weekRequests) * 100) : 0,
            
            lastUpdated: new Date().toISOString()
          };

          console.log('✅ Dashboard metrics calculated:', metrics);

          return NextResponse.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
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

    // 👤 GET USER MEAL REQUESTS ACTION - DATI UTENTE
    if (action === 'getUserMealRequests') {
      console.log('👤 Getting user meal requests...');
      
      const { email } = data;
      if (!email) {
        return NextResponse.json({
          success: false,
          error: 'Email required'
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
        const filterFormula = `{Email} = "${email}"`;
        // 🔧 ORDINAMENTO PER CREATED_AT
        const response = await fetch(
          `https://api.airtable.com/v0/${baseId}/Meal_Requests?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Created_At&sort[0][direction]=desc`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Retrieved ${result.records?.length || 0} records for user ${email}`);
          
          // 🔧 FORMATTA RECORD UTENTE
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
              Created_At: record.fields?.Created_At || record.createdTime || '',
              Status: record.fields?.Status || 'In attesa',
              Source: record.fields?.Source || 'Manual',
              Variety: record.fields?.Variety || 'diversi'
            },
            createdTime: record.createdTime || ''
          })) || [];
          
          return NextResponse.json({
            success: true,
            records: formattedRecords,
            total: formattedRecords.length,
            userEmail: email
          });
        } else {
          const errorData = await response.json();
          console.log('❌ Failed to get user requests:', errorData);
          return NextResponse.json({
            success: false,
            error: 'Failed to get user data from Airtable',
            details: errorData
          }, { status: 400 });
        }
      } catch (getUserError) {
        console.log('❌ Error getting user data:', getUserError);
        return NextResponse.json({
          success: false,
          error: 'Network error getting user data',
          details: getUserError instanceof Error ? getUserError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // 🔧 UPDATE STATUS ACTION - NUOVA FUNZIONE
    if (action === 'updateStatus') {
      console.log('🔧 Updating record status...');
      
      const { recordId, newStatus } = data;
      if (!recordId || !newStatus) {
        return NextResponse.json({
          success: false,
          error: 'Record ID and new status required'
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
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Meal_Requests/${recordId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Status: newStatus
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Status updated successfully:', result.id);
          return NextResponse.json({
            success: true,
            message: 'Status updated',
            recordId: result.id,
            newStatus: newStatus
          });
        } else {
          const errorData = await response.json();
          console.log('❌ Failed to update status:', errorData);
          return NextResponse.json({
            success: false,
            error: 'Failed to update status',
            details: errorData
          }, { status: 400 });
        }
      } catch (updateError) {
        console.log('❌ Error updating status:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Network error updating status',
          details: updateError instanceof Error ? updateError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // ❌ AZIONE NON RICONOSCIUTA
    console.log('❌ Unknown action:', action);
    return NextResponse.json({
      success: false,
      error: 'Azione non riconosciuta',
      availableActions: [
        'testConnection', 
        'saveMealRequest', 
        'getMealRequests', 
        'getDashboardMetrics', 
        'getUserMealRequests',
        'updateStatus'
      ],
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
    availableActions: [
      'testConnection',
      'saveMealRequest', 
      'getMealRequests',
      'getDashboardMetrics',
      'getUserMealRequests',
      'updateStatus'
    ],
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
}