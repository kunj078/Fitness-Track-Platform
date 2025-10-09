const Activity = require('../models/Activity');
const cache = require('../utils/cache');

const normalizeDate = (dateInput) => {
  const d = new Date(dateInput || Date.now());
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

function invalidateWeeklyStatsCache(userId, activityDate) {

  const end = new Date(Date.UTC(activityDate.getUTCFullYear(), activityDate.getUTCMonth(), activityDate.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 6);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  
  const weeklyStatsKey = `weekly_stats:${userId}:${startStr}:${endStr}`;
  const weeklyDataKey = `weekly_data:${userId}:${startStr}:${endStr}`;
  console.log("Invalidating cache keys weeklyStatsKey:", weeklyStatsKey, "weeklyDataKey: ",weeklyDataKey);
  
  cache.delete(weeklyStatsKey);
  cache.delete(weeklyDataKey);
  
  console.log(`Cache invalidated for user ${userId} week ${startStr} to ${endStr}`);
}

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

    // Invalidate weekly stats cache for this user and date
    invalidateWeeklyStatsCache(userId, date);

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

    // Invalidate weekly stats cache for this user and date
    invalidateWeeklyStatsCache(userId, date);

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

    // Invalidate weekly stats cache for this user and date
    invalidateWeeklyStatsCache(userId, date);

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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = normalizeDate(from);
      if (to) query.date.$lte = normalizeDate(to);
    }

    const [total, activities] = await Promise.all([
      Activity.countDocuments(query),
      Activity.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      data: activities,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      }
    });
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


