
const mongoose = require('mongoose');
const activityModel = require('../models/activity.model');

exports.getActivity = async (req, res) => {
  try {
    const userId = req.user?.id; // from auth middleware
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Validate and cast userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch latest 10 activities for this user
    const activities = await activityModel
      .find({ userId: userObjectId })
      .sort({ timestamp: -1 }) // newest first
      .limit(10)
      .select('-__v') // exclude __v
      .lean(); // faster read-only

    if (activities.length === 0) {
      return res.status(404).json({ success: false, message: 'No activity to show' });
    }

    return res.status(200).json({ success: true, data: activities });
  } catch (err) {
    console.error('getActivity error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
