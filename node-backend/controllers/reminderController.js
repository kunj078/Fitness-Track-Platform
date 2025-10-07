const axios = require('axios');
const User = require('../models/User');

// Return list of users to remind today 
const listToday = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('name email -_id');
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch users to remind' });
  }
};

// Forward a reminder send request to Spring service
const sendNow = async (req, res) => {
  try {
    const payload = req.body; // name,email array
    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ success: false, message: 'Request body must be a non-empty array' });
    }
    for (const user of payload) {
      if (typeof user.name !== 'string' || typeof user.email !== 'string') {
        return res.status(400).json({ success: false, message: 'Each user must have name and email as strings' });
      }
    }
    // Forward to Spring Boot Code
    const url = process.env.REMINDER_SERVICE_URL || 'http://localhost:8081/api/reminders/send';
    const response = await axios.post(url, payload, { timeout: 10000 });
    res.status(200).json({ success: true, forwarded: payload.length, springResponse: response.data });
  } catch (e) {
    res.status(502).json({ success: false, message: 'Failed to send to reminder service', error: e.message });
  }
};

module.exports = { listToday, sendNow };


