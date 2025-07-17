'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Camera, Clock, Scale, Droplets, Activity, Brain, Utensils, Wine } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

  // Debug: verifica modalità PT
  const [isPTMode, setIsPTMode] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se siamo in modalità PT
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
    
    console.log('🔍 Form Debug:', {
      isPTMode: cliente ? true : false,
      clienteId: cliente,
      selectedDate: selectedDate.toISOString()
    });
  }, []);

  // Carica dati esistenti se disponibili
  useEffect(() => {
    if (existingData) {
      console.log('📝 Loading existing data:', existingData);
      setFormData(existingData);
    }
  }, [existingData]);

  // Alimenti comuni per suggerimenti
  const alimentiComuni = [
    'Pane', 'Pasta', 'Riso', 'Quinoa', 'Avena', 'Cereali',
    'Pollo', 'Manzo', 'Pesce', 'Uova', 'Legumi', 'Tofu',
    'Latte', 'Yogurt', 'Formaggio', 'Ricotta', 'Mozzarella',
    'Spinaci', 'Broccoli', 'Zucchine', 'Pomodori', 'Carote',
    'Banana', 'Mela', 'Frutti di bosco', 'Avocado', 'Limone',
    'Olio oliva', 'Burro', 'Noci', 'Mandorle', 'Semi'
  ];

  // Bevande alcoliche comuni
  const bevandeAlcoliche = [
    'Vino rosso', 'Vino bianco', 'Birra', 'Prosecco', 'Champagne',
    'Whisky', 'Vodka', 'Gin', 'Rum', 'Aperitivo', 'Liquore',
    'Cocktail', 'Spritz', 'Negroni', 'Mojito'
  ];

  // Configurazione pasti
  const pastiConfig = [
    { id: 'colazione', label: 'Colazione', emoji: '🌅', color: 'orange' },
    { id: 'spuntino_mattina', label: 'Spuntino Mattina', emoji: '🍎', color: 'green' },
    { id: 'pranzo', label: 'Pranzo', emoji: '☀️', color: 'yellow' },
    { id: 'spuntino_pomeriggio', label: 'Spuntino Pomeriggio', emoji: '🥨', color: 'blue' },
    { id: 'cena', label: 'Cena', emoji: '🌙', color: 'purple' },
    { id: 'spuntino_sera', label: 'Spuntino Sera', emoji: '🍪', color: 'indigo' },
    { id: 'bevande_alcoliche', label: 'Bevande Alcoliche', emoji: '🍷', color: 'red' }
  ];

  const handleAddAlimento = () => {
    if (newAlimento.trim()) {
      console.log('➕ Adding alimento:', newAlimento, 'to', selectedPasto);
      
      setFormData(prev => ({
        ...prev,
        pasti: {
          ...prev.pasti,
          [selectedPasto]: [...prev.pasti[selectedPasto], newAlimento.trim()]
        }
      }));
      setNewAlimento('');
    }
  };

  const handleRemoveAlimento = (pasto: keyof AnalisiGiorno['pasti'], index: number) => {
    console.log('➖ Removing alimento from', pasto, 'at index', index);
    
    setFormData(prev => ({
      ...prev,
      pasti: {
        ...prev.pasti,
        [pasto]: prev.pasti[pasto].filter((_, i) => i !== index)
      }
    }));
  };

  const handlePlicheChange = (field: keyof AnalisiGiorno['pliche'], value: number) => {
    setFormData(prev => ({
      ...prev,
      pliche: {
        ...prev.pliche,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('💾 Starting save process...', {
        isPTMode,
        clienteId,
        clienteNome,
        selectedDate: selectedDate.toISOString(),
        formData
      });

      // Validazione base
      if (formData.idratazione <= 0) {
        alert('⚠️ Inserisci l\'idratazione giornaliera');
        setIsLoading(false);
        return;
      }

      if (formData.pliche.mattino_addome <= 0 || formData.pliche.mattino_fianchi <= 0) {
        alert('⚠️ Inserisci le misurazioni mattutine di riferimento');
        setIsLoading(false);
        return;
      }

      // Prepara i dati per il salvataggio
      const dataToSave = {
        ...formData,
        data: selectedDate,
        cliente_id: isPTMode ? clienteId : undefined
      };

      console.log('📊 Data to save:', dataToSave);

      // Determina la chiave di storage
      let storageKey = 'analisiGrassoData';
      if (isPTMode && clienteId) {
        storageKey = `analisiGrassoData_${clienteId}`;
      }

      console.log('🔑 Storage key:', storageKey);

      // Carica dati esistenti
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
      console.log('📋 Existing data:', existingData);

      // Rimuovi dati per la stessa data
      const dateString = selectedDate.toISOString().split('T')[0];
      const filteredData = existingData.filter((d: any) => {
        const existingDateString = new Date(d.data).toISOString().split('T')[0];
        return existingDateString !== dateString;
      });

      console.log('🗑️ Filtered data (removed same date):', filteredData);

      // Aggiungi nuovi dati
      const dataWithISODate = {
        ...dataToSave,
        data: selectedDate.toISOString()
      };

      filteredData.push(dataWithISODate);

      console.log('📦 Final data to save:', filteredData);

      // Salva nel localStorage
      localStorage.setItem(storageKey, JSON.stringify(filteredData));

      console.log('✅ Data saved successfully to localStorage');

      // Prova a salvare anche su Airtable
      try {
        const response = await fetch('/api/analisi-grasso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveData',
            data: {
              ...dataToSave,
              data: selectedDate.toISOString(),
              user_email: isPTMode ? `pt_${clienteId}@example.com` : 'user@example.com'
            }
          })
        });

        const result = await response.json();
        console.log('🌐 Airtable save result:', result);
      } catch (airtableError) {
        console.log('⚠️ Airtable save failed (localStorage saved):', airtableError);
      }

      // Chiama la funzione onSave del parent
      onSave(dataToSave);

      // Mostra messaggio di successo
      const successMessage = isPTMode && clienteNome 
        ? `✅ Dati salvati per ${clienteNome}!`
        : '✅ Dati salvati!';
      
      alert(successMessage);

      // Chiudi il form
      onClose();

    } catch (error) {
      console.error('❌ Save error:', error);
      alert('❌ Errore nel salvataggio dei dati');
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
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-green-100 mt-2">{formatDate(selectedDate)}</p>
        </div>

        {/* Debug Info (rimuovi in produzione) */}
        <div className="bg-gray-900 p-2 text-xs text-gray-400 border-b border-gray-700">
          Debug: PT Mode: {isPTMode ? 'YES' : 'NO'} | Cliente: {clienteNome || 'N/A'} | ID: {clienteId || 'N/A'}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <nav className="flex">
            {[
              { id: 'pasti', label: '🍽️ Pasti', icon: Utensils },
              { id: 'pliche', label: '📏 Pliche', icon: Scale },
              { id: 'extra', label: '📊 Extra', icon: Activity }
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
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            {/* TAB PASTI */}
            {activeTab === 'pasti' && (
              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-orange-400 mb-4">🍽️ Pasti & Bevande Consumate</h3>
                  
                  {/* Selettore Pasto */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {pastiConfig.map(pasto => (
                      <button
                        key={pasto.id}
                        type="button"
                        onClick={() => setSelectedPasto(pasto.id as any)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                          selectedPasto === pasto.id
                            ? `${getColorClass(pasto.color)} text-white`
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

                  {/* Lista Alimenti per Pasto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastiConfig.map(pasto => (
                      <div key={pasto.id} className="bg-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${getColorClass(pasto.color)}`}></span>
                          {pasto.emoji} {pasto.label}
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
                            <p className="text-gray-400 text-sm italic">Nessun elemento aggiunto</p>
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
                  
                  {/* Misurazioni di Riferimento */}
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-400 mb-3">🌅 Riferimento Mattutino</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Addome (mm)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.pliche.mattino_addome}
                          onChange={(e) => handlePlicheChange('mattino_addome', parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Fianchi (mm)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.pliche.mattino_fianchi}
                          onChange={(e) => handlePlicheChange('mattino_fianchi', parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Misurazioni Post-Pasto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastiConfig.slice(0, 6).map(pasto => (
                      <div key={pasto.id} className="bg-gray-600 rounded-lg p-4">
                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${getColorClass(pasto.color)}`}></span>
                          {pasto.emoji} Post-{pasto.label}
                        </h4>
                        <p className="text-xs text-gray-400 mb-3">⏱️ Misurazione a 90-120 min</p>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Addome (mm)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={formData.pliche[`${pasto.id}_post_addome` as keyof typeof formData.pliche]}
                              onChange={(e) => handlePlicheChange(`${pasto.id}_post_addome` as any, parseFloat(e.target.value) || 0)}
                              className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Fianchi (mm)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={formData.pliche[`${pasto.id}_post_fianchi` as keyof typeof formData.pliche]}
                              onChange={(e) => handlePlicheChange(`${pasto.id}_post_fianchi` as any, parseFloat(e.target.value) || 0)}
                              className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  {/* Idratazione */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-4">💧 Idratazione</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Litri bevuti</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.idratazione}
                        onChange={(e) => setFormData(prev => ({ ...prev, idratazione: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Sonno */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-purple-400 mb-4">😴 Sonno</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ore dormite</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.sonno}
                        onChange={(e) => setFormData(prev => ({ ...prev, sonno: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* Stress */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-red-400 mb-4">😰 Stress</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Livello (1-10)</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.stress}
                        onChange={(e) => setFormData(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
                        className="w-full mb-2"
                      />
                      <div className="text-center text-2xl font-bold text-red-400">{formData.stress}/10</div>
                    </div>
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
                        onChange={(e) => setFormData(prev => ({ ...prev, digestione: e.target.value }))}
                        placeholder="Come ti sei sentito durante la digestione?"
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">📋 Note aggiuntive</label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Qualche osservazione particolare?"
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-6 bg-gray-800">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isLoading ? 'Salvando...' : 'Salva Dati'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}