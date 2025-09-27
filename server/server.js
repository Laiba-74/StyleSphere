// explain
require('dotenv').config();
const express = require('express');

const app = express();
const path = require("path");
const router = require('./routes/authRoutes');
// const profileRoutes = require('./routes/profileRoutes')
const checkoutRoutes = require("./routes/checkoutRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const shippingRoutes = require("./routes/shippingAddressRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const favRoutes = require("./routes/favoriteRoutes");
const settingRoutes = require("./routes/settingRoutes");
const connectDB = require('./config/db');
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allows undefined origins (e.g., Postman)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true,
};

app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());// delegate
app.use('/api/auth', router);
app.use("/api/products", productRoutes);
app.use('/api/checkout', checkoutRoutes );
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/shipping", shippingRoutes );
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/favorites", favRoutes);
app.use("/api/settings", settingRoutes);

connectDB().then(()=>{
    app.listen(5000,()=>{
        console.log("Server is running on Port # 5000");
    });
})

app.use((req, res) => {
  res.status(404).json({ msg: "Endpoint not found" });
});




