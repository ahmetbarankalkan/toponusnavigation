// app/api/admin/rooms/add-campaign/route.js
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Place from "@/models/Place";

import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

// Final GeoJSON dosyasını güncelleme fonksiyonu
async function updateFinalGeoJSON(placeId, roomId, room) {
  try {

    
    // Place'i bul
    const place = await Place.findById(placeId);
    if (!place) {
      throw new Error("Place bulunamadı");
    }

    const placeSlug = place.slug;
    const floor = room.floor;
    

    
    // Final GeoJSON dosya yolu
    const finalPath = path.join(
      process.cwd(),
      "public",
      "places",
      placeSlug,
      "final",
      `floor_${floor}.geojson`
    );



    // Dosya var mı kontrol et
    if (!fs.existsSync(finalPath)) {
      console.warn(`⚠️ Final GeoJSON dosyası bulunamadı: ${finalPath}`);
      return;
    }



    // GeoJSON dosyasını oku
    const geoJsonData = JSON.parse(fs.readFileSync(finalPath, "utf8"));
    

    
    // Room'u bul ve güncelle
    const roomFeature = geoJsonData.features.find(
      feature => feature.properties.id === roomId
    );


    
    if (roomFeature) {

      
      // Kampanya bilgilerini properties'e ekle
      roomFeature.properties.campaigns = room.content?.campaigns || [];
      roomFeature.properties.active_campaigns = room.content?.campaigns?.filter(c => c.is_active && 
        (!c.end_date || new Date(c.end_date) > new Date())) || [];
      

      

    } else {
      console.warn(`⚠️ GeoJSON'da room bulunamadı: ${roomId}`);

    }



    // Dosyayı kaydet
    fs.writeFileSync(finalPath, JSON.stringify(geoJsonData, null, 2));


  } catch (error) {
    console.error("❌ GeoJSON güncelleme hatası:", error);
    throw error;
  }
}

export async function POST(request) {
  try {


    // Token kontrolü
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

    // FormData'yı parse et
    const formData = await request.formData();
    const roomId = formData.get("roomId");
    const placeId = formData.get("placeId");
    const title = formData.get("title");
    const description = formData.get("description");
    const discountPercentage = formData.get("discountPercentage");
    const discountAmount = formData.get("discountAmount");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const imageFile = formData.get("image");
    const isActive = formData.get("is_active");



    // Validasyon
    if (!roomId || !placeId || !title) {

      return NextResponse.json({ error: "Room ID, Place ID ve başlık gerekli" }, { status: 400 });
    }

    if (!discountPercentage && !discountAmount) {

      return NextResponse.json({ error: "İndirim yüzdesi veya miktarı gerekli" }, { status: 400 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Place'i bul
    const place = await Place.findById(placeId);
    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }

    // Room'u bul
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room) {

      return NextResponse.json({ error: "Room bulunamadı" }, { status: 404 });
    }



    // Yetkilendirme kontrolü
    const isAdmin = user.role === "admin";
    const isPlaceOwner = place.owner_id === user.userId;
    const isStoreOwner = room.content?.owner_id === user.userId;

    if (!isAdmin && !isPlaceOwner && !isStoreOwner) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Kampanya görseli yükle
    let imagePath = "";
    if (imageFile && imageFile.size > 0) {
      try {
        // Dosya uzantısını al
        const fileExtension = path.extname(imageFile.name).toLowerCase();
        const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
        
        if (!allowedExtensions.includes(fileExtension)) {

          return NextResponse.json({ error: "Desteklenen formatlar: PNG, JPG, JPEG, GIF, WEBP" }, { status: 400 });
        }

        // Dosya adını oluştur (timestamp ile unique)
        const timestamp = Date.now();
        const fileName = `discount-${timestamp}${fileExtension}`;
        
        // Upload dizinini oluştur
        const uploadDir = path.join(process.cwd(), "public", "images", "rooms", place.slug, roomId);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });

        }

        // Dosyayı kaydet
        const filePath = path.join(uploadDir, fileName);
        const fileBuffer = await imageFile.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(fileBuffer));
        
        imagePath = `images/rooms/${place.slug}/${roomId}/${fileName}`;

      } catch (error) {
        console.error("❌ Görsel yükleme hatası:", error);
        return NextResponse.json({ error: "Görsel yüklenemedi" }, { status: 500 });
      }
    }

    // Kampanya objesini oluştur
    const campaign = {
      title,
      description: description || "",
      discount_percentage: discountPercentage ? parseFloat(discountPercentage) : null,
      discount_amount: discountAmount ? parseFloat(discountAmount) : null,
      start_date: startDate ? new Date(startDate) : new Date(),
      end_date: endDate ? new Date(endDate) : null,
      image: imagePath,
      is_active: isActive === "true", // String'den boolean'a çevir
      created_at: new Date(),
      updated_at: new Date()
    };

    // Room'a kampanyayı ekle
    if (!room.content.campaigns) {
      room.content.campaigns = [];
    }

    room.content.campaigns.push(campaign);
    room.needs_sync = true;
    room.last_synced = new Date();

    await room.save();


    // Final GeoJSON dosyasını güncelle
    try {
      await updateFinalGeoJSON(placeId, roomId, room);

    } catch (geoJsonError) {
      console.warn("⚠️ GeoJSON güncelleme hatası:", geoJsonError);
    }

    // Cache temizleme
    try {
      revalidatePath("/", "page");
      revalidatePath("/[slug]", "page");
      revalidatePath("/api/places", "route");
      revalidatePath("/api/rooms", "route");

    } catch (revalidateError) {
      console.warn("⚠️ Revalidation hatası:", revalidateError);
    }

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        id: room.content.campaigns.length - 1 // Array index
      },
      room: {
        room_id: room.room_id,
        name: room.name,
        campaigns_count: room.content.campaigns.length
      }
    });

  } catch (error) {
    console.error("❌ Kampanya ekleme hatası:", error);
    return NextResponse.json(
      {
        error: "Kampanya ekleme hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {


    // Token kontrolü
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

    // FormData'yı parse et
    const formData = await request.formData();
    const roomId = formData.get("roomId");
    const placeId = formData.get("placeId");
    const campaignIndex = formData.get("campaignIndex");
    const title = formData.get("title");
    const description = formData.get("description");
    const discountPercentage = formData.get("discountPercentage");
    const discountAmount = formData.get("discountAmount");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const imageFile = formData.get("image");
    const isActive = formData.get("is_active");



    // Gerekli alanları kontrol et
    if (!roomId || !placeId || !campaignIndex || !title) {

      return NextResponse.json(
        { error: "Room ID, Place ID, Campaign Index ve başlık gerekli" },
        { status: 400 }
      );
    }

    await connectDB();


    // Room'u bul

    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room) {

      return NextResponse.json({ error: "Room bulunamadı" }, { status: 404 });
    }


    // Kullanıcı yetkisi kontrolü

    const place = await Place.findById(placeId);
    if (!place) {

      return NextResponse.json({ error: "Place bulunamadı" }, { status: 404 });
    }


    const isAdmin = user.role === "admin";
    const isPlaceOwner = place.owner_id === user.userId;
    const isStoreOwner = room.content?.owner_id === user.userId;

    if (!isAdmin && !isPlaceOwner && !isStoreOwner) {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Campaign index kontrolü
    const campaignIdx = parseInt(campaignIndex);
    if (campaignIdx < 0 || campaignIdx >= room.content.campaigns.length) {
      return NextResponse.json({ error: "Geçersiz kampanya indeksi" }, { status: 400 });
    }

    // Mevcut kampanyayı al
    const existingCampaign = room.content.campaigns[campaignIdx];

    // Görsel yükleme
    let imagePath = existingCampaign.image; // Mevcut görseli koru

    if (imageFile && imageFile.size > 0) {
      // Eski görseli sil
      if (existingCampaign.image) {
        try {
          const oldImagePath = path.join(process.cwd(), "public", existingCampaign.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);

          }
        } catch (error) {
          console.warn("⚠️ Eski görsel silme hatası:", error);
        }
      }

      // Yeni görseli yükle
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "images",
        "rooms",
        placeId,
        roomId
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(imageFile.name);
      const fileName = `discount-${Date.now()}${fileExtension}`;
      imagePath = `images/rooms/${placeId}/${roomId}/${fileName}`;

      const filePath = path.join(uploadDir, fileName);
      const buffer = await imageFile.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));


    }

    // Kampanya objesini güncelle
    const updatedCampaign = {
      title,
      description: description || "",
      discount_percentage: discountPercentage ? parseFloat(discountPercentage) : null,
      discount_amount: discountAmount ? parseFloat(discountAmount) : null,
      start_date: startDate ? new Date(startDate) : new Date(),
      end_date: endDate ? new Date(endDate) : null,
      image: imagePath,
      is_active: isActive === "true",
      created_at: existingCampaign.created_at, // Orijinal tarihi koru
      updated_at: new Date()
    };

    // Kampanyayı güncelle
    room.content.campaigns[campaignIdx] = updatedCampaign;
    room.needs_sync = true;
    room.last_synced = new Date();

    await room.save();



    // Final GeoJSON dosyasını güncelle
    try {
      await updateFinalGeoJSON(placeId, roomId, room);

    } catch (geoJsonError) {
      console.warn("⚠️ GeoJSON güncelleme hatası:", geoJsonError);
    }

    // Cache'i temizle
    revalidatePath("/admin/rooms");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    });

  } catch (error) {
    console.error("❌ Kampanya güncelleme hatası:", error);
    return NextResponse.json(
      {
        error: "Kampanya güncelleme hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Kampanya silme endpoint'i
export async function DELETE(request) {
  try {


    // Token kontrolü
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

    const { roomId, placeId, campaignIndex } = await request.json();

    if (!roomId || !placeId || campaignIndex === undefined) {
      return NextResponse.json({ error: "Room ID, Place ID ve kampanya index gerekli" }, { status: 400 });
    }

    // MongoDB'ye bağlan
    await connectDB();

    // Room'u bul
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room || !room.content.campaigns || !room.content.campaigns[campaignIndex]) {
      return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 });
    }

    // Yetkilendirme kontrolü
    if (user.role === "place_owner" && user.place_id !== placeId) {
      return NextResponse.json({ error: "Bu place'e erişim yetkiniz yok" }, { status: 403 });
    }

    if (user.role === "store_owner" && user.store_id !== roomId) {
      return NextResponse.json({ error: "Bu room'a erişim yetkiniz yok" }, { status: 403 });
    }

    // Kampanyayı sil
    const deletedCampaign = room.content.campaigns.splice(campaignIndex, 1)[0];
    room.needs_sync = true;
    room.last_synced = new Date();

    await room.save();

    // Görsel dosyasını da sil
    if (deletedCampaign.image) {
      try {
        const imagePath = path.join(process.cwd(), "public", deletedCampaign.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);

        }
      } catch (error) {
        console.warn("⚠️ Görsel silme hatası:", error);
      }
    }



    // Final GeoJSON dosyasını güncelle
    try {
      await updateFinalGeoJSON(placeId, roomId, room);

    } catch (geoJsonError) {
      console.warn("⚠️ GeoJSON güncelleme hatası:", geoJsonError);
    }

    return NextResponse.json({
      success: true,
      deletedCampaign: deletedCampaign.title
    });

  } catch (error) {
    console.error("❌ Kampanya silme hatası:", error);
    return NextResponse.json(
      {
        error: "Kampanya silme hatası",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
