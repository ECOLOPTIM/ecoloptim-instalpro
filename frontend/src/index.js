import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f3f4f6'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#2563eb', marginBottom: '1rem' }}>
        🏗️ Ecoloptim InstalPro
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#6b7280' }}>
        Aplicația funcționează!
      </p>
      <p style={{ marginTop: '2rem', color: '#9ca3af' }}>
        Version 1.0.0
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);