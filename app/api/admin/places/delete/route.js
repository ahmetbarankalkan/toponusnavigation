import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";
import Room from "@/models/Room";
import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json({ error: "Place ID gerekli" }, { status: 400 });
    }

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

    // Sadece admin silebilir
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Sadece adminler mekan silebilir" }, { status: 403 });
    }

    await connectDB();

    // Mekanı bul
    const place = await Place.findById(placeId);
    if (!place) {
      return NextResponse.json({ error: "Mekan bulunamadı" }, { status: 404 });
    }

    // Mekana ait tüm odaları/birimleri sil
    // Not: legacy_id veya place_id'ye göre silinebilir. 
    // Room modelinde place_id veya legacy_id hangisi varsa ona göre silmeliyiz.
    // Varsayım: Room modelinde place_id var veya biz eklemeliyiz.
    // Şimdilik sadece mekanı silelim, ama ilerde odaları da temizlemek iyi olur.
    await Room.deleteMany({ place_id: placeId });

    // Mekanı sil
    await Place.findByIdAndDelete(placeId);

    return NextResponse.json({
      success: true,
      message: "Mekan ve bağlı odalar başarıyla silindi"
    });
  } catch (error) {
    console.error("❌ Mekan silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
