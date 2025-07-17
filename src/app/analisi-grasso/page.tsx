'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, TrendingUp, Brain, BarChart3, User, ArrowLeft, MessageSquare, Wine } from 'lucide-react';
import Header from '@/components/header';
import AnalisiGrassoForm from '@/components/AnalisiGrassoForm';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  obiettivo: string;
  eta: number;
}

interface AnalisiGiorno {
  data: Date;
  cliente_id?: string;
  pasti: {
    colazione: string[];
    spuntino_mattina: string[];
    pranzo: string[];
    spuntino_pomeriggio: string[];
    cena: string[];
    spuntino_sera: string[];
    bevande_alcoliche: string[];
  };
  pliche: {
    mattino_addome: number;
    mattino_fianchi: number;
    colazione_post_addome: number;
    colazione_post_fianchi: number;
    spuntino_mattina_post_addome: number;
    spuntino_mattina_post_fianchi: number;
    pranzo_post_addome: number;
    pranzo_post_fianchi: number;
    spuntino_pomeriggio_post_addome: number;
    spuntino_pomeriggio_post_fianchi: number;
    cena_post_addome: number;
    cena_post_fianchi: number;
    spuntino_sera_post_addome: number;
    spuntino_sera_post_fianchi: number;
  };
  idratazione: number;
  sonno?: number;
  stress?: number;
  digestione?: string;
  note?: string;
  note_pt?: string;
  foto?: string[];
}

interface AnalisiAI {
  cibi_trigger: {
    alimento: string;
    aumento_medio_pliche: number;
    frequenza_problemi: number;
    confidence_score: number;
  }[];
  consigli: {
    tipo: 'evitare' | 'limitare' | 'preferire';
    alimento: string;
    motivo: string;
    evidenza: string;
  }[];
  metriche: {
    giorni_analizzati: number;
    food_score: number;
  };
}

export default function AnalisiGrassoPTPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savedData, setSavedData] = useState<AnalisiGiorno[]>([]);
  const [currentDayData, setCurrentDayData] = useState<AnalisiGiorno | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AnalisiAI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPTMode, setIsPTMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [ptNotes, setPtNotes] = useState('');

  // Configurazione pasti per la visualizzazione
  const pastiConfig = [
    { id: 'colazione', label: 'Colazione', emoji: '🌅', color: 'orange' },
    { id: 'spuntino_mattina', label: 'Spuntino Mattina', emoji: '🍎', color: 'green' },
    { id: 'pranzo', label: 'Pranzo', emoji: '☀️', color: 'yellow' },
    { id: 'spuntino_pomeriggio', label: 'Spuntino Pomeriggio', emoji: '🥨', color: 'blue' },
    { id: 'cena', label: 'Cena', emoji: '🌙', color: 'purple' },
    { id: 'spuntino_sera', label: 'Spuntino Sera', emoji: '🍪', color: 'indigo' },
    { id: 'bevande_alcoliche', label: 'Bevande Alcoliche', emoji: '🍷', color: 'red' }
  ];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('cliente');
    
    console.log('🔍 URL Params - Cliente ID:', clienteId);
    
    if (clienteId) {
      setIsPTMode(true);
      loadCliente(clienteId);
    } else {
      setIsPTMode(false);
      setSelectedCliente(null);
    }

    loadClienti();
  }, []);

  useEffect(() => {
    if (isPTMode && selectedCliente) {
      console.log('📊 Loading data for cliente:', selectedCliente.nome);
      loadSavedData();
    } else if (!isPTMode) {
      console.log('👤 Loading personal data');
      loadSavedData();
    }
  }, [selectedDate, selectedCliente, isPTMode]);

  const loadCliente = (clienteId: string) => {
    try {
      console.log('👤 Loading cliente:', clienteId);
      const savedClienti = JSON.parse(localStorage.getItem('pt_clienti') || '[]');
      console.log('📋 All clients:', savedClienti);
      
      const cliente = savedClienti.find((c: Cliente) => c.id === clienteId);
      console.log('✅ Found cliente:', cliente);
      
      if (cliente) {
        setSelectedCliente(cliente);
        console.log('🎯 Cliente set:', cliente.nome);
      } else {
        console.error('❌ Cliente not found for ID:', clienteId);
        setSelectedCliente(null);
      }
    } catch (error) {
      console.error('❌ Error loading cliente:', error);
      setSelectedCliente(null);
    }
  };

  const loadClienti = () => {
    try {
      const savedClienti = JSON.parse(localStorage.getItem('pt_clienti') || '[]');
      setClienti(savedClienti);
      console.log('📋 Loaded', savedClienti.length, 'clients');
    } catch (error) {
      console.error('❌ Error loading clients:', error);
    }
  };

  const loadSavedData = () => {
    try {
      // Determina la chiave di storage
      let storageKey = 'analisiGrassoData'; // Default per uso personale
      
      if (isPTMode && selectedCliente) {
        storageKey = `analisiGrassoData_${selectedCliente.id}`;
        console.log('🔑 Using PT storage key:', storageKey);
      } else {
        console.log('🔑 Using personal storage key:', storageKey);
      }
      
      const dataString = localStorage.getItem(storageKey);
      console.log('💾 Raw data from localStorage:', dataString);
      
      if (dataString) {
        const data = JSON.parse(dataString);
        console.log('📊 Parsed data:', data);
        
        // Converti le stringhe date in oggetti Date
        const processedData = data.map((item: any) => ({
          ...item,
          data: new Date(item.data)
        }));
        
        setSavedData(processedData);
        console.log('✅ Loaded', processedData.length, 'days of data');
        
        // Cerca dati per la data selezionata
        const dayData = processedData.find((d: any) => 
          new Date(d.data).toDateString() === selectedDate.toDateString()
        );
        
        if (dayData) {
          setCurrentDayData(dayData);
          setPtNotes(dayData.note_pt || '');
          console.log('📅 Found data for selected date:', dayData);
        } else {
          setCurrentDayData(null);
          setPtNotes('');
          console.log('📅 No data for selected date');
        }
      } else {
        console.log('💾 No data found in localStorage');
        setSavedData([]);
        setCurrentDayData(null);
        setPtNotes('');
      }
    } catch (error) {
      console.error('❌ Error loading saved data:', error);
      setSavedData([]);
      setCurrentDayData(null);
      setPtNotes('');
    }
  };

  const handleSaveData = (data: AnalisiGiorno) => {
    console.log('💾 Saving data:', data);
    
    // Rimuovi dati esistenti per questa data
    const updatedData = savedData.filter(d => 
      new Date(d.data).toDateString() !== selectedDate.toDateString()
    );
    
    // Aggiungi ID cliente se in modalità PT
    if (isPTMode && selectedCliente) {
      data.cliente_id = selectedCliente.id;
      console.log('🏋️‍♂️ Adding cliente_id:', selectedCliente.id);
    }
    
    // Aggiungi i nuovi dati
    updatedData.push(data);
    
    // Determina la chiave di storage
    let storageKey = 'analisiGrassoData';
    if (isPTMode && selectedCliente) {
      storageKey = `analisiGrassoData_${selectedCliente.id}`;
    }
    
    console.log('🔑 Saving to storage key:', storageKey);
    console.log('📊 Data to save:', updatedData);
    
    try {
      // Salva nel localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
      console.log('✅ Data saved successfully');
      
      // Aggiorna lo stato
      setSavedData(updatedData);
      setCurrentDayData(data);
      
      // Mostra conferma
      if (isPTMode && selectedCliente) {
        alert(`✅ Dati salvati per ${selectedCliente.nome}!`);
      } else {
        alert('✅ Dati salvati!');
      }
      
    } catch (error) {
      console.error('❌ Error saving data:', error);
      alert('❌ Errore nel salvataggio dei dati');
    }
  };

  const handleSavePTNotes = () => {
    if (!currentDayData) {
      alert('❌ Nessun dato da modificare');
      return;
    }
    
    console.log('📝 Saving PT notes:', ptNotes);
    
    const updatedData = { ...currentDayData, note_pt: ptNotes };
    const allData = savedData.map(d => 
      new Date(d.data).toDateString() === selectedDate.toDateString() ? updatedData : d
    );
    
    const storageKey = isPTMode && selectedCliente 
      ? `analisiGrassoData_${selectedCliente.id}` 
      : 'analisiGrassoData';
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(allData));
      setCurrentDayData(updatedData);
      setSavedData(allData);
      alert('✅ Note PT salvate!');
      console.log('✅ PT notes saved successfully');
    } catch (error) {
      console.error('❌ Error saving PT notes:', error);
      alert('❌ Errore nel salvataggio delle note');
    }
  };

  const generateAIAnalysis = async () => {
    if (savedData.length < 3) {
      alert('⚠️ Servono almeno 3 giorni di dati per l\'analisi AI');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analisi-grasso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateAnalysis',
          data: savedData,
          cliente_id: selectedCliente?.id,
          pt_mode: isPTMode
        })
      });

      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.analysis);
      } else {
        alert('Errore nell\'analisi AI: ' + result.error);
      }
    } catch (error) {
      console.error('Errore analisi AI:', error);
      alert('Errore connessione AI');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayStatus = (date: Date) => {
    const dayData = savedData.find(d => 
      new Date(d.data).toDateString() === date.toDateString()
    );
    return dayData ? 'complete' : 'empty';
  };

  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate);
      const status = getDayStatus(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isCurrentMonth = date.getMonth() === currentMonth;

      days.push(
        <button
          key={i}
          onClick={() => setSelectedDate(date)}
          className={`p-2 text-sm rounded-lg transition-all ${
            isSelected 
              ? 'bg-green-600 text-white' 
              : isToday 
                ? 'bg-blue-600 text-white' 
                : isCurrentMonth 
                  ? status === 'complete' 
                    ? 'bg-green-800 text-green-300 hover:bg-green-700' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-800 text-gray-600'
          }`}
        >
          <div className="font-medium">{date.getDate()}</div>
          {status === 'complete' && (
            <div className="w-1 h-1 bg-green-400 rounded-full mx-auto mt-1"></div>
          )}
        </button>
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getColorClass = (color: string) => {
    const colors = {
      orange: 'bg-orange-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      indigo: 'bg-indigo-600',
      red: 'bg-red-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-600';
  };

  // Debug info (rimuovi in produzione)
  if (typeof window !== 'undefined') {
    console.log('🔍 Debug Info:', {
      isPTMode,
      selectedCliente: selectedCliente?.nome,
      savedDataLength: savedData.length,
      currentDayData: currentDayData ? 'present' : 'null',
      selectedDate: selectedDate.toDateString()
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      {/* Header PT Mode */}
      {isPTMode && (
        <div className="bg-blue-900/20 border-b border-blue-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedCliente?.nome.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-400">
                      🏋️‍♂️ Modalità Personal Trainer
                    </h2>
                    <p className="text-gray-300">
                      Monitoraggio per: <span className="font-semibold text-white">
                        {selectedCliente?.nome || 'Cliente non trovato'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {selectedCliente && (
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Obiettivo</div>
                    <div className="font-semibold text-green-400">{selectedCliente.obiettivo}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-12 px-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📊 Analisi del Grasso
            {isPTMode && selectedCliente && (
              <span className="text-2xl block mt-2">Cliente: {selectedCliente.nome}</span>
            )}
          </h1>
          <p className="text-lg text-gray-200 mb-6">
            {isPTMode 
              ? 'Monitora i progressi del tuo cliente attraverso il tracciamento giornaliero'
              : 'Identifica gli alimenti che causano gonfiore e ritenzione attraverso il tracciamento giornaliero di pasti e misurazioni pliche'
            }
          </p>
          
          {/* Debug info in development */}
          {isPTMode && !selectedCliente && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mt-4">
              <p className="text-red-400">⚠️ Cliente non trovato o non selezionato</p>
              <p className="text-sm text-red-300">Verifica che il link contenga l'ID cliente corretto</p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-400">{savedData.length}</div>
                <div className="text-sm text-gray-400">Giorni tracciati</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {savedData.length >= 3 ? '✓' : '⏳'}
                </div>
                <div className="text-sm text-gray-400">Analisi AI</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {aiAnalysis?.cibi_trigger.length || 0}
                </div>
                <div className="text-sm text-gray-400">Cibi trigger</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {aiAnalysis?.metriche.food_score || 0}
                </div>
                <div className="text-sm text-gray-400">Food Score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendario */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">📅 Calendario Tracciamento</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
                  <div key={day} className="text-center text-sm text-gray-400 font-medium p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span>Dati completi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Oggi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                  <span>Nessun dato</span>
                </div>
              </div>
            </div>
          </div>

          {/* Giorno Selezionato */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">
                  📋 {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  disabled={isPTMode && !selectedCliente}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {currentDayData ? 'Modifica' : 'Aggiungi'} Dati
                </button>
              </div>

              {currentDayData ? (
                <div className="space-y-6">
                  {/* Pasti & Bevande */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-orange-400 mb-3">🍽️ Pasti & Bevande Consumate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastiConfig.map(pasto => (
                        <div key={pasto.id} className="bg-gray-600 rounded-lg p-3">
                          <h4 className="font-semibold text-sm text-white mb-2 flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${getColorClass(pasto.color)}`}></span>
                            {pasto.emoji} {pasto.label}
                          </h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {currentDayData.pasti[pasto.id as keyof typeof currentDayData.pasti].map((alimento, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                {alimento}
                              </li>
                            ))}
                            {currentDayData.pasti[pasto.id as keyof typeof currentDayData.pasti].length === 0 && (
                              <li className="text-gray-500 italic">Nessun elemento</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Misurazioni Pliche */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-blue-400 mb-3">📏 Misurazioni Pliche</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-400 mb-2">🌅 Mattutino</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Addome:</span>
                            <span className="font-bold text-blue-300">{currentDayData.pliche.mattino_addome}mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fianchi:</span>
                            <span className="font-bold text-blue-300">{currentDayData.pliche.mattino_fianchi}mm</span>
                          </div>
                        </div>
                      </div>
                      
                      {pastiConfig.slice(0, 6).map(pasto => {
                        const addome = currentDayData.pliche[`${pasto.id}_post_addome` as keyof typeof currentDayData.pliche];
                        const fianchi = currentDayData.pliche[`${pasto.id}_post_fianchi` as keyof typeof currentDayData.pliche];
                        
                        if (addome === 0 && fianchi === 0) return null;
                        
                        return (
                          <div key={pasto.id} className="bg-gray-600 rounded-lg p-3">
                            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${getColorClass(pasto.color)}`}></span>
                              {pasto.emoji} Post-{pasto.label}
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Addome:</span>
                                <span className="font-bold text-white">{addome}mm</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fianchi:</span>
                                <span className="font-bold text-white">{fianchi}mm</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dati Extra */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-cyan-400 mb-3">📊 Dati Extra</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-sm text-gray-300 mb-1">💧 Idratazione</div>
                        <div className="text-lg font-bold text-cyan-400">{currentDayData.idratazione}L</div>
                      </div>
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-sm text-gray-300 mb-1">😴 Sonno</div>
                        <div className="text-lg font-bold text-purple-400">{currentDayData.sonno || 0}h</div>
                      </div>
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-sm text-gray-300 mb-1">😰 Stress</div>
                        <div className="text-lg font-bold text-red-400">{currentDayData.stress || 5}/10</div>
                      </div>
                    </div>
                    
                    {(currentDayData.digestione || currentDayData.note) && (
                      <div className="mt-4 space-y-3">
                        {currentDayData.digestione && (
                          <div className="bg-gray-600 rounded-lg p-3">
                            <div className="text-sm text-gray-300 mb-1">🤢 Digestione</div>
                            <div className="text-sm text-white">{currentDayData.digestione}</div>
                          </div>
                        )}
                        {currentDayData.note && (
                          <div className="bg-gray-600 rounded-lg p-3">
                            <div className="text-sm text-gray-300 mb-1">📝 Note</div>
                            <div className="text-sm text-white">{currentDayData.note}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Note PT */}
                  {isPTMode && (
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                      <h3 className="font-bold text-blue-400 mb-3">🏋️‍♂️ Note Personal Trainer</h3>
                      <div className="space-y-3">
                        <textarea
                          value={ptNotes}
                          onChange={(e) => setPtNotes(e.target.value)}
                          placeholder="Aggiungi note professionali per questo cliente..."
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <button
                            onClick={handleSavePTNotes}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Salva Note PT
                          </button>
                          {currentDayData.note_pt && (
                            <span className="text-sm text-gray-400">
                              Ultima modifica: {new Date().toLocaleDateString('it-IT')}
                            </span>
                          )}
                        </div>
                        {currentDayData.note_pt && (
                          <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-300">{currentDayData.note_pt}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      {isPTMode && selectedCliente
                        ? `Nessun dato per ${selectedCliente.nome} in questa giornata`
                        : isPTMode && !selectedCliente
                        ? 'Cliente non selezionato'
                        : 'Nessun dato per questa giornata'
                      }
                    </p>
                    <p className="text-sm">
                      {isPTMode && selectedCliente
                        ? 'Clicca "Aggiungi Dati" per iniziare il tracciamento'
                        : isPTMode && !selectedCliente
                        ? 'Verifica il link o torna alla dashboard PT'
                        : 'Clicca "Aggiungi Dati" per iniziare il tracciamento'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-400">
                🧠 AI Analysis Engine
                {isPTMode && selectedCliente && (
                  <span className="text-lg block text-blue-400">Cliente: {selectedCliente.nome}</span>
                )}
              </h2>
              <button
                onClick={generateAIAnalysis}
                disabled={savedData.length < 3 || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Brain className="w-5 h-5" />
                )}
                {isLoading ? 'Analizzando...' : 'Genera Analisi AI'}
              </button>
            </div>

            {savedData.length < 3 ? (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg text-gray-400 mb-2">
                  {isPTMode && selectedCliente
                    ? `Analisi AI per ${selectedCliente.nome} disponibile con 3+ giorni di dati`
                    : 'Analisi AI disponibile con 3+ giorni di dati'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Hai tracciato {savedData.length}/3 giorni. Continua a registrare i dati!
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-red-400 mb-3">🚨 Cibi Trigger Identificati</h3>
                  <div className="space-y-2">
                    {aiAnalysis.cibi_trigger.map((trigger, idx) => (
                      <div key={idx} className="bg-gray-600 rounded p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white">{trigger.alimento}</span>
                          <span className="text-red-400 text-sm">+{trigger.aumento_medio_pliche}mm</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Confidence: {trigger.confidence_score}% | Frequenza: {trigger.frequenza_problemi}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-green-400 mb-3">
                    💡 Consigli{isPTMode ? ' per il Cliente' : ' Personalizzati'}
                  </h3>
                  <div className="space-y-3">
                    {aiAnalysis.consigli.map((consiglio, idx) => (
                      <div key={idx} className="bg-gray-600 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            consiglio.tipo === 'evitare' ? 'bg-red-600 text-white' :
                            consiglio.tipo === 'limitare' ? 'bg-yellow-600 text-white' :
                            'bg-green-600 text-white'
                          }`}>
                            {consiglio.tipo}
                          </span>
                          <span className="font-semibold text-white">{consiglio.alimento}</span>
                        </div>
                        <p className="text-sm text-gray-300">{consiglio.motivo}</p>
                        <p className="text-xs text-gray-400">Evidenza: {consiglio.evidenza}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg text-gray-400">Pronto per l'analisi AI!</p>
                <p className="text-sm text-gray-500">Clicca "Genera Analisi AI" per iniziare</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AnalisiGrassoForm
          selectedDate={selectedDate}
          existingData={currentDayData}
          onSave={handleSaveData}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}