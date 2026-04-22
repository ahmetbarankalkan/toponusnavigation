// app/api/auth/signin/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createJWTToken } from "@/utils/auth.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;



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

    // MongoDB'ye bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 401 }
      );
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.is_active) {
      return NextResponse.json(
        { error: "Hesabınız devre dışı bırakılmış" },
        { status: 403 }
      );
    }

    // Son giriş tarihini güncelle
    user.last_login = new Date();
    await user.save();

    // JWT token oluştur
    const tokenPayload = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
    };

    const token = createJWTToken(tokenPayload, "30d"); // 30 gün geçerli

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      displayName: user.displayName,
      visitedStores: user.visitedStores || [],
      favoriteStores: user.favoriteStores || [],
      favoriteCampaigns: user.favoriteCampaigns || [],
    };



    // Mevcut sistemle uyumlu response döndür (localStorage için)
    return NextResponse.json({
      success: true,
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ Signin hatası:", error);
    return NextResponse.json(
      {
        error: "Giriş hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
