import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function PUT(request) {
  try {


    // Token kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {

      return NextResponse.json({ error: "Token gerekli" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);

    } catch (error) {

      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    // Admin veya place_owner slug değiştirebilir
    if (user.role !== "admin" && user.role !== "place_owner") {

      return NextResponse.json({ error: "Bu işlem için admin veya place_owner yetkisi gerekli" }, { status: 403 });
    }

    const body = await request.json();


    const { placeId, newName, newSlug } = body;



    if (!placeId || !newName || !newSlug) {

      return NextResponse.json({ error: "Place ID, yeni isim ve slug gerekli" }, { status: 400 });
    }

    // Place owner kontrolü
    if (user.role === "place_owner" && user.place_id !== placeId) {

      return NextResponse.json({ error: "Bu place'i güncelleme yetkiniz yok" }, { status: 403 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Place'i bul (MongoDB ObjectId ile)
    const place = await Place.findById(placeId);
    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }



    const oldSlug = place.slug;
    const oldName = place.name;

    // Slug'un benzersiz olduğunu kontrol et
    const existingPlace = await Place.findOne({ slug: newSlug, _id: { $ne: placeId } });
    if (existingPlace) {

      return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 400 });
    }



    // ⚠️ UYARI: Vercel'de filesystem read-only olduğu için dosya taşıma işlemleri devre dışı
    // Dosyaları manuel olarak taşımanız ve yeniden deploy etmeniz gerekiyor!

    // Sadece MongoDB'i güncelle
    place.name = newName;
    place.slug = newSlug;
    place.updatedAt = new Date();

    // Floor dosya yollarını güncelle (path'ler slug'a göre olduğu için)
    if (place.floors) {
      const floorsObj = place.floors instanceof Map ? Object.fromEntries(place.floors) : place.floors;
      Object.keys(floorsObj).forEach((floor) => {
        const oldPath = floorsObj[floor];
        const newPath = oldPath.replace(`places/${oldSlug}/`, `places/${newSlug}/`);
        floorsObj[floor] = newPath;

      });
      place.floors = floorsObj;
    }

    // Header image yolunu güncelle
    if (place.content && place.content.header_image) {
      const oldHeaderImagePath = place.content.header_image;
      const newHeaderImagePath = oldHeaderImagePath.replace(`${oldSlug}-header`, `${newSlug}-header`);
      place.content.header_image = newHeaderImagePath;

    }

    // MongoDB'de kaydet
    await place.save();


    return NextResponse.json({
      success: true,
      oldSlug: oldSlug,
      newSlug: newSlug,
      oldName: oldName,
      newName: newName,
    });
  } catch (error) {
    console.error("❌ Slug güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
