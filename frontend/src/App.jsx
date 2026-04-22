import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts & Security
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Pages
import Dashboard from './pages/Dashboard';
import Habitaciones from './pages/Habitaciones';
import Reservas from './pages/Reservas';
import Clientes from './pages/Clientes';
import Servicios from './pages/Servicios';
import Paquetes from './pages/Paquetes';
import Configuracion from './pages/Configuracion';
import RolesPermisos from './pages/RolesPermisos';
import ClientePortal from './pages/ClientePortal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Area */}
          <Route element={<ProtectedRoute />}>
            {/* Client Portal (separate layout) */}
            <Route path="/mi-portal" element={<ClientePortal />} />

            {/* Admin Area */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="habitaciones" element={<Habitaciones />} />
              <Route path="reservas" element={<Reservas />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="servicios" element={<Servicios />} />
              <Route path="paquetes" element={<Paquetes />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="roles-permisos" element={<RolesPermisos />} />
              
              <Route path="*" element={
                <div className="page-container glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
                  <h2>Módulo no encontrado</h2>
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Verifica la URL ingresada.</p>
                </div>
              } />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
