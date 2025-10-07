const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWeeklyStats } = require('../controllers/statsController');

router.use(protect);

router.get('/weekly', getWeeklyStats);

module.exports = router;


