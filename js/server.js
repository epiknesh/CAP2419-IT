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

        // Find the highest existing accountID and increment it
        const lastAccount = await Account.findOne().sort({ accountID: -1 });
        const newAccountID = lastAccount ? lastAccount.accountID + 1 : 1;

        // Create a new account
        const newAccount = new Account({
            accountID: newAccountID,
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
        res.status(201).json({ message: 'Account registered successfully', accountID: newAccountID });

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


// Fetch all maintenance records (for populating Bus ID dropdown)
app.get('/maintenance', async (req, res) => {
    try {
        const buses = await Maintenance.find({}, 'busID'); // Fetch only bus IDs
        res.status(200).json(buses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update maintenance record for a specific bus
app.put('/maintenance/:busID', async (req, res) => {
    try {
        const { busID } = req.params;
        const { status, issue, schedule, assignedStaff, vehicle_condition } = req.body;

        // Update the maintenance record
        const updatedMaintenance = await Maintenance.findOneAndUpdate(
            { busID: busID },
            { status, issue, schedule, assignedStaff, vehicle_condition },
            { new: true }
        );

        if (!updatedMaintenance) {
            return res.status(404).json({ message: 'Bus not found in maintenance records' });
        }

        res.status(200).json({ message: 'Maintenance record updated successfully', updatedMaintenance });
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

app.put('/dispatch/:busID', async (req, res) => {
    try {
        const busID = Number(req.params.busID); // Convert busID to a number
        const dispatch = await Dispatch.findOne({ busID });

        if (!dispatch) {
            return res.status(404).json({ message: 'Bus not found in dispatch records' });
        }

        // Update values as per your logic
        dispatch.status = 1; // Change status from 2 to 1
        dispatch.lastDispatch = dispatch.nextDispatch; // Set lastDispatch to previous nextDispatch
        dispatch.nextDispatch = new Date().toISOString(); // Set nextDispatch to current time

        await dispatch.save(); // Save updated dispatch data

        res.status(200).json({ message: 'Dispatch updated successfully', dispatch });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/dispatch/:busID', async (req, res) => {
    try {
        const busID = Number(req.params.busID);
        const dispatch = await Dispatch.findOne({ busID });

        if (!dispatch) {
            return res.status(404).json({ message: 'Bus not found in dispatch records' });
        }

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

const Capacity = require('./models/Capacity'); 

app.get('/capacity', async (req, res) => {
    try {
        const capacity = await Capacity.find(); 
        res.status(200).json(capacity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const Buses = require('./models/Bus'); 

app.get('/buses', async (req, res) => {
    try {
        const buses = await Buses.find(); 
        res.status(200).json(buses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



app.get('/fleetPersonnel', async (req, res) => {
    try {
        const buses = await Buses.find();
        const accounts = await Accounts.find();

        const fleetPersonnel = buses.map(bus => {
            const driver = accounts.find(account => account.accountID === bus.driverID);
            const controller = accounts.find(account => account.accountID === bus.controllerID);
            
            return {
                busID: bus.busID,
                driver: driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown',
                controller: controller ? `${controller.firstName} ${controller.lastName}` : 'Unknown'
            };
        });

        res.status(200).json(fleetPersonnel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});









