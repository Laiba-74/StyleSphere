const User = require("../models/User"); 
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

// Register new user (role will be predefined)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    const token = newUser.generateToken();

    res.status(201).json({
      msg: "Registered successfully",
      token,
      user: {
        id: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err); // full log
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// Login for both User and Admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = await user.generateToken();

    res.json({
      msg: "Login successful",
      token,
      user: { id: user.userId, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get logged-in user info
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("GetMe error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -resetToken -resetTokenExpiry");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Get Profile error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

const update = async (req, res) => {
  console.log("📥 REQ.FILE:", req.file);
  console.log("📥 REQ.BODY:", req.body);

  try {
    const id = req.user.userId;
    if (!id) {
      console.error("❌ No user ID provided in params");
      return res.status(400).json({ msg: "User ID is required" });
    }

    const {
      name,
      email,
      password,
      role
    } = req.body;

    let updatedData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(password && { password }),
      ...(role && { role }),
      updatedAt: new Date(),
    };

    // Handle image update
    if (req.file) {
      const imagePath = `uploads/${req.file.filename}`;
      try {
        const user = await User.findById(id);
        if (!user) {
          console.error("❌ User not found with ID:", id);
          return res.status(404).json({ msg: "User not found." });
        }
        if (user.avatar) {
          const oldImagePath = path.join(__dirname, "..", user.avatar);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("✅ Old image deleted successfully.");
          } else {
            console.warn("⚠️ Old image not found, skipping deletion");
          }
        }
        updatedData.avatar = imagePath;
      } catch (findErr) {
        console.error("❌ Error finding user for old image cleanup:", findErr);
      }
    }

    // Perform update
    const response = await User.findOneAndUpdate({ _id: id }, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      console.error("❌ User not found for update:", id);
      return res.status(404).json({ msg: "User Not Found" });
    }

    console.log("✅ User updated successfully:", response._id);
    return res.status(200).json({
      msg: "User updated successfully",
      user: response,
      token: await response.generateToken(),
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    return res.status(500).json({
      msg: "Server error while updating user",
      error: error.message,
    });
  }
};



const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Set new password (will be hashed automatically in pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Get users (exclude sensitive fields)
    const users = await User.find({ role: "user"})
      .select("-password -__v")
      .sort({ createdAt: -1 });

    // For each user, calculate stats
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user.userId });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
          ...user.toObject(),
          totalOrders,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Error fetching users with stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ totalUsers: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const admin = req.user; // logged-in user

    if (admin.role !== "admin") {
      return res.status(403).json({ msg: "Access denied: Admins only" });
    }

    const userId = req.params.id;
    const userToDelete = await User.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (userToDelete.role === "admin") {
      return res
        .status(403)
        .json({ msg: "Cannot delete another admin" });
    }

    // Delete avatar if exists
    if (userToDelete.avatar) {
      const avatarPath = path.join(__dirname, "..", userToDelete.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Update User Status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.status = status;
    await user.save();

    res.status(200).json({ msg: "User status updated successfully", user });
  } catch (err) {
    console.error("Update user status error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


module.exports = { getProfile, update, register, login, getMe, changePassword, getAllUsers, getUserCount, deleteUser, updateUserStatus } 