const axios = require('axios');

const EMAIL = 'your_email';
const PASSWORD = 'your_password';
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const runSimulator = async () => {
  try {
    console.log(`Attempting login as ${EMAIL}...`);
    let token = '';

    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: EMAIL,
        password: PASSWORD,
      });
      token = loginRes.data.token;
      console.log('Login successful.');
    } catch (loginErr) {
      console.error('Login failed:', loginErr.response?.data?.message || loginErr.message);
      console.error('Please ensure the user is registered with credentials:', { EMAIL, PASSWORD });
      process.exit(1);
    }

    console.log('Fetching patients list...');
    const patientsRes = await axios.get(`${API_URL}/patients`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const patients = patientsRes.data;
    if (!patients || patients.length === 0) {
      console.error('No patients exist. Please add at least one patient via the web interface.');
      process.exit(1);
    }

    const patientId = patients[0]._id;
    console.log(`Targeting Patient ID: ${patientId} (${patients[0].name})`);
    console.log('Starting vitals transmission every 5 seconds...');

    setInterval(async () => {
      try {
        const heartRate = Math.floor(60 + Math.random() * 60);
        const spo2 = Math.floor(90 + Math.random() * 10);
        const temperature = parseFloat((36 + Math.random() * 3).toFixed(1));

        const res = await axios.post(
          `${API_URL}/vitals`,
          {
            patient: patientId,
            heartRate,
            spo2,
            temperature,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Vitals sent:', res.data);
      } catch (err) {
        console.error('Error sending vitals:', err.response?.data?.message || err.message);
      }
    }, 5000);
  } catch (error) {
    console.error('Simulator error:', error.message);
    process.exit(1);
  }
};

runSimulator();
