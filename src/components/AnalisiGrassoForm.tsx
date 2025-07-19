'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Save, AlertCircle, Clock, Droplets, Bed, Zap, Activity, Scale } from 'lucide-react';

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
  note_pt?: string;
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
    sonno: 8,
    stress: 5,
    digestione: '',
    note: ''
  });

  // 🎯 STATI PER INPUT DECIMALI (STRING FORMAT)
  const [inputValues, setInputValues] = useState({
    peso: '',
    addome: '',
    fianchi: '',
    idratazione: ''
  });

  const [currentInputs, setCurrentInputs] = useState({
    colazione: '',
    spuntino_mattina: '',
    pranzo: '',
    spuntino_pomeriggio: '',
    cena: '',
    spuntino_sera: '',
    bevande_alcoliche: ''
  });

  const [activeTab, setActiveTab] = useState<'pasti' | 'misurazioni' | 'extra'>('pasti');
  const [isSaving, setIsSaving] = useState(false);

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

  // Carica dati esistenti
  useEffect(() => {
    if (existingData) {
      console.log('🔄 Loading existing data:', existingData);
      setFormData(existingData);
      
      // 🎯 POPOLA INPUT VALUES CON DATI ESISTENTI
      setInputValues({
        peso: existingData.peso > 0 ? existingData.peso.toString().replace('.', ',') : '',
        addome: existingData.pliche.addome > 0 ? existingData.pliche.addome.toString().replace('.', ',') : '',
        fianchi: existingData.pliche.fianchi > 0 ? existingData.pliche.fianchi.toString().replace('.', ',') : '',
        idratazione: existingData.idratazione > 0 ? existingData.idratazione.toString().replace('.', ',') : ''
      });
    }
  }, [existingData]);

  // 🎯 FUNZIONE CONVERSIONE DECIMALI ITALIANI
  const parseDecimalInput = (value: string): number => {
    if (!value || value.trim() === '') return 0;
    
    // Sostituisci virgola con punto per parsing
    const normalizedValue = value.replace(',', '.');
    const parsed = parseFloat(normalizedValue);
    
    return isNaN(parsed) ? 0 : Math.round(parsed * 10) / 10; // Arrotonda a 1 decimale
  };

  // 🎯 GESTIONE INPUT DECIMALI CON VIRGOLA ITALIANA
  const handleDecimalInput = (field: keyof typeof inputValues, value: string) => {
    console.log(`📝 Input ${field}: "${value}"`);
    
    // Permetti solo numeri, virgole e punti
    const cleanValue = value.replace(/[^0-9.,]/g, '');
    
    // Evita multiple virgole/punti
    const parts = cleanValue.split(/[.,]/);
    if (parts.length > 2) {
      return; // Non aggiornare se ci sono troppe virgole/punti
    }
    
    // Aggiorna l'input visivo
    setInputValues(prev => ({
      ...prev,
      [field]: cleanValue
    }));
    
    // Converti e salva nel formData
    const numericValue = parseDecimalInput(cleanValue);
    console.log(`🔢 Converted ${field}: "${cleanValue}" → ${numericValue}`);
    
    if (field === 'peso') {
      setFormData(prev => ({ ...prev, peso: numericValue }));
    } else if (field === 'addome') {
      setFormData(prev => ({ 
        ...prev, 
        pliche: { ...prev.pliche, addome: numericValue }
      }));
    } else if (field === 'fianchi') {
      setFormData(prev => ({ 
        ...prev, 
        pliche: { ...prev.pliche, fianchi: numericValue }
      }));
    } else if (field === 'idratazione') {
      setFormData(prev => ({ ...prev, idratazione: numericValue }));
    }
  };

  // Aggiungi pasto
  const addPasto = (categoria: string) => {
    const input = currentInputs[categoria as keyof typeof currentInputs];
    if (!input.trim()) return;

    setFormData(prev => ({
      ...prev,
      pasti: {
        ...prev.pasti,
        [categoria]: [...prev.pasti[categoria as keyof typeof prev.pasti], input.trim()]
      }
    }));

    setCurrentInputs(prev => ({
      ...prev,
      [categoria]: ''
    }));
  };

  // Rimuovi pasto
  const removePasto = (categoria: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      pasti: {
        ...prev.pasti,
        [categoria]: prev.pasti[categoria as keyof typeof prev.pasti].filter((_, i) => i !== index)
      }
    }));
  };

  // Gestione salvataggio
  const handleSave = async () => {
    console.log('💾 Saving form data:', formData);
    console.log('📊 Input values at save:', inputValues);
    
    setIsSaving(true);
    
    try {
      // Validazione base
      if (formData.peso === 0 && formData.pliche.addome === 0 && formData.pliche.fianchi === 0) {
        alert('⚠️ Inserisci almeno una misurazione (peso o pliche)');
        setIsSaving(false);
        return;
      }
      
      // Prepara dati finali
      const finalData: AnalisiGiorno = {
        ...formData,
        data: selectedDate
      };
      
      console.log('✅ Final data to save:', finalData);
      
      // Simula un breve delay per feedback UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(finalData);
      onClose();
      
    } catch (error) {
      console.error('❌ Error saving data:', error);
      alert('Errore durante il salvataggio. Riprova.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calcola percentuale completamento
  const calculateCompletion = (): number => {
    let completed = 0;
    let total = 0;

    // Pasti (20%)
    const totalPasti = Object.values(formData.pasti).reduce((sum, pasto) => sum + pasto.length, 0);
    if (totalPasti > 0) completed += 20;
    total += 20;

    // Peso (25%)
    if (formData.peso > 0) completed += 25;
    total += 25;

    // Pliche (25%)
    if (formData.pliche.addome > 0 && formData.pliche.fianchi > 0) completed += 25;
    total += 25;

    // Idratazione (20%)
    if (formData.idratazione > 0) completed += 20;
    total += 20;

    // Extra (10%)
    if (formData.sonno && formData.sonno > 0) completed += 5;
    if (formData.stress !== 5) completed += 5;
    total += 10;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-green-600 to-blue-600">
          <div>
            <h3 className="text-xl font-bold text-white">
              📋 Tracciamento Giornaliero
            </h3>
            <p className="text-green-100">
              {selectedDate.toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
              <div className="text-xs text-green-100">Completato</div>
              <div className="w-16 bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setActiveTab('pasti')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'pasti' 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            🍽️ Pasti
          </button>
          <button
            onClick={() => setActiveTab('misurazioni')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'misurazioni' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            📏 Misurazioni
          </button>
          <button
            onClick={() => setActiveTab('extra')}
            className={`flex-1 px-6 py-4 text-center transition-colors ${
              activeTab === 'extra' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            📊 Extra
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* TAB PASTI */}
          {activeTab === 'pasti' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-orange-400 mb-2">🍽️ Tracciamento Pasti & Bevande</h4>
                <p className="text-sm text-gray-400">Aggiungi tutti gli alimenti e bevande consumate oggi</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastiConfig.map(pasto => (
                  <div key={pasto.id} className="bg-gray-700 rounded-lg p-4">
                    <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getColorClass(pasto.color)}`}></span>
                      {pasto.emoji} {pasto.label}
                    </h5>
                    
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentInputs[pasto.id as keyof typeof currentInputs]}
                        onChange={(e) => setCurrentInputs(prev => ({
                          ...prev,
                          [pasto.id]: e.target.value
                        }))}
                        placeholder={`es. ${pasto.id === 'bevande_alcoliche' ? 'Birra 33cl, Vino rosso 1 bicchiere' : 'Pasta al pomodoro, Insalata mista'}`}
                        className="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addPasto(pasto.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => addPasto(pasto.id)}
                        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {formData.pasti[pasto.id as keyof typeof formData.pasti].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-600 rounded px-3 py-2">
                          <span className="text-sm text-white flex-1">{item}</span>
                          <button
                            onClick={() => removePasto(pasto.id, idx)}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {formData.pasti[pasto.id as keyof typeof formData.pasti].length === 0 && (
                        <p className="text-xs text-gray-500 italic text-center py-2">Nessun elemento aggiunto</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB MISURAZIONI */}
          {activeTab === 'misurazioni' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">📏 Misurazioni Corporee</h4>
                <p className="text-sm text-gray-400">Inserisci peso e misurazioni pliche (supporta decimali con virgola)</p>
              </div>

              {/* 🎯 SEZIONE PESO - FIX DECIMALI */}
              <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-6">
                <h5 className="font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Peso Corporeo
                </h5>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Peso (kg) *
                      <span className="text-xs text-gray-500 ml-2">es. 75,5 o 75.5</span>
                    </label>
                    <input
                      type="text"
                      value={inputValues.peso}
                      onChange={(e) => handleDecimalInput('peso', e.target.value)}
                      placeholder="es. 75,5"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {inputValues.peso && (
                      <div className="mt-2 text-sm text-purple-300">
                        ✓ Valore salvato: {formData.peso}kg
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🎯 SEZIONE PLICHE - FIX DECIMALI */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                <h5 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Misurazioni Pliche
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Addome (mm) *
                      <span className="text-xs text-gray-500 block">es. 15,5 o 15.5</span>
                    </label>
                    <input
                      type="text"
                      value={inputValues.addome}
                      onChange={(e) => handleDecimalInput('addome', e.target.value)}
                      placeholder="es. 15,5"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {inputValues.addome && (
                      <div className="mt-2 text-sm text-blue-300">
                        ✓ Valore salvato: {formData.pliche.addome}mm
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fianchi (mm) *
                      <span className="text-xs text-gray-500 block">es. 18,2 o 18.2</span>
                    </label>
                    <input
                      type="text"
                      value={inputValues.fianchi}
                      onChange={(e) => handleDecimalInput('fianchi', e.target.value)}
                      placeholder="es. 18,2"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {inputValues.fianchi && (
                      <div className="mt-2 text-sm text-green-300">
                        ✓ Valore salvato: {formData.pliche.fianchi}mm
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DEBUG INFO (RIMUOVERE IN PRODUZIONE) */}
              <div className="bg-gray-700 rounded-lg p-4 text-xs">
                <details>
                  <summary className="text-gray-400 cursor-pointer">🔧 Debug Info (per sviluppatori)</summary>
                  <div className="mt-2 space-y-1 text-gray-300">
                    <div>Input peso: "{inputValues.peso}" → Salvato: {formData.peso}</div>
                    <div>Input addome: "{inputValues.addome}" → Salvato: {formData.pliche.addome}</div>
                    <div>Input fianchi: "{inputValues.fianchi}" → Salvato: {formData.pliche.fianchi}</div>
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* TAB EXTRA */}
          {activeTab === 'extra' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-purple-400 mb-2">📊 Dati Extra</h4>
                <p className="text-sm text-gray-400">Informazioni aggiuntive per analisi completa</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Idratazione */}
                <div className="bg-cyan-900/20 border border-cyan-700 rounded-lg p-4">
                  <h5 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    Idratazione
                  </h5>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Litri d'acqua *
                    <span className="text-xs text-gray-500 block">es. 2,5 o 2.5</span>
                  </label>
                  <input
                    type="text"
                    value={inputValues.idratazione}
                    onChange={(e) => handleDecimalInput('idratazione', e.target.value)}
                    placeholder="es. 2,5"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  {inputValues.idratazione && (
                    <div className="mt-2 text-sm text-cyan-300">
                      ✓ Valore salvato: {formData.idratazione}L
                    </div>
                  )}
                </div>

                {/* Sonno */}
                <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-4">
                  <h5 className="font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    Sonno
                  </h5>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ore di sonno</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.sonno || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sonno: parseFloat(e.target.value) || 8 }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Stress */}
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <h5 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Livello Stress
                  </h5>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Da 1 (rilassato) a 10 (molto stressato)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stress || 5}
                    onChange={(e) => setFormData(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-center mt-2">
                    <span className="text-lg font-bold text-red-400">{formData.stress}/10</span>
                  </div>
                </div>

                {/* Digestione */}
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-400 mb-3">🤢 Digestione</h5>
                  <select
                    value={formData.digestione || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, digestione: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Seleziona</option>
                    <option value="ottima">Ottima</option>
                    <option value="buona">Buona</option>
                    <option value="normale">Normale</option>
                    <option value="pesante">Pesante</option>
                    <option value="problematica">Problematica</option>
                  </select>
                </div>
              </div>

              {/* Note */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="font-semibold text-gray-300 mb-3">📝 Note Aggiuntive</h5>
                <textarea
                  value={formData.note || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Aggiungi note sulla giornata, sensazioni, eventi particolari..."
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Completamento: <span className="font-semibold text-white">{completionPercentage}%</span>
              {completionPercentage < 100 && (
                <span className="ml-2 text-yellow-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Aggiungi più dati per analisi completa
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg transition-colors"
                disabled={isSaving}
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || (formData.peso === 0 && formData.pliche.addome === 0 && formData.pliche.fianchi === 0)}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salva Dati
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function per colori
function getColorClass(color: string) {
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
}