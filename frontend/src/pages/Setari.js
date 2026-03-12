import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Setari = () => {
  const { user, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({
    nume_complet: '',
    email: '',
    telefon: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    parola_noua: '',
    confirmare_parola: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/profile').then(r => {
      if (r.data.success) {
        setProfileForm({
          nume_complet: r.data.data.nume_complet || '',
          email: r.data.data.email || '',
          telefon: r.data.data.telefon || ''
        });
      }
    }).catch(() => {});
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profilul a fost actualizat cu succes!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la actualizarea profilului');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.parola_noua !== passwordForm.confirmare_parola) {
      toast.error('Parolele nu coincid!');
      return;
    }
    if (passwordForm.parola_noua.length < 6) {
      toast.error('Parola trebuie să aibă minim 6 caractere!');
      return;
    }
    try {
      await api.put('/auth/password', { parola_noua: passwordForm.parola_noua });
      toast.success('Parola a fost schimbată cu succes!');
      setPasswordForm({ parola_noua: '', confirmare_parola: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Eroare la schimbarea parolei');
    }
  };

  return (
    <Container>
      <Title>⚙️ Setări</Title>

      <Grid>
        <Card>
          <CardTitle>👤 Profil utilizator</CardTitle>
          <UserBadge>
            <Avatar>{user?.nume_complet?.charAt(0) || user?.username?.charAt(0) || '?'}</Avatar>
            <UserInfo>
              <UserName>{user?.nume_complet || user?.username}</UserName>
              <UserRole>{user?.rol} · {user?.username}</UserRole>
            </UserInfo>
          </UserBadge>
          <Form onSubmit={handleProfileSubmit}>
            <FormGroup>
              <Label>Nume Complet</Label>
              <Input type="text" name="nume_complet" value={profileForm.nume_complet} onChange={handleProfileChange} />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} />
            </FormGroup>
            <FormGroup>
              <Label>Telefon</Label>
              <Input type="tel" name="telefon" value={profileForm.telefon} onChange={handleProfileChange} />
            </FormGroup>
            <SaveButton type="submit" disabled={profileLoading}>
              {profileLoading ? '⏳ Se salvează...' : '💾 Salvează Profilul'}
            </SaveButton>
          </Form>
        </Card>

        <Card>
          <CardTitle>🔒 Schimbare Parolă</CardTitle>
          <Form onSubmit={handlePasswordSubmit}>
            <FormGroup>
              <Label>Parolă Nouă (min. 6 caractere)</Label>
              <Input type="password" name="parola_noua" value={passwordForm.parola_noua} onChange={handlePasswordChange} required minLength={6} />
            </FormGroup>
            <FormGroup>
              <Label>Confirmă Parola Nouă</Label>
              <Input type="password" name="confirmare_parola" value={passwordForm.confirmare_parola} onChange={handlePasswordChange} required minLength={6} />
            </FormGroup>
            <SaveButton type="submit">🔑 Schimbă Parola</SaveButton>
          </Form>
        </Card>

        <Card danger>
          <CardTitle>🚪 Sesiune</CardTitle>
          <InfoText>Ești autentificat ca <strong>{user?.username}</strong> cu rolul <strong>{user?.rol}</strong>.</InfoText>
          <InfoText>Versiune aplicație: <strong>1.0.0</strong></InfoText>
          <DangerButton onClick={logout}>🚪 Deconectare</DangerButton>
        </Card>
      </Grid>
    </Container>
  );
};

const Container = styled.div`padding: 30px;`;
const Title = styled.h1`font-size: 32px; color: #333; margin-bottom: 30px;`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px; align-items: start;`;
const Card = styled.div`background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 4px solid ${p => p.danger ? '#f44336' : '#667eea'};`;
const CardTitle = styled.h2`font-size: 20px; color: #333; margin-bottom: 20px;`;
const UserBadge = styled.div`display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding: 15px; background: #f5f5f5; border-radius: 10px;`;
const Avatar = styled.div`width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; flex-shrink: 0;`;
const UserInfo = styled.div``;
const UserName = styled.div`font-weight: bold; font-size: 16px; color: #333;`;
const UserRole = styled.div`font-size: 13px; color: #999; text-transform: capitalize;`;
const Form = styled.form`display: flex; flex-direction: column; gap: 15px;`;
const FormGroup = styled.div``;
const Label = styled.label`display: block; margin-bottom: 6px; font-weight: bold; color: #555; font-size: 14px;`;
const Input = styled.input`width: 100%; padding: 10px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 15px; &:focus { outline: none; border-color: #667eea; }`;
const SaveButton = styled.button`padding: 12px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 5px; transition: transform 0.2s; &:hover { transform: translateY(-2px); } &:disabled { opacity: 0.6; cursor: not-allowed; }`;
const DangerButton = styled.button`padding: 12px 20px; background: #f44336; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 20px; transition: transform 0.2s; &:hover { background: #d32f2f; }`;
const InfoText = styled.p`color: #555; margin-bottom: 10px; font-size: 15px; line-height: 1.5;`;

export default Setari;
