import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  Calendar,
  LogOut,
  User
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/clienti', icon: Users, label: 'Clienți' },
    { path: '/lucrari', icon: Briefcase, label: 'Lucrări' },
    { path: '/documente', icon: FileText, label: 'Documente' },
    { path: '/facturi', icon: Receipt, label: 'Facturi' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Ecoloptim</h2>
        <p className="sidebar-subtitle">InstalPro</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <User size={20} />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.nume_complet || user?.username}</div>
            <div className="sidebar-user-role">{user?.rol === 'admin' ? 'Administrator' : 'Utilizator'}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={20} />
          <span>Deconectare</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;