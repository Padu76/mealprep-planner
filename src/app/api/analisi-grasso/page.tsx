'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, TrendingUp, Brain, BarChart3, Clock, User, Scale, Droplets, Activity, BrainCircuit } from 'lucide-react';
import Header from '../components/header';
import AnalisiGrassoForm from '../components/AnalisiGrassoForm';

interface AnalisiGiorno {
  data: Date;
  pasti: {
    colazione: string[];
    pranzo: string[];
    cena: string[];
  };
  pliche: {
    mattino_addome: number;
    mattino_fianchi: number;
    colazione_1h30_addome: number;
    colazione_1h30_fianchi: number;
    colazione_1h45_addome: number;
    colazione_1h45_fianchi: number;
    colazione_2h_addome: number;
    colazione_2h_fianchi: number;
    pranzo_1h30_addome: number;
    pranzo_1h30_fianchi: number;
    pranzo_1h45_addome: number;
    pranzo_1h45_fianchi: number;
    pranzo_2h_addome: number;
    pranzo_2h_fianchi: number;
    cena_1h30_addome: number;
    cena_1h30_fianchi: number;
    cena_1h45_addome: number;
    cena_1h45_fianchi: number;
    cena_2h_addome: number;
    cena_2h_fianchi: number;
  };
  idratazione: number;
  sonno?: number;
  stress?: number;
  digestione?: string;
  note?: string;
  foto?: string[];
}

interface AnalisiAI {
  cibi_trigger: {
    alimento: string;
    aumento_medio_pliche: number;
    frequenza_problemi: number;
    confidence_score: number;
  }[];
  trend_settimanale: {
    giorno: string;
    variazione_addome: number;
    variazione_fianchi: number;
    pasti_problematici: string[];
  }[];
  consigli: {
    tipo: 'evitare' | 'limitare' | 'preferire';
    alimento: string;
    motivo: string;
    evidenza: string;
  }[];
  metriche: {
    giorni_analizzati: number;
    variabilita_media: number;
    miglioramento_trend: boolean;
    food_score: number;
  };
}

export default function AnalisiGrassoPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savedData, setSavedData] = useState<AnalisiGiorno[]>([]);
  const [currentDayData, setCurrentDayData] = useState<AnalisiGiorno | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AnalisiAI | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carica dati salvati
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const data = JSON.parse(localStorage.getItem('analisiGrassoData') || '[]');
        setSavedData(data);
        
        // Cerca dati per la data selezionata
        const dayData = data.find((d: any) => 
          new Date(d.data).toDateString() === selectedDate.toDateString()
        );
        setCurrentDayData(dayData || null);
      } catch (error) {
        console.error('Errore caricamento dati:', error);
      }
    };

    loadSavedData();
  }, [selectedDate]);

  const handleSaveData = (data: AnalisiGiorno) => {
    // Aggiorna i dati salvati
    const updatedData = savedData.filter(d => 
      new Date(d.data).toDateString() !== selectedDate.toDateString()
    );
    updatedData.push(data);
    setSavedData(updatedData);
    setCurrentDayData(data);
  };

  // Genera analisi AI
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
          data: savedData
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
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="text-center py-12 px-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📊 Analisi del Grasso
          </h1>
          <p className="text-lg text-gray-200 mb-6">
            Identifica gli alimenti che causano gonfiore e ritenzione attraverso il tracciamento giornaliero di pasti e misurazioni pliche.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-semibold">🎯 Pattern Recognition</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-semibold">🧠 AI Analysis</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-semibold">📈 Trend Analysis</span>
            </div>
          </div>
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
          {/* Colonna 1: Calendario */}
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

          {/* Colonna 2: Giorno Selezionato */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">
                  📋 {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {currentDayData ? 'Modifica' : 'Aggiungi'} Dati
                </button>
              </div>

              {currentDayData ? (
                <div className="space-y-6">
                  {/* Pasti */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-orange-400 mb-3">🍽️ Pasti Consumati</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(currentDayData.pasti).map(([tipo, alimenti]) => (
                        <div key={tipo} className="bg-gray-600 rounded-lg p-3">
                          <h4 className="font-semibold text-sm text-green-400 mb-2 capitalize">{tipo}</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {alimenti.map((alimento, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                {alimento}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pliche */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold text-blue-400 mb-3">📏 Misurazioni Pliche</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-600 rounded-lg p-3">
                        <h4 className="font-semibold text-sm text-blue-400 mb-2">Addome</h4>
                        <div className="text-sm text-gray-300">
                          <p>Mattino: {currentDayData.pliche.mattino_addome}mm</p>
                          <p>Post-colazione: {currentDayData.pliche.colazione_2h_addome}mm</p>
                          <p>Post-pranzo: {currentDayData.pliche.pranzo_2h_addome}mm</p>
                          <p>Post-cena: {currentDayData.pliche.cena_2h_addome}mm</p>
                        </div>
                      </div>
                      <div className="bg-gray-600 rounded-lg p-3">
                        <h4 className="font-semibold text-sm text-blue-400 mb-2">Fianchi</h4>
                        <div className="text-sm text-gray-300">
                          <p>Mattino: {currentDayData.pliche.mattino_fianchi}mm</p>
                          <p>Post-colazione: {currentDayData.pliche.colazione_2h_fianchi}mm</p>
                          <p>Post-pranzo: {currentDayData.pliche.pranzo_2h_fianchi}mm</p>
                          <p>Post-cena: {currentDayData.pliche.cena_2h_fianchi}mm</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parametri aggiuntivi */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-400 mb-2">💧 Idratazione</h4>
                      <p className="text-2xl font-bold text-cyan-400">{currentDayData.idratazione}L</p>
                    </div>
                    {currentDayData.sonno && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-400 mb-2">😴 Sonno</h4>
                        <p className="text-2xl font-bold text-purple-400">{currentDayData.sonno}h</p>
                      </div>
                    )}
                    {currentDayData.stress && (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-red-400 mb-2">😰 Stress</h4>
                        <p className="text-2xl font-bold text-red-400">{currentDayData.stress}/10</p>
                      </div>
                    )}
                  </div>

                  {currentDayData.digestione && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">🤢 Note Digestione</h4>
                      <p className="text-gray-300">{currentDayData.digestione}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nessun dato per questa giornata</p>
                    <p className="text-sm">Clicca "Aggiungi Dati" per iniziare il tracciamento</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sezione AI Analysis */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-400">🧠 AI Analysis Engine</h2>
              <button
                onClick={generateAIAnalysis}
                disabled={savedData.length < 3 || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <BrainCircuit className="w-5 h-5" />
                )}
                {isLoading ? 'Analizzando...' : 'Genera Analisi AI'}
              </button>
            </div>

            {savedData.length < 3 ? (
              <div className="text-center py-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg text-gray-400 mb-2">Analisi AI disponibile con 3+ giorni di dati</p>
                <p className="text-sm text-gray-500">
                  Hai tracciato {savedData.length}/3 giorni. Continua a registrare i tuoi dati!
                </p>
              </div>
            ) : aiAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cibi Trigger */}
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

                {/* Consigli AI */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-bold text-green-400 mb-3">💡 Consigli Personalizzati</h3>
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
                <BrainCircuit className="w-16 h-16 mx-auto mb-4 text-gray-600" />
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