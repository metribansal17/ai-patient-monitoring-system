const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const { getStatus } = require('../utils/riskDetector');

const createPatient = async (req, res) => {
  try {
    const { name, age, gender, condition, assignedDoctor } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ message: 'Name, age, and gender are required' });
    }

    const patientData = {
      name,
      age,
      gender,
      condition: condition || 'Stable',
      admittedBy: req.user._id,
    };

    if (assignedDoctor) {
      patientData.assignedDoctor = assignedDoctor;
    }

    const patient = await Patient.create(patientData);
    return res.status(201).json(patient);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate('assignedDoctor', 'name email')
      .populate('admittedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const patientIds = patients.map((p) => p._id);
    const latestVitals = await Vitals.aggregate([
      { $match: { patient: { $in: patientIds } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$patient',
          latest: { $first: '$$ROOT' },
        },
      },
    ]);

    const vitalsMap = {};
    latestVitals.forEach((item) => {
      vitalsMap[item._id.toString()] = item.latest;
    });

    const patientsWithStatus = patients.map((patient) => {
      const vital = vitalsMap[patient._id.toString()];
      return {
        ...patient,
        latestVitals: vital || null,
        status: vital ? getStatus(vital) : null,
      };
    });

    return res.json(patientsWithStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'name email')
      .populate('admittedBy', 'name email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.json(patient);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.json(patient);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
