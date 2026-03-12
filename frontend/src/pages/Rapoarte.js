import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Rapoarte = () => {
  const [stats, setStats] = useState(null);
  const [lucrari, setLucrari] = useState([]);
  const [materiale, setMateriale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/lucrari', { params: { limit: 200 } }),
      api.get('/materiale', { params: { limit: 200 } })
    ]).then(([statsRes, lucrariRes, materialeRes]) => {
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (lucrariRes.data.success) setLucrari(lucrariRes.data.data);
      if (materialeRes.data.success) setMateriale(materialeRes.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Container><LoadingMessage>⏳ Se generează rapoartele...</LoadingMessage></Container>;

  const lucrariByStatus = lucrari.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {});

  const materialeSubStoc = materiale.filter(m => m.stoc_minim > 0 && m.stoc_curent < m.stoc_minim);
  const totalValoare = lucrari.reduce((s, l) => s + (parseFloat(l.valoare_contract) || 0), 0);
  const totalIncasat = lucrari.reduce((s, l) => s + (parseFloat(l.valoare_incasata) || 0), 0);

  const STATUS_LABELS = {
    oferta: 'Ofertă', contract_semnat: 'Contract semnat',
    in_lucru: 'În lucru', finalizata: 'Finalizată', anulata: 'Anulată'
  };

  return (
    <Container>
      <Title>📈 Rapoarte</Title>

      <Grid>
        <ReportCard>
          <CardTitle>📊 Sumar General</CardTitle>
          <StatList>
            <StatItem><StatLabel>Clienți activi:</StatLabel><StatValue>{stats?.clienti ?? '-'}</StatValue></StatItem>
            <StatItem><StatLabel>Lucrări în curs:</StatLabel><StatValue>{stats?.lucrari ?? '-'}</StatValue></StatItem>
            <StatItem><StatLabel>Materiale în stoc:</StatLabel><StatValue>{stats?.materiale ?? '-'}</StatValue></StatItem>
            <StatItem><StatLabel>Angajați activi:</StatLabel><StatValue>{stats?.angajati ?? '-'}</StatValue></StatItem>
          </StatList>
        </ReportCard>

        <ReportCard>
          <CardTitle>🏗️ Lucrări pe Status</CardTitle>
          <StatList>
            {Object.entries(lucrariByStatus).map(([status, count]) => (
              <StatItem key={status}>
                <StatLabel>{STATUS_LABELS[status] || status}:</StatLabel>
                <StatValue>{count}</StatValue>
              </StatItem>
            ))}
            {Object.keys(lucrariByStatus).length === 0 && <StatItem><StatLabel>Nicio lucrare înregistrată</StatLabel></StatItem>}
          </StatList>
        </ReportCard>

        <ReportCard>
          <CardTitle>💰 Situație Financiară</CardTitle>
          <StatList>
            <StatItem><StatLabel>Total valoare contracte:</StatLabel><StatValue>{totalValoare.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</StatValue></StatItem>
            <StatItem><StatLabel>Total încasat:</StatLabel><StatValue color="#4CAF50">{totalIncasat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</StatValue></StatItem>
            <StatItem><StatLabel>Rămas de încasat:</StatLabel><StatValue color="#FF9800">{(totalValoare - totalIncasat).toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</StatValue></StatItem>
            <StatItem><StatLabel>Grad încasare:</StatLabel><StatValue>{totalValoare > 0 ? Math.round((totalIncasat / totalValoare) * 100) : 0}%</StatValue></StatItem>
          </StatList>
        </ReportCard>

        <ReportCard warning={materialeSubStoc.length > 0}>
          <CardTitle>📦 Materiale Sub Stoc Minim</CardTitle>
          {materialeSubStoc.length === 0 ? (
            <SuccessMessage>✅ Toate materialele au stoc suficient</SuccessMessage>
          ) : (
            <StatList>
              {materialeSubStoc.map(m => (
                <StatItem key={m.id}>
                  <StatLabel>{m.cod_material ? `[${m.cod_material}] ` : ''}{m.nume}:</StatLabel>
                  <StatValue color="#f44336">{m.stoc_curent} / {m.stoc_minim} {m.unitate_masura}</StatValue>
                </StatItem>
              ))}
            </StatList>
          )}
        </ReportCard>
      </Grid>
    </Container>
  );
};

const Container = styled.div`padding: 30px;`;
const Title = styled.h1`font-size: 32px; color: #333; margin-bottom: 30px;`;
const LoadingMessage = styled.div`text-align: center; padding: 50px; font-size: 20px; color: #666;`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;`;
const ReportCard = styled.div`background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid ${p => p.warning ? '#FF9800' : '#667eea'};`;
const CardTitle = styled.h2`font-size: 20px; color: #333; margin-bottom: 20px;`;
const StatList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const StatItem = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5;`;
const StatLabel = styled.span`color: #666; font-size: 14px;`;
const StatValue = styled.span`font-weight: bold; color: ${p => p.color || '#333'}; font-size: 15px;`;
const SuccessMessage = styled.div`color: #4CAF50; font-weight: bold; text-align: center; padding: 20px;`;

export default Rapoarte;
