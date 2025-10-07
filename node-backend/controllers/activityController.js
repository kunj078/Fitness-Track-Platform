const Activity = require('../models/Activity');

const normalizeDate = (dateInput) => {
  const d = new Date(dateInput || Date.now());
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const createActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = normalizeDate(req.body.date);

    // Activity checking 
    const existing = await Activity.findOne({ user: userId, date });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Activity for this date already exists. Please update it instead.'
      });
    }

    const activity = await Activity.create({
      user: userId,
      date,
      steps: req.body.steps,
      calories: req.body.calories,
      workoutMinutes: req.body.workoutMinutes
    });

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ success: false, message: 'Server error creating activity' });
  }
};

const updateActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = normalizeDate(req.body.date);

    const update = {
      steps: req.body.steps,
      calories: req.body.calories,
      workoutMinutes: req.body.workoutMinutes
    };

    const activity = await Activity.findOneAndUpdate(
      { user: userId, date },
      update,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({ success: false, message: 'No activity found for this date' });
    }

    res.status(200).json({ success: true, message: 'Activity updated', data: activity });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, message: 'Server error updating activity' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const date = normalizeDate(req.body.date);

    const activity = await Activity.findOneAndDelete({ user: userId, date });
    if (!activity) {
      return res.status(404).json({ success: false, message: 'No activity found for this date' });
    }

    res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting activity' });
  }
};

const getActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const query = { user: userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = normalizeDate(from);
      if (to) query.date.$lte = normalizeDate(to);
    }

    const activities = await Activity.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching activities' });
  }
};

module.exports = {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivities
};


