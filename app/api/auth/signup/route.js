// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createJWTToken } from "@/utils/auth.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, displayName, phone, dateOfBirth, countryCode } = body;

    const fullPhone = countryCode && phone ? `${countryCode}${phone}` : phone;

    // Validasyon
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gerekli" },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin" },
        { status: 400 }
      );
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Şifre en az 4 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Username oluştur (email'den)
    const username = email.split('@')[0] + '_' + Date.now();

    // Yeni kullanıcı oluştur
    const newUser = new User({
      username,
      email,
      password, // Model'deki middleware otomatik hash'leyecek
      displayName,
      phone: fullPhone,
      dateOfBirth,
      role: "basic_user",
      is_active: true,
      visitedStores: [],
      favoriteStores: [],
      favoriteCampaigns: [],
    });

    const savedUser = await newUser.save();


    // JWT token oluştur
    const tokenPayload = {
      id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
      email: savedUser.email,
      phone: savedUser.phone,
      displayName: savedUser.displayName,
    };

    const token = createJWTToken(tokenPayload, "30d"); // 30 gün geçerli

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userInfo = {
      id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
      email: savedUser.email,
      phone: savedUser.phone,
      dateOfBirth: savedUser.dateOfBirth,
      displayName: savedUser.displayName,
      visitedStores: savedUser.visitedStores || [],
      favoriteStores: savedUser.favoriteStores || [],
      favoriteCampaigns: savedUser.favoriteCampaigns || [],
    };

    return NextResponse.json({
      success: true,
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ Signup hatası:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error name:", error.name);
    return NextResponse.json(
      {
        error: "Kayıt hatası",
        details: error.message,
        errorName: error.name,
      },
      { status: 500 }
    );
  }
}
