// models/KioskContent.js
import mongoose from 'mongoose';

const KioskContentSchema = new mongoose.Schema(
  {
    place_id: {
      type: String,
      required: true,
      unique: true,
    },
    selectedStores: {
      type: [String],
      default: [],
      validate: {
        validator: function(v) {
          return v.length <= 8;
        },
        message: 'Maksimum 8 mağaza seçilebilir!'
      }
    },
    selectedDiscounts: {
      type: [String],
      default: [],
    },
    updatedBy: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.KioskContent || mongoose.model('KioskContent', KioskContentSchema);
