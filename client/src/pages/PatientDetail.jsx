import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import axiosInstance from '../api/axiosInstance';
import { useSocket } from '../context/SocketContext';
import {
  getStatus,
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  STATUS_THEME,
} from '../utils/status';

const PatientDetail = () => {
  const { id } = useParams();
  const socket = useSocket();

  const [patient, setPatient] = useState(null);
  const [vitalsList, setVitalsList] = useState([]);
  const [latestVitals, setLatestVitals] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial patient info, vitals, and alerts
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [patientRes, vitalsRes, alertsRes] = await Promise.all([
          axiosInstance.get(`/patients/${id}`).catch(() => ({ data: null })),
          axiosInstance.get(`/vitals/${id}`),
          axiosInstance.get(`/alerts/${id}`),
        ]);

        if (isMounted) {
          if (patientRes.data) {
            setPatient(patientRes.data);
          }

          // Reverse array from oldest to newest
          const orderedVitals = [...vitalsRes.data].reverse();
          setVitalsList(orderedVitals.slice(-20));

          if (orderedVitals.length > 0) {
            setLatestVitals(orderedVitals[orderedVitals.length - 1]);
          }

          setAlerts(alertsRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    const handleVitalsUpdate = (newVitals) => {
      const patientId =
        typeof newVitals.patient === 'object'
          ? newVitals.patient?._id
          : newVitals.patient;

      if (patientId === id) {
        setLatestVitals(newVitals);
        setVitalsList((prev) => {
          const nextList = [...prev, newVitals];
          return nextList.slice(-20);
        });
      }
    };

    const handleNewAlerts = (incomingAlerts) => {
      const alertArray = Array.isArray(incomingAlerts)
        ? incomingAlerts
        : [incomingAlerts];

      const matchingAlerts = alertArray.filter((alert) => {
        const patientId =
          typeof alert.patient === 'object'
            ? alert.patient?._id
            : alert.patient;
        return patientId === id;
      });

      if (matchingAlerts.length > 0) {
        setAlerts((prev) => [...matchingAlerts, ...prev].slice(0, 20));
      }
    };

    socket.on('vitalsUpdate', handleVitalsUpdate);
    socket.on('newAlerts', handleNewAlerts);

    return () => {
      socket.off('vitalsUpdate', handleVitalsUpdate);
      socket.off('newAlerts', handleNewAlerts);
    };
  }, [socket, id]);

  const hasCriticalAlert = alerts.some(
    (alert) => alert.severity === 'critical' && !alert.resolved
  );

  const chartData = vitalsList.map((v) => ({
    time: new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    heartRate: v.heartRate,
    spo2: v.spo2,
  }));

  // Overall reading status for latest reading
  const currentStatus = latestVitals ? getStatus(latestVitals) : 'none';
  const statusConfig = STATUS_THEME[currentStatus] || STATUS_THEME.none;

  // Individual vital statuses
  const hrStatus = latestVitals ? getHeartRateStatus(latestVitals.heartRate) : 'none';
  const spo2Status = latestVitals ? getSpo2Status(latestVitals.spo2) : 'none';
  const tempStatus = latestVitals ? getTemperatureStatus(latestVitals.temperature) : 'none';

  const hrTheme = STATUS_THEME[hrStatus] || STATUS_THEME.none;
  const spo2Theme = STATUS_THEME[spo2Status] || STATUS_THEME.none;
  const tempTheme = STATUS_THEME[tempStatus] || STATUS_THEME.none;

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top Navigation & Action Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link
          to="/patients"
          style={{
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          ← Back to Patients
        </Link>

        <Link
          to={`/patients/${id}/report`}
          style={{
            padding: '0.55rem 1.1rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          📊 View Report
        </Link>
      </div>

      {/* Header Info */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', margin: '0.25rem 0 0.5rem 0', fontSize: '1.85rem', fontWeight: 700 }}>
          Live Vitals Monitor
        </h1>
        {patient && (
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Patient: <strong style={{ color: '#0f172a' }}>{patient.name}</strong> ({patient.age} yrs,{' '}
            <span style={{ textTransform: 'capitalize' }}>{patient.gender}</span>) &bull; Condition:{' '}
            <strong style={{ color: '#0f172a' }}>{patient.condition || 'Stable'}</strong>
          </p>
        )}
      </div>

      {/* Large Live Status Card */}
      {latestVitals && (
        <div
          className={currentStatus === 'critical' ? 'pulse-critical' : ''}
          style={{
            backgroundColor: statusConfig.bg,
            border: `2px solid ${statusConfig.border}`,
            borderRadius: '12px',
            padding: '1.25rem 2rem',
            margin: '0 auto 1.75rem auto',
            maxWidth: '850px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: statusConfig.dotColor,
            }}
          />
          <div
            style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              color: statusConfig.color,
              letterSpacing: '-0.01em',
            }}
          >
            {statusConfig.label}
          </div>
        </div>
      )}

      {/* Critical Alert Banner (if any unresolved critical alert exists) */}
      {hasCriticalAlert && (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '2px solid #e63946',
            color: '#b00020',
            fontWeight: 'bold',
            padding: '1rem',
            borderRadius: '8px',
            margin: '0 auto 1.75rem auto',
            maxWidth: '850px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>⚠</span> Critical alert active for this patient — please review immediately.
        </div>
      )}

      {/* Exactly Three Vital Cards (Centred) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          margin: '1.5rem 0 2.5rem 0',
        }}
      >
        {!latestVitals ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '1rem 0' }}>
            {loading ? 'Loading vitals data...' : 'Waiting for vitals data...'}
          </p>
        ) : (
          <>
            {/* Heart Rate Card */}
            <div
              className="health-card"
              style={{
                border: `2px solid ${hrTheme.border}`,
                backgroundColor: hrTheme.bg,
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                minWidth: '160px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Heart Rate
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: hrTheme.color }}>
                {latestVitals.heartRate} bpm
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: hrTheme.color, marginTop: '0.35rem' }}>
                {hrStatus}
              </div>
            </div>

            {/* SpO2 Card */}
            <div
              className="health-card"
              style={{
                border: `2px solid ${spo2Theme.border}`,
                backgroundColor: spo2Theme.bg,
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                minWidth: '160px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                SpO2
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: spo2Theme.color }}>
                {latestVitals.spo2}%
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: spo2Theme.color, marginTop: '0.35rem' }}>
                {spo2Status}
              </div>
            </div>

            {/* Temperature Card */}
            <div
              className="health-card"
              style={{
                border: `2px solid ${tempTheme.border}`,
                backgroundColor: tempTheme.bg,
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                minWidth: '160px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Temperature
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: tempTheme.color }}>
                {latestVitals.temperature}°C
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: tempTheme.color, marginTop: '0.35rem' }}>
                {tempStatus}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Real-time Vitals Chart */}
      <div
        className="health-card"
        style={{
          borderRadius: '12px',
          padding: '1.75rem',
          maxWidth: '850px',
          margin: '0 auto 2rem auto',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
            Real-time Vitals Trend
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Latest 20 telemetry points
          </span>
        </div>

        {chartData.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
            No trend data available yet.
          </p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2 (%)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Alerts List */}
      <div
        className="health-card"
        style={{
          maxWidth: '850px',
          margin: '0 auto 2rem auto',
          borderRadius: '12px',
          padding: '1.75rem',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
            Recent Alerts
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {alerts.length} alert(s)
          </span>
        </div>

        {alerts.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', margin: 0, textAlign: 'center', padding: '1rem 0' }}>
            No alerts yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const bg = isCritical ? '#fef2f2' : '#fefce8';
              const borderCol = isCritical ? '#dc2626' : '#d97706';

              return (
                <div
                  key={alert._id || `${alert.createdAt}-${Math.random()}`}
                  style={{
                    backgroundColor: bg,
                    borderLeft: `4px solid ${borderCol}`,
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        color: borderCol,
                        marginRight: '0.75rem',
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span style={{ color: '#1e293b', fontSize: '0.92rem' }}>
                      {alert.message}
                    </span>
                  </div>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
