const mongoose = require('mongoose');

function normalizeToUTCDate(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    set: normalizeToUTCDate
  },
  steps: {
    type: Number,
    required: true,
    min: [0, 'Steps cannot be negative']
  },
  calories: {
    type: Number,
    required: true,
    min: [0, 'Calories cannot be negative']
  },
  workoutMinutes: {
    type: Number,
    required: true,
    min: [0, 'Workout minutes cannot be negative']
  }
}, {
  timestamps: true
});

// unique activity per user per day (User can create activty once per day)
activitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Activity', activitySchema);
