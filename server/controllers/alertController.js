const Alert = require('../models/Alert');

const getAlertsByPatient = async (req, res) => {
  try {
    const alerts = await Alert.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(alerts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAlertsByPatient,
};
