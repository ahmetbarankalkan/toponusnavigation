// app/api/admin/rooms/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {


    // JWT token kontrolü
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

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");
    const floor = searchParams.get("floor");



    if (!placeId || !floor) {

      return NextResponse.json({ error: "placeId ve floor parametreleri gerekli" }, { status: 400 });
    }

    // Place'i bul
    const place = await Place.findById(placeId);


    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }

    // Store owner kontrolü
    if (user.role === "store_owner") {
      // Store owner'ın place_id'sini al
      const User = require("@/models/User");
      const userDoc = await User.findById(user.id);
      const userPlaceId = userDoc?.place_id?.toString();



      if (!userPlaceId) {

        return NextResponse.json({ error: "Store owner'ın place bilgisi bulunamadı" }, { status: 400 });
      }

      // Store owner sadece kendi place'indeki odaları görebilir
      if (placeId !== userPlaceId) {

        return NextResponse.json({ error: "Bu mekana erişim yetkiniz yok" }, { status: 403 });
      }

      // Store owner sadece kendi room'unu görebilir
      const allowedRoomId = user.store_id;
      if (!allowedRoomId) {

        return NextResponse.json({ error: "Store ID bulunamadı" }, { status: 400 });
      }

      const room = await Room.findOne({
        room_id: allowedRoomId,
        place_id: userPlaceId,
      });

      if (!room) {

        return NextResponse.json({ error: "Room bulunamadı" }, { status: 404 });
      }



      // Store owner için de aynı formatı uygula
      const formattedRoom = {
        id: `f${room.floor}-${room.room_id}`,
        originalId: room.room_id,
        room_id: room.room_id,
        name: room.name,
        floor: room.floor,
        // Content objesinden düz field'lara dönüştür
        category: room.content?.category || "general",
        subtype: room.content?.subtype || "",
        icon: room.content?.icon || "",
        is_special: room.content?.is_special || false,
        special_type: room.content?.special_type || "",
        phone: room.content?.phone || "",
        hours: room.content?.hours || "",
        promotion: room.content?.promotion || "",
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
      };

      return NextResponse.json([formattedRoom]);
    }

    // Admin/Place Owner için tüm rooms


    let query = { place_id: placeId };
    if (floor !== "all") {
      query.floor = parseInt(floor);
    }

    const rooms = await Room.find(query).sort({ name: 1 });



    // Room verilerini düz field'lara dönüştür (find-store endpoint'i gibi)
    const formattedRooms = rooms.map((room) => {

      
      return {
        id: `f${room.floor}-${room.room_id}`,
        originalId: room.room_id,
        room_id: room.room_id,
        name: room.name,
        floor: room.floor,
        // Content objesinden düz field'lara dönüştür
        category: room.content?.category || "general",
        subtype: room.content?.subtype || "",
        icon: room.content?.icon || "",
        is_special: room.content?.is_special || false,
        special_type: room.content?.special_type || "",
        phone: room.content?.phone || "",
        hours: room.content?.hours || "",
        promotion: room.content?.promotion || "",
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
      };
    });

    // CACHE KONTROLÜ: No-cache header'ları ekle
    const response = NextResponse.json(formattedRooms);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("❌ Rooms listesi hatası:", error);
    return NextResponse.json(
      {
        error: "Rooms listesi hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
