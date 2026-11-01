import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { STATUS_THEME } from '../utils/status';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/patients');
      setPatients(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#94a3b8',
            }}
          />
          No data
        </span>
      );
    }

    const theme = STATUS_THEME[status] || STATUS_THEME.normal;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'capitalize',
          backgroundColor: theme.bg,
          color: theme.color,
          border: `1px solid ${theme.border}`,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: theme.dotColor,
          }}
        />
        {status}
      </span>
    );
  };

  return (
    <div
      className="health-card"
      style={{
        maxWidth: '1100px',
        margin: '2rem auto',
        padding: '2rem',
        borderRadius: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.75rem', fontWeight: 700 }}>
            Patients Directory
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Active monitoring and patient census
          </p>
        </div>

        <Link
          to="/patients/add"
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          + Add Patient
        </Link>
      </div>

      {loading && (
        <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
          Loading patients...
        </div>
      )}

      {error && (
        <div
          style={{
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && patients.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>No patients found.</p>
          <Link
            to="/patients/add"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '6px',
              fontWeight: 600,
            }}
          >
            Admit your first patient
          </Link>
        </div>
      )}

      {!loading && !error && patients.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.92rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem 1rem', color: '#334155' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: '#334155' }}>Name</th>
                <th style={{ padding: '0.75rem 1rem', color: '#334155' }}>Age</th>
                <th style={{ padding: '0.75rem 1rem', color: '#334155' }}>Gender</th>
                <th style={{ padding: '0.75rem 1rem', color: '#334155' }}>Condition</th>
                <th style={{ padding: '0.75rem 1rem', color: '#334155' }}>Admitted By</th>
                <th style={{ padding: '0.75rem 1rem', color: '#334155', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient._id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.1s' }}
                >
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {getStatusBadge(patient.status)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Link
                      to={`/patients/${patient._id}`}
                      style={{
                        color: '#0284c7',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      {patient.name}
                    </Link>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{patient.age}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155', textTransform: 'capitalize' }}>
                    {patient.gender}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                    {patient.condition || 'Stable'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                    {patient.admittedBy?.name || 'Staff'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <Link
                        to={`/patients/${patient._id}`}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: '#f0f9ff',
                          color: '#0284c7',
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          border: '1px solid #bae6fd',
                        }}
                      >
                        Monitor
                      </Link>
                      <Link
                        to={`/patients/${patient._id}/report`}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          borderRadius: '4px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        Report
                      </Link>
                      <button
                        onClick={() => handleDelete(patient._id, patient.name)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList;
