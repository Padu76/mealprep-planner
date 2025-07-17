'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Activity, TrendingUp, AlertTriangle, Calendar, Search, Filter, BarChart3, User, Mail, Phone } from 'lucide-react';
import Header from '@/components/header';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  eta: number;
  obiettivo: string;
  dataInizio: string;
  avatar?: string;
  status: 'attivo' | 'inattivo' | 'pausa';
  ultimaAnalisi?: string;
  food_score?: number;
  giorni_tracciati?: number;
  trigger_count?: number;
}

export default function PTDashboard() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'tutti' | 'attivo' | 'inattivo' | 'pausa'>('tutti');
  const [newClient, setNewClient] = useState({
    nome: '',
    email: '',
    telefono: '',
    eta: '',
    obiettivo: 'dimagrimento'
  });
  const [stats, setStats] = useState({
    totale_clienti: 0,
    clienti_attivi: 0,
    analisi_settimana: 0,
    media_food_score: 0
  });

  useEffect(() => {
    loadClienti();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [clienti]);

  const loadClienti = () => {
    try {
      const savedClienti = JSON.parse(localStorage.getItem('pt_clienti') || '[]');
      setClienti(savedClienti);
    } catch (error) {
      console.error('Errore caricamento clienti:', error);
    }
  };

  const calculateStats = () => {
    const clientiAttivi = clienti.filter(c => c.status === 'attivo').length;
    const mediaScore = clienti.length > 0 
      ? clienti.reduce((acc, c) => acc + (c.food_score || 0), 0) / clienti.length
      : 0;
    const analisiRecenti = clienti.filter(c => {
      if (!c.ultimaAnalisi) return false;
      const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(c.ultimaAnalisi) >= week;
    }).length;

    setStats({
      totale_clienti: clienti.length,
      clienti_attivi: clientiAttivi,
      analisi_settimana: analisiRecenti,
      media_food_score: Math.round(mediaScore)
    });
  };

  const handleAddClient = () => {
    if (!newClient.nome || !newClient.email) {
      alert('⚠️ Nome e email sono obbligatori');
      return;
    }

    const nuovoCliente: Cliente = {
      id: `client_${Date.now()}`,
      nome: newClient.nome,
      email: newClient.email,
      telefono: newClient.telefono,
      eta: parseInt(newClient.eta) || 30,
      obiettivo: newClient.obiettivo,
      dataInizio: new Date().toISOString(),
      status: 'attivo',
      food_score: 0,
      giorni_tracciati: 0,
      trigger_count: 0
    };

    const updatedClienti = [...clienti, nuovoCliente];
    setClienti(updatedClienti);
    localStorage.setItem('pt_clienti', JSON.stringify(updatedClienti));

    // Reset form
    setNewClient({
      nome: '',
      email: '',
      telefono: '',
      eta: '',
      obiettivo: 'dimagrimento'
    });
    setShowAddClient(false);

    alert(`✅ Cliente ${nuovoCliente.nome} aggiunto con successo!`);
  };

  const deleteClient = (clienteId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente? Tutti i suoi dati saranno persi.')) {
      return;
    }

    const updatedClienti = clienti.filter(c => c.id !== clienteId);
    setClienti(updatedClienti);
    localStorage.setItem('pt_clienti', JSON.stringify(updatedClienti));

    // Rimuovi anche i dati analisi del cliente
    localStorage.removeItem(`analisiGrassoData_${clienteId}`);

    alert('🗑️ Cliente eliminato');
  };

  const filteredClienti = clienti.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'tutti' || cliente.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attivo': return 'bg-green-600';
      case 'inattivo': return 'bg-red-600';
      case 'pausa': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'attivo': return 'Attivo';
      case 'inattivo': return 'Inattivo';
      case 'pausa': return 'In Pausa';
      default: return 'Sconosciuto';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header PT */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-400 mb-2">🏋️‍♂️ Dashboard Personal Trainer</h1>
          <p className="text-gray-400">Monitora l'analisi del grasso dei tuoi clienti</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.totale_clienti}</div>
                <div className="text-sm text-gray-400">Clienti Totali</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.clienti_attivi}</div>
                <div className="text-sm text-gray-400">Clienti Attivi</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.analisi_settimana}</div>
                <div className="text-sm text-gray-400">Analisi Settimana</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-orange-400">{stats.media_food_score}</div>
                <div className="text-sm text-gray-400">Media Food Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controlli */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cerca cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="tutti">Tutti i clienti</option>
                <option value="attivo">Solo attivi</option>
                <option value="inattivo">Solo inattivi</option>
                <option value="pausa">In pausa</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddClient(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Aggiungi Cliente
            </button>
          </div>
        </div>

        {/* Lista Clienti */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-green-400">👥 I Tuoi Clienti ({filteredClienti.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300">Cliente</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Obiettivo</th>
                  <th className="text-left p-4 text-gray-300">Food Score</th>
                  <th className="text-left p-4 text-gray-300">Giorni Tracciati</th>
                  <th className="text-left p-4 text-gray-300">Trigger</th>
                  <th className="text-left p-4 text-gray-300">Ultima Analisi</th>
                  <th className="text-left p-4 text-gray-300">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredClienti.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {cliente.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{cliente.nome}</div>
                          <div className="text-sm text-gray-400">{cliente.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(cliente.status)}`}>
                        {getStatusText(cliente.status)}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{cliente.obiettivo}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${
                          (cliente.food_score || 0) >= 80 ? 'text-green-400' :
                          (cliente.food_score || 0) >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {cliente.food_score || 0}
                        </div>
                        <div className="text-sm text-gray-400">/100</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{cliente.giorni_tracciati || 0}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {(cliente.trigger_count || 0) > 0 && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`font-medium ${
                          (cliente.trigger_count || 0) > 3 ? 'text-red-400' :
                          (cliente.trigger_count || 0) > 1 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {cliente.trigger_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {cliente.ultimaAnalisi 
                        ? new Date(cliente.ultimaAnalisi).toLocaleDateString('it-IT')
                        : 'Mai'
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCliente(cliente)}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Info
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = `/analisi-grasso?cliente=${cliente.id}`;
                          }}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Analizza
                        </button>
                        <button
                          onClick={() => deleteClient(cliente.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredClienti.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg text-gray-400 mb-2">Nessun cliente trovato</p>
                <p className="text-sm text-gray-500">
                  {searchQuery || filterStatus !== 'tutti' 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Aggiungi il tuo primo cliente per iniziare'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alert Clienti Critici */}
        {filteredClienti.some(c => (c.food_score || 0) < 50 || (c.trigger_count || 0) > 3) && (
          <div className="mt-8 bg-red-900/20 border border-red-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-xl font-bold text-red-400">⚠️ Clienti che Richiedono Attenzione</h3>
            </div>
            <div className="space-y-3">
              {filteredClienti
                .filter(c => (c.food_score || 0) < 50 || (c.trigger_count || 0) > 3)
                .map(cliente => (
                  <div key={cliente.id} className="bg-red-800/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{cliente.nome}</div>
                        <div className="text-sm text-gray-300">
                          {(cliente.food_score || 0) < 50 && `Food Score basso: ${cliente.food_score}`}
                          {(cliente.food_score || 0) < 50 && (cliente.trigger_count || 0) > 3 && ' • '}
                          {(cliente.trigger_count || 0) > 3 && `Troppi trigger: ${cliente.trigger_count}`}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = `/analisi-grasso?cliente=${cliente.id}`;
                        }}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Intervieni
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Aggiungi Cliente */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-green-400 mb-4">➕ Aggiungi Nuovo Cliente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={newClient.nome}
                  onChange={(e) => setNewClient(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nome del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="email@esempio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefono</label>
                <input
                  type="tel"
                  value={newClient.telefono}
                  onChange={(e) => setNewClient(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Età</label>
                <input
                  type="number"
                  value={newClient.eta}
                  onChange={(e) => setNewClient(prev => ({ ...prev, eta: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Obiettivo</label>
                <select
                  value={newClient.obiettivo}
                  onChange={(e) => setNewClient(prev => ({ ...prev, obiettivo: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="dimagrimento">Dimagrimento</option>
                  <option value="aumento-massa">Aumento massa</option>
                  <option value="mantenimento">Mantenimento</option>
                  <option value="definizione">Definizione</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddClient(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleAddClient}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dettagli Cliente */}
      {selectedCliente && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-400">
                👤 {selectedCliente.nome}
              </h3>
              <button
                onClick={() => setSelectedCliente(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3">📋 Informazioni Base</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Email:</span> 
                    <span>{selectedCliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Telefono:</span> 
                    <span>{selectedCliente.telefono || 'Non specificato'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Età:</span> 
                    <span>{selectedCliente.eta} anni</span>
                  </div>
                  <div><span className="text-gray-400">Obiettivo:</span> {selectedCliente.obiettivo}</div>
                  <div><span className="text-gray-400">Data inizio:</span> {new Date(selectedCliente.dataInizio).toLocaleDateString('it-IT')}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">📊 Statistiche Analisi</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Food Score:</span> 
                    <span className={`ml-2 font-bold ${
                      (selectedCliente.food_score || 0) >= 80 ? 'text-green-400' :
                      (selectedCliente.food_score || 0) >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {selectedCliente.food_score || 0}/100
                    </span>
                  </div>
                  <div><span className="text-gray-400">Giorni tracciati:</span> {selectedCliente.giorni_tracciati || 0}</div>
                  <div><span className="text-gray-400">Cibi trigger:</span> {selectedCliente.trigger_count || 0}</div>
                  <div><span className="text-gray-400">Ultima analisi:</span> {
                    selectedCliente.ultimaAnalisi 
                      ? new Date(selectedCliente.ultimaAnalisi).toLocaleDateString('it-IT')
                      : 'Mai'
                  }</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  window.location.href = `/analisi-grasso?cliente=${selectedCliente.id}`;
                }}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Vai all'Analisi
              </button>
              <button
                onClick={() => setSelectedCliente(null)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}