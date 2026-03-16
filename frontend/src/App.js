import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Clienti from './pages/Clienti';
import ClientDetalii from './pages/ClientDetalii';
import Lucrari from './pages/Lucrari';
import LucrareDetalii from './pages/LucrareDetalii';
import Documente from './pages/Documente';
import Facturi from './pages/Facturi';
import Calendar from './pages/Calendar';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clienti" element={<Clienti />} />
            <Route path="clienti/:id" element={<ClientDetalii />} />
            <Route path="lucrari" element={<Lucrari />} />
            <Route path="lucrari/:id" element={<LucrareDetalii />} />
            <Route path="documente" element={<Documente />} />
            <Route path="facturi" element={<Facturi />} />
            <Route path="calendar" element={<Calendar />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;