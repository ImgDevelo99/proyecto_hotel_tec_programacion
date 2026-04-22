import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthLayout.css'; // Optional styling for the auth background

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // Si ya está logueado, mandarlo directo al dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-layout-container">
      <div className="auth-background">
        <div className="glow-orb primary-orb"></div>
        <div className="glow-orb secondary-orb"></div>
      </div>
      <div className="auth-content-wrapper">
         <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
