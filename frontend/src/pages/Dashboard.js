import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import api from '../services/api';

const ACTIVITY_ICONS = {
  client_nou: '👤',
  lucrare_oferta: '📋',
  lucrare_contract_semnat: '✍️',
  lucrare_in_lucru: '🔨',
  lucrare_finalizata: '✅',
  lucrare_anulata: '❌'
};

const ACTIVITY_LABELS = {
  client_nou: 'Client nou adăugat',
  lucrare_oferta: 'Lucrare în ofertă',
  lucrare_contract_semnat: 'Contract semnat',
  lucrare_in_lucru: 'Lucrare în lucru',
  lucrare_finalizata: 'Lucrare finalizată',
  lucrare_anulata: 'Lucrare anulată'
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ clienti: 0, lucrari: 0, materiale: 0, angajati: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activitate, setActivitate] = useState([]);
  const [notificari, setNotificari] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, activitateRes, notificariRes] = await Promise.all([
          api.get('/stats'),
          api.get('/dashboard/activitate'),
          api.get('/dashboard/notificari')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (activitateRes.data.success) setActivitate(activitateRes.data.data);
        if (notificariRes.data.success) setNotificari(notificariRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'Acum câteva minute';
    if (diffHours < 24) return `Acum ${diffHours} ${diffHours === 1 ? 'oră' : 'ore'}`;
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `Acum ${diffDays} zile`;
    return date.toLocaleDateString('ro-RO');
  };

  return (
    <Container>
      <Header>
        <Title>📊 Dashboard</Title>
        <Welcome>Bun venit, <strong>{user?.nume_complet || user?.username}</strong>!</Welcome>
      </Header>

      <StatsGrid>
        <StatCard color="#4CAF50">
          <StatIcon>👥</StatIcon>
          <StatNumber>{statsLoading ? '...' : stats.clienti}</StatNumber>
          <StatLabel>Clienți activi</StatLabel>
        </StatCard>
        <StatCard color="#2196F3">
          <StatIcon>🏗️</StatIcon>
          <StatNumber>{statsLoading ? '...' : stats.lucrari}</StatNumber>
          <StatLabel>Lucrări în curs</StatLabel>
        </StatCard>
        <StatCard color="#FF9800">
          <StatIcon>📦</StatIcon>
          <StatNumber>{statsLoading ? '...' : stats.materiale}</StatNumber>
          <StatLabel>Materiale în stoc</StatLabel>
        </StatCard>
        <StatCard color="#9C27B0">
          <StatIcon>👷</StatIcon>
          <StatNumber>{statsLoading ? '...' : stats.angajati}</StatNumber>
          <StatLabel>Angajați</StatLabel>
        </StatCard>
      </StatsGrid>

      <SectionsRow>
        <Section>
          <SectionTitle>📈 Activitate recentă</SectionTitle>
          {activitate.length === 0 ? (
            <EmptyActivity>Nicio activitate recentă de afișat.</EmptyActivity>
          ) : (
            <ActivityList>
              {activitate.map((item, idx) => (
                <ActivityItem key={idx}>
                  <ActivityIcon>{ACTIVITY_ICONS[item.tip] || '📌'}</ActivityIcon>
                  <ActivityText>
                    <strong>{ACTIVITY_LABELS[item.tip] || item.tip}:</strong> {item.titlu}
                  </ActivityText>
                  <ActivityTime>{formatDate(item.data)}</ActivityTime>
                </ActivityItem>
              ))}
            </ActivityList>
          )}
        </Section>

        <Section>
          <SectionTitle>⚠️ Notificări</SectionTitle>
          {notificari.length === 0 ? (
            <NotificationBox type="success">
              ✅ <strong>Totul este în ordine!</strong> Nu există alerte active.
            </NotificationBox>
          ) : (
            notificari.map((n, idx) => (
              <NotificationBox key={idx} type={n.tip}>
                {n.tip === 'danger' && '🔴 '}
                {n.tip === 'warning' && '⚠️ '}
                {n.tip === 'info' && 'ℹ️ '}
                {n.mesaj}
              </NotificationBox>
            ))
          )}
        </Section>
      </SectionsRow>
    </Container>
  );
};

// Styled Components
const Container = styled.div`padding: 20px;`;
const Header = styled.div`margin-bottom: 30px;`;
const Title = styled.h1`font-size: 32px; color: #333; margin-bottom: 10px;`;
const Welcome = styled.p`font-size: 18px; color: #666;`;
const StatsGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; margin-bottom: 30px;`;
const StatCard = styled.div`
  background: white; padding: 25px; border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); text-align: center;
  border-left: 5px solid ${props => props.color}; transition: transform 0.3s;
  &:hover { transform: translateY(-5px); }
`;
const StatIcon = styled.div`font-size: 40px; margin-bottom: 12px;`;
const StatNumber = styled.div`font-size: 38px; font-weight: bold; color: #333; margin-bottom: 8px;`;
const StatLabel = styled.div`font-size: 15px; color: #666;`;
const SectionsRow = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 20px;`;
const Section = styled.div`background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px;`;
const SectionTitle = styled.h2`font-size: 22px; color: #333; margin-bottom: 20px;`;
const EmptyActivity = styled.div`color: #999; text-align: center; padding: 20px;`;
const ActivityList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const ActivityItem = styled.div`display: flex; align-items: center; padding: 12px; background: #f9f9f9; border-radius: 8px; gap: 12px;`;
const ActivityIcon = styled.div`font-size: 22px; flex-shrink: 0;`;
const ActivityText = styled.div`flex: 1; color: #333; font-size: 14px;`;
const ActivityTime = styled.div`color: #999; font-size: 12px; flex-shrink: 0;`;
const NotificationBox = styled.div`
  padding: 14px 18px; border-radius: 10px; margin-bottom: 10px; font-size: 15px;
  background: ${props => ({
    warning: '#fff3cd',
    info: '#d1ecf1',
    danger: '#f8d7da',
    success: '#d4edda'
  }[props.type] || '#f5f5f5')};
  border-left: 4px solid ${props => ({
    warning: '#ffc107',
    info: '#17a2b8',
    danger: '#f44336',
    success: '#28a745'
  }[props.type] || '#ccc')};
  color: ${props => ({
    warning: '#856404',
    info: '#0c5460',
    danger: '#721c24',
    success: '#155724'
  }[props.type] || '#333')};
`;

export default Dashboard;
