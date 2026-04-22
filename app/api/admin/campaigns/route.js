import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const placeId = searchParams.get("placeId");
    const isActive = searchParams.get("isActive");
    const type = searchParams.get("type");

    await connectDB();
    
    const query = {};
    if (roomId) query.roomId = roomId;
    if (placeId) query.placeId = placeId;
    if (isActive === "true") query.isActive = true;
    if (type) query.type = type;

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).populate("productId");
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

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
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, description, type, discountPercentage, discountAmount, 
      startDate, endDate, image, roomId, placeId, productId 
    } = body;

    if (!title || !roomId || !placeId || !type) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Yetki kontrolü
    if (user.role === "store_owner" && (user.store_id !== roomId || user.place_id !== placeId)) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    await connectDB();

    const newCampaign = new Campaign({
      title,
      description,
      type,
      discountPercentage: discountPercentage || undefined,
      discountAmount: discountAmount || undefined,
      startDate,
      endDate,
      image,
      roomId,
      placeId,
      productId: productId || undefined,
      isActive: true
    });

    await newCampaign.save();

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası", details: error.message }, { status: 500 });
  }
}

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
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID gerekli" }, { status: 400 });
    }

    await connectDB();
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü
    if (user.role === "store_owner" && (user.store_id !== campaign.roomId)) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token gerekli" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Campaign ID gerekli" }, { status: 400 });
    }

    await connectDB();
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü
    if (user.role === "store_owner" && (user.store_id !== campaign.roomId)) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    await Campaign.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
