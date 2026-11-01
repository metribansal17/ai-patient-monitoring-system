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
import {
  getStatus,
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  STATUS_THEME,
} from '../utils/status';

const Report = () => {
  const { id } = useParams();
  const [range, setRange] = useState('24'); // '1', '24', or 'all'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');

  const fetchSummary = async (selectedRange) => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/vitals/${id}/summary?hours=${selectedRange}`);
      setData(res.data);
      setGeneratedAt(new Date().toLocaleString());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(range);
  }, [id, range]);

  const handlePrint = () => {
    window.print();
  };

  const getCellBg = (status) => {
    if (status === 'critical') return '#fef2f2';
    if (status === 'warning') return '#fefce8';
    return '#f0fdf4';
  };

  const getCellColor = (status) => {
    if (status === 'critical') return '#dc2626';
    if (status === 'warning') return '#d97706';
    return '#16a34a';
  };

  const overallStatus = data?.overallStatus || 'normal';
  const statusTheme = STATUS_THEME[overallStatus] || STATUS_THEME.normal;

  return (
    <div
      className="report-page-container"
      style={{
        maxWidth: '1000px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Action Bar (hidden on print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link
          to={`/patients/${id}`}
          style={{
            color: '#0284c7',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          ← Back to Live Monitor
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Time range selector */}
          <div
            className="time-range-selector"
            style={{
              display: 'inline-flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '0.25rem',
            }}
          >
            {[
              { label: 'Last 1 hour', value: '1' },
              { label: 'Last 24 hours', value: '24' },
              { label: 'All', value: 'all' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setRange(btn.value)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: range === btn.value ? '#ffffff' : 'transparent',
                  color: range === btn.value ? '#0284c7' : '#64748b',
                  boxShadow: range === btn.value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Download PDF button */}
          <button
            onClick={handlePrint}
            className="btn-print"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.2rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            🖨️ Download PDF / Print
          </button>
        </div>
      </div>

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          Generating Patient Health Report...
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <div>
          {/* Header */}
          <header
            style={{
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  color: '#0284c7',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.2rem',
                }}
              >
                AI Based Patient Monitoring System
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  color: '#0f172a',
                  fontWeight: 700,
                }}
              >
                Patient Health Report
              </h1>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>
              <div>Generated: <strong>{generatedAt}</strong></div>
              <div>Range: <strong>{range === 'all' ? 'All records' : `Last ${range} hours`}</strong></div>
              <div>Telemetry readings analyzed: <strong>{data.count}</strong></div>
            </div>
          </header>

          {/* Patient Details */}
          <section
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.95rem',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.75rem',
              }}
            >
              Patient Information
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Name</span>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{data.patient?.name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Age / Gender</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                  {data.patient?.age} yrs / <span style={{ textTransform: 'capitalize' }}>{data.patient?.gender}</span>
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Clinical Condition</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{data.patient?.condition || 'Stable'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Admitted By</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                  {data.patient?.admittedBy?.name || 'Staff'}
                </strong>
              </div>
            </div>
          </section>

          {/* Big Overall Result Badge */}
          <section
            className={overallStatus === 'critical' ? 'pulse-critical' : ''}
            style={{
              backgroundColor: statusTheme.bg,
              border: `2px solid ${statusTheme.border}`,
              borderRadius: '10px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: statusTheme.dotColor,
                }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, color: statusTheme.color }}>
                  Overall Assessment ({range === 'all' ? 'All Time' : `Last ${range}h`})
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: statusTheme.color }}>
                  {statusTheme.badgeText}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: statusTheme.color, fontWeight: 600 }}>
              {data.alertCounts.critical > 0
                ? `${data.alertCounts.critical} critical alert(s) triggered`
                : data.alertCounts.warning > 0
                ? `${data.alertCounts.warning} warning alert(s) triggered`
                : 'No adverse telemetry detected'}
            </div>
          </section>

          {/* Summary Table: min / avg / max */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 700 }}>
              Vitals Summary (Min / Average / Max)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.92rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#334155' }}>Vital Metric</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#334155' }}>Min</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#334155' }}>Average</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#334155' }}>Max</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748b' }}>Standard Range</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Heart Rate */}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      Heart Rate (bpm)
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getHeartRateStatus(data.stats.heartRate.min)),
                        color: getCellColor(getHeartRateStatus(data.stats.heartRate.min)),
                      }}
                    >
                      {data.stats.heartRate.min !== null ? `${data.stats.heartRate.min} bpm` : 'N/A'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getHeartRateStatus(data.stats.heartRate.avg)),
                        color: getCellColor(getHeartRateStatus(data.stats.heartRate.avg)),
                      }}
                    >
                      {data.stats.heartRate.avg !== null ? `${data.stats.heartRate.avg} bpm` : 'N/A'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getHeartRateStatus(data.stats.heartRate.max)),
                        color: getCellColor(getHeartRateStatus(data.stats.heartRate.max)),
                      }}
                    >
                      {data.stats.heartRate.max !== null ? `${data.stats.heartRate.max} bpm` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      60 – 100 bpm (Warn &gt;100, Crit &gt;120 / &lt;50)
                    </td>
                  </tr>

                  {/* SpO2 */}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      Blood Oxygen (SpO2)
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getSpo2Status(data.stats.spo2.min)),
                        color: getCellColor(getSpo2Status(data.stats.spo2.min)),
                      }}
                    >
                      {data.stats.spo2.min !== null ? `${data.stats.spo2.min}%` : 'N/A'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getSpo2Status(data.stats.spo2.avg)),
                        color: getCellColor(getSpo2Status(data.stats.spo2.avg)),
                      }}
                    >
                      {data.stats.spo2.avg !== null ? `${data.stats.spo2.avg}%` : 'N/A'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getSpo2Status(data.stats.spo2.max)),
                        color: getCellColor(getSpo2Status(data.stats.spo2.max)),
                      }}
                    >
                      {data.stats.spo2.max !== null ? `${data.stats.spo2.max}%` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      94% – 100% (Warn &lt;94%, Crit &lt;90%)
                    </td>
                  </tr>

                  {/* Temperature */}
                  <tr>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                      Body Temperature (°C)
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getTemperatureStatus(data.stats.temperature.min)),
                        color: getCellColor(getTemperatureStatus(data.stats.temperature.min)),
                      }}
                    >
                      {data.stats.temperature.min !== null ? `${data.stats.temperature.min}°C` : 'N/A'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getTemperatureStatus(data.stats.temperature.avg)),
                        color: getCellColor(getTemperatureStatus(data.stats.temperature.avg)),
                      }}
                    >
                      {data.stats.temperature.avg !== null ? `${data.stats.temperature.avg}°C` : 'N/A'}
                    </td>
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        backgroundColor: getCellBg(getTemperatureStatus(data.stats.temperature.max)),
                        color: getCellColor(getTemperatureStatus(data.stats.temperature.max)),
                      }}
                    >
                      {data.stats.temperature.max !== null ? `${data.stats.temperature.max}°C` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>
                      36.0°C – 37.5°C (Warn &gt;38°C, Crit &gt;39°C)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Alert Summary */}
          <section style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', color: '#0f172a', margin: 0, fontWeight: 700 }}>
                Alerts Summary
              </h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  Critical: {data.alertCounts.critical}
                </span>
                <span
                  style={{
                    backgroundColor: '#fefce8',
                    border: '1px solid #fef08a',
                    color: '#d97706',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  Warnings: {data.alertCounts.warning}
                </span>
              </div>
            </div>

            {data.alerts.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                No alerts recorded in this time range.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.alerts.map((alert) => {
                  const isCrit = alert.severity === 'critical';
                  return (
                    <div
                      key={alert._id}
                      style={{
                        padding: '0.65rem 0.9rem',
                        backgroundColor: isCrit ? '#fef2f2' : '#fefce8',
                        borderLeft: `4px solid ${isCrit ? '#dc2626' : '#f59e0b'}`,
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            color: isCrit ? '#dc2626' : '#d97706',
                            marginRight: '0.5rem',
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                          }}
                        >
                          {alert.severity}
                        </strong>
                        <span style={{ color: '#1e293b' }}>{alert.message}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Line Chart */}
          <section className="chart-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 700 }}>
              Telemetry Trend in Selected Range
            </h2>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              {data.chartReadings && data.chartReadings.length > 0 ? (
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                      data={data.chartReadings.map((r) => ({
                        time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        heartRate: r.heartRate,
                        spo2: r.spo2,
                      }))}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                    >
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
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="spo2"
                        name="SpO2 (%)"
                        stroke="#0284c7"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                  No readings available for this period.
                </div>
              )}
            </div>
          </section>

          {/* Table of Latest 30 Readings */}
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 700 }}>
              Readings Log (Latest {data.readings.length})
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.88rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: '#334155' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>Heart Rate</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>SpO2</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>Temperature</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', color: '#334155' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.readings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                        No readings recorded.
                      </td>
                    </tr>
                  ) : (
                    data.readings.map((r, i) => {
                      const st = r.status || getStatus(r);
                      const theme = STATUS_THEME[st] || STATUS_THEME.normal;
                      return (
                        <tr
                          key={r._id || i}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                          }}
                        >
                          <td style={{ padding: '0.55rem 0.8rem', color: '#475569' }}>
                            {new Date(r.createdAt).toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: '0.55rem 0.8rem',
                              textAlign: 'center',
                              fontWeight: 600,
                              color: getCellColor(getHeartRateStatus(r.heartRate)),
                            }}
                          >
                            {r.heartRate} bpm
                          </td>
                          <td
                            style={{
                              padding: '0.55rem 0.8rem',
                              textAlign: 'center',
                              fontWeight: 600,
                              color: getCellColor(getSpo2Status(r.spo2)),
                            }}
                          >
                            {r.spo2}%
                          </td>
                          <td
                            style={{
                              padding: '0.55rem 0.8rem',
                              textAlign: 'center',
                              fontWeight: 600,
                              color: getCellColor(getTemperatureStatus(r.temperature)),
                            }}
                          >
                            {r.temperature}°C
                          </td>
                          <td style={{ padding: '0.55rem 0.8rem', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.6rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                backgroundColor: theme.bg,
                                color: theme.color,
                                border: `1px solid ${theme.border}`,
                              }}
                            >
                              {theme.key}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer Disclaimer */}
          <footer
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
              color: '#64748b',
              fontSize: '0.8rem',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>
              Generated from prototype sensor readings (MAX30102, DS18B20). This is a monitoring aid, not a medical diagnosis.
            </p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Report;
