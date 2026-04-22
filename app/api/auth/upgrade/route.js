// app/api/auth/upgrade/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyJWTToken, createJWTToken } from "@/utils/auth.js";

export async function POST(request) {
  try {
    // JWT token kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, displayName } = body;



    // Validasyon
    if (!phone || !displayName) {
      return NextResponse.json(
        { error: "Telefon numarası ve kullanıcı ismi gerekli" },
        { status: 400 }
      );
    }

    // Telefon formatı kontrolü (0 ile başlayan 11 haneli)
    const phoneClean = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^0[0-9]{10}$/;
    if (!phoneRegex.test(phoneClean)) {
      return NextResponse.json(
        { error: "Telefon numarası 0 ile başlamalı ve 11 haneli olmalıdır (örn: 05419675256)" },
        { status: 400 }
      );
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Kullanıcıyı güncelle
    user.phone = phone;
    user.displayName = displayName;
    user.role = "advanced_user"; // Advanced user'a yükselt
    await user.save();



    // Yeni JWT token oluştur
    const newTokenPayload = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
    };

    const newToken = createJWTToken(newTokenPayload, "30d");

    // Kullanıcı bilgilerini döndür
    const userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      visitedStores: user.visitedStores || [],
      favoriteStores: user.favoriteStores || [],
      favoriteCampaigns: user.favoriteCampaigns || [],
    };

    return NextResponse.json({
      success: true,
      token: newToken,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ Profile upgrade hatası:", error);
    return NextResponse.json(
      {
        error: "Profil güncelleme hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
