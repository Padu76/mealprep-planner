// 🔧 FIX DASHBOARD UTENTE + RIMUOVI LOCALSTORAGE

// 1. FIX nel file che usa localStorage (probabilmente useFormData hook o simile)

// TROVA questa logica e SOSTITUISCILA:
/*
❌ VECCHIA LOGICA:
try {
  await saveToAirtable(data);
} catch (error) {
  // Fallback a localStorage
  localStorage.setItem('mealData', JSON.stringify(data));
}
*/

// ✅ NUOVA LOGICA:
const saveToAirtable = async (plan: any, formData: any) => {
  try {
    console.log('💾 Attempting to save to Airtable...');
    
    const response = await fetch('/api/airtable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'saveMealRequest',
        data: {
          nome: formData.nome,
          email: formData.email || 'user@example.com',
          age: formData.eta,
          weight: formData.peso,
          height: formData.altezza,
          gender: formData.sesso,
          activity_level: formData.attivita,
          goal: formData.obiettivo,
          duration: formData.durata,
          meals_per_day: formData.pasti,
          exclusions: Array.isArray(formData.allergie) ? formData.allergie.join(', ') : formData.allergie || '',
          foods_at_home: Array.isArray(formData.preferenze) ? formData.preferenze.join(', ') : formData.preferenze || '',
          phone: formData.telefono || ''
        }
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Saved to Airtable successfully:', result.recordId);
      return true;
    } else {
      console.log('❌ Airtable save failed:', result.error);
      // ❌ NON usare localStorage come fallback
      return false;
    }
  } catch (error) {
    console.log('⚠️ Airtable save error (non-blocking):', error);
    // ❌ NON usare localStorage come fallback
    return false;
  }
};

// 2. FIX DASHBOARD UTENTE - HOOK PERSONALIZZATO

export const useUserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prova prima con email se disponibile
      const userEmail = getUserEmail(); // Implementa questa funzione
      
      if (userEmail) {
        console.log('🔍 Loading user data for:', userEmail);
        
        const response = await fetch('/api/airtable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getUserMealRequests',
            data: { email: userEmail }
          })
        });
        
        const result = await response.json();
        
        if (result.success && result.records?.length > 0) {
          setUserData(result.records[0]); // Ultimo record dell'utente
          console.log('✅ User data loaded from Airtable');
        } else {
          console.log('📭 No user data found in Airtable');
          setUserData(null);
        }
      } else {
        console.log('📭 No user email available');
        setUserData(null);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setError('Errore nel caricamento dati utente');
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { userData, isLoading, error, refreshData: loadUserData };
};

// 3. FUNZIONE PER OTTENERE EMAIL UTENTE
const getUserEmail = (): string | null => {
  // Opzione 1: Da sessionStorage (se presente)
  try {
    const userAuth = sessionStorage.getItem('userAuth');
    if (userAuth && userAuth.includes('@')) {
      return userAuth;
    }
  } catch (error) {
    console.log('SessionStorage not available');
  }
  
  // Opzione 2: Da URL params
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email');
  if (emailParam) {
    return emailParam;
  }
  
  // Opzione 3: Prompt utente se necessario
  return null;
};

// 4. AGGIORNA API AIRTABLE per getUserMealRequests
// Aggiungi questo al route.ts:

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
    // Filtra per email utente
    const filterFormula = `{Email} = "${email}"`;
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
      
      return NextResponse.json({
        success: true,
        records: result.records || [],
        total: result.records?.length || 0
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

// 5. COMPONENTE DASHBOARD UTENTE SEMPLIFICATA
export const UserDashboard = () => {
  const { userData, isLoading, error, refreshData } = useUserDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-3">Caricamento dati utente...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Errore nel caricamento</h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button 
          onClick={refreshData}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-300 mb-4">Nessun dato trovato</h3>
        <p className="text-gray-400 mb-6">Non abbiamo trovato piani alimentari per il tuo account.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          Crea il Tuo Primo Piano
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-2xl font-bold text-green-400 mb-6">I Tuoi Dati Fitness</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Nome</label>
            <div className="text-white font-semibold">{userData.fields?.Nome || 'N/A'}</div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Obiettivo</label>
            <div className="text-green-400 font-semibold">{userData.fields?.Goal || 'N/A'}</div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Durata Piano</label>
            <div className="text-white">{userData.fields?.Duration || 0} giorni</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Età / Peso / Altezza</label>
            <div className="text-white">{userData.fields?.Age || 0} anni • {userData.fields?.Weight || 0} kg • {userData.fields?.Height || 0} cm</div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Livello Attività</label>
            <div className="text-blue-400">{userData.fields?.Activity_Level || 'N/A'}</div>
          </div>
          
          <div>
            <label className="text-sm text-gray-400">Stato</label>
            <div className="text-yellow-400">{userData.fields?.Status || 'In attesa'}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex gap-4">
          <button 
            onClick={refreshData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Aggiorna Dati
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Nuovo Piano
          </button>
        </div>
      </div>
    </div>
  );
};