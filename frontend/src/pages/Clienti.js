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
  Building2,
  User,
  Users,
  X
} from 'lucide-react';
import './Pages.css';

const Clienti = () => {
  const navigate = useNavigate();
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    tip_client: '',
    judet: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    tip_client: 'persoana_fizica',
    nume: '',
    cui: '',
    cnp: '',
    reg_com: '',
    telefon_primar: '',
    telefon_secundar: '',
    email: '',
    adresa_strada: '',
    adresa_numar: '',
    adresa_bloc: '',
    adresa_scara: '',
    adresa_apartament: '',
    localitate: '',
    judet: '',
    cod_postal: '',
    persoana_contact: '',
    observatii: '',
    status: 'activ'
  });

  useEffect(() => {
    fetchClienti();
  }, [search, filters]);

  const fetchClienti = async () => {
    try {
      const params = new URLSearchParams({
        search,
        ...filters
      }).toString();
      const response = await api.get(`/clienti?${params}`);
      setClienti(response.data);
    } catch (error) {
      console.error('Error fetching clienti:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClient(null);
    setFormData({
      tip_client: 'persoana_fizica',
      nume: '',
      cui: '',
      cnp: '',
      reg_com: '',
      telefon_primar: '',
      telefon_secundar: '',
      email: '',
      adresa_strada: '',
      adresa_numar: '',
      adresa_bloc: '',
      adresa_scara: '',
      adresa_apartament: '',
      localitate: '',
      judet: '',
      cod_postal: '',
      persoana_contact: '',
      observatii: '',
      status: 'activ'
    });
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.put(`/clienti/${editingClient.id}`, formData);
      } else {
        await api.post('/clienti', formData);
      }
      setShowModal(false);
      fetchClienti();
    } catch (error) {
      console.error('Error saving client:', error);
      alert(error.response?.data?.message || 'Eroare la salvare');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest client?')) return;
    
    try {
      await api.delete(`/clienti/${id}`);
      fetchClienti();
    } catch (error) {
      console.error('Error deleting client:', error);
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Clienți</h1>
          <p>Gestionează baza de clienți</p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={20} />
          Client Nou
        </button>
      </div>

      {/* Search & Filters */}
      <div className="page-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Caută după nume, telefon, email..."
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
            value={filters.tip_client}
            onChange={(e) => setFilters({...filters, tip_client: e.target.value})}
          >
            <option value="">Toate tipurile</option>
            <option value="persoana_fizica">Persoană Fizică</option>
            <option value="firma">Firmă</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Toate statusurile</option>
            <option value="activ">Activ</option>
            <option value="inactiv">Inactiv</option>
          </select>
          <button 
            className="btn btn-text"
            onClick={() => setFilters({ tip_client: '', judet: '', status: '' })}
          >
            Resetează
          </button>
        </div>
      )}

      {/* Clienti Table */}
      {loading ? (
        <div className="page-loading">Se încarcă...</div>
      ) : clienti.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <p>Nu există clienți</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={20} />
            Adaugă primul client
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tip</th>
                <th>Nume</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Localitate</th>
                <th>Lucrări</th>
                <th>Valoare Totală</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {clienti.map((client) => (
                <tr key={client.id}>
                  <td>
                    {client.tip_client === 'firma' ? (
                      <Building2 size={18} color="#3b82f6" />
                    ) : (
                      <User size={18} color="#8b5cf6" />
                    )}
                  </td>
                  <td>
                    <strong>{client.nume}</strong>
                    {client.cui && <div className="text-muted">CUI: {client.cui}</div>}
                  </td>
                  <td>{client.telefon_primar}</td>
                  <td>{client.email || '-'}</td>
                  <td>{client.localitate || '-'}</td>
                  <td>{client.numar_lucrari || 0}</td>
                  <td>{formatCurrency(client.total_contracte || 0)}</td>
                  <td>
                    <span className={`badge ${client.status === 'activ' ? 'badge-success' : 'badge-gray'}`}>
                      {client.status === 'activ' ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon"
                        onClick={() => navigate(`/clienti/${client.id}`)}
                        title="Vezi detalii"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="btn-icon"
                        onClick={() => handleEdit(client)}
                        title="Editează"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(client.id)}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? 'Editează Client' : 'Client Nou'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tip Client *</label>
                  <select
                    value={formData.tip_client}
                    onChange={(e) => setFormData({...formData, tip_client: e.target.value})}
                    required
                  >
                    <option value="persoana_fizica">Persoană Fizică</option>
                    <option value="firma">Firmă</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="activ">Activ</option>
                    <option value="inactiv">Inactiv</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Nume / Denumire *</label>
                  <input
                    type="text"
                    value={formData.nume}
                    onChange={(e) => setFormData({...formData, nume: e.target.value})}
                    required
                  />
                </div>

                {formData.tip_client === 'firma' && (
                  <>
                    <div className="form-group">
                      <label>CUI</label>
                      <input
                        type="text"
                        value={formData.cui}
                        onChange={(e) => setFormData({...formData, cui: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Reg. Com.</label>
                      <input
                        type="text"
                        value={formData.reg_com}
                        onChange={(e) => setFormData({...formData, reg_com: e.target.value})}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Telefon Primar *</label>
                  <input
                    type="tel"
                    value={formData.telefon_primar}
                    onChange={(e) => setFormData({...formData, telefon_primar: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefon Secundar</label>
                  <input
                    type="tel"
                    value={formData.telefon_secundar}
                    onChange={(e) => setFormData({...formData, telefon_secundar: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Stradă</label>
                  <input
                    type="text"
                    value={formData.adresa_strada}
                    onChange={(e) => setFormData({...formData, adresa_strada: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Număr</label>
                  <input
                    type="text"
                    value={formData.adresa_numar}
                    onChange={(e) => setFormData({...formData, adresa_numar: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Bloc</label>
                  <input
                    type="text"
                    value={formData.adresa_bloc}
                    onChange={(e) => setFormData({...formData, adresa_bloc: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Scară</label>
                  <input
                    type="text"
                    value={formData.adresa_scara}
                    onChange={(e) => setFormData({...formData, adresa_scara: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Apartament</label>
                  <input
                    type="text"
                    value={formData.adresa_apartament}
                    onChange={(e) => setFormData({...formData, adresa_apartament: e.target.value})}
                  />
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
                  <label>Cod Poștal</label>
                  <input
                    type="text"
                    value={formData.cod_postal}
                    onChange={(e) => setFormData({...formData, cod_postal: e.target.value})}
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
                  {editingClient ? 'Salvează' : 'Creează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clienti;