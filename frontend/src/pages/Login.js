import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔐 Form submitted!');
    console.log('📝 Form data:', formData);
    
    setError('');
    setLoading(true);

    try {
      console.log('📡 Calling login...');
      const result = await login(formData.username, formData.password);
      console.log('✅ Login result:', result);

      if (result.success) {
        console.log('✅ Login successful, navigating...');
        navigate('/dashboard');
      } else {
        console.log('❌ Login failed:', result.message);
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Exception:', err);
      setError('Eroare de conectare la server');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={40} />
          </div>
          <h1>Ecoloptim InstalPro</h1>
          <p>Autentificare</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <User size={18} />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Introdu username"
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Parolă
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Introdu parola"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Se autentifică...' : 'Autentificare'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Nu ai cont? <Link to="/register">Înregistrează-te</Link></p>
          <p className="auth-demo">
            <strong>Demo:</strong> admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;