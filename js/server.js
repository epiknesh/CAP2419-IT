require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Account = require('./models/Accounts'); // Import the model

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));


// **Start Server**
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, birthdate, mobile, email, password, role } = req.body;

        // Check if the email is already registered
        const existingUser = await Account.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new account
        const newAccount = new Account({
            firstName,
            lastName,
            birthdate,
            mobile,
            email,
            password: hashedPassword,
            role
        });

        // Save to database
        await newAccount.save();
        res.status(201).json({ message: 'Account registered successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email exists
        const user = await Account.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h' // Token expires in 1 hour
        });

        // Return token & user details
        res.status(200).json({ message: 'Login successful', token, user: { email: user.email, role: user.role } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Maintenance = require('./models/Maintenance'); // Import Bus model

app.get('/maintenance', async (req, res) => {
    try {
        const buses = await Maintenance.find(); // Fetch all bus data
        res.status(200).json(buses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Dispatch = require('./models/Dispatch'); // Import Bus model

app.get('/dispatch', async (req, res) => {
    try {
        const dispatch = await Dispatch.find(); // Fetch all bus data
        res.status(200).json(dispatch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Income = require('./models/Income'); 

app.get('/income', async (req, res) => {
    try {
        const income = await Income.find(); 
        res.status(200).json(income);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Accounts = require('./models/Accounts'); 

app.get('/accounts', async (req, res) => {
    try {
        const accounts = await Accounts.find(); 
        res.status(200).json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Accounts.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});







