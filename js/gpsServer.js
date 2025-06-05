const express = require("express");
const router = express.Router();  // <-- use Router, NOT full app
const cors = require("cors");

// You can apply middleware to router if needed
router.use(express.json());
router.use(cors());

let busLocations = {};  // Store bus locations

router.post("/update_location", (req, res) => {
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

router.get("/get_locations", (req, res) => {
    res.json(busLocations);
});

// No app.listen here — main server will listen

module.exports = router;  // <-- export router, not app
