
// middlewares/logger.middleware.js
const Activity = require('../models/activity.model');

const activityLogger = (req, res, next) => {
  const start = Date.now();

  const headerUserId =
    (req.get && (req.get('x-user-id') || req.get('x-userid'))) ||
    (req.headers && (req.headers['x-user-id'] || req.headers['x-userid'])) ||
    null;

  const bodyUserId = req.body?.userId || null;
  const queryUserId = req.query?.userId || null;

  // Prefer JWT-derived id
  const resolvedUserId = req.userId || headerUserId || bodyUserId || queryUserId || null;
  console.log(resolvedUserId)
  console.log(req.originalUrl)
  const finalize = async (eventType) => {
    try {
      const durationMs = Date.now() - start;
      const log = new Activity({
        userId: resolvedUserId,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent:
          (req.get && req.get('user-agent')) ||
          (req.headers && req.headers['user-agent']) ||
          null,
        message: `API ${req.method} ${req.originalUrl} ${eventType}`,
        timestamp: new Date(),
        durationMs,
      });

      await log.save();
    } catch (err) {
      console.error('Activity logging failed:', err?.message || err);
    }
  };

  res.on('finish', () => finalize('finished'));
  //res.on('close', () => finalize('closed')); // handles aborted connections as well

  return next();
};

module.exports = activityLogger;
