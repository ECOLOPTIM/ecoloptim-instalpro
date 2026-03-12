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
import Lucrari from './pages/Lucrari';
import Materiale from './pages/Materiale';
import Angajati from './pages/Angajati';
import Financiar from './pages/Financiar';
import Rapoarte from './pages/Rapoarte';
import Setari from './pages/Setari';

const withLayout = (Component) => (
  <PrivateRoute>
    <Layout>
      <Component />
    </Layout>
  </PrivateRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={withLayout(Dashboard)} />
          <Route path="/clienti" element={withLayout(Clienti)} />
          <Route path="/lucrari" element={withLayout(Lucrari)} />
          <Route path="/materiale" element={withLayout(Materiale)} />
          <Route path="/angajati" element={withLayout(Angajati)} />
          <Route path="/financiar" element={withLayout(Financiar)} />
          <Route path="/rapoarte" element={withLayout(Rapoarte)} />
          <Route path="/setari" element={withLayout(Setari)} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div style={{ padding: '50px', textAlign: 'center', fontSize: '24px' }}>
                404 - Pagina nu există
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
