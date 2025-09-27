const express = require("express");
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, relatedProduct, getProductCount, getCategoryCounts, getFiveStarProduct } = require("../controllers/productController.js");
const { auth, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/image-upload-middleware.js");
const router = express.Router();

router.post("/add", auth, authorizeRoles("admin"), upload.array("images", 5), createProduct);
router.get("/count", auth,  authorizeRoles("admin"), getProductCount);
router.get("/", getProducts);
router.get("/categories/count", getCategoryCounts)
router.get("/five-star", getFiveStarProduct);
router.get("/:id", getProductById);
router.get("/:id/related", relatedProduct);
router.put("/:id", auth, authorizeRoles("admin"), upload.array("images", 5), updateProduct);
router.delete("/:id", auth, authorizeRoles("admin"), deleteProduct);


module.exports = router;
