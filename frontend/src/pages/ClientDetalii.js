import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, User, Building2, Phone, Mail, MapPin, Edit, Briefcase } from 'lucide-react';
import './Pages.css';

const ClientDetalii = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api.get(`/clienti/${id}`);
        setClient(response.data);
      } catch (err) {
        setError('Eroare la încărcarea clientului');
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0
    }).format(value || 0);
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

  if (loading) return <div className="page"><div className="page-loading">Se încarcă...</div></div>;
  if (error) return <div className="page"><div className="empty-state"><p>{error}</p></div></div>;
  if (!client) return null;

  const hasAddress = client.adresa_strada || client.adresa_numar || client.adresa_bloc ||
    client.adresa_scara || client.adresa_apartament || client.localitate ||
    client.judet || client.cod_postal;

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/clienti')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{client.nume}</h1>
            <p>{client.tip_client === 'firma' ? 'Firmă' : 'Persoană Fizică'}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/clienti')}>
          <Edit size={18} />
          Editează
        </button>
      </div>

      <div className="detail-grid">
        {/* Info Card */}
        <div className="detail-card">
          <h3>
            {client.tip_client === 'firma' ? <Building2 size={20} /> : <User size={20} />}
            Informații generale
          </h3>
          <div className="detail-rows">
            {client.cui && <div className="detail-row"><span>CUI</span><strong>{client.cui}</strong></div>}
            {client.cnp && <div className="detail-row"><span>CNP</span><strong>{client.cnp}</strong></div>}
            {client.reg_com && <div className="detail-row"><span>Reg. Com.</span><strong>{client.reg_com}</strong></div>}
            {client.persoana_contact && <div className="detail-row"><span>Persoană contact</span><strong>{client.persoana_contact}</strong></div>}
            <div className="detail-row">
              <span>Status</span>
              <span className={`badge ${client.status === 'activ' ? 'badge-success' : 'badge-gray'}`}>
                {client.status === 'activ' ? 'Activ' : 'Inactiv'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="detail-card">
          <h3><Phone size={20} /> Contact</h3>
          <div className="detail-rows">
            <div className="detail-row"><span>Telefon primar</span><strong>{client.telefon_primar}</strong></div>
            {client.telefon_secundar && <div className="detail-row"><span>Telefon secundar</span><strong>{client.telefon_secundar}</strong></div>}
            {client.email && (
              <div className="detail-row">
                <span><Mail size={14} /> Email</span>
                <strong><a href={`mailto:${client.email}`}>{client.email}</a></strong>
              </div>
            )}
          </div>
        </div>

        {/* Address Card */}
        {hasAddress && (
          <div className="detail-card">
            <h3><MapPin size={20} /> Adresă</h3>
            <div className="detail-rows">
              {client.adresa_strada && (
                <div className="detail-row">
                  <span>Stradă</span>
                  <strong>{client.adresa_strada} {client.adresa_numar}</strong>
                </div>
              )}
              {(client.adresa_bloc || client.adresa_scara || client.adresa_apartament) && (
                <div className="detail-row">
                  <span>Bloc/Scară/Ap.</span>
                  <strong>
                    {[client.adresa_bloc, client.adresa_scara, client.adresa_apartament].filter(Boolean).join(', ')}
                  </strong>
                </div>
              )}
              {client.localitate && <div className="detail-row"><span>Localitate</span><strong>{client.localitate}</strong></div>}
              {client.judet && <div className="detail-row"><span>Județ</span><strong>{client.judet}</strong></div>}
              {client.cod_postal && <div className="detail-row"><span>Cod poștal</span><strong>{client.cod_postal}</strong></div>}
            </div>
          </div>
        )}

        {/* Stats Card */}
        {client.statistici && (
          <div className="detail-card">
            <h3>📊 Statistici</h3>
            <div className="detail-rows">
              <div className="detail-row"><span>Lucrări totale</span><strong>{client.statistici.numar_lucrari}</strong></div>
              <div className="detail-row"><span>Valoare contracte</span><strong>{formatCurrency(client.statistici.total_contracte)}</strong></div>
              <div className="detail-row"><span>Total încasat</span><strong>{formatCurrency(client.statistici.total_incasat)}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* Lucrări */}
      {client.lucrari && client.lucrari.length > 0 && (
        <div className="detail-section">
          <h2><Briefcase size={20} /> Lucrări ({client.lucrari.length})</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Număr</th>
                  <th>Nume lucrare</th>
                  <th>Status</th>
                  <th>Valoare</th>
                  <th>Progres</th>
                </tr>
              </thead>
              <tbody>
                {client.lucrari.map((lucrare) => (
                  <tr
                    key={lucrare.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/lucrari/${lucrare.id}`)}
                  >
                    <td><span className="badge badge-gray">{lucrare.numar_lucrare}</span></td>
                    <td><strong>{lucrare.nume_lucrare}</strong></td>
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
                    <td>{lucrare.procent_finalizare || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {client.observatii && (
        <div className="detail-section">
          <h2>Observații</h2>
          <p>{client.observatii}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetalii;