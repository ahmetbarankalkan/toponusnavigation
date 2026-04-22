// API - Kiosk için etkinlikleri getir
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Tüm room'ları al
    const rooms = await Room.find({}).lean();

    // Tüm etkinlikleri topla
    const allEvents = [];
    rooms.forEach(room => {
      if (room.content?.events && Array.isArray(room.content.events)) {
        room.content.events.forEach(event => {
          if (event.isActive !== false) {
            allEvents.push({
              ...event,
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
      events: allEvents,
      count: allEvents.length,
    });
  } catch (error) {
    console.error('Etkinlikler yüklenirken hata:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
