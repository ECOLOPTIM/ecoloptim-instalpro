import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clienti: 0,
    lucrari: 0,
    materiale: 0,
    angajati: 0
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    // Deocamdată folosim date mock
    setStats({
      clienti: 15,
      lucrari: 8,
      materiale: 42,
      angajati: 6
    });
  }, []);

  return (
    <Container>
      <Header>
        <Title>📊 Dashboard</Title>
        <Welcome>Bun venit, <strong>{user?.nume_complet || user?.username}</strong>!</Welcome>
      </Header>

      <StatsGrid>
        <StatCard color="#4CAF50">
          <StatIcon>���</StatIcon>
          <StatNumber>{stats.clienti}</StatNumber>
          <StatLabel>Clienți activi</StatLabel>
        </StatCard>

        <StatCard color="#2196F3">
          <StatIcon>🏗️</StatIcon>
          <StatNumber>{stats.lucrari}</StatNumber>
          <StatLabel>Lucrări în curs</StatLabel>
        </StatCard>

        <StatCard color="#FF9800">
          <StatIcon>📦</StatIcon>
          <StatNumber>{stats.materiale}</StatNumber>
          <StatLabel>Materiale în stoc</StatLabel>
        </StatCard>

        <StatCard color="#9C27B0">
          <StatIcon>👷</StatIcon>
          <StatNumber>{stats.angajati}</StatNumber>
          <StatLabel>Angajați</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>📈 Activitate recentă</SectionTitle>
        <ActivityList>
          <ActivityItem>
            <ActivityIcon>✅</ActivityIcon>
            <ActivityText>
              <strong>Lucrare finalizată:</strong> Instalație termică SC Test SRL
            </ActivityText>
            <ActivityTime>Acum 2 ore</ActivityTime>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>📝</ActivityIcon>
            <ActivityText>
              <strong>Client nou:</strong> Ion Popescu
            </ActivityText>
            <ActivityTime>Azi, 10:30</ActivityTime>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>📦</ActivityIcon>
            <ActivityText>
              <strong>Material primit:</strong> Țevi PVC D110 - 50ml
            </ActivityText>
            <ActivityTime>Ieri, 16:45</ActivityTime>
          </ActivityItem>
        </ActivityList>
      </Section>

      <Section>
        <SectionTitle>⚠️ Notificări</SectionTitle>
        <NotificationBox type="warning">
          <strong>Atenție:</strong> 3 materiale au stocul sub limita minimă
        </NotificationBox>
        <NotificationBox type="info">
          <strong>Reminder:</strong> 2 lucrări au termenul de finalizare în următoarele 7 zile
        </NotificationBox>
      </Section>
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