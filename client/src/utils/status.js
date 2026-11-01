// Thresholds mirrored directly from server/utils/riskDetector.js

export const getHeartRateStatus = (hr) => {
  if (hr === undefined || hr === null || isNaN(hr)) return 'normal';
  const val = Number(hr);
  if (val > 120 || val < 50) return 'critical';
  if (val > 100) return 'warning';
  return 'normal';
};

export const getSpo2Status = (spo2) => {
  if (spo2 === undefined || spo2 === null || isNaN(spo2)) return 'normal';
  const val = Number(spo2);
  if (val < 90) return 'critical';
  if (val < 94) return 'warning';
  return 'normal';
};

export const getTemperatureStatus = (temp) => {
  if (temp === undefined || temp === null || isNaN(temp)) return 'normal';
  const val = Number(temp);
  if (val > 39) return 'critical';
  if (val > 38) return 'warning';
  return 'normal';
};

export const getStatus = (vitals) => {
  if (!vitals) return 'normal';
  const hrStatus = getHeartRateStatus(vitals.heartRate);
  const spo2Status = getSpo2Status(vitals.spo2);
  const tempStatus = getTemperatureStatus(vitals.temperature);

  if (hrStatus === 'critical' || spo2Status === 'critical' || tempStatus === 'critical') {
    return 'critical';
  }
  if (hrStatus === 'warning' || spo2Status === 'warning' || tempStatus === 'warning') {
    return 'warning';
  }
  return 'normal';
};

export const STATUS_THEME = {
  normal: {
    key: 'normal',
    label: 'Normal - all vitals within range',
    badgeText: 'All vitals normal',
    color: '#16a34a', // emerald green
    bg: '#f0fdf4',
    border: '#86efac',
    lightBorder: '#bbf7d0',
    dotColor: '#22c55e',
  },
  warning: {
    key: 'warning',
    label: 'Warning - check patient',
    badgeText: 'Warning - check patient',
    color: '#d97706', // amber
    bg: '#fefce8',
    border: '#fde047',
    lightBorder: '#fef08a',
    dotColor: '#eab308',
  },
  critical: {
    key: 'critical',
    label: 'Critical - immediate attention',
    badgeText: 'Critical - immediate attention',
    color: '#dc2626', // crimson red
    bg: '#fef2f2',
    border: '#fca5a5',
    lightBorder: '#fecaca',
    dotColor: '#ef4444',
  },
  none: {
    key: 'none',
    label: 'No data',
    badgeText: 'No data',
    color: '#64748b',
    bg: '#f8fafc',
    border: '#cbd5e1',
    lightBorder: '#e2e8f0',
    dotColor: '#94a3b8',
  },
};
