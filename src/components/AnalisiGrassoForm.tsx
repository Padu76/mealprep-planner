'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, Check, AlertCircle, RefreshCw } from 'lucide-react';

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
  foto?: string[];
}

interface AnalisiGrassoFormProps {
  selectedDate: Date;
  existingData?: AnalisiGiorno | null;
  onSave: (data: AnalisiGiorno) => void;
  onClose: () => void;
}

export default function AnalisiGrassoForm({ selectedDate, existingData, onSave, onClose }: AnalisiGrassoFormProps) {
  const [formData, setFormData] = useState<AnalisiGiorno>({
    data: selectedDate,
    pasti: {
      colazione: [],
      spuntino_mattina: [],
      pranzo: [],
      spuntino_pomeriggio: [],
      cena: [],
      spuntino_sera: [],
      bevande_alcoliche: []
    },
    pliche: {
      mattino_addome: 0,
      mattino_fianchi: 0,
      colazione_post_addome: 0,
      colazione_post_fianchi: 0,
      spuntino_mattina_post_addome: 0,
      spuntino_mattina_post_fianchi: 0,
      pranzo_post_addome: 0,
      pranzo_post_fianchi: 0,
      spuntino_pomeriggio_post_addome: 0,
      spuntino_pomeriggio_post_fianchi: 0,
      cena_post_addome: 0,
      cena_post_fianchi: 0,
      spuntino_sera_post_addome: 0,
      spuntino_sera_post_fianchi: 0
    },
    idratazione: 0,
    sonno: 0,
    stress: 5,
    digestione: '',
    note: '',
    foto: []
  });

  const [activeTab, setActiveTab] = useState<'pasti' | 'pliche' | 'extra'>('pasti');
  const [newAlimento, setNewAlimento] = useState('');
  const [selectedPasto, setSelectedPasto] = useState<keyof AnalisiGiorno['pasti']>('colazione');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);
  
  // Modalità PT
  const [isPTMode, setIsPTMode] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);
  
  // Refs per evitare salvataggi multipli
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Aggiungi log di debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log('🔍 DEBUG:', logEntry);
    setDebugLog(prev => [...prev.slice(-10), logEntry]); // Mantieni solo gli ultimi 10 log
  };

  useEffect(() => {
    // Verifica modalità PT
    const urlParams = new URLSearchParams(window.location.search);
    const cliente = urlParams.get('cliente');
    
    if (cliente) {
      setIsPTMode(true);
      setClienteId(cliente);
      addDebugLog(`Modalità PT attivata per cliente: ${cliente}`);
      
      // Carica info cliente
      try {
        const savedClienti = JSON.parse(localStorage.getItem('pt_clienti') || '[]');
        const clienteData = savedClienti.find((c: any) => c.id === cliente);
        if (clienteData) {
          setClienteNome(clienteData.nome);
          addDebugLog(`Cliente trovato: ${clienteData.nome}`);
        } else {
          addDebugLog(`⚠️ Cliente non trovato per ID: ${cliente}`);
        }
      } catch (error) {
        addDebugLog(`❌ Errore caricamento cliente: ${error}`);
      }
    } else {
      addDebugLog('Modalità personale (non PT)');
    }
  }, []);

  // Carica dati esistenti
  useEffect(() => {
    if (existingData) {
      addDebugLog('Caricamento dati esistenti...');
      setFormData(existingData);
      setSaveStatus('saved');
      setSaveMessage('Dati caricati');
      addDebugLog(`Dati caricati: ${Object.keys(existingData.pasti).map(k => `${k}:${existingData.pasti[k as keyof typeof existingData.pasti].length}`).join(', ')}`);
    }
  }, [existingData]);

  // FUNZIONE DI SALVATAGGIO IMMEDIATO
  const saveDataNow = async (data: AnalisiGiorno, reason: string) => {
    if (isSavingRef.current) {
      addDebugLog(`⏸️ Salvataggio saltato (già in corso): ${reason}`);
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');
    setSaveMessage('Salvataggio...');
    addDebugLog(`💾 Inizio salvataggio: ${reason}`);

    try {
      // Determina chiave storage
      let storageKey = 'analisiGrassoData';
      if (isPTMode && clienteId) {
        storageKey = `analisiGrassoData_${clienteId}`;
      }
      
      addDebugLog(`🔑 Chiave storage: ${storageKey}`);

      // Prepara dati per salvataggio
      const dataToSave = {
        ...data,
        data: selectedDate.toISOString(),
        cliente_id: isPTMode ? clienteId : undefined
      };

      addDebugLog(`📊 Dati da salvare: ${JSON.stringify({
        pasti: Object.keys(dataToSave.pasti).map(k => `${k}:${dataToSave.pasti[k as keyof typeof dataToSave.pasti].length}`),
        pliche_mattino: `${dataToSave.pliche.mattino_addome}/${dataToSave.pliche.mattino_fianchi}`,
        idratazione: dataToSave.idratazione
      })}`);

      // Carica dati esistenti
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      addDebugLog(`📋 Dati esistenti: ${existingData.length} giorni`);

      // Rimuovi data esistente
      const dateString = selectedDate.toISOString().split('T')[0];
      const filteredData = existingData.filter((d: any) => {
        const existingDateString = new Date(d.data).toISOString().split('T')[0];
        return existingDateString !== dateString;
      });

      addDebugLog(`🗑️ Rimossi dati esistenti per ${dateString}`);

      // Aggiungi nuovi dati
      filteredData.push(dataToSave);
      addDebugLog(`➕ Aggiunti nuovi dati. Totale: ${filteredData.length} giorni`);

      // Salva in localStorage
      localStorage.setItem(storageKey, JSON.stringify(filteredData));
      addDebugLog(`✅ Salvato in localStorage con chiave: ${storageKey}`);

      // Verifica salvataggio
      const verification = localStorage.getItem(storageKey);
      if (verification) {
        const parsed = JSON.parse(verification);
        addDebugLog(`✅ Verifica salvataggio: ${parsed.length} giorni trovati`);
      } else {
        throw new Error('Verifica salvataggio fallita');
      }

      // Salva su Airtable
      try {
        addDebugLog('🌐 Tentativo salvataggio Airtable...');
        const response = await fetch('/api/analisi-grasso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveData',
            data: {
              ...dataToSave,
              user_email: isPTMode ? `pt_${clienteId}@example.com` : 'user@example.com'
            }
          })
        });

        const result = await response.json();
        if (result.success) {
          addDebugLog('✅ Salvato su Airtable');
          setSaveStatus('saved');
          setSaveMessage('Salvato su cloud ✓');
        } else {
          throw new Error(result.error);
        }
      } catch (airtableError) {
        addDebugLog(`⚠️ Airtable fallito: ${airtableError}`);
        setSaveStatus('saved');
        setSaveMessage('Salvato localmente ✓');
      }

      // Notifica parent
      onSave(data);
      addDebugLog('📢 Parent notificato del salvataggio');

    } catch (error) {
      addDebugLog(`❌ Errore salvataggio: ${error}`);
      setSaveStatus('error');
      setSaveMessage(`Errore: ${error}`);
    } finally {
      isSavingRef.current = false;
    }
  };

  // TRIGGER SALVATAGGIO CON DEBOUNCE
  const triggerSave = (reason: string) => {
    addDebugLog(`🔄 Trigger save: ${reason}`);
    
    // Cancella timeout precedente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Imposta nuovo timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveDataNow(formData, reason);
    }, 1000);
  };

  // SALVATAGGIO IMMEDIATO (per azioni importanti)
  const saveImmediately = (reason: string) => {
    addDebugLog(`⚡ Salvataggio immediato: ${reason}`);
    
    // Cancella timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveDataNow(formData, reason);
  };

  // Configurazione pasti
  const pastiConfig = [
    { id: 'colazione', label: 'Colazione', emoji: '🌅' },
    { id: 'spuntino_mattina', label: 'Spuntino Mattina', emoji: '🍎' },
    { id: 'pranzo', label: 'Pranzo', emoji: '☀️' },
    { id: 'spuntino_pomeriggio', label: 'Spuntino Pomeriggio', emoji: '🥨' },
    { id: 'cena', label: 'Cena', emoji: '🌙' },
    { id: 'spuntino_sera', label: 'Spuntino Sera', emoji: '🍪' },
    { id: 'bevande_alcoliche', label: 'Bevande Alcoliche', emoji: '🍷' }
  ];

  const alimentiComuni = [
    'Pane', 'Pasta', 'Riso', 'Quinoa', 'Avena', 'Cereali',
    'Pollo', 'Manzo', 'Pesce', 'Uova', 'Legumi', 'Tofu',
    'Latte', 'Yogurt', 'Formaggio', 'Ricotta', 'Mozzarella'
  ];

  const bevandeAlcoliche = [
    'Vino rosso', 'Vino bianco', 'Birra', 'Prosecco', 'Whisky', 'Vodka'
  ];

  // HANDLERS CON SALVATAGGIO
  const handleAddAlimento = () => {
    if (newAlimento.trim()) {
      const newFormData = {
        ...formData,
        pasti: {
          ...formData.pasti,
          [selectedPasto]: [...formData.pasti[selectedPasto], newAlimento.trim()]
        }
      };
      
      setFormData(newFormData);
      setNewAlimento('');
      
      // Salva immediatamente quando aggiungi un alimento
      setTimeout(() => saveDataNow(newFormData, `Aggiunto ${newAlimento} a ${selectedPasto}`), 100);
    }
  };

  const handleRemoveAlimento = (pasto: keyof AnalisiGiorno['pasti'], index: number) => {
    const alimentoRimosso = formData.pasti[pasto][index];
    const newFormData = {
      ...formData,
      pasti: {
        ...formData.pasti,
        [pasto]: formData.pasti[pasto].filter((_, i) => i !== index)
      }
    };
    
    setFormData(newFormData);
    
    // Salva immediatamente quando rimuovi un alimento
    setTimeout(() => saveDataNow(newFormData, `Rimosso ${alimentoRimosso} da ${pasto}`), 100);
  };

  const handlePlicheChange = (field: keyof AnalisiGiorno['pliche'], value: number) => {
    const newFormData = {
      ...formData,
      pliche: {
        ...formData.pliche,
        [field]: value
      }
    };
    
    setFormData(newFormData);
    triggerSave(`Pliche ${field}: ${value}`);
  };

  const handleExtraChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    triggerSave(`${field}: ${value}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">📝 Tracciamento Giornaliero</h2>
              {isPTMode && clienteNome && (
                <p className="text-sm text-green-100 mt-1">🏋️‍♂️ Cliente: {clienteNome}</p>
              )}
              <p className="text-green-100 mt-1">{formatDate(selectedDate)}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-green-100">
                {getSaveStatusIcon()}
                <span>{saveMessage}</span>
              </div>
              
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-green-900/20 border-b border-green-700 px-6 py-2 flex justify-between items-center">
          <p className="text-green-400 text-sm">
            💾 <strong>Salvataggio automatico attivo</strong> - Debug mode
          </p>
          <button
            onClick={() => saveImmediately('Test manuale')}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors"
          >
            Test Save
          </button>
        </div>

        <div className="flex">
          {/* Contenuto principale */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="border-b border-gray-700">
              <nav className="flex">
                {[
                  { id: 'pasti', label: '🍽️ Pasti' },
                  { id: 'pliche', label: '📏 Pliche' },
                  { id: 'extra', label: '📊 Extra' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-green-500 text-green-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* TAB PASTI */}
              {activeTab === 'pasti' && (
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-orange-400 mb-4">🍽️ Pasti & Bevande</h3>
                    
                    {/* Selettore Pasto */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                      {pastiConfig.map(pasto => (
                        <button
                          key={pasto.id}
                          type="button"
                          onClick={() => setSelectedPasto(pasto.id as any)}
                          className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                            selectedPasto === pasto.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {pasto.emoji} {pasto.label}
                        </button>
                      ))}
                    </div>

                    {/* Aggiunta Alimento */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newAlimento}
                        onChange={(e) => setNewAlimento(e.target.value)}
                        placeholder={`Aggiungi ${pastiConfig.find(p => p.id === selectedPasto)?.label.toLowerCase()}...`}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlimento())}
                      />
                      <button
                        type="button"
                        onClick={handleAddAlimento}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Suggerimenti */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Suggerimenti:</p>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPasto === 'bevande_alcoliche' ? bevandeAlcoliche : alimentiComuni).slice(0, 8).map(item => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setNewAlimento(item)}
                            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Lista Alimenti */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastiConfig.map(pasto => (
                        <div key={pasto.id} className="bg-gray-600 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-3">
                            {pasto.emoji} {pasto.label} ({formData.pasti[pasto.id as keyof typeof formData.pasti].length})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {formData.pasti[pasto.id as keyof typeof formData.pasti].map((alimento, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                                <span className="text-white text-sm">{alimento}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAlimento(pasto.id as any, index)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {formData.pasti[pasto.id as keyof typeof formData.pasti].length === 0 && (
                              <p className="text-gray-400 text-sm italic">Nessun elemento</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PLICHE */}
              {activeTab === 'pliche' && (
                <div className="space-y-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-400 mb-4">📏 Misurazioni Pliche</h3>
                    
                    {/* Riferimento Mattutino */}
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-blue-400 mb-3">🌅 Riferimento Mattutino</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Addome (mm)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.pliche.mattino_addome || ''}
                            onChange={(e) => handlePlicheChange('mattino_addome', parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Fianchi (mm)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={formData.pliche.mattino_fianchi || ''}
                            onChange={(e) => handlePlicheChange('mattino_fianchi', parseFloat(e.target.value) || 0)}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Post-Pasto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pastiConfig.slice(0, 6).map(pasto => (
                        <div key={pasto.id} className="bg-gray-600 rounded-lg p-4">
                          <h4 className="font-semibold text-white mb-3">
                            {pasto.emoji} Post-{pasto.label}
                          </h4>
                          <p className="text-xs text-gray-400 mb-3">⏱️ 90-120 min dopo</p>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Addome (mm)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.pliche[`${pasto.id}_post_addome` as keyof typeof formData.pliche] || ''}
                                onChange={(e) => handlePlicheChange(`${pasto.id}_post_addome` as any, parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0.0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Fianchi (mm)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={formData.pliche[`${pasto.id}_post_fianchi` as keyof typeof formData.pliche] || ''}
                                onChange={(e) => handlePlicheChange(`${pasto.id}_post_fianchi` as any, parseFloat(e.target.value) || 0)}
                                className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0.0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB EXTRA */}
              {activeTab === 'extra' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-cyan-400 mb-4">💧 Idratazione</h3>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.idratazione || ''}
                        onChange={(e) => handleExtraChange('idratazione', parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        placeholder="Litri bevuti"
                      />
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-purple-400 mb-4">😴 Sonno</h3>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.sonno || ''}
                        onChange={(e) => handleExtraChange('sonno', parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Ore dormite"
                      />
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-red-400 mb-4">😰 Stress (1-10)</h3>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.stress}
                        onChange={(e) => handleExtraChange('stress', parseInt(e.target.value))}
                        className="w-full mb-2"
                      />
                      <div className="text-center text-2xl font-bold text-red-400">{formData.stress}/10</div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-yellow-400 mb-4">📝 Note</h3>
                    <div className="space-y-4">
                      <textarea
                        value={formData.digestione}
                        onChange={(e) => handleExtraChange('digestione', e.target.value)}
                        placeholder="Come ti sei sentito durante la digestione?"
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={3}
                      />
                      <textarea
                        value={formData.note}
                        onChange={(e) => handleExtraChange('note', e.target.value)}
                        placeholder="Note aggiuntive..."
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debug Panel */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 p-4">
            <h4 className="font-bold text-yellow-400 mb-3">🔍 Debug Log</h4>
            <div className="space-y-1 text-xs text-gray-300 max-h-60 overflow-y-auto">
              {debugLog.map((log, index) => (
                <div key={index} className="font-mono bg-gray-800 p-2 rounded">
                  {log}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h5 className="font-semibold text-gray-400 mb-2">Stato Attuale:</h5>
              <div className="text-xs text-gray-300 space-y-1">
                <div>PT Mode: {isPTMode ? 'YES' : 'NO'}</div>
                <div>Cliente: {clienteNome || 'N/A'}</div>
                <div>Pasti: {Object.values(formData.pasti).flat().length}</div>
                <div>Pliche Mattino: {formData.pliche.mattino_addome}/{formData.pliche.mattino_fianchi}</div>
                <div>Idratazione: {formData.idratazione}L</div>
                <div>Status: {saveStatus}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                {getSaveStatusIcon()}
                <span className={saveStatus === 'saved' ? 'text-green-400' : 'text-gray-400'}>
                  {saveStatus === 'saved' && 'Tutti i dati salvati'}
                  {saveStatus === 'saving' && 'Salvataggio...'}
                  {saveStatus === 'error' && 'Errore salvataggio'}
                  {saveStatus === 'idle' && 'In attesa'}
                </span>
              </div>
              
              <button
                onClick={() => saveImmediately('Salvataggio manuale')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Forza Salvataggio
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}