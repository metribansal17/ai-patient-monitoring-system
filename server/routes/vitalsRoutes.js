const express = require('express');
const router = express.Router();
const {
  addVitals,
  getVitalsByPatient,
  getVitalsSummary,
} = require('../controllers/vitalsController');
const { protect } = require('../middleware/authMiddleware');
const { deviceAuth } = require('../middleware/deviceAuth');

router.post('/device', deviceAuth, addVitals);
router.post('/', protect, addVitals);
router.get('/:patientId/summary', protect, getVitalsSummary);
router.get('/:patientId', protect, getVitalsByPatient);

module.exports = router;
