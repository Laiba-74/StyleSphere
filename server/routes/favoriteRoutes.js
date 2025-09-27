const express = require("express");
const { addToFavorites, removeFromFavorites, getFavorites } = require("../controllers/favoriteController");
const { auth } = require("../middleware/authMiddleware"); // your auth middleware

const router = express.Router();

router.post("/add", auth, addToFavorites);
router.delete("/:productId", auth, removeFromFavorites);
router.get("/", auth, getFavorites);

module.exports = router;
