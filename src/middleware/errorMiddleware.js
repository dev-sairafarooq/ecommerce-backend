const { logError } = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // File mein bhi error log karo
  logError(req.method, req.originalUrl, err);

  const statusCode = err.statusCode || 500;

  const response = {
    success: false,
    message: err.message || 'Something went wrong on the server',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorMiddleware;