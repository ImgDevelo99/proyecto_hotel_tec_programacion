import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Habitaciones from './pages/Habitaciones';
import Reservas from './pages/Reservas';
import Clientes from './pages/Clientes';
import Servicios from './pages/Servicios';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="configuracion" element={<Configuracion />} />
          {/* Default fallback for unimplemented routes */}
          <Route path="*" element={
            <div className="page-container glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
              <h2>Módulo en construcción</h2>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                Este módulo se encuentra en desarrollo.
              </p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
