
// controllers/accountController.js
const User = require('../models/userModel');
const { doHash, doHashValidation } = require('../utils/hashing');
const { changePasswordSchema } = require('../middlewares/validator');

exports.changePassword = async (req, res) => {
  try {
    // 1) Must be authenticated; get ID from JWT via middleware
    const userId = req.userId || (req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    // 2) Validate input via Joi
    const { error, value } = changePasswordSchema.validate(req.body || {}, { abortEarly: true });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { oldPassword, newPassword } = value;

    // 3) Fetch user with password (since it’s select: false in your model)
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 4) Verify old password
    const matches = await doHashValidation(oldPassword, user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect.' });
    }

    // 5) Hash new password and update
    user.password = await doHash(newPassword, 12);

    // 6) Optional: bump tokenVersion to invalidate existing tokens (see section 5 below)
    if (typeof user.tokenVersion === 'number') {
      user.tokenVersion += 1;
    }

    await user.save();

    // 7) Optional: clear cookie to force re-login on web
    // res.clearCookie('Authorization');

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};
