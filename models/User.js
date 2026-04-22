// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // allows null values
    },
    phone: {
      type: String,
      sparse: true, // allows null values
    },
    dateOfBirth: {
      type: String,
    },
    displayName: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "place_owner", "store_owner", "basic_user", "advanced_user"],
      default: "basic_user",
      required: true,
    },
    
    // User activity tracking
    visitedStores: [{
      storeId: String,
      storeName: String,
      visitDate: { type: Date, default: Date.now }
    }],
    favoriteStores: [{
      storeId: String,
      storeName: String,
      addedDate: { type: Date, default: Date.now }
    }],
    favoriteCampaigns: [{
      campaignId: String,
      campaignTitle: String,
      addedDate: { type: Date, default: Date.now }
    }],
    routeHistory: [{
      startStoreId: String,
      startStoreName: String,
      endStoreId: String,
      endStoreName: String,
      distance: Number,
      duration: Number,
      completedDate: { type: Date, default: Date.now }
    }],

    // Role-specific fields (Primary location)
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
    },
    store_id: {
      type: String, // room-157 format
    },

    // Professional Multi-Location Access
    access_list: [{
      place_id: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
      place_name: String, // Denormalized for performance
      store_id: String,   // Optional: if provided, user only manages this store
      store_name: String,
      role: { type: String, enum: ["place_owner", "store_owner"] }
    }],

    last_login: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Model cache'ini temizle ve yeniden oluştur
if (mongoose.models.User) {
  delete mongoose.models.User;
}

module.exports = mongoose.model("User", UserSchema);
