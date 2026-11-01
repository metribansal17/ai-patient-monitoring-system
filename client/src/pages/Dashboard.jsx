import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    axiosInstance.get('/patients')
      .then((res) => setPatientCount(res.data.length))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="health-card"
      style={{
        maxWidth: '900px',
        margin: '2rem auto',
        padding: '2.5rem',
        borderRadius: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.25rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: 700 }}>
            Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Welcome, <strong style={{ color: '#0f172a' }}>{user?.name || 'User'}</strong> ({user?.role || 'nurse'})
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1.02rem', margin: 0 }}>
          Central telemetry monitor for clinical staff. View admitted patients, monitor real-time heart rate, SpO2, and body temperature streams, and generate clinical summary health reports.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
          }}
        >
          <div style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Patients
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0284c7', margin: '0.35rem 0' }}>
            {patientCount}
          </div>
          <div style={{ color: '#0369a1', fontSize: '0.85rem' }}>
            Under active care
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
          }}
        >
          <div style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Telemetry Status
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', margin: '0.75rem 0 0.35rem 0' }}>
            🟢 Live Online
          </div>
          <div style={{ color: '#15803d', fontSize: '0.85rem' }}>
            Socket.io &amp; Sensor gateway connected
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#faf5ff',
            border: '1px solid #e9d5ff',
            borderRadius: '10px',
          }}
        >
          <div style={{ color: '#7e22ce', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            Hardware Device (ESP32)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9333ea', margin: '0.75rem 0 0.35rem 0' }}>
            API Ready
          </div>
          <div style={{ color: '#7e22ce', fontSize: '0.85rem' }}>
            Ready for hardware telemetry
          </div>
        </div>
      </div>

      {/* Navigation action buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to="/patients"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          View Patients →
        </Link>

        <Link
          to="/patients/add"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#ffffff',
            color: '#0284c7',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '1rem',
            border: '1px solid #0284c7',
          }}
        >
          + Admit Patient
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
