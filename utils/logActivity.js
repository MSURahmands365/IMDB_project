// utils/logActivity.js
const Activity = require('../models/activity.model');

const logActivity = (req, res, userId, eventType = 'completed', durationMs = null) => {
    try {
        const log = new Activity({
            userId: userId,
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode || 200, // Fallback status code
            ip: req.ip,
            userAgent: req.get('user-agent') || null,
            message: `API ${req.method} ${req.originalUrl} ${eventType}`,
            timestamp: new Date(),
            durationMs: durationMs || 0, // Duration is hard to capture precisely here, 0 is safe
        });

        // Use catch to handle saving errors without crashing the app
        log.save().catch(err => {
            console.error('Activity logging failed (async save):', err?.message || err);
        });
    } catch (err) {
        console.error('Activity logging failed:', err?.message || err);
    }
};

module.exports = logActivity;