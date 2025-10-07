const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateActivityCreate, validateActivityUpdate, validateActivityQuery } = require('../middleware/validation');
const { createActivity, updateActivity, deleteActivity, getActivities } = require('../controllers/activityController');

router.use(protect);

router.get('/', validateActivityQuery, getActivities);
router.post('/', validateActivityCreate, createActivity);
router.put('/', validateActivityUpdate, updateActivity);
router.delete('/', validateActivityUpdate, deleteActivity);

module.exports = router;


