const jwt = require('jsonwebtoken');

// Secret key (use the same key used for generating the token)
const SECRET_KEY = 'very-secure-secret-key';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = verifyToken;
