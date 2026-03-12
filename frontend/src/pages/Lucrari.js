import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import api from '../services/api';

const STATUS_LABELS = {
  oferta: { label: '📋 Ofertă', color: '#607D8B' },
  contract_semnat: { label: '✍️ Contract semnat', color: '#2196F3' },
  in_lucru: { label: '🔨 În lucru', color: '#FF9800' },
  finalizata: { label: '✅ Finalizată', color: '#4CAF50' },
  anulata: { label: '❌ Anulată', color: '#f44336' }
};

const emptyForm = {
  numar_lucrare: '',
  nume_lucrare: '',
  client_id: '',
  tip_lucrare: '',
  adresa_santier: '',
  localitate: '',
  judet: '',
  status: 'oferta',
  data_start: '',
  data_finalizare_planificata: '',
  data_finalizare_efectiva: '',
  valoare_contract: '',
  valoare_incasata: '',
  responsabil_id: '',
  observatii: ''
};

const Lucrari = () => {
  const [lucrari, setLucrari] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLucrare, setEditingLucrare] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchLucrari();
  }, [search, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Fetch clients for dropdown
    api.get('/clienti', { params: { limit: 200 } })
      .then(r => { if (r.data.success) setClienti(r.data.data); })
      .catch(() => {});
  }, []);

  const fetchLucrari = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lucrari', { params: { search, status: filterStatus } });
      if (response.data.success) setLucrari(response.data.data);
    } catch (error) {
      toast.error('Eroare la încărcarea lucrărilor: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLucrare) {
        const response = await api.put(`/lucrari/${editingLucrare.id}`, formData);
        if (response.data.success) { toast.success('Lucrare actualizată cu succes!'); fetchLucrari(); closeModal(); }
      } else {
        const response = await api.post('/lucrari', formData);
        if (response.data.success) { toast.success('Lucrare creată cu succes!'); fetchLucrari(); closeModal(); }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la salvarea lucrării');
    }
  };

  const handleEdit = (lucrare) => {
    setEditingLucrare(lucrare);
    setFormData({
      numar_lucrare: lucrare.numar_lucrare || '',
      nume_lucrare: lucrare.nume_lucrare || '',
      client_id: lucrare.client_id || '',
      tip_lucrare: lucrare.tip_lucrare || '',
      adresa_santier: lucrare.adresa_santier || '',
      localitate: lucrare.localitate || '',
      judet: lucrare.judet || '',
      status: lucrare.status || 'oferta',
      data_start: lucrare.data_start ? lucrare.data_start.substring(0, 10) : '',
      data_finalizare_planificata: lucrare.data_finalizare_planificata ? lucrare.data_finalizare_planificata.substring(0, 10) : '',
      data_finalizare_efectiva: lucrare.data_finalizare_efectiva ? lucrare.data_finalizare_efectiva.substring(0, 10) : '',
      valoare_contract: lucrare.valoare_contract || '',
      valoare_incasata: lucrare.valoare_incasata || '',
      responsabil_id: lucrare.responsabil_id || '',
      observatii: lucrare.observatii || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi această lucrare? Acțiunea este ireversibilă!')) return;
    try {
      const response = await api.delete(`/lucrari/${id}`);
      if (response.data.success) { toast.success('Lucrare ștearsă cu succes!'); fetchLucrari(); }
    } catch (error) {
      toast.error('Eroare la ștergerea lucrării');
    }
  };

  const openNewModal = () => {
    setEditingLucrare(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingLucrare(null); };

  return (
    <Container>
      <PageHeader>
        <Title>🏗️ Lucrări</Title>
        <Actions>
          <SearchBox type="text" placeholder="🔍 Caută lucrare..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Toate statusurile</option>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </FilterSelect>
          <AddButton onClick={openNewModal}>➕ Adaugă Lucrare</AddButton>
        </Actions>
      </PageHeader>

      {loading ? (
        <LoadingMessage>⏳ Se încarcă lucrările...</LoadingMessage>
      ) : lucrari.length === 0 ? (
        <EmptyMessage>
          📭 Nu există lucrări.
          <br />
          <AddButton onClick={openNewModal} style={{ marginTop: '20px' }}>➕ Adaugă prima lucrare</AddButton>
        </EmptyMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nr.</Th>
              <Th>Denumire</Th>
              <Th>Client</Th>
              <Th>Status</Th>
              <Th>Valoare</Th>
              <Th>Termen</Th>
              <Th>Acțiuni</Th>
            </tr>
          </thead>
          <tbody>
            {lucrari.map((l) => (
              <tr key={l.id}>
                <Td><strong>{l.numar_lucrare}</strong></Td>
                <Td>{l.nume_lucrare}</Td>
                <Td>{l.client_nume || '-'}</Td>
                <Td>
                  <StatusBadge color={STATUS_LABELS[l.status]?.color || '#999'}>
                    {STATUS_LABELS[l.status]?.label || l.status}
                  </StatusBadge>
                </Td>
                <Td>{l.valoare_contract ? `${parseFloat(l.valoare_contract).toLocaleString('ro-RO')} RON` : '-'}</Td>
                <Td>{l.data_finalizare_planificata ? new Date(l.data_finalizare_planificata).toLocaleDateString('ro-RO') : '-'}</Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(l)} color="#2196F3">✏️</ActionButton>
                  <ActionButton onClick={() => handleDelete(l.id)} color="#f44336">🗑️</ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{editingLucrare ? '✏️ Editează Lucrare' : '➕ Lucrare Nouă'}</ModalTitle>
              <CloseButton onClick={closeModal}>✖</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Nr. Lucrare *</Label>
                  <Input type="text" name="numar_lucrare" value={formData.numar_lucrare} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup style={{ flex: 2 }}>
                  <Label>Denumire Lucrare *</Label>
                  <Input type="text" name="nume_lucrare" value={formData.nume_lucrare} onChange={handleInputChange} required />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Client</Label>
                  <Select name="client_id" value={formData.client_id} onChange={handleInputChange}>
                    <option value="">— Selectează client —</option>
                    {clienti.map(c => <option key={c.id} value={c.id}>{c.nume}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Tip Lucrare</Label>
                  <Input type="text" name="tip_lucrare" value={formData.tip_lucrare} onChange={handleInputChange} placeholder="ex: Instalație termică" />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Status</Label>
                  <Select name="status" value={formData.status} onChange={handleInputChange}>
                    {Object.entries(STATUS_LABELS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Valoare Contract (RON)</Label>
                  <Input type="number" name="valoare_contract" value={formData.valoare_contract} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
                <FormGroup>
                  <Label>Valoare Încasată (RON)</Label>
                  <Input type="number" name="valoare_incasata" value={formData.valoare_incasata} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label>Adresă Șantier</Label>
                <Input type="text" name="adresa_santier" value={formData.adresa_santier} onChange={handleInputChange} />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label>Localitate</Label>
                  <Input type="text" name="localitate" value={formData.localitate} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Județ</Label>
                  <Input type="text" name="judet" value={formData.judet} onChange={handleInputChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Data Start</Label>
                  <Input type="date" name="data_start" value={formData.data_start} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Termen Planificat</Label>
                  <Input type="date" name="data_finalizare_planificata" value={formData.data_finalizare_planificata} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Data Finalizare</Label>
                  <Input type="date" name="data_finalizare_efectiva" value={formData.data_finalizare_efectiva} onChange={handleInputChange} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label htmlFor="lucrare-observatii">Observații</Label>
                <Textarea id="lucrare-observatii" name="observatii" value={formData.observatii} onChange={handleInputChange} rows={3} />
              </FormGroup>
              <FormActions>
                <CancelButton type="button" onClick={closeModal}>Anulează</CancelButton>
                <SubmitButton type="submit">{editingLucrare ? '💾 Salvează' : '➕ Creează'}</SubmitButton>
              </FormActions>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`padding: 30px;`;
const PageHeader = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;`;
const Title = styled.h1`font-size: 32px; color: #333;`;
const Actions = styled.div`display: flex; gap: 12px; align-items: center; flex-wrap: wrap;`;
const SearchBox = styled.input`padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; width: 220px; &:focus { outline: none; border-color: #667eea; }`;
const FilterSelect = styled.select`padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; &:focus { outline: none; border-color: #667eea; }`;
const AddButton = styled.button`padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; transition: transform 0.2s; &:hover { transform: translateY(-2px); }`;
const LoadingMessage = styled.div`text-align: center; padding: 50px; font-size: 20px; color: #666;`;
const EmptyMessage = styled.div`text-align: center; padding: 50px; font-size: 18px; color: #999;`;
const Table = styled.table`width: 100%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-collapse: collapse;`;
const Th = styled.th`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: left; font-weight: bold;`;
const Td = styled.td`padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px;`;
const StatusBadge = styled.span`padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; background: ${p => p.color}22; color: ${p => p.color};`;
const ActionButton = styled.button`padding: 6px 12px; background: ${p => p.color}; color: white; border: none; border-radius: 5px; font-size: 13px; cursor: pointer; margin-right: 6px; &:hover { opacity: 0.8; }`;
const ModalOverlay = styled.div`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;`;
const ModalContent = styled.div`background: white; border-radius: 15px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto;`;
const ModalHeader = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 2px solid #f0f0f0;`;
const ModalTitle = styled.h2`font-size: 22px; color: #333;`;
const CloseButton = styled.button`background: none; border: none; font-size: 24px; cursor: pointer; color: #999; &:hover { color: #333; }`;
const Form = styled.form`padding: 25px 30px;`;
const FormRow = styled.div`display: flex; gap: 15px; margin-bottom: 0; flex-wrap: wrap;`;
const FormGroup = styled.div`flex: 1; min-width: 150px; margin-bottom: 15px;`;
const Label = styled.label`display: block; margin-bottom: 6px; font-weight: bold; color: #555; font-size: 14px;`;
const Input = styled.input`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; &:focus { outline: none; border-color: #667eea; }`;
const Select = styled.select`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; &:focus { outline: none; border-color: #667eea; }`;
const Textarea = styled.textarea`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; &:focus { outline: none; border-color: #667eea; }`;
const FormActions = styled.div`display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px;`;
const CancelButton = styled.button`padding: 12px 25px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; &:hover { background: #d0d0d0; }`;
const SubmitButton = styled.button`padding: 12px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; &:hover { transform: translateY(-2px); }`;

export default Lucrari;
