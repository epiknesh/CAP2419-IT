const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let busLocations = {};  // Store bus locations

// ✅ API: Receive GPS data from Raspberry Pi
app.post("/api/update_location", (req, res) => {
    const { bus_id, latitude, longitude, hdop } = req.body;
    
    if (!bus_id || !latitude || !longitude) {
        return res.status(400).json({ error: "Invalid GPS data" });
    }

    busLocations[bus_id] = {
        latitude,
        longitude,
        hdop,
        timestamp: new Date()
    };

    console.log(`📍 Received GPS Update: ${bus_id} -> ${latitude}, ${longitude}, HDOP: ${hdop}`);
    res.json({ success: true, message: "GPS data received" });
});

// ✅ API: Serve bus locations to frontend
app.get("/api/get_locations", (req, res) => {
    res.json(busLocations);
});

// Start backend on Port 8000
const PORT = 8000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
