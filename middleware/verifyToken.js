const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET; // ✅ no quotes! // Replace with process.env.JWT_SECRET in production

const verifyToken = (req, res, next) => {
  // Token is usually sent in the format: "Bearer <token>"
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified, decoded user:", decoded);

    // Attach the decoded payload to the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = verifyToken;
