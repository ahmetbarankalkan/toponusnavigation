export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    
    // Admin zaten var mı kontrol et
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "Admin kullanıcısı zaten mevcut." 
      });
    }

    // Yeni admin oluştur
    // Not: User modelinde muhtemelen pre-save hook ile şifreleme vardır ama biz sağlama alalım
    const newAdmin = new User({
      username: 'admin',
      password: 'admin123', // Model'in pre-save hook'u bunu şifrelemeli
      email: 'admin@toponus.com',
      role: 'admin',
      is_active: true
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      message: "Admin kullanıcısı başarıyla oluşturuldu.",
      credentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error("❌ Admin oluşturma hatası:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
