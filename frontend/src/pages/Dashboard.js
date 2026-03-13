import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import styled from 'styled-components';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [lucrariRecente, setLucrariRecente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, lucrariRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/lucrari-recente?limit=5')
        ]);
        setStats(statsRes.data);
        setLucrariRecente(lucrariRes.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0
    }).format(value || 0);
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

  if (loading) {
    return (
      <Container>
        <div className="page-loading">Se încarcă...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📊 Dashboard</Title>
        <Welcome>Bun venit, <strong>{user?.nume_complet || user?.username}</strong>!</Welcome>
      </Header>

      {stats && (
        <>
          <StatsGrid>
            <StatCard color="#4CAF50">
              <StatIcon>👥</StatIcon>
              <StatNumber>{stats.clienti?.total || 0}</StatNumber>
              <StatLabel>Clienți total</StatLabel>
              <StatSub>{stats.clienti?.activi || 0} activi</StatSub>
            </StatCard>

            <StatCard color="#2196F3">
              <StatIcon>🏗️</StatIcon>
              <StatNumber>{stats.lucrari?.in_executie || 0}</StatNumber>
              <StatLabel>Lucrări în execuție</StatLabel>
              <StatSub>{stats.lucrari?.total || 0} total</StatSub>
            </StatCard>

            <StatCard color="#FF9800">
              <StatIcon>💰</StatIcon>
              <StatNumber>{formatCurrency(stats.financiar?.valoare_totala_contracte)}</StatNumber>
              <StatLabel>Valoare contracte</StatLabel>
              <StatSub>{formatCurrency(stats.financiar?.valoare_totala_incasata)} încasată</StatSub>
            </StatCard>

            <StatCard color="#9C27B0">
              <StatIcon>📄</StatIcon>
              <StatNumber>{stats.facturi?.numar_facturi_neincasate || 0}</StatNumber>
              <StatLabel>Facturi neîncasate</StatLabel>
              <StatSub>{formatCurrency(stats.facturi?.valoare_neincasata)} de încasat</StatSub>
            </StatCard>
          </StatsGrid>

          {stats.alerte?.termene_apropiate > 0 && (
            <Section>
              <SectionTitle>⚠️ Alerte</SectionTitle>
              <NotificationBox type="warning">
                <strong>Atenție:</strong> {stats.alerte.termene_apropiate} lucrări au termenul de finalizare în următoarele 30 zile
              </NotificationBox>
            </Section>
          )}
        </>
      )}

      {lucrariRecente.length > 0 && (
        <Section>
          <SectionTitle>🏗️ Lucrări Recente</SectionTitle>
          <ActivityList>
            {lucrariRecente.map((lucrare) => (
              <ActivityItem key={lucrare.id}>
                <div style={{ flex: 1 }}>
                  <strong>{lucrare.numar_lucrare}</strong> — {lucrare.nume_lucrare}
                  {lucrare.client_nume && <div style={{ color: '#666', fontSize: '13px' }}>{lucrare.client_nume}</div>}
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: `${getStatusColor(lucrare.status)}20`,
                    color: getStatusColor(lucrare.status),
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                >
                  {getStatusLabel(lucrare.status)}
                </span>
                <div style={{ color: '#999', fontSize: '13px', marginLeft: '12px' }}>
                  {formatCurrency(lucrare.valoare_contract)}
                </div>
              </ActivityItem>
            ))}
          </ActivityList>
        </Section>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
`;

const Welcome = styled.p`
  font-size: 18px;
  color: #666;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const StatCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  border-left: 5px solid ${props => props.color};
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
`;

const StatNumber = styled.div`
  font-size: 42px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #666;
`;

const StatSub = styled.div`
  font-size: 13px;
  color: #999;
  margin-top: 4px;
`;

const Section = styled.div`
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  gap: 15px;
`;

const ActivityIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const ActivityText = styled.div`
  flex: 1;
  color: #333;
  font-size: 15px;
`;

const ActivityTime = styled.div`
  color: #999;
  font-size: 13px;
  flex-shrink: 0;
`;

const NotificationBox = styled.div`
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 10px;
  background: ${props => props.type === 'warning' ? '#fff3cd' : '#d1ecf1'};
  border-left: 4px solid ${props => props.type === 'warning' ? '#ffc107' : '#17a2b8'};
  color: ${props => props.type === 'warning' ? '#856404' : '#0c5460'};
  font-size: 15px;
`;

export default Dashboard;