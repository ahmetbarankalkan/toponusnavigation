import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const placeId = url.searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json({ error: "Place ID gerekli" }, { status: 400 });
    }

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

    // MongoDB'ye bağlan
    await connectDB();

    // Place'i bul (sadece MongoDB ObjectId ile)
    const place = await Place.findById(placeId);
    if (!place) {
      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }

    // İçerik döndür
    return NextResponse.json({
      success: true,
      content: place.content || {},
    });
  } catch (error) {
    console.error("Content API hatası:", error);
    return NextResponse.json(
      {
        error: "Content API hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { placeId, content } = body;



    if (!placeId || !content) {

      return NextResponse.json({ error: "Place ID ve content gerekli" }, { status: 400 });
    }

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

    // MongoDB'ye bağlan
    await connectDB();

    // Place'i bul (sadece MongoDB ObjectId ile)
    const place = await Place.findById(placeId);
    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }



    // Place owner kontrolü
    if (user.role === "place_owner" && user.place_id !== place._id.toString()) {

      return NextResponse.json({ error: "Bu place'e erişim yetkiniz yok" }, { status: 403 });
    }

    // Content'i güncelle
    place.content = content;
    await place.save();



    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Content güncelleme hatası:", error);
    return NextResponse.json(
      {
        error: "Content güncelleme hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
