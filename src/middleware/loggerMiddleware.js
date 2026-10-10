const { logRequest } = require('../utils/logger');

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // 'finish' event tab fire hota hai jab response client ko poora bhej diya gaya ho
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logRequest(req.method, req.originalUrl, res.statusCode, responseTime);
  });

  next();
};

module.exports = loggerMiddleware;