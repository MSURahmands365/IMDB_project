
// activity.model.js (example)
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // allow null for anonymous
  endpoint: String,
  method: String,
  statusCode: Number,
  ip: String,
  userAgent: String,
  message: String,
  timestamp: Date,
  durationMs: Number,
});

module.exports = mongoose.model('Activity', activitySchema);
