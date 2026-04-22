import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { verifyJWTToken } from "@/utils/auth.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const placeId = searchParams.get("placeId");

    if (!roomId) {
      return NextResponse.json({ error: "roomId gerekli" }, { status: 400 });
    }

    await connectDB();
    
    const query = { roomId };
    if (placeId) query.placeId = placeId;

    const products = await Product.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
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
    const { name, description, price, image, roomId, placeId, category } = body;

    if (!name || !roomId || !placeId) {
      return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
    }

    // Yetki kontrolü
    if (user.role === "store_owner" && (user.store_id !== roomId || user.place_id !== placeId)) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    await connectDB();

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      roomId,
      placeId,
      category,
      isActive: true
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
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
      return NextResponse.json({ error: "Product ID gerekli" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü
    if (user.role === "store_owner" && (user.store_id !== product.roomId)) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json({ success: true, product: updatedProduct });
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
      return NextResponse.json({ error: "Product ID gerekli" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    // Yetki kontrolü
    if (user.role === "store_owner" && (user.store_id !== product.roomId)) {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
