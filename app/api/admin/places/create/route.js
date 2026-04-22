import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";
import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function POST(request) {
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

    // Sadece admin yeni mekan oluşturabilir
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Sadece adminler yeni mekan oluşturabilir" }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, center, zoom, status } = body;

    if (!name || !slug || !center) {
      return NextResponse.json({ error: "Eksik bilgi: isim, slug ve koordinatlar gerekli" }, { status: 400 });
    }

    await connectDB();

    // Benzersizlik kontrolü
    const existingName = await Place.findOne({ name });
    if (existingName) {
      return NextResponse.json({ error: "Bu isimde bir mekan zaten mevcut" }, { status: 400 });
    }

    const existingSlug = await Place.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json({ error: "Bu slug zaten kullanılıyor" }, { status: 400 });
    }

    const newPlace = new Place({
      name,
      slug,
      center: {
        type: "Point",
        coordinates: center
      },
      zoom: zoom || 18,
      status: status || "draft",
      floors: {},
      floor_photos: {},
      content: {
        description: "",
        gallery: [],
        amenities: [],
        contact: {
          phone: "",
          email: "",
          website: "",
          address: ""
        },
        working_hours: {
          monday: { open: "10:00", close: "22:00", closed: false },
          tuesday: { open: "10:00", close: "22:00", closed: false },
          wednesday: { open: "10:00", close: "22:00", closed: false },
          thursday: { open: "10:00", close: "22:00", closed: false },
          friday: { open: "10:00", close: "22:00", closed: false },
          saturday: { open: "10:00", close: "22:00", closed: false },
          sunday: { open: "10:00", close: "22:00", closed: false },
        }
      }
    });

    await newPlace.save();

    return NextResponse.json({
      success: true,
      message: "Mekan başarıyla oluşturuldu",
      placeId: newPlace._id.toString()
    });
  } catch (error) {
    console.error("❌ Mekan oluşturma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}
