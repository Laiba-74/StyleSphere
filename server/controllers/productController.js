const Product = require("../models/Product.js");
const Reviews = require("../models/Review.js")
const createProduct = async (req, res) => {
  try {
    const {
      category,
      name,
      price,
      discount,
      description,
      status,
      stock,
      tags,
      sizes,
      specifications = {} // default empty object
    } = req.body;

    const { material, care, origin, fit } = specifications;

    if (!name || !category || !price || !description) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Handle tags
    let tagsArray = [];
    if (Array.isArray(tags)) {
      tagsArray = tags;
    } else if (typeof tags === "string" && tags.trim() !== "") {
      tagsArray = tags.split(",").map((t) => t.trim());
    }

    // Handle sizes
    let sizesArray = [];
    if (Array.isArray(sizes)) {
      sizesArray = sizes;
    } else if (typeof sizes === "string" && sizes.trim() !== "") {
      sizesArray = sizes.split(",").map((s) => s.trim());
    }

    // Handle images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) =>
        file.path.replace(/\\/g, "/")
      );
    }

    // Create product
    const product = new Product({
      category,
      name,
      price,
      discount: discount || 0,
      sizes: sizesArray,
      description,
      status: status || "Active",
      tags: tagsArray,
      stock: stock || 0,
      specifications: {
        material: material || "",
        care: care || "",
        origin: origin || "",
        fit: fit || ""
      },
      images: imagePaths
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Error creating product",
      error: error.message
    });
  }
};


const getProducts = async (req, res) => {
  try {
    const products = await Product.find({})
    .populate("reviews")
    .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    .populate("reviews");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      category,
      name,
      price,
      discount,
      sizes,
      description,
      status,
      tags,
      stock
    } = req.body;

    // ===== Parse specifications JSON safely =====
    let specifications = {};
    if (req.body.specifications) {
      try {
        specifications = JSON.parse(req.body.specifications);
      } catch (err) {
        specifications = {};
      }
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update basic fields
    product.category = category || product.category;
    product.name = name || product.name;
    product.price = price || product.price;
    product.discount = discount ?? product.discount;

    // Sizes handling
    if (sizes && Array.isArray(sizes)) {
      product.sizes = sizes;
    } else if (sizes) {
      product.sizes = [sizes];
    }

    product.description = description || product.description;
    product.status = status || product.status;

    // Tags handling
    if (tags) {
      if (Array.isArray(tags)) {
        product.tags = tags;
      } else {
        product.tags = tags.split(",").map(t => t.trim());
      }
    }

    product.stock = stock || product.stock;

    product.specifications = {
      ...product.specifications, 
      ...specifications         
    };
    
    if (!product.images) product.images = [];

   
   let imagesToDelete = [];
if (req.body.imagesToDelete) {
  try {
    imagesToDelete = JSON.parse(req.body.imagesToDelete);
  } catch (e) {
    imagesToDelete = [];
  }
}

if (imagesToDelete.length > 0) {
  product.images = product.images.filter(img => !imagesToDelete.includes(img));
}


    // Add new uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path.replace(/\\/g, "/"));
      product.images.push(...newImages);
    }
    // ===============================================================

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

const relatedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .select("name price images category rating"); // fetch only needed fields

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch related products", error: err.message });
  }
}

const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json({ totalProducts: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get category counts
const getCategoryCounts = async (req, res) => {
  try {
    const counts = await Product.aggregate([
      { $group: { 
        _id: "$category", 
        count: { $sum: 1 },
        image: { $first: "$images"}
      } }
    ]);

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category counts", error });
  }
};


const getFiveStarProduct = async (req, res) => {
  try {
    const product = await Product.aggregate([
      // Join reviews
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews"
        }
      },
      // Add average + total
      {
        $addFields: {
          avgRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" }
        }
      },
      // Filter only 5-star average
      {
        $match: { avgRating: 5 }
      },
      // Only need one
      { $limit: 1 }
    ]);

    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No 5-star product found" });
    }

    res.json(product[0]);
  } catch (error) {
    console.error("Error fetching 5-star product:", error);
    res.status(500).json({ message: "Error fetching 5-star product", error: error.message });
  }
};


module.exports = { createProduct, getProductById, getProducts, updateProduct, deleteProduct, relatedProduct, getProductCount, getCategoryCounts, getFiveStarProduct}