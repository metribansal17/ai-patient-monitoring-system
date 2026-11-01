const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    heartRate: {
      type: Number,
      required: true,
    },
    spo2: {
      type: Number,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vitals', vitalsSchema);
