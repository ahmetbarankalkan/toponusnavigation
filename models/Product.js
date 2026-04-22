const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    image: {
      type: String, // Path to image
    },
    roomId: {
      type: String, // e.g. "room-157"
      required: true,
    },
    placeId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
ProductSchema.index({ roomId: 1 });
ProductSchema.index({ placeId: 1 });

// Cache management
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

module.exports = mongoose.model("Product", ProductSchema);
