import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";
import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function PUT(request) {
  try {
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

    if (user.role !== "admin" && user.role !== "place_owner") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const body = await request.json();
    const { placeId, name, slug, center, zoom, status } = body;

    if (!placeId) {
      return NextResponse.json({ error: "Place ID gerekli" }, { status: 400 });
    }

    if (user.role === "place_owner" && user.place_id !== placeId) {
      return NextResponse.json({ error: "Bu mekana erişim yetkiniz yok" }, { status: 403 });
    }

    await connectDB();

    const place = await Place.findById(placeId);
    if (!place) {
      return NextResponse.json({ error: "Mekan bulunamadı" }, { status: 404 });
    }

    // Slug benzersizlik kontrolü (eğer değiştiyse)
    if (slug !== place.slug) {
      const existing = await Place.findOne({ slug, _id: { $ne: placeId } });
      if (existing) {
        return NextResponse.json({ error: "Bu slug zaten başka bir mekan tarafından kullanılıyor" }, { status: 400 });
      }
    }

    // Güncellemeler
    if (name) place.name = name;
    if (slug) place.slug = slug;
    if (center && Array.isArray(center)) {
      place.center = {
        type: "Point",
        coordinates: center
      };
    }
    if (zoom !== undefined) place.zoom = zoom;
    if (status && user.role === "admin") place.status = status;

    await place.save();

    return NextResponse.json({
      success: true,
      message: "Temel bilgiler güncellendi"
    });
  } catch (error) {
    console.error("❌ update-basic hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
