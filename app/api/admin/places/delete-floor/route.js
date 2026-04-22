import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function DELETE(request) {
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

    // URL'den parametreleri al
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");
    const floor = searchParams.get("floor");



    if (!placeId || !floor) {

      return NextResponse.json({ error: "Place ID ve kat bilgisi gerekli" }, { status: 400 });
    }

    // Place owner kontrolü
    if (user.role === "place_owner" && user.place_id !== placeId) {

      return NextResponse.json({ error: "Bu place'e erişim yetkiniz yok" }, { status: 403 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Place'i bul (sadece MongoDB ObjectId ile)
    const place = await Place.findById(placeId);

    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }



    // Kat planı var mı kontrol et
    if (!place.floor_photos || !place.floor_photos.has(floor)) {

      return NextResponse.json({ error: "Bu kat için plan bulunamadı" }, { status: 404 });
    }

    const filePath = place.floor_photos.get(floor);
    const fullFilePath = path.join(process.cwd(), "public", filePath);

    // Dosya var mı kontrol et
    if (fs.existsSync(fullFilePath)) {
      // Dosyayı sil
      fs.unlinkSync(fullFilePath);

    } else {

    }

    // MongoDB'den kat planı bilgisini sil
    place.floor_photos.delete(floor);
    await place.save();



    return NextResponse.json({
      success: true,
      floor: floor,
    });
  } catch (error) {
    console.error("❌ Kat dosyası silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
