// app/api/auth/verify/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

import { verifyJWTToken } from "@/utils/auth.js";

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    // Token'ı verify et
    let decoded;
    try {
      decoded = verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 401 });
    }

    // Mekan bilgisini al (Primary)
    let placeName = "Bilinmeyen Mekan";
    const Place = (await import("@/models/Place")).default;
    
    if (user.place_id) {
      const place = await Place.findById(user.place_id);
      if (place) placeName = place.name;
    }

    // Access list hazırlama (Profesyonel mimari için)
    let accessList = user.access_list || [];
    if (accessList.length === 0 && user.place_id) {
      // Legacy kullanıcılar için otomatik access list oluştur
      accessList = [{
        place_id: user.place_id.toString(),
        place_name: placeName,
        store_id: user.store_id,
        store_name: user.username.replace('_admin', '').toUpperCase(),
        role: user.role
      }];
    }

    // Kullanıcı bilgilerini döndür
    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      place_id: user.place_id?.toString(),
      place_name: placeName,
      store_id: user.store_id,
      access_list: accessList,
      last_login: user.last_login,
    };

    return NextResponse.json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ Token verify hatası:", error);
    return NextResponse.json(
      {
        error: "Token verify hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
