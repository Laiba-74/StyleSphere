const ShippingAddress = require("../models/ShippingAddress");

// Create Shipping Address
exports.createShippingAddress = async (req, res) => {
  try {
    const { phone, address, city, state, zipcode, isDefault } = req.body;
    const shipping = new ShippingAddress({
      user: req.user.userId,
      phone,
      address,
      city,
      state,
      zipcode,
      isDefault: isDefault || false,
    });
    await shipping.save();
    res.status(201).json({ success: true, address: shipping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all shipping addresses of user
exports.getUserShippingAddresses = async (req, res) => {
  try {
    const addresses = await ShippingAddress.find({ user: req.user.userId });
    res.status(200).json({ success: true, addresses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Shipping Address
exports.updateShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow the owner to update
    const shipping = await ShippingAddress.findOneAndUpdate(
      { _id: id, user: req.user.userId }, // check ownership
      { $set: req.body }, // apply updates from request body
      { new: true } // return updated doc
    );

    if (!shipping) {
      return res.status(404).json({ success: false, error: "Address not found" });
    }

    res.status(200).json({ success: true, address: shipping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Shipping Address
exports.deleteShippingAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const shipping = await ShippingAddress.findOneAndDelete({
      _id: id,
      user: req.user.userId, // ensure user owns it
    });

    if (!shipping) {
      return res.status(404).json({ success: false, error: "Address not found" });
    }

    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
