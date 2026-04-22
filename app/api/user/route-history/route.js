import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { verifyJWTToken } from "@/utils/auth";

export async function POST(request) {
  try {
    await connectDB();

    // Token kontrolü
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = verifyJWTToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const userId = decoded.id;
    if (!userId) {
      return NextResponse.json({ error: "Kullanıcı ID bulunamadı" }, { status: 400 });
    }

    const body = await request.json();
    const { 
      startStoreId, 
      startStoreName, 
      endStoreId, 
      endStoreName, 
      distance, 
      duration 
    } = body;

    // Temel kontrol
    if (!endStoreId || !endStoreName) {
      return NextResponse.json({ error: "Eksik rota bilgisi" }, { status: 400 });
    }

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          routeHistory: {
            startStoreId: startStoreId || "current_location",
            startStoreName: startStoreName || "Mevcut Konum",
            endStoreId,
            endStoreName,
            distance: distance || 0,
            duration: duration || 0,
            completedDate: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Rota geçmişine kaydedildi",
      routeHistory: updatedUser.routeHistory 
    });

  } catch (error) {
    console.error("❌ Rota geçmişi kaydetme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası", details: error.message },
      { status: 500 }
    );
  }
}
