import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Search, Filter, Plus, Trash2, X } from 'lucide-react';
import './Pages.css';

const Documente = () => {
  const [documente, setDocumente] = useState([]);
  const [lucrari, setLucrari] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ tip_document: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    lucrare_id: '',
    tip_document: 'contract',
    nume_fisier: '',
    cale_fisier: '',
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
      const [docRes, lucrariRes] = await Promise.all([
        api.get(`/documente?${params}`),
        api.get('/lucrari')
      ]);
      setDocumente(docRes.data);
      setLucrari(lucrariRes.data);
    } catch (error) {
      console.error('Error fetching documente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documente', formData);
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Eroare la salvare');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest document?')) return;
    try {
      await api.delete(`/documente/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Eroare la ștergere');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ro-RO');
  };

  const getTipLabel = (tip) => {
    const labels = {
      contract: 'Contract',
      deviz: 'Deviz',
      factura: 'Factură',
      proces_verbal: 'Proces verbal',
      alte: 'Alte'
    };
    return labels[tip] || tip;
  };

  const filteredDocumente = documente.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      d.nume_fisier?.toLowerCase().includes(s) ||
      d.numar_lucrare?.toLowerCase().includes(s) ||
      d.client_nume?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Documente</h1>
          <p>Gestionează documentele lucrărilor</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Document Nou
        </button>
      </div>

      <div className="page-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Caută după nume, lucrare, client..."
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
            value={filters.tip_document}
            onChange={(e) => setFilters({ ...filters, tip_document: e.target.value })}
          >
            <option value="">Toate tipurile</option>
            <option value="contract">Contract</option>
            <option value="deviz">Deviz</option>
            <option value="factura">Factură</option>
            <option value="proces_verbal">Proces verbal</option>
            <option value="alte">Alte</option>
          </select>
          <button className="btn btn-text" onClick={() => setFilters({ tip_document: '' })}>
            Resetează
          </button>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Se încarcă...</div>
      ) : filteredDocumente.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <p>Nu există documente</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Adaugă primul document
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tip</th>
                <th>Nume fișier</th>
                <th>Lucrare</th>
                <th>Client</th>
                <th>Dată adăugare</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocumente.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <span className="badge badge-gray">{getTipLabel(doc.tip_document)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} color="#6b7280" />
                      <strong>{doc.nume_fisier}</strong>
                    </div>
                  </td>
                  <td>{doc.numar_lucrare || '-'}</td>
                  <td>{doc.client_nume || '-'}</td>
                  <td>{formatDate(doc.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDelete(doc.id)}
                        title="Șterge"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Document Nou</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Lucrare asociată *</label>
                  <select
                    value={formData.lucrare_id}
                    onChange={(e) => setFormData({ ...formData, lucrare_id: e.target.value })}
                    required
                  >
                    <option value="">Selectează lucrare</option>
                    {lucrari.map((l) => (
                      <option key={l.id} value={l.id}>{l.numar_lucrare} — {l.nume_lucrare}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tip document *</label>
                  <select
                    value={formData.tip_document}
                    onChange={(e) => setFormData({ ...formData, tip_document: e.target.value })}
                    required
                  >
                    <option value="contract">Contract</option>
                    <option value="deviz">Deviz</option>
                    <option value="factura">Factură</option>
                    <option value="proces_verbal">Proces verbal</option>
                    <option value="alte">Alte</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Nume fișier *</label>
                  <input
                    type="text"
                    value={formData.nume_fisier}
                    onChange={(e) => setFormData({ ...formData, nume_fisier: e.target.value })}
                    placeholder="ex: contract-client-2024.pdf"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Cale / URL fișier</label>
                  <input
                    type="text"
                    value={formData.cale_fisier}
                    onChange={(e) => setFormData({ ...formData, cale_fisier: e.target.value })}
                    placeholder="ex: /uploads/contract-client-2024.pdf"
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
                <button type="submit" className="btn btn-primary">Salvează</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documente;