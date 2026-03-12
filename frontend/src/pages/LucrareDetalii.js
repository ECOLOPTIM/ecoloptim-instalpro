import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Edit, Clock, FileText, Receipt } from 'lucide-react';
import './Pages.css';

const LucrareDetalii = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lucrare, setLucrare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLucrare = async () => {
      try {
        const response = await api.get(`/lucrari/${id}`);
        setLucrare(response.data);
      } catch (err) {
        setError('Eroare la încărcarea lucrării');
      } finally {
        setLoading(false);
      }
    };
    fetchLucrare();
  }, [id]);

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
      contract_semnat: 'Contract semnat',
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

  if (loading) return <div className="page"><div className="page-loading">Se încarcă...</div></div>;
  if (error) return <div className="page"><div className="empty-state"><p>{error}</p></div></div>;
  if (!lucrare) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/lucrari')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{lucrare.numar_lucrare}</h1>
            <p>{lucrare.nume_lucrare}</p>
          </div>
        </div>
        <span
          className="badge"
          style={{
            backgroundColor: `${getStatusColor(lucrare.status)}20`,
            color: getStatusColor(lucrare.status),
            padding: '6px 16px',
            borderRadius: '20px',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          {getStatusLabel(lucrare.status)}
        </span>
      </div>

      <div className="detail-grid">
        {/* General Info */}
        <div className="detail-card">
          <h3>ℹ️ Informații generale</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Tip lucrare</span><strong>{getTipLabel(lucrare.tip_lucrare)}</strong></div>
            {lucrare.client_nume && (
              <div className="detail-row">
                <span>Client</span>
                <strong
                  style={{ cursor: 'pointer', color: '#3b82f6' }}
                  onClick={() => navigate(`/clienti/${lucrare.client_id}`)}
                >
                  {lucrare.client_nume}
                </strong>
              </div>
            )}
            {lucrare.localitate && <div className="detail-row"><span>Localitate</span><strong>{lucrare.localitate}{lucrare.judet ? `, ${lucrare.judet}` : ''}</strong></div>}
            {lucrare.adresa_santier && <div className="detail-row"><span>Adresă șantier</span><strong>{lucrare.adresa_santier}</strong></div>}
          </div>
        </div>

        {/* Timeline dates */}
        <div className="detail-card">
          <h3>📅 Termene</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Data start</span><strong>{formatDate(lucrare.data_start)}</strong></div>
            <div className="detail-row"><span>Finalizare planificată</span><strong>{formatDate(lucrare.data_finalizare_planificata)}</strong></div>
            {lucrare.data_finalizare_efectiva && (
              <div className="detail-row"><span>Finalizare efectivă</span><strong>{formatDate(lucrare.data_finalizare_efectiva)}</strong></div>
            )}
          </div>
        </div>

        {/* Financial */}
        <div className="detail-card">
          <h3>💰 Financiar</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Valoare contract</span><strong>{formatCurrency(lucrare.valoare_contract)}</strong></div>
            <div className="detail-row"><span>Valoare încasată</span><strong>{formatCurrency(lucrare.valoare_incasata)}</strong></div>
            <div className="detail-row">
              <span>Rest de încasat</span>
              <strong style={{ color: '#ef4444' }}>
                {formatCurrency((lucrare.valoare_contract || 0) - (lucrare.valoare_incasata || 0))}
              </strong>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="detail-card">
          <h3>📊 Progres</h3>
          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Finalizare</span>
              <strong>{lucrare.procent_finalizare || 0}%</strong>
            </div>
            <div className="progress-bar" style={{ height: '12px' }}>
              <div
                className="progress-fill"
                style={{
                  width: `${lucrare.procent_finalizare || 0}%`,
                  backgroundColor: getStatusColor(lucrare.status)
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Facturi */}
      {lucrare.facturi && lucrare.facturi.length > 0 && (
        <div className="detail-section">
          <h2><Receipt size={20} /> Facturi ({lucrare.facturi.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Număr</th>
                  <th>Dată emitere</th>
                  <th>Scadentă</th>
                  <th>Valoare</th>
                  <th>Plătit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lucrare.facturi.map((factura) => (
                  <tr key={factura.id}>
                    <td><span className="badge badge-gray">{factura.numar_factura}</span></td>
                    <td>{formatDate(factura.data_emitere)}</td>
                    <td>{formatDate(factura.data_scadenta)}</td>
                    <td>{formatCurrency(factura.valoare_totala)}</td>
                    <td>{formatCurrency(factura.valoare_platita)}</td>
                    <td>
                      <span className={`badge ${
                        factura.status === 'incasata' ? 'badge-success' :
                        factura.status === 'partial_incasata' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {factura.status === 'incasata' ? 'Încasată' :
                         factura.status === 'partial_incasata' ? 'Parțial' : 'Neîncasată'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documente */}
      {lucrare.documente && lucrare.documente.length > 0 && (
        <div className="detail-section">
          <h2><FileText size={20} /> Documente ({lucrare.documente.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tip</th>
                  <th>Nume fișier</th>
                  <th>Dată</th>
                </tr>
              </thead>
              <tbody>
                {lucrare.documente.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.tip_document}</td>
                    <td>{doc.nume_fisier}</td>
                    <td>{formatDate(doc.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timeline */}
      {lucrare.timeline && lucrare.timeline.length > 0 && (
        <div className="detail-section">
          <h2><Clock size={20} /> Activitate</h2>
          <div className="timeline">
            {lucrare.timeline.map((item) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <strong>{item.descriere}</strong>
                  <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>
                    {item.username || 'Sistem'} • {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lucrare.observatii && (
        <div className="detail-section">
          <h2>Observații</h2>
          <p>{lucrare.observatii}</p>
        </div>
      )}
    </div>
  );
};

export default LucrareDetalii;