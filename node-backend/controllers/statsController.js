const Activity = require('../models/Activity');
const mongoose = require('mongoose');

const getWeeklyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const start = new Date(end);
    start.setUTCDate(end.getUTCDate() - 6); // 7-day

    const pipeline = [
      { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$date',
          steps: { $sum: '$steps' },
          calories: { $sum: '$calories' },
          workoutMinutes: { $sum: '$workoutMinutes' }
        }
      },
      { $project: { _id: 0, date: '$_id', steps: 1, calories: 1, workoutMinutes: 1 } },
      { $sort: { date: 1 } }
    ];

    const daily = await Activity.aggregate(pipeline);

    const seriesMap = new Map(daily.map(d => [new Date(d.date).toISOString(), d]));
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const iso = d.toISOString();
      const item = seriesMap.get(iso) || { date: d, steps: 0, calories: 0, workoutMinutes: 0 };
      days.push({
        date: d.toISOString(),
        steps: item.steps || 0,
        calories: item.calories || 0,
        workoutMinutes: item.workoutMinutes || 0
      });
    }

    const totals = days.reduce((acc, cur) => ({
      steps: acc.steps + cur.steps,
      calories: acc.calories + cur.calories,
      workoutMinutes: acc.workoutMinutes + cur.workoutMinutes
    }), { steps: 0, calories: 0, workoutMinutes: 0 });

    const average = {
      steps: Math.round(totals.steps / 7),
      calories: Math.round(totals.calories / 7),
      workoutMinutes: Math.round(totals.workoutMinutes / 7)
    };

    res.status(200).json({
      success: true,
      range: { start: start.toISOString(), end: end.toISOString() },
      totals,
      average,
      days, 
    });
  } catch (error) {
    console.error('Weekly stats error:', error);
    res.status(500).json({ success: false, message: 'Server error generating weekly stats' });
  }
};

module.exports = { getWeeklyStats };


