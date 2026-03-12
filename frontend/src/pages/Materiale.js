import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import api from '../services/api';

const emptyForm = {
  cod_material: '',
  nume: '',
  categorie: '',
  unitate_masura: '',
  pret_achizitie: '',
  pret_vanzare: '',
  stoc_curent: '',
  stoc_minim: '',
  furnizor: '',
  observatii: ''
};

const Materiale = () => {
  const [materiale, setMateriale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchMateriale();
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMateriale = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materiale', { params: { search } });
      if (response.data.success) setMateriale(response.data.data);
    } catch (error) {
      toast.error('Eroare la încărcarea materialelor: ' + (error.response?.data?.message || error.message));
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
      if (editingMaterial) {
        const response = await api.put(`/materiale/${editingMaterial.id}`, formData);
        if (response.data.success) { toast.success('Material actualizat cu succes!'); fetchMateriale(); closeModal(); }
      } else {
        const response = await api.post('/materiale', formData);
        if (response.data.success) { toast.success('Material adăugat cu succes!'); fetchMateriale(); closeModal(); }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la salvarea materialului');
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      cod_material: material.cod_material || '',
      nume: material.nume || '',
      categorie: material.categorie || '',
      unitate_masura: material.unitate_masura || '',
      pret_achizitie: material.pret_achizitie || '',
      pret_vanzare: material.pret_vanzare || '',
      stoc_curent: material.stoc_curent ?? '',
      stoc_minim: material.stoc_minim ?? '',
      furnizor: material.furnizor || '',
      observatii: material.observatii || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur vrei să ștergi acest material?')) return;
    try {
      const response = await api.delete(`/materiale/${id}`);
      if (response.data.success) { toast.success('Material șters cu succes!'); fetchMateriale(); }
    } catch (error) {
      toast.error('Eroare la ștergerea materialului');
    }
  };

  const openNewModal = () => { setEditingMaterial(null); setFormData(emptyForm); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingMaterial(null); };

  const stockStatus = (material) => {
    if (material.stoc_minim > 0 && material.stoc_curent < material.stoc_minim) return 'low';
    if (material.stoc_curent === 0) return 'empty';
    return 'ok';
  };

  return (
    <Container>
      <PageHeader>
        <Title>📦 Materiale</Title>
        <Actions>
          <SearchBox type="text" placeholder="🔍 Caută material..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <AddButton onClick={openNewModal}>➕ Adaugă Material</AddButton>
        </Actions>
      </PageHeader>

      {loading ? (
        <LoadingMessage>⏳ Se încarcă materialele...</LoadingMessage>
      ) : materiale.length === 0 ? (
        <EmptyMessage>
          📭 Nu există materiale.
          <br />
          <AddButton onClick={openNewModal} style={{ marginTop: '20px' }}>➕ Adaugă primul material</AddButton>
        </EmptyMessage>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Cod</Th>
              <Th>Denumire</Th>
              <Th>Categorie</Th>
              <Th>U.M.</Th>
              <Th>Stoc</Th>
              <Th>Preț achiz.</Th>
              <Th>Preț vânz.</Th>
              <Th>Furnizor</Th>
              <Th>Acțiuni</Th>
            </tr>
          </thead>
          <tbody>
            {materiale.map((m) => (
              <tr key={m.id}>
                <Td>{m.cod_material || '-'}</Td>
                <Td><strong>{m.nume}</strong></Td>
                <Td>{m.categorie || '-'}</Td>
                <Td>{m.unitate_masura}</Td>
                <Td>
                  <StockBadge status={stockStatus(m)}>
                    {parseFloat(m.stoc_curent).toLocaleString('ro-RO')} {m.unitate_masura}
                    {stockStatus(m) === 'low' && ' ⚠️'}
                    {stockStatus(m) === 'empty' && ' ❌'}
                  </StockBadge>
                </Td>
                <Td>{m.pret_achizitie ? `${parseFloat(m.pret_achizitie).toFixed(2)} RON` : '-'}</Td>
                <Td>{m.pret_vanzare ? `${parseFloat(m.pret_vanzare).toFixed(2)} RON` : '-'}</Td>
                <Td>{m.furnizor || '-'}</Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(m)} color="#2196F3">✏️</ActionButton>
                  <ActionButton onClick={() => handleDelete(m.id)} color="#f44336">🗑️</ActionButton>
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
              <ModalTitle>{editingMaterial ? '✏️ Editează Material' : '➕ Material Nou'}</ModalTitle>
              <CloseButton onClick={closeModal}>✖</CloseButton>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label>Cod Material</Label>
                  <Input type="text" name="cod_material" value={formData.cod_material} onChange={handleInputChange} />
                </FormGroup>
                <FormGroup style={{ flex: 2 }}>
                  <Label>Denumire *</Label>
                  <Input type="text" name="nume" value={formData.nume} onChange={handleInputChange} required />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Categorie</Label>
                  <Input type="text" name="categorie" value={formData.categorie} onChange={handleInputChange} placeholder="ex: Instalații" />
                </FormGroup>
                <FormGroup>
                  <Label>Unitate Măsură *</Label>
                  <Input type="text" name="unitate_masura" value={formData.unitate_masura} onChange={handleInputChange} placeholder="ex: ml, buc, kg" required />
                </FormGroup>
                <FormGroup>
                  <Label>Furnizor</Label>
                  <Input type="text" name="furnizor" value={formData.furnizor} onChange={handleInputChange} />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <Label>Stoc Curent</Label>
                  <Input type="number" name="stoc_curent" value={formData.stoc_curent} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
                <FormGroup>
                  <Label>Stoc Minim</Label>
                  <Input type="number" name="stoc_minim" value={formData.stoc_minim} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
                <FormGroup>
                  <Label>Preț Achiziție (RON)</Label>
                  <Input type="number" name="pret_achizitie" value={formData.pret_achizitie} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
                <FormGroup>
                  <Label>Preț Vânzare (RON)</Label>
                  <Input type="number" name="pret_vanzare" value={formData.pret_vanzare} onChange={handleInputChange} min="0" step="0.01" />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label htmlFor="material-observatii">Observații</Label>
                <Textarea id="material-observatii" name="observatii" value={formData.observatii} onChange={handleInputChange} rows={3} />
              </FormGroup>
              <FormActions>
                <CancelButton type="button" onClick={closeModal}>Anulează</CancelButton>
                <SubmitButton type="submit">{editingMaterial ? '💾 Salvează' : '➕ Adaugă'}</SubmitButton>
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
const Th = styled.th`background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; text-align: left; font-weight: bold; font-size: 14px;`;
const Td = styled.td`padding: 12px 15px; border-bottom: 1px solid #f0f0f0; font-size: 14px;`;
const StockBadge = styled.span`color: ${p => p.status === 'low' ? '#FF9800' : p.status === 'empty' ? '#f44336' : '#4CAF50'}; font-weight: bold;`;
const ActionButton = styled.button`padding: 6px 12px; background: ${p => p.color}; color: white; border: none; border-radius: 5px; font-size: 13px; cursor: pointer; margin-right: 6px; &:hover { opacity: 0.8; }`;
const ModalOverlay = styled.div`position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;`;
const ModalContent = styled.div`background: white; border-radius: 15px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto;`;
const ModalHeader = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 2px solid #f0f0f0;`;
const ModalTitle = styled.h2`font-size: 22px; color: #333;`;
const CloseButton = styled.button`background: none; border: none; font-size: 24px; cursor: pointer; color: #999; &:hover { color: #333; }`;
const Form = styled.form`padding: 25px 30px;`;
const FormRow = styled.div`display: flex; gap: 15px; flex-wrap: wrap;`;
const FormGroup = styled.div`flex: 1; min-width: 140px; margin-bottom: 15px;`;
const Label = styled.label`display: block; margin-bottom: 6px; font-weight: bold; color: #555; font-size: 14px;`;
const Input = styled.input`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; &:focus { outline: none; border-color: #667eea; }`;
const Textarea = styled.textarea`width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; &:focus { outline: none; border-color: #667eea; }`;
const FormActions = styled.div`display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px;`;
const CancelButton = styled.button`padding: 12px 25px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; &:hover { background: #d0d0d0; }`;
const SubmitButton = styled.button`padding: 12px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; &:hover { transform: translateY(-2px); }`;

export default Materiale;
