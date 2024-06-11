const jwt = require('jsonwebtoken');

// Secret key (in a real application, store this in an environment variable)
const SECRET_KEY = 'very-secure-secret-key';

const generateToken = (payload) => {
  // Token expires in 1 hour
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

module.exports = generateToken;
