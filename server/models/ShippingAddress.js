const mongoose = require("mongoose");


const shippingAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\+?[0-9]{9,15}$/.test(v);
        },
        message: "Phone number must be 9–15 digits and may start with +",
      },
    },
    address: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    zipcode: { 
      type: String, 
      required: true,
      match: [/^[0-9]{4,10}$/, "Zip code must be 4–10 digits"],
    },
    isDefault: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

shippingAddressSchema.pre("save", function (next) {
  if (this.phone) {
    this.phone = this.phone.replace(/[\s()-]/g, ""); // remove formatting
    if (!this.phone.startsWith("+")) {
      this.phone = "+" + this.phone;
    }
  }
  next();
});

module.exports = mongoose.model("ShippingAddress", shippingAddressSchema);

