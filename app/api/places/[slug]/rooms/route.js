// app/api/places/[slug]/rooms/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Place from '@/models/Place';
import Room from '@/models/Room';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { slug } = params;

    await connectDB();

    // Place'i bul
    const place = await Place.findOne({ slug });
    if (!place) {
      return NextResponse.json(
        { success: false, error: 'Place bulunamadı' },
        { status: 404 }
      );
    }

    // Tüm rooms'u getir
    const rooms = await Room.find({ place_id: place._id.toString() }).sort({ floor: 1, name: 1 });

    // Format rooms
    const formattedRooms = rooms.map(room => ({
      id: `f${room.floor}-${room.room_id}`,
      room_id: room.room_id,
      name: room.name,
      floor: room.floor,
      content: room.content || {},
    }));

    return NextResponse.json({
      success: true,
      rooms: formattedRooms,
    });
  } catch (error) {
    console.error('❌ Rooms getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Rooms getirme hatası',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
