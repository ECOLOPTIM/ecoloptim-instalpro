import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Briefcase,
  X
} from 'lucide-react';
import './Pages.css';

const Lucrari = () => {
  const navigate = useNavigate();
  const [lucrari, setLucrari] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    tip_lucrare: '',
    client_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLucrare, setEditingLucrare] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    nume_lucrare: '',
    tip_lucrare: 'instalatii_sanitare',
    status: 'oferta',
    adresa_santier: '',
    localitate: '',
    judet: '',
    data_start: '',
    data_finalizare_planificata: '',
    valoare_contract: '',
    observatii: ''
  });

  useEffect(() => {
    fetchData();
  }, [search, filters]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        search,
        ...filters
      }).toString();
      const [lucrariRes, clientiRes] = await Promise.all([
        api.get(`/lucrari?${params}`),
        api.get('/clienti')
      ]);
      setLucrari(lucrariRes.data);
      setClienti(clientiRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLucrare(null);
    setFormData({
      client_id: '',
      nume_lucrare: '',
      tip_lucrare: 'instalatii_sanitare',
      status: 'oferta',
      adresa_santier: '',
      localitate: '',
      judet: '',
      data_start: '',
      data_finalizare_planificata: '',
      valoare_contract: '',
      observatii: ''
    });
    setShowModal(true);
  };

  const handleEdit = (lucrare) => {
    setEditingLucrare(lucrare);
    setFormData({
      ...lucrare,
      data_start: lucrare.data_start?.split('T')[0] || '',
      data_finalizare_planificata: lucrare.data_finalizare_planificata?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLucrare) {
        await api.put(`/lucrari/${editingLucrare.id}`, formData);
      } else {
        await api.post('/lucrari', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving lucrare:', error);
      alert(error.response?.data?.message || 'Eroare la salvare');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi această lucrare?')) return;
    
    try {
      await api.delete(`/lucrari/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting lucrare:', error);
      alert(error.response?.data?.message || 'Eroare la ștergere');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      oferta: '#f59e0b',
      contract_semnat: '#3b82f6',
      in_executie: '#8b5cf6',
      finalizata: '#10b981',
      suspendata: '#6b7280',
      anulata: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      oferta: 'Ofertă',
      contract_semnat: 'Contract',
      in_executie: 'În execuție',
      finalizata: 'Finalizată',
      suspendata: 'Suspendată',
      anulata: 'Anulată'
    };
    return labels[status] || status;
  };

  const getTipLabel = (tip) => {
    const labels = {
      instalatii_sanitare: 'Instalații Sanitare',
      incalzire: 'Încălzire',
      gaz: 'Gaz',
      climatizare: 'Climatizare',
      electrice: 'Electrice',
      constructii: 'Construcții',
      alte: 'Alte'
    };
    return labels[tip] || tip;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Lucrări</h1>
          <p>Gestionează portofoliul de lucrări</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Lucrare Nouă
        </button>
      </div>

      {/* Search & Filters */}
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Caută după număr, nume, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          Filtre
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Toate statusurile</option>
            <option value="oferta">Ofertă</option>
            <option value="contract_semnat">Contract semnat</option>
            <option value="in_executie">În execuție</option>
            <option value="finalizata">Finalizată</option>
            <option value="suspendata">Suspendată</option>
            <option value="anulata">Anulată</option>
          </select>
          <select
            value={filters.tip_lucrare}
            onChange={(e) => setFilters({...filters, tip_lucrare: e.target.value})}
          >
            <option value="">Toate tipurile</option>
            <option value="instalatii_sanitare">Instalații Sanitare</option>
            <option value="incalzire">Încălzire</option>
            <option value="gaz">Gaz</option>
            <option value="climatizare">Climatizare</option>
            <option value="electrice">Electrice</option>
            <option value="constructii">Construcții</option>
            <option value="alte">Alte</option>
          </select>
          <button 
            className="btn btn-text"
            onClick={() => setFilters({ status: '', tip_lucrare: '', client_id: '' })}
          >
            Resetează
          </button>
        </div>
      )}

      {/* Lucrari Table */}
      {loading ? (
        <div className="page-loading">Se încarcă...</div>
      ) : lucrari.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <p>Nu există lucrări</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={20} />
            Adaugă prima lucrare
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Număr</th>
                <th>Nume Lucrare</th>
                <th>Client</th>
                <th>Tip</th>
                <th>Status</th>
                <th>Valoare</th>
                <th>Progres</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {lucrari.map((lucrare) => (
                <tr key={lucrare.id}>
                  <td>
                    <span className="badge badge-gray">{lucrare.numar_lucrare}</span>
                  </td>
                  <td>
                    <strong>{lucrare.nume_lucrare}</strong>
                  </td>
                  <td>{lucrare.client_nume}</td>
                  <td>{getTipLabel(lucrare.tip_lucrare)}</td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: `${getStatusColor(lucrare.status)}20`,
                        color: getStatusColor(lucrare.status)
                      }}
                    >
                      {getStatusLabel(lucrare.status)}
                    </span>
                  </td>
                  <td>{formatCurrency(lucrare.valoare_contract)}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${lucrare.procent_finalizare || 0}%`,
                          backgroundColor: getStatusColor(lucrare.status)
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">{lucrare.procent_finalizare || 0}%</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => navigate(`/lucrari/${lucrare.id}`)}
                        title="Vezi detalii"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(lucrare)}
                        title="Editează"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(lucrare.id)}
                        title="Șterge"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLucrare ? 'Editează Lucrare' : 'Lucrare Nouă'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                    required
                  >
                    <option value="">Selectează client</option>
                    {clienti.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.nume}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Nume Lucrare *</label>
                  <input
                    type="text"
                    value={formData.nume_lucrare}
                    onChange={(e) => setFormData({...formData, nume_lucrare: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tip Lucrare *</label>
                  <select
                    value={formData.tip_lucrare}
                    onChange={(e) => setFormData({...formData, tip_lucrare: e.target.value})}
                    required
                  >
                    <option value="instalatii_sanitare">Instalații Sanitare</option>
                    <option value="incalzire">Încălzire</option>
                    <option value="gaz">Gaz</option>
                    <option value="climatizare">Climatizare</option>
                    <option value="electrice">Electrice</option>
                    <option value="constructii">Construcții</option>
                    <option value="alte">Alte</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="oferta">Ofertă</option>
                    <option value="contract_semnat">Contract semnat</option>
                    <option value="in_executie">În execuție</option>
                    <option value="finalizata">Finalizată</option>
                    <option value="suspendata">Suspendată</option>
                    <option value="anulata">Anulată</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Localitate</label>
                  <input
                    type="text"
                    value={formData.localitate}
                    onChange={(e) => setFormData({...formData, localitate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Județ</label>
                  <input
                    type="text"
                    value={formData.judet}
                    onChange={(e) => setFormData({...formData, judet: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Data Start</label>
                  <input
                    type="date"
                    value={formData.data_start}
                    onChange={(e) => setFormData({...formData, data_start: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Data Finalizare Planificată</label>
                  <input
                    type="date"
                    value={formData.data_finalizare_planificata}
                    onChange={(e) => setFormData({...formData, data_finalizare_planificata: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Valoare Contract (RON)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valoare_contract}
                    onChange={(e) => setFormData({...formData, valoare_contract: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Adresă Șantier</label>
                  <textarea
                    rows="2"
                    value={formData.adresa_santier}
                    onChange={(e) => setFormData({...formData, adresa_santier: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Observații</label>
                  <textarea
                    rows="3"
                    value={formData.observatii}
                    onChange={(e) => setFormData({...formData, observatii: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Anulează
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLucrare ? 'Salvează' : 'Creează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lucrari;