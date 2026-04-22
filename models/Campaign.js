const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["store", "product", "popular"],
      required: true,
      default: "store",
    },
    discountPercentage: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    image: {
      type: String, // Path to image
    },
    roomId: {
      type: String,
      required: true,
    },
    placeId: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Optional, only for type: "product"
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

// Indexes
CampaignSchema.index({ roomId: 1 });
CampaignSchema.index({ placeId: 1 });
CampaignSchema.index({ type: 1 });
CampaignSchema.index({ isActive: 1 });

if (mongoose.models.Campaign) {
  delete mongoose.models.Campaign;
}

module.exports = mongoose.model("Campaign", CampaignSchema);
