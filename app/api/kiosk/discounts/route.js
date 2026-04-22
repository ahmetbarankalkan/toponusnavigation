// API - Kiosk için fırsatları getir
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Tüm room'ları al
    const rooms = await Room.find({}).lean();

    // Tüm fırsatları topla
    const allDiscounts = [];
    rooms.forEach(room => {
      if (room.content?.discounts && Array.isArray(room.content.discounts)) {
        room.content.discounts.forEach(discount => {
          if (discount.isActive !== false) {
            allDiscounts.push({
              ...discount,
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
      discounts: allDiscounts,
      count: allDiscounts.length,
    });
  } catch (error) {
    console.error('Fırsatlar yüklenirken hata:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
