import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Filter, X, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './Pages.css';

const Facturi = () => {
  const [facturi, setFacturi] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [lucrari, setLucrari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', tip_factura: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPlataModal, setShowPlataModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [formData, setFormData] = useState({
    tip_factura: 'factura',
    client_id: '',
    lucrare_id: '',
    data_emitere: new Date().toISOString().split('T')[0],
    data_scadenta: '',
    valoare_totala: '',
    observatii: ''
  });
  const [plataData, setPlataData] = useState({
    data_plata: new Date().toISOString().split('T')[0],
    suma: '',
    modalitate_plata: 'transfer_bancar',
    numar_document: '',
    observatii: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      ).toString();
      const [facturiRes, clientiRes, lucrariRes] = await Promise.all([
        api.get(`/facturi?${params}`),
        api.get('/clienti'),
        api.get('/lucrari')
      ]);
      setFacturi(facturiRes.data);
      setClienti(clientiRes.data);
      setLucrari(lucrariRes.data);
    } catch (error) {
      console.error('Error fetching facturi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFactura = async (e) => {
    e.preventDefault();
    try {
      await api.post('/facturi', formData);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Eroare la crearea facturii');
    }
  };

  const handleAdaugaPlata = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/facturi/${selectedFactura.id}/plata`, plataData);
      setShowPlataModal(false);
      setSelectedFactura(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Eroare la adăugarea plății');
    }
  };

  const handleDeleteFactura = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi această factură?')) return;
    try {
      await api.delete(`/facturi/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Eroare la ștergere');
    }
  };

  const openPlataModal = (factura) => {
    setSelectedFactura(factura);
    setPlataData({
      data_plata: new Date().toISOString().split('T')[0],
      suma: (factura.valoare_totala - factura.valoare_platita).toFixed(2),
      modalitate_plata: 'transfer_bancar',
      numar_document: '',
      observatii: ''
    });
    setShowPlataModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ro-RO');
  };

  const filteredFacturi = facturi.filter((f) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      f.numar_factura?.toLowerCase().includes(s) ||
      f.client_nume?.toLowerCase().includes(s) ||
      f.numar_lucrare?.toLowerCase().includes(s)
    );
  });

  const getStatusIcon = (status) => {
    if (status === 'incasata') return <CheckCircle size={16} color="#10b981" />;
    if (status === 'partial_incasata') return <Clock size={16} color="#f59e0b" />;
    return <AlertCircle size={16} color="#ef4444" />;
  };

  const getStatusLabel = (status) => {
    if (status === 'incasata') return 'Încasată';
    if (status === 'partial_incasata') return 'Parțial';
    return 'Neîncasată';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Facturi</h1>
          <p>Gestionează facturile și plățile</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Factură Nouă
        </button>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Caută după număr, client, lucrare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <Filter size={20} />
          Filtre
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Toate statusurile</option>
            <option value="neincasata">Neîncasată</option>
            <option value="partial_incasata">Parțial încasată</option>
            <option value="incasata">Încasată</option>
          </select>
          <select
            value={filters.tip_factura}
            onChange={(e) => setFilters({ ...filters, tip_factura: e.target.value })}
          >
            <option value="">Toate tipurile</option>
            <option value="factura">Factură</option>
            <option value="proforma">Proformă</option>
            <option value="chitanta">Chitanță</option>
          </select>
          <button className="btn btn-text" onClick={() => setFilters({ status: '', tip_factura: '' })}>
            Resetează
          </button>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Se încarcă...</div>
      ) : filteredFacturi.length === 0 ? (
        <div className="empty-state">
          <Receipt size={48} />
          <p>Nu există facturi</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Adaugă prima factură
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Număr</th>
                <th>Tip</th>
                <th>Client</th>
                <th>Lucrare</th>
                <th>Dată emitere</th>
                <th>Scadentă</th>
                <th>Valoare</th>
                <th>Plătit</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacturi.map((factura) => (
                <tr key={factura.id}>
                  <td><span className="badge badge-gray">{factura.numar_factura}</span></td>
                  <td>{factura.tip_factura || 'factura'}</td>
                  <td>{factura.client_nume || '-'}</td>
                  <td>{factura.numar_lucrare || '-'}</td>
                  <td>{formatDate(factura.data_emitere)}</td>
                  <td>{formatDate(factura.data_scadenta)}</td>
                  <td><strong>{formatCurrency(factura.valoare_totala)}</strong></td>
                  <td>{formatCurrency(factura.valoare_platita)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(factura.status)}
                      <span>{getStatusLabel(factura.status)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {factura.status !== 'incasata' && (
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                          onClick={() => openPlataModal(factura)}
                          title="Înregistrează plată"
                        >
                          Plată
                        </button>
                      )}
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDeleteFactura(factura.id)}
                        title="Șterge"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Factura Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Factură Nouă</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateFactura} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tip document *</label>
                  <select
                    value={formData.tip_factura}
                    onChange={(e) => setFormData({ ...formData, tip_factura: e.target.value })}
                    required
                  >
                    <option value="factura">Factură</option>
                    <option value="proforma">Proformă</option>
                    <option value="chitanta">Chitanță</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                  >
                    <option value="">Selectează client</option>
                    {clienti.map((c) => (
                      <option key={c.id} value={c.id}>{c.nume}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Lucrare asociată</label>
                  <select
                    value={formData.lucrare_id}
                    onChange={(e) => setFormData({ ...formData, lucrare_id: e.target.value })}
                  >
                    <option value="">Fără lucrare</option>
                    {lucrari.map((l) => (
                      <option key={l.id} value={l.id}>{l.numar_lucrare} — {l.nume_lucrare}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Valoare totală (RON) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valoare_totala}
                    onChange={(e) => setFormData({ ...formData, valoare_totala: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Dată emitere *</label>
                  <input
                    type="date"
                    value={formData.data_emitere}
                    onChange={(e) => setFormData({ ...formData, data_emitere: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Dată scadentă</label>
                  <input
                    type="date"
                    value={formData.data_scadenta}
                    onChange={(e) => setFormData({ ...formData, data_scadenta: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Observații</label>
                  <textarea
                    rows="2"
                    value={formData.observatii}
                    onChange={(e) => setFormData({ ...formData, observatii: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Anulează
                </button>
                <button type="submit" className="btn btn-primary">Emite factură</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plata Modal */}
      {showPlataModal && selectedFactura && (
        <div className="modal-overlay" onClick={() => setShowPlataModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Înregistrează plată</h2>
              <button className="btn-icon" onClick={() => setShowPlataModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdaugaPlata} className="modal-body">
              <p style={{ marginBottom: '16px', color: '#666' }}>
                Factură: <strong>{selectedFactura.numar_factura}</strong> —
                Rest de plată: <strong>{formatCurrency(selectedFactura.valoare_totala - selectedFactura.valoare_platita)}</strong>
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label>Sumă (RON) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={plataData.suma}
                    onChange={(e) => setPlataData({ ...plataData, suma: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Dată plată *</label>
                  <input
                    type="date"
                    value={plataData.data_plata}
                    onChange={(e) => setPlataData({ ...plataData, data_plata: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Modalitate plată *</label>
                  <select
                    value={plataData.modalitate_plata}
                    onChange={(e) => setPlataData({ ...plataData, modalitate_plata: e.target.value })}
                    required
                  >
                    <option value="transfer_bancar">Transfer bancar</option>
                    <option value="numerar">Numerar</option>
                    <option value="card">Card</option>
                    <option value="cec">CEC</option>
                    <option value="bilet_ordin">Bilet la ordin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Număr document</label>
                  <input
                    type="text"
                    value={plataData.numar_document}
                    onChange={(e) => setPlataData({ ...plataData, numar_document: e.target.value })}
                    placeholder="OP nr., chitanță nr., etc."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlataModal(false)}>
                  Anulează
                </button>
                <button type="submit" className="btn btn-primary">Înregistrează plată</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturi;