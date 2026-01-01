
// controllers/deleteAccount.js
const User = require('../models/userModel');
const Activity = require('../models/activity.model'); // optional, only if you want to clean up logs
const { doHashValidation } = require('../utils/hashing');
const { deleteAccountSchema } = require('../middlewares/validator');

exports.deleteAccount = async (req, res) => {
  try {
    // 1) Authenticated user ID from JWT via authMiddleware
    const userId = req.userId || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized user.' });
    }

    // 2) Validate body: requires { password }
    const { error, value } = deleteAccountSchema.validate(req.body || {}, { abortEarly: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { password } = value;

    // 3) Fetch user with password to validate
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 4) Verify provided password
    const ok = await doHashValidation(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // 5) Delete user
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 6) Optional: Clean up user’s activities (comment out if you want to keep audit history)
    // await Activity.deleteMany({ userId });

    // 7) Clear auth cookie (so browser sessions end cleanly); tokens in memory remain unaffected
    res.clearCookie('Authorization');

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (err) {
    console.error('Delete Account error:', err);
    return res.status(500).json({ success: false, message: 'Server error while deleting account.' });
  }
};
