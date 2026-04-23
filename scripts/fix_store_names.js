// scripts/fix_store_names.js
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const Room = require("../models/Room.js");
const User = require("../models/User.js");

const MONGODB_URI = process.env.MONGODB_URI;

async function fixStoreNames() {
  try {
    console.log("🔄 MongoDB'ye bağlanıyor...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Bağlandı!");

    // 1. room-157'yi Koçtaş olarak düzelt
    console.log("🛠️ room-157 kontrol ediliyor...");
    const koctasRoom = await Room.findOne({ room_id: "room-157" });
    
    if (koctasRoom) {
      koctasRoom.name = "Koçtaş";
      if (!koctasRoom.content) koctasRoom.content = {};
      koctasRoom.content.title = "Koçtaş";
      koctasRoom.content.description = "Koçtaş, Koç Holding bünyesinde faaliyet gösteren, Türkiye'nin önde gelen yapı market zinciridir. Ev geliştirme, bahçe, mobilya, dekorasyon, banyo ve mutfak gibi geniş kategorilerde binlerce ürünü ve çözüm hizmetlerini sunar.";
      koctasRoom.content.logo = "/images/rooms/ankamall/room-room-157/logo.png";
      
      await koctasRoom.save();
      console.log("✅ room-157 başarıyla Koçtaş olarak güncellendi.");
    } else {
      console.log("❌ room-157 bulunamadı!");
    }

    // 2. teknosa_admin kullanıcısını güncelle
    console.log("🛠️ teknosa_admin kullanıcısı kontrol ediliyor...");
    const teknosaUser = await User.findOne({ username: "teknosa_admin" });
    if (teknosaUser && teknosaUser.store_id === "room-157") {
      console.log("⚠️ teknosa_admin kullanıcısı room-157'ye (Koçtaş) bağlı. Bu bağı kaldırıyoruz...");
      teknosaUser.store_id = ""; // Gerçek Teknosa ID'si bulunana kadar boş bırakılabilir
      await teknosaUser.save();
      console.log("✅ teknosa_admin store_id temizlendi.");
    }

    console.log("🎉 Düzenleme tamamlandı!");
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await mongoose.disconnect();
  }
}

fixStoreNames();
