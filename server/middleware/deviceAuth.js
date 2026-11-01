const deviceAuth = (req, res, next) => {
  const key = req.headers['x-device-key'];
  if (!key || key !== process.env.DEVICE_API_KEY) {
    return res.status(401).json({ message: 'Invalid device key' });
  }
  next();
};

module.exports = { deviceAuth };
