import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <TopBar title="Sistema de Reservas" />
        <main className="layout-main animate-fade-in animate-delay-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
