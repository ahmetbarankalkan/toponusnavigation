/**
 * Admin Places Rooms API
 * Belirli bir yer ve kattaki odaları listeler
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Yer odaları listesi
export async function GET(request, { params }) {
  try {
    // Auth kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { placeId } = params;
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');
    
    const { db } = await connectToDatabase();
    
    let query = { place_id: placeId };
    if (floor !== null) {
      query.floor = parseInt(floor);
    }
    
    const rooms = await db.collection('rooms').find(query).toArray();

    return NextResponse.json({
      success: true,
      rooms: rooms.map(room => ({
        id: room._id.toString(),
        originalId: room.originalId || room.room_id,
        room_id: room.originalId || room.room_id,
        name: room.name,
        category: room.category,
        subtype: room.subtype,
        floor: room.floor,
        place_id: room.place_id,
      })),
    });
  } catch (error) {
    console.error('Odalar listelenemedi:', error);
    return NextResponse.json(
      { success: false, error: 'Odalar listelenemedi' },
      { status: 500 }
    );
  }
}