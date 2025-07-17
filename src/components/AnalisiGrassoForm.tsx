'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Check, AlertCircle, RefreshCw, Scale } from 'lucide-react';

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
    addome: number;
    fianchi: number;
  };
  peso: number;
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
      addome: 0,
      fianchi: 0
    },
    peso: 0,
    idratazione: 0,
    sonno: 0,
    stress: 5,
    digestione: '',
    note: '',
    foto: []
  });

  const [activeTab, setActiveTab] = useState<'pasti' | 'misurazioni' | 'extra'>('pasti');
  const [newAlimento, setNewAlimento] = useState('');
  const [selectedPasto, setSelectedPasto] = useState<keyof AnalisiGiorno['pasti']>('colazione');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Modalità PT
  const [isPTMode, setIsPTMode] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);
  
  // Refs per evitare salvataggi multipli
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // FUNZIONE MIGRAZIONE DATI PLICHE VECCHI → NUOVI
  const migrateOldPlicheData = (oldData: any): AnalisiGiorno => {
    console.log('🔄 Migrating old pliche data:', oldData);
    
    // Se ha già la struttura nuova, ritorna così com'è
    if (oldData.pliche && typeof oldData.pliche.addome === 'number') {
      console.log('✅ Data already in new format');
      return oldData;
    }
    
    // Migrazione da struttura vecchia a nuova
    const migratedData = {
      ...oldData,
      pliche: {
        addome: oldData.pliche?.mattino_addome || 0,
        fianchi: oldData.pliche?.mattino_fianchi || 0
      }
    };
    
    console.log('✅ Migrated data:', migratedData);
    return migratedData;
  };

  useEffect(() => {
    // Verifica modalità PT
    const urlParams = new URLSearchParams(window.location.search);
    const cliente = urlParams.get('cliente');
    
    if (cliente) {
      setIsPTMode(true);
      setClienteId(cliente);
      
      // Carica info cliente
      try {
        const savedClienti = JSON.parse(localStorage.getItem('pt_clienti') || '[]');
        const clienteData = savedClienti.find((c: any) => c.id === cliente);
        if (clienteData) {
          setClienteNome(clienteData.nome);
        }
      } catch (error) {
        console.error('Errore caricamento cliente:', error);
      }
    }
  }, []);

  // Carica dati esistenti con migrazione
  useEffect(() => {
    if (existingData) {
      console.log('📥 Loading existing data:', existingData);
      
      // Migra dati vecchi se necessario
      const migratedData = migrateOldPlicheData(existingData);
      
      // Assicurati che tutti i campi siano definiti
      const safeData: AnalisiGiorno = {
        data: migratedData.data,
        cliente_id: migratedData.cliente_id,
        pasti: migratedData.pasti || {
          colazione: [],
          spuntino_mattina: [],
          pranzo: [],
          spuntino_pomeriggio: [],
          cena: [],
          spuntino_sera: [],
          bevande_alcoliche: []
        },
        pliche: {
          addome: migratedData.pliche?.addome || 0,
          fianchi: migratedData.pliche?.fianchi || 0
        },
        peso: migratedData.peso || 0,
        idratazione: migratedData.idratazione || 0,
        sonno: migratedData.sonno || 0,
        stress: migratedData.stress || 5,
        digestione: migratedData.digestione || '',
        note: migratedData.note || '',
        foto: migratedData.foto || []
      };
      
      console.log('✅ Safe data loaded:', safeData);
      setFormData(safeData);
      setSaveStatus('saved');
    }
  }, [existingData]);

  // CALCOLO PERCENTUALE COMPLETAMENTO
  const calculateCompletionPercentage = () => {
    let completed = 0;
    let total = 0;

    // Pasti (30% del totale)
    const totalPasti = Object.values(formData.pasti).reduce((sum, pasto) => sum + pasto.length, 0);
    if (totalPasti > 0) completed += 30;
    total += 30;

    // Peso (15% del totale)
    if (formData.peso > 0) completed += 15;
    total += 15;

    // Pliche (25% del totale)
    if (formData.pliche.addome > 0 && formData.pliche.fianchi > 0) completed += 25;
    total += 25;

    // Idratazione (15% del totale)
    if (formData.idratazione > 0) completed += 15;
    total += 15;

    // Sonno (10% del totale)
    if (formData.sonno && formData.sonno > 0) completed += 10;
    total += 10;

    // Stress (5% del totale)
    if (formData.stress !== 5) completed += 5; // Se ha modificato dal default
    total += 5;

    return Math.round((completed / total) * 100);
  };

  // FUNZIONE DI SALVATAGGIO SILENZIOSA - COMPLETAMENTE SENZA POPUP
  const saveDataSilently = async (data: AnalisiGiorno) => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // Determina chiave storage
      let storageKey = 'analisiGrassoData';
      if (isPTMode && clienteId) {
        storageKey = `analisiGrassoData_${clienteId}`;
      }

      // Prepara dati per salvataggio
      const dataToSave = {
        ...data,
        data: selectedDate.toISOString(),
        cliente_id: isPTMode ? clienteId : undefined
      };

      // Carica dati esistenti
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');

      // Rimuovi data esistente
      const dateString = selectedDate.toISOString().split('T')[0];
      const filteredData = existingData.filter((d: any) => {
        const existingDateString = new Date(d.data).toISOString().split('T')[0];
        return existingDateString !== dateString;
      });

      // Aggiungi nuovi dati
      filteredData.push(dataToSave);

      // Salva in localStorage
      localStorage.setItem(storageKey, JSON.stringify(filteredData));

      // Salva su Airtable (silenziosamente)
      try {
        await fetch('/api/analisi-grasso', {
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
      } catch (airtableError) {
        // Salvataggio Airtable fallito ma localStorage OK - continua silenziosamente
      }

      setSaveStatus('saved');
      
      // Notifica parent SENZA POPUP O ALERT
      onSave(data);

    } catch (error) {
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  };

  // TRIGGER SALVATAGGIO CON DEBOUNCE
  const triggerSave = () => {
    // Cancella timeout precedente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Imposta nuovo timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveDataSilently(formData);
    }, 1000);
  };

  // SALVATAGGIO IMMEDIATO (per azioni importanti)
  const saveImmediately = () => {
    // Cancella timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveDataSilently(formData);
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

  // HANDLERS CON SALVATAGGIO SILENZIOSO
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
      setTimeout(() => saveDataSilently(newFormData), 100);
    }
  };

  const handleRemoveAlimento = (pasto: keyof AnalisiGiorno['pasti'], index: number) => {
    const newFormData = {
      ...formData,
      pasti: {
        ...formData.pasti,
        [pasto]: formData.pasti[pasto].filter((_, i) => i !== index)
      }
    };
    
    setFormData(newFormData);
    
    // Salva immediatamente quando rimuovi un alimento
    setTimeout(() => saveDataSilently(newFormData), 100);
  };

  const handleMisurazioneChange = (field: string, value: number) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    triggerSave();
  };

  const handlePlicheChange = (field: 'addome' | 'fianchi', value: number) => {
    const newFormData = {
      ...formData,
      pliche: {
        ...formData.pliche,
        [field]: value
      }
    };
    
    setFormData(newFormData);
    triggerSave();
  };

  const handleExtraChange = (field: string, value: any) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    triggerSave();
  };

  // FUNZIONE PER PARSARE INPUT DECIMALI PERFEZIONATA
  const parseDecimalInput = (value: string): number => {
    if (!value || value === '') return 0;
    
    // Rimuovi spazi e sostituisci virgola con punto
    const cleanValue = value.trim().replace(',', '.');
    
    // Verifica che sia un numero valido
    const numValue = parseFloat(cleanValue);
    
    return isNaN(numValue) ? 0 : Math.round(numValue * 100) / 100; // Arrotonda a 2 decimali
  };

  // FUNZIONE PER FORMATTARE NUMERI CON VIRGOLA
  const formatNumber = (num: number): string => {
    if (num === 0) return '';
    return num.toString().replace('.', ',');
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

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
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
                <span>
                  {saveStatus === 'saved' && 'Salvato'}
                  {saveStatus === 'saving' && 'Salvando...'}
                  {saveStatus === 'error' && 'Errore'}
                </span>
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
        <div className="bg-green-900/20 border-b border-green-700 px-6 py-2">
          <p className="text-green-400 text-sm">
            💾 <strong>Salvataggio automatico attivo</strong> - Le modifiche vengono salvate automaticamente
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex">
            {[
              { id: 'pasti', label: '🍽️ Pasti' },
              { id: 'misurazioni', label: '📏 Misurazioni' },
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
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
                    {(selectedPasto === 'bevande_alcoliche' ? bevandeAlcoliche : alimentiComuni).slice(0, 12).map(item => (
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

          {/* TAB MISURAZIONI */}
          {activeTab === 'misurazioni' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-400 mb-4">📏 Misurazioni Giornaliere</h3>
                <p className="text-sm text-gray-400 mb-6">⏰ Una misurazione al giorno - mattina appena svegli o sera prima di dormire</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Peso */}
                  <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Peso Corporeo
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Peso (kg)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={formatNumber(formData.peso)}
                        onChange={(e) => {
                          const value = parseDecimalInput(e.target.value);
                          handleMisurazioneChange('peso', value);
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="es. 70,5"
                      />
                    </div>
                  </div>

                  {/* Pliche Addome */}
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-3">📏 Plica Addome</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Addome (mm)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={formatNumber(formData.pliche.addome)}
                        onChange={(e) => {
                          const value = parseDecimalInput(e.target.value);
                          handlePlicheChange('addome', value);
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="es. 15,5"
                      />
                    </div>
                  </div>

                  {/* Pliche Fianchi */}
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-3">📏 Plica Fianchi</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Fianchi (mm)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*[.,]?[0-9]*"
                        value={formatNumber(formData.pliche.fianchi)}
                        onChange={(e) => {
                          const value = parseDecimalInput(e.target.value);
                          handlePlicheChange('fianchi', value);
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="es. 18,2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB EXTRA */}
          {activeTab === 'extra' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Idratazione */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">💧 Idratazione</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Litri bevuti oggi</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      value={formatNumber(formData.idratazione)}
                      onChange={(e) => {
                        const value = parseDecimalInput(e.target.value);
                        handleExtraChange('idratazione', value);
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="es. 2,5"
                    />
                  </div>
                </div>

                {/* Sonno */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-purple-400 mb-4">😴 Sonno</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Ore dormite</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      value={formatNumber(formData.sonno || 0)}
                      onChange={(e) => {
                        const value = parseDecimalInput(e.target.value);
                        handleExtraChange('sonno', value);
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="es. 7,5"
                    />
                  </div>
                </div>

                {/* Stress */}
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

              {/* Note */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-4">📝 Note</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">🤢 Digestione</label>
                    <textarea
                      value={formData.digestione}
                      onChange={(e) => handleExtraChange('digestione', e.target.value)}
                      placeholder="Come ti sei sentito durante la digestione?"
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">📋 Note aggiuntive</label>
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
            </div>
          )}
        </div>

        {/* Footer con Progress Bar */}
        <div className="border-t border-gray-700 p-4 bg-gray-800">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Completamento giornaliero</span>
              <span className="text-sm font-bold text-green-400">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm">
              {getSaveStatusIcon()}
              <span className={saveStatus === 'saved' ? 'text-green-400' : 'text-gray-400'}>
                {saveStatus === 'saved' && 'Tutti i dati sono salvati'}
                {saveStatus === 'saving' && 'Salvataggio in corso...'}
                {saveStatus === 'error' && 'Errore nel salvataggio'}
                {saveStatus === 'idle' && 'Inserisci i dati'}
              </span>
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