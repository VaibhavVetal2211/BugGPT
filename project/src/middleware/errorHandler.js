import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { method: req.method, url: req.originalUrl });

  res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again later.'
  });
};
