const express = require("express")
const { getSettings, updateSettings } = require("../controllers/settingContoller.js");
const { auth, authorizeRoles } = require("../middleware/authMiddleware.js");
const router = express.Router();

// Only admins should access these
router.get("/", getSettings);
router.put("/", auth, authorizeRoles("admin"), updateSettings);

module.exports = router;
