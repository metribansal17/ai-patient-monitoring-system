const Vitals = require('../models/Vitals');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { detectRisk, getStatus } = require('../utils/riskDetector');

const addVitals = async (req, res) => {
  try {
    const { patient, heartRate, spo2, temperature } = req.body;

    if (!(heartRate > 0) || !(spo2 > 0 && spo2 <= 100) || !(temperature > 0)) {
      return res.status(400).json({ message: 'Invalid sensor reading' });
    }

    if (!patient || heartRate === undefined || spo2 === undefined || temperature === undefined) {
      return res.status(400).json({ message: 'Patient, heartRate, spo2, and temperature are required' });
    }

    const vitals = await Vitals.create({
      patient,
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      temperature: Number(temperature),
    });

    const risks = detectRisk({
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      temperature: Number(temperature),
    });

    const createdAlerts = [];
    if (risks.length > 0) {
      for (const risk of risks) {
        const alert = await Alert.create({
          patient,
          vitals: vitals._id,
          message: risk.message,
          severity: risk.severity,
        });
        createdAlerts.push(alert);
      }
    }

    const io = req.app.get('io');
    if (io) {
      if (createdAlerts.length > 0) {
        io.emit('newAlerts', createdAlerts);
      }
      io.emit('vitalsUpdate', vitals);
    }

    return res.status(201).json(vitals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVitalsByPatient = async (req, res) => {
  try {
    const vitals = await Vitals.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(vitals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVitalsSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { hours = '24' } = req.query;

    const patient = await Patient.findById(patientId)
      .populate('assignedDoctor', 'name email')
      .populate('admittedBy', 'name email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const to = new Date();
    let from = null;
    const query = { patient: patientId };

    if (hours !== 'all') {
      const h = Number(hours) || 24;
      from = new Date(to.getTime() - h * 60 * 60 * 1000);
      query.createdAt = { $gte: from, $lte: to };
    }

    const vitals = await Vitals.find(query).sort({ createdAt: 1 });
    const count = vitals.length;

    if (count > 0 && !from) {
      from = vitals[0].createdAt;
    }

    let stats = {
      heartRate: { min: null, avg: null, max: null },
      spo2: { min: null, avg: null, max: null },
      temperature: { min: null, avg: null, max: null },
    };

    let overallStatus = 'normal';

    if (count > 0) {
      let hrMin = Infinity, hrMax = -Infinity, hrSum = 0;
      let spo2Min = Infinity, spo2Max = -Infinity, spo2Sum = 0;
      let tempMin = Infinity, tempMax = -Infinity, tempSum = 0;
      let hasWarning = false;

      for (const v of vitals) {
        if (v.heartRate < hrMin) hrMin = v.heartRate;
        if (v.heartRate > hrMax) hrMax = v.heartRate;
        hrSum += v.heartRate;

        if (v.spo2 < spo2Min) spo2Min = v.spo2;
        if (v.spo2 > spo2Max) spo2Max = v.spo2;
        spo2Sum += v.spo2;

        if (v.temperature < tempMin) tempMin = v.temperature;
        if (v.temperature > tempMax) tempMax = v.temperature;
        tempSum += v.temperature;

        const vStatus = getStatus(v);
        if (vStatus === 'critical') {
          overallStatus = 'critical';
        } else if (vStatus === 'warning') {
          hasWarning = true;
        }
      }

      if (overallStatus !== 'critical' && hasWarning) {
        overallStatus = 'warning';
      }

      stats = {
        heartRate: {
          min: hrMin,
          avg: Math.round((hrSum / count) * 10) / 10,
          max: hrMax,
        },
        spo2: {
          min: spo2Min,
          avg: Math.round((spo2Sum / count) * 10) / 10,
          max: spo2Max,
        },
        temperature: {
          min: Math.round(tempMin * 10) / 10,
          avg: Math.round((tempSum / count) * 10) / 10,
          max: Math.round(tempMax * 10) / 10,
        },
      };
    }

    // Alerts query
    const alertQuery = { patient: patientId };
    if (from) {
      alertQuery.createdAt = { $gte: from, $lte: to };
    }
    const alerts = await Alert.find(alertQuery).sort({ createdAt: -1 });

    const alertCounts = { warning: 0, critical: 0 };
    alerts.forEach((a) => {
      if (a.severity === 'critical') alertCounts.critical++;
      else if (a.severity === 'warning') alertCounts.warning++;
    });

    const latestAlerts = alerts.slice(0, 20);

    const latest30 = vitals.slice(-30).reverse().map((v) => ({
      _id: v._id,
      patient: v.patient,
      heartRate: v.heartRate,
      spo2: v.spo2,
      temperature: v.temperature,
      createdAt: v.createdAt,
      status: getStatus(v),
    }));

    return res.json({
      patient,
      from,
      to,
      count,
      stats,
      overallStatus,
      alertCounts,
      alerts: latestAlerts,
      readings: latest30,
      chartReadings: vitals.map((v) => ({
        _id: v._id,
        heartRate: v.heartRate,
        spo2: v.spo2,
        temperature: v.temperature,
        createdAt: v.createdAt,
        status: getStatus(v),
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addVitals,
  getVitalsByPatient,
  getVitalsSummary,
};
