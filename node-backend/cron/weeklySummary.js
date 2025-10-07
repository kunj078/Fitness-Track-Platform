const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { weeklyData } = require('../controllers/statsController');

function htmlFormat(name, totals, range) {
  const startStr = new Date(range.start).toISOString().slice(0, 10);
  const endStr = new Date(range.end).toISOString().slice(0, 10);
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Weekly Fitness Summary</h2>
      <p>Hi ${name || 'there'}, here is your summary for ${startStr} to ${endStr}:</p>
      <ul>
        <li><strong>Total Steps:</strong> ${totals.steps}</li>
        <li><strong>Total Calories:</strong> ${totals.calories}</li>
        <li><strong>Total Workout Minutes:</strong> ${totals.workoutMinutes}</li>
        <li><strong>Average Steps:</strong> ${(totals.workoutMinutes)/7}</li>
        <li><strong>Average Calories:</strong> ${(totals.workoutMinutes)/7}</li>
        <li><strong>Average Workout Minutes:</strong> ${(totals.workoutMinutes)/7}</li>
      </ul>
      <p>Keep up the great work! 💪</p>
    </div>
  `;
}

async function weeklyScheduler() {
  const users = await User.find({ isActive: true }).select('name email');
  for (const user of users) {
    try {
      const { totals, range } = await weeklyData(user._id);
      if (!user.email) continue;
      const subject = 'Your Weekly Fitness Summary';
      const html = htmlFormat(user.name, totals, range);
      const text = `Weekly summary (${new Date(range.start).toISOString().slice(0,10)} to ${new Date(range.end).toISOString().slice(0,10)}): Steps ${totals.steps}, Calories ${totals.calories}, Workout Minutes ${totals.workoutMinutes}`;
      await sendEmail({ to: user.email, subject, html, text });
      console.log(`Weekly summary email sent to ${user.email}`);
    } catch (e) {
      console.error(`Failed to send weekly summary to ${user.email}:`, e.message);
    }
  }
}

function scheduleWeeklySummary() {
  const cronExpr = process.env.WEEKLY_SUMMARY_CRON || '0 9 * * 1'; // 09:00 every Monday
  const task = cron.schedule(cronExpr, async () => {
    console.log('Starting weekly summary job...');
    await weeklyScheduler();
  }, { timezone: process.env.CRON_TZ || 'UTC' });
  console.log(`Weekly summary cron scheduled with "${cronExpr}" (${process.env.CRON_TZ || 'UTC'})`);
  return task;
}

module.exports = { scheduleWeeklySummary, weeklyScheduler };



