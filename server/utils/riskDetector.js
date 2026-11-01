const detectRisk = (vitals) => {
  const risks = [];
  const { heartRate, spo2, temperature } = vitals;

  // Heart Rate
  if (heartRate > 120) {
    risks.push({
      message: `High heart rate detected: ${heartRate} bpm`,
      severity: 'critical',
    });
  } else if (heartRate < 50) {
    risks.push({
      message: `Low heart rate detected: ${heartRate} bpm`,
      severity: 'critical',
    });
  } else if (heartRate > 100) {
    risks.push({
      message: `Elevated heart rate: ${heartRate} bpm`,
      severity: 'warning',
    });
  }

  // SpO2
  if (spo2 < 90) {
    risks.push({
      message: `Critical low SpO2: ${spo2}%`,
      severity: 'critical',
    });
  } else if (spo2 < 94) {
    risks.push({
      message: `Low SpO2: ${spo2}%`,
      severity: 'warning',
    });
  }

  // Temperature
  if (temperature > 39) {
    risks.push({
      message: `High fever detected: ${temperature}°C`,
      severity: 'critical',
    });
  } else if (temperature > 38) {
    risks.push({
      message: `Elevated temperature: ${temperature}°C`,
      severity: 'warning',
    });
  }

  return risks;
};

const getStatus = (vitals) => {
  if (!vitals) return 'normal';
  const risks = detectRisk(vitals);
  if (risks.some((r) => r.severity === 'critical')) return 'critical';
  if (risks.some((r) => r.severity === 'warning')) return 'warning';
  return 'normal';
};

module.exports = { detectRisk, getStatus };
