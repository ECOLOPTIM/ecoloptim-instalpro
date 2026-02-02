import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    parola: '',
    confirmare_parola: '',
    nume_complet: '',
    telefon: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validare parole
    if (formData.parola !== formData.confirmare_parola) {
      setError('Parolele nu coincid!');
      return;
    }

    if (formData.parola.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere!');
      return;
    }

    setLoading(true);

    try {
      const { confirmare_parola, ...dataToSend } = formData;
      const result = await register(dataToSend);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Eroare la înregistrare');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare de conectare la server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <RegisterBox>
        <Logo>🏗️</Logo>
        <Title>Ecoloptim InstalPro</Title>
        <Subtitle>Creare cont nou</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="Username (minim 3 caractere)"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="parola"
            placeholder="Parola (minim 6 caractere)"
            value={formData.parola}
            onChange={handleChange}
            required
            minLength="6"
          />
          <Input
            type="password"
            name="confirmare_parola"
            placeholder="Confirmă parola"
            value={formData.confirmare_parola}
            onChange={handleChange}
            required
          />
          <Input
            type="text"
            name="nume_complet"
            placeholder="Nume complet"
            value={formData.nume_complet}
            onChange={handleChange}
            required
          />
          <Input
            type="tel"
            name="telefon"
            placeholder="Telefon (opțional)"
            value={formData.telefon}
            onChange={handleChange}
          />
          <Button type="submit" disabled={loading}>
            {loading ? '⏳ Se înregistrează...' : '✅ Creare cont'}
          </Button>
        </Form>
        
        <LoginLink>
          Ai deja cont? <Link to="/login">Autentifică-te</Link>
        </LoginLink>
      </RegisterBox>
    </Container>
  );
};

// Styled Components (refolosim din Login)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterBox = styled.div`
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 450px;
`;

const Logo = styled.div`
  font-size: 64px;
  text-align: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
`;

const Subtitle = styled.h2`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 18px;
  font-weight: normal;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
  border: 1px solid #ef9a9a;
  font-size: 14px;
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: 20px;
  color: #666;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export default Register;