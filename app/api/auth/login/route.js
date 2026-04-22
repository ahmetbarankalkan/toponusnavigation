// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

import { verifyJWTToken, createJWTToken } from "@/utils/auth.js";

export async function POST(request) {
  try {
    const { username, password } = await request.json();


    if (!username || !password) {

      return NextResponse.json({ error: "Username ve password gerekli" }, { status: 400 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findOne({ username, is_active: true });


    if (!user) {

      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre" }, { status: 401 });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await user.comparePassword(password);


    if (!isPasswordValid) {

      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre" }, { status: 401 });
    }

    // JWT token oluştur
    const tokenPayload = {
      id: user._id,
      username: user.username,
      role: user.role,
      place_id: user.place_id,
      store_id: user.store_id,
    };

    const token = createJWTToken(tokenPayload, "24h");

    // Son giriş zamanını güncelle
    await User.findByIdAndUpdate(user._id, { last_login: new Date() });

    // Mekan bilgisini al (İsimler için)
    const Place = (await import("@/models/Place")).default;
    let placeName = "Bilinmeyen Mekan";
    if (user.place_id) {
      const place = await Place.findById(user.place_id);
      if (place) placeName = place.name;
    }

    // Access list hazırlama (Profesyonel çoklu şube desteği için)
    let accessList = user.access_list || [];
    if (accessList.length === 0 && user.place_id) {
      accessList = [{
        place_id: user.place_id.toString(),
        place_name: placeName,
        store_id: user.store_id,
        store_name: user.username.replace('_admin', '').toUpperCase(),
        role: user.role
      }];
    }

    // Kullanıcı bilgilerini döndür (şifre hariç)
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
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("❌ Login hatası:", error);
    return NextResponse.json(
      {
        error: "Login hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
