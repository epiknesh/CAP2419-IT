require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');  // Required for file upload handling
const BusAccount = require('./models/BusAccounts'); // Import BusAccounts model

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store uploaded files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // File will be saved with timestamp
  }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// **Start Server**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Login Endpoint (username instead of email)
app.post('/buslogin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username exists
    const user = await BusAccount.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, 'your-jwt-secret', {
      expiresIn: '1h'
    });

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Endpoint (includes profile picture and username)
app.post('/busregister', upload.single('profile_picture'), async (req, res) => {
  try {
    const { username, firstName, lastName, email, phoneNumber, password } = req.body;

    // Check if the username or email is already registered
    const existingUser = await BusAccount.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile picture URL (assuming you store it on the server)
    const profilePicture = req.file ? req.file.path : null;

    // Find the highest existing accountID and increment it
    const highestAccount = await BusAccount.aggregate([
      { $group: { _id: null, maxAccountID: { $max: "$accountID" } } }
    ]);

    const newAccountID = highestAccount && highestAccount.length > 0 ? highestAccount[0].maxAccountID + 1 : 1;

    // Create new user with accountID assigned explicitly
    const newAccount = new BusAccount({
      accountID: newAccountID,  // Explicitly set accountID
      profile_picture: profilePicture,
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword
    });

    await newAccount.save();
    res.status(201).json({ message: 'Account registered successfully', accountID: newAccountID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


