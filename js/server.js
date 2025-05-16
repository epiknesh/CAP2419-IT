require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Account = require('./models/Accounts'); // Import the model
const Settings = require('./models/Settings');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');
const Channel = require('./models/Channel'); // adjust path as needed

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

        const existingUser = await Account.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const lastAccount = await Account.findOne().sort({ accountID: -1 });
        const newAccountID = lastAccount ? lastAccount.accountID + 1 : 1;

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

        await newAccount.save();

        const newSettings = new Settings({
            accountID: newAccountID,
            dispatch_notif: false,
            capacity_notif: false,
            eta_notif: false
        });

        await newSettings.save();

        // Add the new user to "JST Kidlat" channel
        const globalChannel = await Channel.findOneAndUpdate(
            { name: 'JST Kidlat' },
            { $addToSet: { members: newAccountID } }, // Prevent duplicates
            { new: true }
        );

        // Map roles to their respective channel names
        const roleChannelMap = {
            "1": "Admins",
            "2": "Drivers",
            "3": "Controllers",
            "4": "Dispatchers",
            "5": "Maintenance",
            "6": "Cashiers"
        };

        const roleChannelName = roleChannelMap[role];
        if (roleChannelName) {
            await Channel.findOneAndUpdate(
                { name: roleChannelName },
                { $addToSet: { members: newAccountID } },
                { new: true }
            );
        }

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
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send response with token and user details
        res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user: { 
                id: user._id,
                accountid: user.accountID, 
                email: user.email, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                birthdate: user.birthdate, 
                mobile: user.mobile, 
                role: user.role,
                pic: user.profilePicture
            } 
        });

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

const Dispatch = require('./models/Dispatch');// Import Bus model
 
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
        const { status, lastDispatch, nextDispatch, coordinates } = req.body;

        console.log(`🛠️ Updating Dispatch for Bus ID ${req.params.busID}`);

        const updatedDispatch = await Dispatch.findOneAndUpdate(
            { busID: req.params.busID }, // Find by busID
            { $set: { status, lastDispatch, nextDispatch, coordinates } },
            { new: true }
        );

        if (!updatedDispatch) {
            console.error("❌ Dispatch record not found");
            return res.status(404).json({ message: "Dispatch record not found" });
        }

        console.log("✅ Successfully updated dispatch:", updatedDispatch);
        res.status(200).json({ message: "Dispatch updated successfully", dispatch: updatedDispatch });

    } catch (error) {
        console.error("❌ Error updating dispatch:", error);
        res.status(500).json({ message: "Server error" });
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

app.post('/update-income', async (req, res) => {
    try {
        const { busID, incomeToday } = req.body;
        const incomeRecord = await Income.findOne({ busID });

        if (!incomeRecord) {
            return res.status(404).json({ message: 'Bus ID not found' });
        }

        const today = new Date().toISOString().split('T')[0];
        const lastUpdated = incomeRecord.updatedAt
            ? new Date(incomeRecord.updatedAt).toISOString().split('T')[0]
            : null;

      

        if (lastUpdated === today) {
            // If the record is from today, ADD to the current incomeToday
            incomeRecord.incomeToday += incomeToday;
        } else {
            // If the record is from a previous day, REPLACE incomeToday
            incomeRecord.incomeToday = incomeToday;
        }

        
        incomeRecord.incomeWeek += incomeToday;
        incomeRecord.incomeMonth += incomeToday;
        incomeRecord.totalIncome += incomeToday;

        await incomeRecord.save();

        res.status(200).json({ message: 'Income updated successfully' });
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

        // Find and delete the account
        const deletedAccount = await Accounts.findByIdAndDelete(id);
        if (!deletedAccount) {
            return res.status(404).json({ message: "User not found" });
        }

        // Use accountID from the deleted account to remove the matching settings entry
        await Settings.findOneAndDelete({ accountID: deletedAccount.accountID });

        res.status(200).json({ message: "User and associated settings deleted successfully" });
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
            // If driverID or controllerID is null, return "Unassigned"
            const driver = bus.driverID !== null ? accounts.find(account => account.accountID === bus.driverID) : null;
            const controller = bus.controllerID !== null ? accounts.find(account => account.accountID === bus.controllerID) : null;
            
            return {
                busID: bus.busID,
                driver: driver ? `${driver.firstName} ${driver.lastName}` : 'Unassigned',
                controller: controller ? `${controller.firstName} ${controller.lastName}` : 'Unassigned'
            };
        });

        res.status(200).json(fleetPersonnel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.post('/update-fleet-personnel', async (req, res) => {
    try {
        const { busID, driverID, controllerID } = req.body;

        // Ensure driverID and controllerID are either null or valid numbers
        const validDriverID = driverID === "Unassigned" ? null : Number(driverID) || null;
        const validControllerID = controllerID === "Unassigned" ? null : Number(controllerID) || null;

        // Check if the driver is already assigned to another bus (excluding the current bus)
        if (validDriverID) {
            const driverAssigned = await Buses.findOne({
                driverID: validDriverID,
                busID: { $ne: busID }
            });

            if (driverAssigned) {
                return res.status(400).json({ message: `Driver is already assigned to another bus.` });
            }
        }

        // Check if the controller is already assigned to another bus (excluding the current bus)
        if (validControllerID) {
            const controllerAssigned = await Buses.findOne({
                controllerID: validControllerID,
                busID: { $ne: busID }
            });

            if (controllerAssigned) {
                return res.status(400).json({ message: `Controller is already assigned to another bus.` });
            }
        }

        // Find current bus info (to remove old personnel from group)
        const currentBus = await Buses.findOne({ busID });
        if (!currentBus) {
            return res.status(404).json({ message: 'Bus ID not found' });
        }

        const prevDriverID = currentBus.driverID;
        const prevControllerID = currentBus.controllerID;

        // Update the bus with the new personnel
        const updatedBus = await Buses.findOneAndUpdate(
            { busID },
            { driverID: validDriverID, controllerID: validControllerID },
            { new: true }
        );

        // Update the group chat membership for the bus channel
        const channelName = `Bus ${busID}`;
        const channel = await Channel.findOne({ name: channelName });

        if (!channel) {
            return res.status(404).json({ message: `Channel "${channelName}" not found.` });
        }

        // Use a Set to manage unique members
        const memberSet = new Set(channel.members.map(id => parseInt(id)));

        // Remove previous personnel
        if (prevDriverID) memberSet.delete(parseInt(prevDriverID));
        if (prevControllerID) memberSet.delete(parseInt(prevControllerID));

        // Add new personnel (if any)
        if (validDriverID) memberSet.add(validDriverID);
        if (validControllerID) memberSet.add(validControllerID);

        // Save the updated member list to the channel
        await Channel.updateOne(
            { _id: channel._id },
            { $set: { members: Array.from(memberSet) } }
        );

        res.status(200).json({ message: 'Fleet personnel updated successfully', updatedBus });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



app.put('/update-profile', async (req, res) => {
    try {
        const { id, firstName, lastName, birthdate, mobile, email } = req.body;

        // Check if the user exists
        const user = await Account.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the updated email or mobile number is already in use by another user
        const existingEmail = await Account.findOne({ email, _id: { $ne: id } });
        if (existingEmail) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        const existingMobile = await Account.findOne({ mobile, _id: { $ne: id } });
        if (existingMobile) {
            return res.status(400).json({ message: "Phone number is already registered" });
        }

        // Update user details
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.birthdate = birthdate || user.birthdate;
        user.mobile = mobile || user.mobile;
        user.email = email || user.email;

        await user.save();

        // Return updated user data
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                mobile: user.mobile,
                email: user.email,
                role: user.role
            } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }

    });



      app.get('/settings', async (req, res) => {
        try {
            const settings = await Settings.find(); // Fetch all bus data
            res.status(200).json(settings);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });
      
app.get('/settings/:accountID', async (req, res) => {
    const accountID = parseInt(req.params.accountID);
    try {
      const settings = await Settings.findOne({ accountID });
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      res.json(settings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/settings/:accountID', async (req, res) => {
    const accountID = parseInt(req.params.accountID);
    const updates = req.body;
  
    try {
      const settings = await Settings.findOneAndUpdate({ accountID }, updates, { new: true });
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found' });
      }
      res.json(settings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });


cloudinary.config({
    cloud_name: 'doecgbux4',
    api_key: '435565291394525',
    api_secret: 'W6_8slgUq-DPnrfiAxFfQ227FCI'
});

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pictures',
        format: async (req, file) => 'png', // Convert to PNG
        public_id: (req, file) => Date.now() + '-' + file.originalname
    },
});

const upload = multer({ storage });

app.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: "User ID is required" });

        const user = await Account.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profilePicture = req.file.path; // Cloudinary URL
        await user.save();

        res.status(200).json({ message: "Profile picture updated", profilePicture: req.file.path });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

const Fuel = require('./models/Fuel');

app.get('/fuel', async (req, res) => {
    try {
        const fuelData = await Fuel.find();
        res.json(fuelData);
    } catch (error) {
        console.error('Error fetching fuel data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to update fuel data
app.put('/fuel/:busId', async (req, res) => {
    try {
        const { busId } = req.params;
        const { lastRefuelDate, currentFuel, fuelRefilled } = req.body;

        const updatedFuel = await Fuel.findOneAndUpdate(
            { busId: Number(busId) },
            {
                lastRefuelDate: new Date(lastRefuelDate),
                currentFuel: Number(currentFuel),
                fuelRefilled: Number(fuelRefilled)
            },
            { new: true }
        );

        if (!updatedFuel) {
            return res.status(404).json({ message: "Bus ID not found" });
        }

        res.json(updatedFuel);
    } catch (error) {
        console.error('Error updating fuel data:', error);
        res.status(500).json({ message: "Server error" });
    }
});



app.get('/channels', async (req, res) => {
  const accountID = parseInt(req.query.accountID, 10);
console.log('Parsed accountID:', accountID, typeof accountID);

  if (!accountID) {
    return res.status(400).json({ message: 'accountID query parameter is required' });
  }

  try {
    // Find channels where the accountID is in the members array
    const userChannels = await Channel.find({ members: accountID });
    res.json(userChannels);
   
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/channel-members', async (req, res) => {
  const channelName = req.query.channel;

  if (!channelName) {
    return res.status(400).json({ message: 'channel query parameter is required' });
  }

  try {
    const channel = await Channel.findOne({ name: channelName });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Fetch accounts whose accountID is in channel.members
    const members = await Accounts.find(
      { accountID: { $in: channel.members } },
      { _id: 0, accountID: 1, firstName: 1, lastName: 1, role: 1, profilePicture: 1 }
    );

    // Optionally format full names
    const formattedMembers = members.map(member => ({
      accountID: member.accountID,
      fullName: `${member.firstName} ${member.lastName}`,
      role: member.role,
      profilePicture: member.profilePicture
    }));

    res.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching channel members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





  // WEB SOCKET (WALKIE-TALKIE)
const WebSocket = require('ws');
const Message = require('./models/Message');





// 🔹 Cloudinary Storage for Voice Messages
const voiceStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'voice_messages', // Store in "voice_messages" folder
        resource_type: 'raw', // Required for audio files
        format: async () => 'webm', // Use WebM format
        public_id: (req, file) => Date.now() + '-' + file.originalname
    },
});
const uploadVoice = multer({ storage: voiceStorage });

// 🔹 Handle Voice Message Uploads
app.post('/upload-voice', uploadVoice.single('voice'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the Cloudinary URL
    res.json({ voiceUrl: req.file.path });
});

// 🔹 WebSocket Setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', async (ws) => {
    console.log("🔹 New client connected");

    // Initialize channels set for this client
    ws.channels = new Set();

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            // Handle joining a channel
            if (data.type === "joinChannel") {
                if (!data.channel) return console.error("❌ No channel specified");

                ws.channels.add(data.channel);
                console.log(`📥 Client joined channel: ${data.channel}`);

                // Send message history for the channel
                const messages = await Message.find({ channel: data.channel }).sort({ timestamp: 1 }).limit(50);
                ws.send(JSON.stringify({ type: "history", channel: data.channel, messages }));
                return;
            }

         if (data.type === 'update-seenBy') {
    const updatedMessage = await Message.findByIdAndUpdate(
        data.messageId,
        { $addToSet: { seenBy: data.accountId } },
        { new: true }
    );

    if (!updatedMessage) {
        console.error(`Message with id ${data.messageId} not found.`);
        return;
    }

    // Broadcast to all clients in the same channel
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.channels.has(updatedMessage.channel)) {
            client.send(JSON.stringify({
                type: 'seenUpdate',
                messageId: updatedMessage._id.toString(),
                accountId: data.accountId
            }));
        }
    });

    console.log(`✅ Updated seenBy for message ${data.messageId} with accountId ${data.accountId}`);
    return;
}

                    if (data.type === "markSeen") {
            if (!data.channel || !data.accountId) {
                return console.error("❌ Missing channel or accountId in markSeen");
            }

            // Update all messages in the channel that don't already include this user in seenBy
            await Message.updateMany(
                { 
                channel: data.channel,
                seenBy: { $ne: data.accountId } // messages where accountId is NOT in seenBy
                },
                { $push: { seenBy: data.accountId } }
            );

            console.log(`✅ Marked messages as seen by accountId ${data.accountId} in channel ${data.channel}`);

            // Optionally, broadcast an update to clients in the channel if you want to update their UI
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && client.channels.has(data.channel)) {
                    client.send(JSON.stringify({ 
                        type: "seenUpdate", 
                        channel: data.channel, 
                        accountId: data.accountId 
                    }));
                }
            });

            return;
        }


            // Handle sending a chat message
            if (data.type === "chatMessage") {
                console.log(`📩 Message from ${data.sender} in channel ${data.channel}: ${data.message || "[Voice Message]"}`);

                if (!data.sender || !data.channel || (!data.message && !data.voiceMessage) || !data.timestamp) {
                    return console.error("❌ Invalid message format:", data);
                }

                // Save to MongoDB
                const newMessage = new Message({
    sender: data.sender,
    profilePic: data.profilePic,
    message: data.message || null,
    voiceMessage: data.voiceMessage || null,
    timestamp: data.timestamp,
    channel: data.channel,
    mentions: data.mentions || [] // ✅ Add this line
});

                await newMessage.save();

                // Broadcast only to clients in the same channel
               // After await newMessage.save();
const messageToSend = {
    _id: newMessage._id.toString(), // include the _id
    sender: newMessage.sender,
    profilePic: newMessage.profilePic,
    message: newMessage.message,
    voiceMessage: newMessage.voiceMessage,
    timestamp: newMessage.timestamp,
    channel: newMessage.channel,
    mentions: newMessage.mentions
};

wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.channels.has(data.channel)) {
        client.send(JSON.stringify(messageToSend));
    }
});
            }

        } catch (error) {
            console.error("❌ Error processing message:", error);
        }
    });

    ws.on('update-seenBy', async ({ messageId, seenBy }) => {
    await MessageModel.findByIdAndUpdate(messageId, { seenBy });
});

    ws.on('close', () => console.log("🔻 Client disconnected"));
});
