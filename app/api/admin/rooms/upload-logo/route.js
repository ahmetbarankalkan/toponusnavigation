import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const { placeId, roomId, imageData } = await request.json();
    if (!placeId || !roomId || !imageData) {
      return NextResponse.json({ error: "placeId, roomId ve imageData gerekli" }, { status: 400 });
    }

    await connectDB();

    // Yetki kontrolü
    if (user.role === "store_owner") {
      if (user.place_id !== placeId || user.store_id !== roomId) {
        return NextResponse.json({ error: "Sadece kendi mağazanız için görsel yükleyebilirsiniz" }, { status: 403 });
      }
    } else if (!(user.role === "admin" || user.role === "place_owner")) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }
    if (user.role === "place_owner" && user.place_id !== placeId) {
      return NextResponse.json({ error: "Sadece kendi mekanınız için yükleyebilirsiniz" }, { status: 403 });
    }

    // Place slug bul
    const place = await Place.findById(placeId);
    if (!place) {
      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }
    const slug = place.slug;

    // Base64 parse
    const match = imageData.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Geçersiz imageData" }, { status: 400 });
    }
    const mimeType = match[1];
    const base64 = match[2];
    let buffer = Buffer.from(base64, "base64");
    let ext = mimeType.split("/")[1].replace("svg+xml", "svg");
    
    // PNG veya JPG ise SVG'ye çevir (base64 embedding ile)
    if (mimeType === "image/png" || mimeType === "image/jpeg" || mimeType === "image/jpg") {

      
      try {
        // Base64 string oluştur
        const base64Image = `data:${mimeType};base64,${base64}`;
        
        // Görüntü boyutlarını tahmin et (varsayılan 200x200, gerçek boyutlar için sharp kullanılabilir)
        const width = 200;
        const height = 200;
        
        // SVG wrapper oluştur - PNG/JPG'yi SVG içine göm
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image width="${width}" height="${height}" xlink:href="${base64Image}"/>
</svg>`;
        
        buffer = Buffer.from(svgString, 'utf8');
        ext = 'svg';

      } catch (err) {
        console.error(`⚠️ SVG wrapper oluşturulamadı, orijinal format kullanılıyor:`, err.message);
        console.error(`📋 Hata detayı:`, err.stack);
        // Dönüşüm başarısız olursa orijinal formatı kullan
      }
    }

    const roomDir = path.join(process.cwd(), "public", "images", "rooms", slug, `room-${roomId}`);
    fs.mkdirSync(roomDir, { recursive: true });

    // ESKİ LOGO DOSYALARINI SİL
    const existingFiles = fs.readdirSync(roomDir);
    existingFiles.forEach((file) => {
      if (file.startsWith("logo-") || file.startsWith("logo.")) {
        const oldFilePath = path.join(roomDir, file);
        try {
          fs.unlinkSync(oldFilePath);

        } catch (e) {
          console.error(`⚠️ Eski logo silinemedi: ${file}`, e.message);
        }
      }
    });

    // Unique ID ile dosya adı oluştur
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileName = `logo-${uniqueId}.${ext}`;
    const filePath = path.join(roomDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const publicPath = `/images/rooms/${slug}/room-${roomId}/${fileName}`;

    // MongoDB'de room'un logo path'ini güncelle
    await Room.findOneAndUpdate(
      { room_id: roomId, place_id: placeId },
      {
        "content.logo": publicPath,
        needs_sync: true,
        last_synced: new Date(),
      }
    );

    return NextResponse.json({ success: true, path: publicPath });
  } catch (error) {
    console.error("Room logo upload error:", error);
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
