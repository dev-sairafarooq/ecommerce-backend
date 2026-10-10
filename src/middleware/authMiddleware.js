const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>" mein se sirf token nikalna

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ab aage jitne bhi middleware/controllers hain, unhe req.user mil jayega
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

module.exports = authMiddleware;