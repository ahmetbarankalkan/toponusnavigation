import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    // MongoDB'ye bağlan
    await connectDB();
    
    // Modelleri dinamik olarak yükle (Relative path kullanarak hata riskini bitiriyoruz)
    const Place = require("../../models/Place");
    const Room = require("../../models/Room");
    const Campaign = require("../../models/Campaign");

    if (slug) {
      console.log(`🔍 Fetching data for slug: ${slug}`);
      // Slug ile ara (Önce published olanı dene, yoksa herhangi birini al)
      let place = await Place.findOne({ slug: slug, status: "published" });
      if (!place) {
        place = await Place.findOne({ slug: slug });
      }

      if (!place) {
        console.log(`❌ Place not found for slug: ${slug}`);
        return NextResponse.json({ error: "Place bulunamadı", slug: slug }, { status: 404 });
      }

      console.log(`📍 Place found: ${place.name} (${place._id})`);

      // Bu mekana ait tüm odaları ve kampanyaları getir
      const [rooms, campaigns] = await Promise.all([
        Room.find({ place_id: place._id }),
        Campaign.find({ placeId: place._id.toString(), isActive: true })
      ]);

      console.log(`🏢 Rooms found: ${rooms.length}`);
      console.log(`🎁 Campaigns found: ${campaigns.length}`);

      // Odaları frontend formatına çevir ve kampanyaları içine ekle
      const allRooms = rooms.map(room => {
        const roomCampaigns = campaigns.filter(c => c.roomId === room.room_id);
        
        // Kampanyaları tiplerine göre ayır ve frontend uyumlu hale getir
        const storeCampaigns = roomCampaigns
          .filter(c => c.type === 'store')
          .map(c => ({ ...c.toObject(), is_active: c.isActive }));
          
        const productCampaigns = roomCampaigns
          .filter(c => c.type === 'product')
          .map(c => ({ ...c.toObject(), is_active: c.isActive }));
          
        const popularCampaign = roomCampaigns.find(c => c.type === 'popular');
        const formattedPopular = popularCampaign 
          ? { ...popularCampaign.toObject(), is_active: popularCampaign.isActive } 
          : null;

        return {
          id: room.room_id,
          name: room.name,
          floor: room.floor,
          logo: room.content?.logo,
          description: room.content?.description,
          category: room.content?.category,
          tags: room.content?.tags,
          website: room.content?.website,
          phone: room.content?.phone,
          hours: room.content?.hours,
          coordinates: room.geometry.coordinates,
          type: room.content?.type || 'room',
          is_special: room.content?.is_special || false,
          special_type: room.content?.special_type,
          rating: room.content?.rating || (4 + Math.random()).toFixed(1),
          header_image: room.content?.header_image,
          campaigns: storeCampaigns,
          product_campaigns: productCampaigns,
          popular_campaign: formattedPopular
        };
      });

      // Kapıları ayır
      const formattedRooms = allRooms.filter(r => r.type !== 'door');
      const formattedDoors = allRooms.filter(r => r.type === 'door');

      console.log(`✅ Formatted: ${formattedRooms.length} rooms, ${formattedDoors.length} doors`);

      // Herhangi bir kampanyası olan odaları filtrele (Keşfet paneli için)
      const campaignRooms = formattedRooms.filter(r => 
        (r.campaigns && r.campaigns.length > 0) || 
        (r.product_campaigns && r.product_campaigns.length > 0) || 
        (r.popular_campaign)
      );
      console.log(`📣 Campaign rooms found for Discover: ${campaignRooms.length}`);

      // Anasayfa için uyumlu format
      const responseData = {
        place: place.name,
        place_id: place._id.toString(),
        floors: Object.fromEntries(place.floors || new Map()),
        center: place.center.coordinates,
        zoom: place.zoom,
        rooms: formattedRooms,
        doors: formattedDoors,
        campaigns: campaignRooms,
        server_time: new Date().toISOString()
      };

      // CACHE KONTROLÜ: Kesinlikle cache'leme
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

      return NextResponse.json(responseData);
    } else {
      // Tüm places getir (admin panel için)
      const places = await Place.find({});
      const placesData = {};

      places.forEach((place) => {
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

      return NextResponse.json(placesData);
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
