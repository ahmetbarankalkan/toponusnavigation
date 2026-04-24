// app/api/rooms/route.js - Public endpoint for getting rooms as GeoJSON
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("place_id");



    if (!placeId) {
      return NextResponse.json({ error: "place_id parametresi gerekli" }, { status: 400 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    let queryId = placeId;

    // Eğer gelen ID geçerli bir ObjectId değilse (örneğin 'fallback-ankamall'), 
    // slug üzerinden gerçek ID'yi bulmaya çalış
    const mongoose = require("mongoose");
    const Campaign = require("../../../models/Campaign");
    const Place = require("../../../models/Place");

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      console.log(`⚠️ Invalid ObjectId received: ${placeId}, attempting slug lookup...`);
      const place = await Place.findOne({ slug: "ankamall" }); // Varsayılan ankamall
      if (place) {
        queryId = place._id;
        console.log(`✅ Found real ID for ankamall: ${queryId}`);
      } else {
        return NextResponse.json({});
      }
    }

    // Place'e ait tüm room'ları ve kampanyaları getir
    const [rooms, campaigns] = await Promise.all([
      Room.find({ place_id: queryId }),
      Campaign.find({ placeId: queryId.toString(), isActive: true })
    ]);

    // Room'ları kat bazında GeoJSON formatına dönüştür
    const roomsByFloor = {};

    rooms.forEach((room) => {
      const floor = room.floor;

      if (!roomsByFloor[floor]) {
        roomsByFloor[floor] = {
          type: "FeatureCollection",
          features: [],
        };
      }

      // Kampanyaları odayla eşleştir
      const roomCampaigns = campaigns.filter(c => c.roomId === room.room_id);
      const storeCampaigns = roomCampaigns.filter(c => c.type === 'store').map(c => ({ ...c.toObject(), is_active: c.isActive }));
      const productCampaigns = roomCampaigns.filter(c => c.type === 'product').map(c => ({ ...c.toObject(), is_active: c.isActive }));
      const popularCampaign = roomCampaigns.find(c => c.type === 'popular');
      const formattedPopular = popularCampaign ? { ...popularCampaign.toObject(), is_active: popularCampaign.isActive } : null;

      // Room'u GeoJSON feature olarak ekle
      roomsByFloor[floor].features.push({
        type: "Feature",
        geometry: room.geometry,
        properties: {
          id: room.room_id,
          name: room.name,
          floor: room.floor,
          type: room.content?.type || "room",
          category: room.content?.category || "general",
          subtype: room.content?.subtype || "",
          icon: room.content?.icon || "",
          is_special: room.content?.is_special || false,
          special_type: room.content?.special_type || "",
          phone: room.content?.phone || "",
          hours: room.content?.hours || "",
          promotion: room.content?.promotion || "",
          description: room.content?.description || "",
          header_image: room.content?.header_image || "",
          logo: room.content?.logo || "",
          website: room.content?.website || "",
          email: room.content?.email || "",
          instagram: room.content?.instagram || "",
          twitter: room.content?.twitter || "",
          services: room.content?.services || "",
          tags: room.content?.tags || "",
          rating: room.content?.rating || (4 + Math.random()).toFixed(1),
          
          // Zenginleştirilmiş Kampanya Bilgileri
          campaigns: storeCampaigns,
          active_campaigns: storeCampaigns,
          product_campaigns: productCampaigns,
          popular_campaign: formattedPopular
        },
      });
    });



    // Cache kontrolü
    const response = NextResponse.json(roomsByFloor);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("❌ Rooms API hatası:", error);
    return NextResponse.json(
      {
        error: "Rooms API hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
