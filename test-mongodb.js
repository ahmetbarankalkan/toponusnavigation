require('dotenv').config({ path: '.env.local' });
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log("🔄 MongoDB'ye bağlanıyor...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB'ye başarıyla bağlandı!");

    // Veritabanı listesini göster
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log(
      "📊 Mevcut veritabanları:",
      dbs.databases.map((db) => db.name)
    );

    await mongoose.disconnect();
    console.log("🔌 Bağlantı kapatıldı");
  } catch (error) {
    console.error("❌ MongoDB bağlantı hatası:", error.message);
  }
}

testConnection();
