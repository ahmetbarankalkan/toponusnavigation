export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    console.log("🔍 DB Test rotası tetiklendi");
    await connectDB();
    console.log("✅ DB Bağlantısı başarılı");
    
    const usersCount = await User.countDocuments();
    const adminUser = await User.findOne({ username: 'admin' });
    
    return NextResponse.json({
      success: true,
      message: "Veritabanı bağlantısı başarılı",
      usersCount,
      adminExists: !!adminUser,
      adminDetails: adminUser ? {
        username: adminUser.username,
        role: adminUser.role,
        is_active: adminUser.is_active
      } : null
    });
  } catch (error) {
    console.error("❌ DB Test hatası:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
