const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: Number, required: true }], // Array of accountID numbers
  // You can add other fields like description, createdAt, etc.
});

module.exports = mongoose.model('Channel', channelSchema);