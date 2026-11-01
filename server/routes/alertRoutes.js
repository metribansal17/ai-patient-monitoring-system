const express = require('express');
const router = express.Router();
const { getAlertsByPatient } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:patientId', getAlertsByPatient);

module.exports = router;
