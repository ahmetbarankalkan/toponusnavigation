// models/Room.js
const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    room_id: {
      type: String,
      required: true,
      // unique: true kaldırıldı - place_id + room_id kombinasyonu unique olacak
    },
    place_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    floor: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    // GeoJSON geometry (harita için)
    geometry: {
      type: {
        type: String,
        enum: ["Polygon", "Point", "LineString"],
        required: true,
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
    },

    // İçerik yönetimi (admin panel için)
    content: {
      // Temel Bilgiler
      type: { type: String, default: "room" }, // GeoJSON için gerekli
      category: String,
      subtype: String,
      icon: String,
      is_special: { type: Boolean, default: false },
      special_type: String,
      status: String,
      phone: String,
      hours: String,
      promotion: String,

      // İçerik Yönetimi
      description: String,
      header_image: String,
      logo: String,
      website: String,
      email: String,
      instagram: String,
      twitter: String,
      services: String, // comma-separated
      tags: String, // comma-separated
      
      // Ürünler, Etkinlikler ve Fırsatlar
      products: [{
        id: String,
        title: String,
        description: String,
        price: Number,
        image: String,
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      }],
      events: [{
        id: String,
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        image: String,
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      }],
      discounts: [{
        id: String,
        title: String,
        description: String,
        discount: Number, // İndirim Oranı (%)
        oldPrice: Number,
        newPrice: Number,
        image: String,
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      }],

      // Kampanya/İndirim Yönetimi
      campaigns: [{
        title: String, // Kampanya başlığı
        description: String, // Kampanya açıklaması
        discount_percentage: Number, // İndirim yüzdesi
        discount_amount: Number, // Sabit indirim miktarı
        start_date: Date, // Kampanya başlangıç tarihi
        end_date: Date, // Kampanya bitiş tarihi
        image: String, // Kampanya görseli
        is_active: { type: Boolean, default: true }, // Aktif kampanya mı
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
      }],

      // Popüler Yerler Kampanyası
      popular_campaign: {
        is_active: { type: Boolean, default: false },
        start_date: Date,
        end_date: Date,
        duration: Number
      },

      // Ürün Kampanyaları
      product_campaigns: [{
        product_name: String,
        description: String,
        original_price: Number,
        discounted_price: Number,
        discount_percentage: Number,
        image: String,
        is_active: { type: Boolean, default: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
      }]
    },

    // Sync durumu
    last_synced: {
      type: Date,
      default: Date.now,
    },
    needs_sync: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
RoomSchema.index({ place_id: 1, floor: 1 });
RoomSchema.index({ geometry: "2dsphere" });
RoomSchema.index({ place_id: 1, room_id: 1 }, { unique: true }); // place_id + room_id unique

// Model cache'ini temizle ve yeniden oluştur
if (mongoose.models.Room) {
  delete mongoose.models.Room;
}

module.exports = mongoose.models.Room || mongoose.model("Room", RoomSchema, "rooms");
