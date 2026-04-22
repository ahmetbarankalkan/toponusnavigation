// app/api/places/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Place from "@/models/Place";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");




    // MongoDB'ye bağlan
    await connectDB();

    if (slug) {


      // Slug ile ara (sadece published olanlar - anasayfa için)
      const place = await Place.findOne({ slug: slug, status: "published" });


      if (!place) {

        return NextResponse.json({ error: "Place bulunamadı", slug: slug }, { status: 404 });
      }

      // Anasayfa için uyumlu format
      const responseData = {
        place: place.name,
        place_id: place._id.toString(), // Room'ları getirmek için place_id ekle
        floors: Object.fromEntries(place.floors || new Map()),
        center: place.center.coordinates,
        zoom: place.zoom,
      };

      // CACHE KONTROLÜ: No-cache header'ları ekle
      const response = NextResponse.json(responseData);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    } else if (id) {


      // ID ile ara
      const place = await Place.findById(id);


      if (!place) {

        return NextResponse.json({ error: "Place bulunamadı", id: id }, { status: 404 });
      }

      // Admin panel için uyumlu format
      const responseData = {
        id: place._id.toString(),
        name: place.name,
        slug: place.slug,
        floors: Object.fromEntries(place.floors || new Map()),
        floor_photos: Object.fromEntries(place.floor_photos || new Map()),
        center: place.center.coordinates,
        zoom: place.zoom,
        status: place.status,
        content: place.content,
        created_at: place.createdAt,
        updated_at: place.updatedAt,
      };

      // CACHE KONTROLÜ: No-cache header'ları ekle
      const response = NextResponse.json(responseData);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    } else {
      // Tüm places getir (admin panel için hem published hem draft)
      console.log("🔍 Fetching all places...");
      const places = await Place.find({});
      console.log(`✅ Found ${places.length} places in DB`);
      
      const placesData = {};

      places.forEach((place) => {
        console.log(`📍 Processing place: ${place.name} (${place._id})`);
        placesData[place._id.toString()] = {
          id: place._id.toString(),
          name: place.name,
          slug: place.slug,
          center: place.center?.coordinates || [0,0],
          zoom: place.zoom || 18,
          status: place.status || 'draft',
          floors: Object.fromEntries(place.floors || new Map()),
          floor_photos: Object.fromEntries(place.floor_photos || new Map()),
          content: place.content,
          created_at: place.createdAt,
          updated_at: place.updatedAt,
        };
      });

      console.log("📤 Sending response with keys:", Object.keys(placesData));
      // CACHE KONTROLÜ: No-cache header'ları ekle
      const response = NextResponse.json(placesData);
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
  } catch (error) {
    console.error("❌ Places API hatası:", error);
    return NextResponse.json(
      {
        error: "Places API hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
