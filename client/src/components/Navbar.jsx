import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/patients' && location.pathname.startsWith('/patients')) return true;
    return location.pathname === path;
  };

  return (
    <nav
      className="no-print"
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Brand / Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            +
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}
          >
            AI Patient Monitor
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/dashboard"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: location.pathname === '/dashboard' ? '#0284c7' : '#475569',
              backgroundColor: location.pathname === '/dashboard' ? '#f0f9ff' : 'transparent',
              transition: 'background-color 0.15s',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/patients"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 500,
              color: isActive('/patients') ? '#0284c7' : '#475569',
              backgroundColor: isActive('/patients') ? '#f0f9ff' : 'transparent',
              transition: 'background-color 0.15s',
            }}
          >
            Patients
          </Link>
        </div>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
              {user.name}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                fontWeight: 600,
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
              }}
            >
              {user.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #fecaca',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
