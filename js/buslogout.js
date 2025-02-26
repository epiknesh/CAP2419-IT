// buslogout.js
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Logout Endpoint
app.post('/buslogout', (req, res) => {
  try {
    // Clear the JWT token by removing it from cookies
    res.clearCookie('auth-token');  // Assuming the JWT is stored as 'auth-token' in cookies

    // Send response that the user has been logged out
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
