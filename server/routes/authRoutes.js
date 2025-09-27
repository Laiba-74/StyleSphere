const express = require("express");
const { getProfile, update, register, login, getMe, changePassword, getAllUsers, getUserCount, deleteUser, updateUserStatus } = require("../controllers/userController");
const { auth, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/image-upload-middleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.get("/me", auth, getMe);
router.put("/change-pass", auth, changePassword);
router.get("/", auth, authorizeRoles("admin"), getAllUsers);
router.get("/count", getUserCount);
router.patch("/userupdate/:id", auth, upload.single("avatar"), update);
router.delete("/delete/:id", auth, authorizeRoles("admin"), deleteUser)
router.put("/status/:id", auth, authorizeRoles("admin"), updateUserStatus)
module.exports = router;

  // (req, res, next) => {
  //   console.log("📥 Incoming request headers:", req.headers);
  //   console.log("📥 Incoming request body (before Multer):", req.body);
  //   next();
  // },

  // (req, res, next) => {
  //   console.log("📥 After Multer - req.file:", req.file);
  //   console.log("📥 After Multer - req.body:", req.body);
  //   next();
  // },