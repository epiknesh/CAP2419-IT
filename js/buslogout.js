const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Logout Endpoint
app.post('/buslogout', (req, res) => {
  try {
    // Check if the user is logged in by checking the JWT token
    const token = req.cookies['auth-token']; // Assuming the JWT is stored in cookies
    if (!token) {
      return res.status(400).json({ message: 'User not logged in' });
    }

    // Clear the JWT token by removing it from cookies
    res.clearCookie('auth-token');  // Clear the 'auth-token' cookie

    // Send response that the user has been logged out
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = app;
