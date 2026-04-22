// API - Kiosk için ürünleri getir
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Tüm room'ları al
    const rooms = await Room.find({}).lean();

    // Tüm ürünleri topla
    const allProducts = [];
    rooms.forEach(room => {
      if (room.content?.products && Array.isArray(room.content.products)) {
        room.content.products.forEach(product => {
          if (product.isActive !== false) {
            allProducts.push({
              ...product,
              storeName: room.name,
              storeId: room.room_id,
              floor: room.floor,
            });
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      products: allProducts,
      count: allProducts.length,
    });
  } catch (error) {
    console.error('Ürünler yüklenirken hata:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
