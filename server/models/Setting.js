const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, required: true },
    siteDescription: { type: String },
    contactEmail: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

// We want only ONE settings document, so prevent multiple inserts accidentally
module.exports = mongoose.model('Setting', settingSchema);