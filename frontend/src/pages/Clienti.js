import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Clienti = () => {
  const [clienti, setClienti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    nume: '',
    tip_client: 'persoana_fizica',
    cui_cnp: '',
    adresa: '',
    localitate: '',
    judet: '',
    cod_postal: '',
    telefon: '',
    email: '',
    persoana_contact: '',
    observatii: ''
  });

  useEffect(() => {
    fetchClienti();
  }, [search]);

  const fetchClienti = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clienti', {
        params: { search }
      });
      if (response.data.success) {
        setClienti(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching clienti:', error);
      alert('Eroare la încărcarea clienților: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingClient) {
        const response = await api.put(`/clienti/${editingClient.id}`, formData);
        if (response.data.success) {
          alert('Client actualizat cu succes!');
          fetchClienti();
          closeModal();
        }
      } else {
        const response = await api.post('/clienti', formData);
        if (response.data.success) {
          alert('Client creat cu succes!');
          fetchClienti();
          closeModal();
        }
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert(error.response?.data?.message || 'Eroare la salvarea clientului');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      nume: client.nume || '',
      tip_client: client.tip_client || 'persoana_fizica',
      cui_cnp: client.cui_cnp || '',
      adresa: client.adresa || '',
      localitate: client.localitate || '',
      judet: client.judet || '',
      cod_postal: client.cod_postal || '',
      telefon: client.telefon || '',
      email: client.email || '',
      persoana_contact: client.persoana_contact || '',
      observatii: client.observatii || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest client?')) {
      return;
    }

    try {
      const response = await api.delete(`/clienti/${id}`);
      if (response.data.success) {
        alert('Client șters cu succes!');
        fetchClienti();
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Eroare la ștergerea clientului');
    }
  };

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      nume: '',
      tip_client: 'persoana_fizica',
      cui_cnp: '',
      adresa: '',
      localitate: '',
      judet: '',
      cod_postal: '',
      telefon: '',
      email: '',
      persoana_contact: '',
      observatii: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  return (
    <Container>
      <Header>
        <Title>👥 Clienți</Title>
        <Actions>
          <SearchBox
            type="text"
            placeholder="🔍 Caută client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <AddButton onClick={openNewModal}>➕ Adaugă Client</AddButton>
        </Actions>
      </Header>

      {loading ? (
        <LoadingMessage>⏳ Se încarcă clienții...</LoadingMessage>
      ) : clienti.length === 0 ? (
        <EmptyMessage>
          📭 Nu există clienți.
          <br />
          <AddButton onClick={openNewModal} style={{ marginTop: '20px' }}>
            ➕ Adaugă primul client
          </AddButton>
        </EmptyMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Nume</Th>
              <Th>Tip</Th>
              <Th>CUI/CNP</Th>
              <Th>Localitate</Th>
              <Th>Telefon</Th>
              <Th>Email</Th>
              <Th>Acțiuni</Th>
            </tr>
          </thead>
          <tbody>
            {clienti.map((client) => (
              <tr key={client.id}>
                <Td>{client.id}</Td>
                <Td><strong>{client.nume}</strong></Td>
                <Td>
                  <Badge type={client.tip_client}>
                    {client.tip_client === 'firma' ? '🏢 Firmă' : '👤 PF'}
                  </Badge>
                </Td>
                <Td>{client.cui_cnp || '-'}</Td>
                <Td>{client.localitate || '-'}</Td>
                <Td>{client.telefon || '-'}</Td>
                <Td>{client.email || '-'}</Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(client)} color="#2196F3">
                    ✏️
                  </ActionButton>
                  <ActionButton onClick={() => handleDelete(client.id)} color="#f44336">
                    🗑️
                  </ActionButton>
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
              <ModalTitle>
                {editingClient ? '✏️ Editează Client' : '➕ Client Nou'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>✖</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nume *</Label>
                <Input
                  type="text"
                  name="nume"
                  value={formData.nume}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Tip Client</Label>
                <Select name="tip_client" value={formData.tip_client} onChange={handleInputChange}>
                  <option value="persoana_fizica">👤 Persoană fizică</option>
                  <option value="firma">🏢 Firmă</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>CUI/CNP</Label>
                <Input type="text" name="cui_cnp" value={formData.cui_cnp} onChange={handleInputChange} />
              </FormGroup>

              <FormGroup>
                <Label>Telefon</Label>
                <Input type="tel" name="telefon" value={formData.telefon} onChange={handleInputChange} />
              </FormGroup>

              <FormGroup>
                <Label>Email</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleInputChange} />
              </FormGroup>

              <FormGroup>
                <Label>Adresă</Label>
                <Input type="text" name="adresa" value={formData.adresa} onChange={handleInputChange} />
              </FormGroup>

              <FormGroup>
                <Label>Localitate</Label>
                <Input type="text" name="localitate" value={formData.localitate} onChange={handleInputChange} />
              </FormGroup>

              <FormGroup>
                <Label>Județ</Label>
                <Input type="text" name="judet" value={formData.judet} onChange={handleInputChange} />
              </FormGroup>

              <FormActions>
                <CancelButton type="button" onClick={closeModal}>Anulează</CancelButton>
                <SubmitButton type="submit">
                  {editingClient ? '💾 Salvează' : '➕ Creează'}
                </SubmitButton>
              </FormActions>
            </Form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

const Container = styled.div`padding: 30px;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;`;
const Title = styled.h1`font-size: 32px; color: #333;`;
const Actions = styled.div`display: flex; gap: 15px; align-items: center;`;
const SearchBox = styled.input`padding: 10px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; width: 250px; &:focus { outline: none; border-color: #667eea; }`;
const AddButton = styled.button`padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s; &:hover { transform: translateY(-2px); }`;
const LoadingMessage = styled.div`text-align: center; padding: 50px; font-size: 20px; color: #666;`;
const EmptyMessage = styled.div`text-align: center; padding: 50px; font-size: 18px; color: #999;`;
const Table = styled.table`width: 100%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-collapse: collapse;`;
const Th = styled.th`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: left; font-weight: bold;`;
const Td = styled.td`padding: 15px; border-bottom: 1px solid #f0f0f0;`;
const Badge = styled.span`padding: 5px 12px; border-radius: 15px; font-size: 13px; font-weight: bold; background: ${p => p.type === 'firma' ? '#E3F2FD' : '#F3E5F5'}; color: ${p => p.type === 'firma' ? '#1976D2' : '#7B1FA2'};`;
const ActionButton = styled.button`padding: 6px 12px; background: ${p => p.color}; color: white; border: none; border-radius: 5px; font-size: 13px; cursor: pointer; margin-right: 8px; &:hover { opacity: 0.8; }`;
const ModalOverlay = styled.div`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;`;
const ModalContent = styled.div`background: white; border-radius: 15px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto;`;
const ModalHeader = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 2px solid #f0f0f0;`;
const ModalTitle = styled.h2`font-size: 24px; color: #333;`;
const CloseButton = styled.button`background: none; border: none; font-size: 24px; cursor: pointer; color: #999; &:hover { color: #333; }`;
const Form = styled.form`padding: 30px;`;
const FormGroup = styled.div`margin-bottom: 15px;`;
const Label = styled.label`display: block; margin-bottom: 8px; font-weight: bold; color: #555;`;
const Input = styled.input`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; &:focus { outline: none; border-color: #667eea; }`;
const Select = styled.select`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; &:focus { outline: none; border-color: #667eea; }`;
const FormActions = styled.div`display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px;`;
const CancelButton = styled.button`padding: 12px 30px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; &:hover { background: #d0d0d0; }`;
const SubmitButton = styled.button`padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; &:hover { transform: translateY(-2px); }`;

export default Clienti;