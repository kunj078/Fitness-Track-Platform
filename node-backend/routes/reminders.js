const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { listToday, sendNow } = require('../controllers/reminderController');

router.use(protect);

// List of users to remind (used by Spring scheduler)
router.get('/today', listToday);
router.post('/send-now', authorize('admin'), sendNow); 

module.exports = router;


