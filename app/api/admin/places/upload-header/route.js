import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
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

    // FormData'yı parse et
    const formData = await request.formData();
    const file = formData.get("file");
    const placeId = formData.get("placeId");



    if (!file || !placeId) {

      return NextResponse.json({ error: "Dosya ve place ID gerekli" }, { status: 400 });
    }

    // Place owner kontrolü
    if (user.role === "place_owner" && user.place_id !== placeId) {

      return NextResponse.json({ error: "Bu place'e erişim yetkiniz yok" }, { status: 403 });
    }

    // Dosya uzantısı kontrolü
    const fileExtension = path.extname(file.name).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    if (!allowedExtensions.includes(fileExtension)) {

      return NextResponse.json({ error: "Desteklenen formatlar: .png, .jpg, .jpeg, .gif, .webp" }, { status: 400 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Place'i bul (sadece MongoDB ObjectId ile)
    const place = await Place.findById(placeId);

    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }



    // Dosya içeriğini oku
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer);

    // Dosya adını oluştur
    const fileName = `${place.slug}-header${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "places");
    const filePath = path.join(uploadDir, fileName);

    // Upload dizinini oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });

    }

    // Dosyayı kaydet
    fs.writeFileSync(filePath, fileContent);


    // MongoDB'de content'i güncelle
    if (!place.content) {
      place.content = {};

    }

    const oldHeaderImage = place.content.header_image;
    place.content.header_image = `/images/places/${fileName}`;
    await place.save();



    return NextResponse.json({
      success: true,
      fileName: fileName,
      filePath: `/images/places/${fileName}`,
    });
  } catch (error) {
    console.error("❌ Header image yükleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
