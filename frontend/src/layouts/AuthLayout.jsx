import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthLayout.css'; // Optional styling for the auth background

const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();

  // Si ya está logueado, mandarlo a su portal respectivo
  if (isAuthenticated) {
    const role = user?.role ?? user?.IDRol;
    return <Navigate to={role === 2 ? '/mi-portal' : '/admin'} replace />;
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
