// server/controllers/settingController.js
const Setting = require("../models/Setting");

// GET settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne(); // only one settings doc
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to load settings" });
  }
};

// UPDATE settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
};

module.exports = { getSettings, updateSettings };
