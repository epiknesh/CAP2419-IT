const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  accountID: { type: Number, required: true, unique: true },
  dispatch_notif: { type: Boolean, required: true, default: false },
  capacity_notif: { type: Boolean, required: true, default: false },
  eta_notif: { type: Boolean, required: true, default: false }
}, { 
  timestamps: true, 
  collection: 'settings' 
});

module.exports = mongoose.model('Settings', SettingsSchema);