import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Financiar = () => {
  const [lucrari, setLucrari] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lucrari', { params: { limit: 200 } })
      .then(r => { if (r.data.success) setLucrari(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalContract = lucrari.reduce((sum, l) => sum + (parseFloat(l.valoare_contract) || 0), 0);
  const totalIncasat = lucrari.reduce((sum, l) => sum + (parseFloat(l.valoare_incasata) || 0), 0);
  const totalRamas = totalContract - totalIncasat;
  const lucrariActive = lucrari.filter(l => !['finalizata', 'anulata'].includes(l.status));

  return (
    <Container>
      <Title>💰 Financiar</Title>

      {loading ? (
        <LoadingMessage>⏳ Se încarcă datele financiare...</LoadingMessage>
      ) : (
        <>
          <SummaryGrid>
            <SummaryCard color="#4CAF50">
              <CardIcon>💵</CardIcon>
              <CardValue>{totalContract.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</CardValue>
              <CardLabel>Total valoare contracte</CardLabel>
            </SummaryCard>
            <SummaryCard color="#2196F3">
              <CardIcon>✅</CardIcon>
              <CardValue>{totalIncasat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</CardValue>
              <CardLabel>Total încasat</CardLabel>
            </SummaryCard>
            <SummaryCard color="#FF9800">
              <CardIcon>⏳</CardIcon>
              <CardValue>{totalRamas.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON</CardValue>
              <CardLabel>Rămas de încasat</CardLabel>
            </SummaryCard>
            <SummaryCard color="#9C27B0">
              <CardIcon>🏗️</CardIcon>
              <CardValue>{lucrariActive.length}</CardValue>
              <CardLabel>Lucrări active</CardLabel>
            </SummaryCard>
          </SummaryGrid>

          <Section>
            <SectionTitle>📋 Detaliu Lucrări</SectionTitle>
            {lucrari.length === 0 ? (
              <EmptyMessage>Nu există lucrări înregistrate.</EmptyMessage>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Nr.</Th>
                    <Th>Denumire</Th>
                    <Th>Client</Th>
                    <Th>Status</Th>
                    <Th>Valoare Contract</Th>
                    <Th>Încasat</Th>
                    <Th>Rămas</Th>
                    <Th>%</Th>
                  </tr>
                </thead>
                <tbody>
                  {lucrari.map(l => {
                    const contract = parseFloat(l.valoare_contract) || 0;
                    const incasat = parseFloat(l.valoare_incasata) || 0;
                    const ramas = contract - incasat;
                    const procent = contract > 0 ? Math.round((incasat / contract) * 100) : 0;
                    return (
                      <tr key={l.id}>
                        <Td>{l.numar_lucrare}</Td>
                        <Td>{l.nume_lucrare}</Td>
                        <Td>{l.client_nume || '-'}</Td>
                        <Td>{l.status}</Td>
                        <Td>{contract > 0 ? `${contract.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON` : '-'}</Td>
                        <Td>{incasat > 0 ? `${incasat.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON` : '-'}</Td>
                        <Td style={{ color: ramas > 0 ? '#FF9800' : '#4CAF50' }}>
                          {ramas > 0 ? `${ramas.toLocaleString('ro-RO', { minimumFractionDigits: 2 })} RON` : '✅'}
                        </Td>
                        <Td>
                          <ProgressBar>
                            <ProgressFill width={procent} />
                          </ProgressBar>
                          <small>{procent}%</small>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </Section>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`padding: 30px;`;
const Title = styled.h1`font-size: 32px; color: #333; margin-bottom: 30px;`;
const LoadingMessage = styled.div`text-align: center; padding: 50px; font-size: 20px; color: #666;`;
const EmptyMessage = styled.div`text-align: center; padding: 30px; color: #999;`;
const SummaryGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;`;
const SummaryCard = styled.div`background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 5px solid ${p => p.color}; text-align: center; transition: transform 0.3s; &:hover { transform: translateY(-4px); }`;
const CardIcon = styled.div`font-size: 40px; margin-bottom: 10px;`;
const CardValue = styled.div`font-size: 24px; font-weight: bold; color: #333; margin-bottom: 8px;`;
const CardLabel = styled.div`font-size: 14px; color: #666;`;
const Section = styled.div`background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 20px;`;
const SectionTitle = styled.h2`font-size: 22px; color: #333; margin-bottom: 20px;`;
const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`background: #f5f5f5; padding: 12px 15px; text-align: left; font-weight: bold; color: #555; font-size: 13px; border-bottom: 2px solid #e0e0e0;`;
const Td = styled.td`padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-size: 13px;`;
const ProgressBar = styled.div`height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; display: inline-block; width: 60px; margin-right: 6px; vertical-align: middle;`;
const ProgressFill = styled.div`height: 100%; width: ${p => p.width}%; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 4px;`;

export default Financiar;
