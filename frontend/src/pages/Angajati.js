import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import api from '../services/api';

const emptyForm = {
  nume_complet: '',
  cnp: '',
  functie: '',
  telefon: '',
  email: '',
  adresa: '',
  data_angajare: '',
  salariu_baza: '',
  cont_bancar: '',
  observatii: ''
};

const Angajati = () => {
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAngajat, setEditingAngajat] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchAngajati();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAngajati = async () => {
    try {
      setLoading(true);
      const response = await api.get('/angajati', { params: { search } });
      if (response.data.success) setAngajati(response.data.data);
    } catch (error) {
      toast.error('Eroare la încărcarea angajaților: ' + (error.response?.data?.message || error.message));
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
      if (editingAngajat) {
        const response = await api.put(`/angajati/${editingAngajat.id}`, formData);
        if (response.data.success) { toast.success('Angajat actualizat cu succes!'); fetchAngajati(); closeModal(); }
      } else {
        const response = await api.post('/angajati', formData);
        if (response.data.success) { toast.success('Angajat adăugat cu succes!'); fetchAngajati(); closeModal(); }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la salvarea angajatului');
    }
  };

  const handleEdit = (angajat) => {
    setEditingAngajat(angajat);
    setFormData({
      nume_complet: angajat.nume_complet || '',
      cnp: angajat.cnp || '',
      functie: angajat.functie || '',
      telefon: angajat.telefon || '',
      email: angajat.email || '',
      adresa: angajat.adresa || '',
      data_angajare: angajat.data_angajare ? angajat.data_angajare.substring(0, 10) : '',
      salariu_baza: angajat.salariu_baza || '',
      cont_bancar: angajat.cont_bancar || '',
      observatii: angajat.observatii || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest angajat?')) return;
    try {
      const response = await api.delete(`/angajati/${id}`);
      if (response.data.success) { toast.success('Angajat șters cu succes!'); fetchAngajati(); }
    } catch (error) {
      toast.error('Eroare la ștergerea angajatului');
    }
  };

  const openNewModal = () => { setEditingAngajat(null); setFormData(emptyForm); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingAngajat(null); };

  return (
    <Container>
      <PageHeader>
        <Title>👷 Angajați</Title>
        <Actions>
          <SearchBox type="text" placeholder="🔍 Caută angajat..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <AddButton onClick={openNewModal}>➕ Adaugă Angajat</AddButton>
        </Actions>
      </PageHeader>

      {loading ? (
        <LoadingMessage>⏳ Se încarcă angajații...</LoadingMessage>
      ) : angajati.length === 0 ? (
        <EmptyMessage>
          📭 Nu există angajați înregistrați.
          <br />
          <AddButton onClick={openNewModal} style={{ marginTop: '20px' }}>➕ Adaugă primul angajat</AddButton>
        </EmptyMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nume Complet</Th>
              <Th>Funcție</Th>
              <Th>Telefon</Th>
              <Th>Email</Th>
              <Th>Data Angajare</Th>
              <Th>Salariu</Th>
              <Th>Acțiuni</Th>
            </tr>
          </thead>
          <tbody>
            {angajati.map((a) => (
              <tr key={a.id}>
                <Td><strong>{a.nume_complet}</strong></Td>
                <Td>{a.functie || '-'}</Td>
                <Td>{a.telefon || '-'}</Td>
                <Td>{a.email || '-'}</Td>
                <Td>{a.data_angajare ? new Date(a.data_angajare).toLocaleDateString('ro-RO') : '-'}</Td>
                <Td>{a.salariu_baza ? `${parseFloat(a.salariu_baza).toLocaleString('ro-RO')} RON` : '-'}</Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(a)} color="#2196F3">✏️</ActionButton>
                  <ActionButton onClick={() => handleDelete(a.id)} color="#f44336">🗑️</ActionButton>
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
              <ModalTitle>{editingAngajat ? '✏️ Editează Angajat' : '➕ Angajat Nou'}</ModalTitle>
              <CloseButton onClick={closeModal}>✖</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup style={{ flex: 2 }}>
                  <Label>Nume Complet *</Label>
                  <Input type="text" name="nume_complet" value={formData.nume_complet} onChange={handleInputChange} required />
                </FormGroup>
                <FormGroup>
                  <Label>CNP</Label>
                  <Input type="text" name="cnp" value={formData.cnp} onChange={handleInputChange} maxLength={13} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Funcție</Label>
                  <Input type="text" name="functie" value={formData.functie} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Telefon</Label>
                  <Input type="tel" name="telefon" value={formData.telefon} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label>Adresă</Label>
                <Input type="text" name="adresa" value={formData.adresa} onChange={handleInputChange} />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label>Data Angajare</Label>
                  <Input type="date" name="data_angajare" value={formData.data_angajare} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup>
                  <Label>Salariu Bază (RON)</Label>
                  <Input type="number" name="salariu_baza" value={formData.salariu_baza} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
                <FormGroup>
                  <Label>Cont Bancar (IBAN)</Label>
                  <Input type="text" name="cont_bancar" value={formData.cont_bancar} onChange={handleInputChange} />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label htmlFor="angajat-observatii">Observații</Label>
                <Textarea id="angajat-observatii" name="observatii" value={formData.observatii} onChange={handleInputChange} rows={3} />
              </FormGroup>
              <FormActions>
                <CancelButton type="button" onClick={closeModal}>Anulează</CancelButton>
                <SubmitButton type="submit">{editingAngajat ? '💾 Salvează' : '➕ Adaugă'}</SubmitButton>
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
const Actions = styled.div`display: flex; gap: 12px; align-items: center;`;
const SearchBox = styled.input`padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; width: 250px; &:focus { outline: none; border-color: #667eea; }`;
const AddButton = styled.button`padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; transition: transform 0.2s; &:hover { transform: translateY(-2px); }`;
const LoadingMessage = styled.div`text-align: center; padding: 50px; font-size: 20px; color: #666;`;
const EmptyMessage = styled.div`text-align: center; padding: 50px; font-size: 18px; color: #999;`;
const Table = styled.table`width: 100%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-collapse: collapse;`;
const Th = styled.th`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: left; font-weight: bold;`;
const Td = styled.td`padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px;`;
const ActionButton = styled.button`padding: 6px 12px; background: ${p => p.color}; color: white; border: none; border-radius: 5px; font-size: 13px; cursor: pointer; margin-right: 6px; &:hover { opacity: 0.8; }`;
const ModalOverlay = styled.div`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;`;
const ModalContent = styled.div`background: white; border-radius: 15px; width: 90%; max-width: 650px; max-height: 90vh; overflow-y: auto;`;
const ModalHeader = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 2px solid #f0f0f0;`;
const ModalTitle = styled.h2`font-size: 22px; color: #333;`;
const CloseButton = styled.button`background: none; border: none; font-size: 24px; cursor: pointer; color: #999; &:hover { color: #333; }`;
const Form = styled.form`padding: 25px 30px;`;
const FormRow = styled.div`display: flex; gap: 15px; flex-wrap: wrap;`;
const FormGroup = styled.div`flex: 1; min-width: 150px; margin-bottom: 15px;`;
const Label = styled.label`display: block; margin-bottom: 6px; font-weight: bold; color: #555; font-size: 14px;`;
const Input = styled.input`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; &:focus { outline: none; border-color: #667eea; }`;
const Textarea = styled.textarea`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; &:focus { outline: none; border-color: #667eea; }`;
const FormActions = styled.div`display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px;`;
const CancelButton = styled.button`padding: 12px 25px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; &:hover { background: #d0d0d0; }`;
const SubmitButton = styled.button`padding: 12px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; &:hover { transform: translateY(-2px); }`;

export default Angajati;
