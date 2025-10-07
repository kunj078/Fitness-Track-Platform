const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const profileRoutes = require('./profile');
const activityRoutes = require('./activities');
const statsRoutes = require('./stats');
const remindersRoutes = require('./reminders');

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fitness Track Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/activities', activityRoutes);
router.use('/stats', statsRoutes);
router.use('/reminders', remindersRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = router;
