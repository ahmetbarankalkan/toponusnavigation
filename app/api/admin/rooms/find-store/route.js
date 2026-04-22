import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {


    // Auth
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

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") || user?.storeId;



    if (!storeId) {

      return NextResponse.json({ error: "storeId gerekli" }, { status: 400 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Store owner'ın place_id'sini al
    const User = require("@/models/User");
    const userDoc = await User.findById(user.id);
    const userPlaceId = userDoc?.place_id?.toString();



    if (!userPlaceId) {

      return NextResponse.json({ error: "Store owner'ın place bilgisi bulunamadı" }, { status: 400 });
    }

    // Room'u bul (hem room_id hem de place_id ile)
    const room = await Room.findOne({
      room_id: storeId,
      place_id: userPlaceId,
    });


    if (!room) {

      return NextResponse.json({ error: "Mağaza bulunamadı veya bu mekana ait değil" }, { status: 404 });
    }

    // Place'i bul
    const place = await Place.findById(room.place_id);


    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      placeId: place._id.toString(),
      placeName: place.name,
      floor: room.floor,
      room: {
        id: `f${room.floor}-${room.room_id}`,
        originalId: room.room_id,
        room_id: room.room_id, // Frontend için room_id ekle
        name: room.name,
        category: room.content?.category || "general",
        subtype: room.content?.subtype || "",
        icon: room.content?.icon || "",
        is_special: room.content?.is_special || false,
        special_type: room.content?.special_type || "",
        phone: room.content?.phone || "",
        hours: room.content?.hours || "",
        promotion: room.content?.promotion || "",
        // Eksik field'ları ekle
        description: room.content?.description || "",
        header_image: room.content?.header_image || "",
        logo: room.content?.logo || "",
        website: room.content?.website || "",
        email: room.content?.email || "",
        instagram: room.content?.instagram || "",
        twitter: room.content?.twitter || "",
        services: room.content?.services || "",
        tags: room.content?.tags || "",
        // Content objesini de ekle
        content: room.content || {},
      },
    });
  } catch (error) {
    console.error("❌ /api/admin/rooms/find-store hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
