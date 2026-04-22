import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import Product from "@/models/Product"; // Ensure models are registered
import Room from "@/models/Room";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json({ error: "placeId gerekli" }, { status: 400 });
    }

    await connectDB();
    
    // Fetch active campaigns for the place
    const campaigns = await Campaign.find({ 
      placeId, 
      isActive: true 
    })
    .populate("productId")
    .sort({ createdAt: -1 });

    // For each campaign, we might want to attach basic room info (name, etc.)
    // But since the frontend already has the rooms, we can just return the campaigns with roomId.
    
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error("Public campaigns fetch error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
