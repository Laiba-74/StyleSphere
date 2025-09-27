const Order = require("../models/Order");
const Product = require("../models/Product");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddressId, totalAmount } = req.body;

    if (!items || items.length === 0 || !shippingAddressId || !totalAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Populate product details (images, description, etc.)
    const fullItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.productId);
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        finalPrice: product.price - (product.discount || 0),
        sizes: product.sizes,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        images: product.images,
        description: product.description,
        sku: product.sku,
      };
    }));

    const today = new Date();
    const datePart = today.toISOString().slice(0,10).replace(/-/g, ""); // e.g. 20250829
    const randomPart = Math.floor(1000 + Math.random() * 9000); // e.g. 4721
    const orderNumber = `ORD-${datePart}-${randomPart}`;

    const order = new Order({
      user: req.user.userId, 
      items: fullItems,
      shippingAddress: shippingAddressId,
      totalAmount,
      orderNumber,
      trackingNumber: `TRK${Math.floor(1000000000 + Math.random() * 9000000000)}`
 // <-- add this
    });

    await order.save();
    console.log("Order contoller",order)
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get Order by ID with full product & shipping details
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("shippingAddress")
      .populate("payment")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all orders of a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate("user", "name email")
      .populate("shippingAddress")
      .populate("payment")
      .populate({
        path: "items.product",
        model: "Product",
      });

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all orders (Admin Panel)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")           // show basic user info
      .populate("shippingAddress")             // include shipping details
      .populate("payment")                     // include payment info
      .populate({
        path: "items.product",
        model: "Product",
        strictPopulate: false
      })
      .sort({ createdAt: -1 });                // latest orders first

    res.status(200).json({ success: true, orders });
  } catch (err) {
    // Detailed error logging
    console.error("===== GET ALL ORDERS ERROR =====");
    console.error("Message:", err.message);
    console.error("Name:", err.name);
    console.error("Stack:", err.stack);
    if (err.code) console.error("Error Code:", err.code);
    if (err.errors) console.error("Validation Errors:", err.errors);
    if (err.cause) console.error("Cause:", err.cause);
    console.error("=================================");

    res.status(500).json({
      success: false,
      error: err.message,
      name: err.name,
      code: err.code || null,
    });
  }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status before updating
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: "Order not found" });

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};



// Delete order (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await order.deleteOne(); // or Order.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getOrderCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.status(200).json({ totalOrders: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    // Sum all paid orders
    const result = await Order.aggregate([
      { $match: { paymentStatus: "pending" } }, // only paid orders
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const revenue = result.length > 0 ? result[0].totalRevenue : 0;
    res.status(200).json({ totalRevenue: revenue });
  } catch (err) {
    res.status(500).json({ message: "Error fetching revenue", error: err.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(5)
      .populate("user", "name email") // optional: populate user info
      .populate("items.product", "name price"); // optional: product info

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

exports.getAllProductSales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.finalPrice", "$items.quantity"] }
          }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: { $ifNull: ["$product.name", "Unknown Product"] },
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    return res.status(200).json({ success: true, sales });
  } catch (err) {
    console.error("getAllProductSales error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};