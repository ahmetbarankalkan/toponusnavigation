/**
 * Public Popüler Mağazalar API
 * Ana sayfa için public erişim
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Popüler mağazaları listele (Public)
export async function GET(request, { params }) {
  try {
    const { placeId } = params;
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');

    const { db } = await connectToDatabase();
    
    // Popüler kampanyası aktif olan mağazaları bul
    let query = {
      place_id: placeId,
      $or: [
        { 'popular_campaign.is_active': true },
        { 'content.popular_campaign.is_active': true }
      ]
    };

    if (floor !== null) {
      query.floor = parseInt(floor);
    }

    const rooms = await db.collection('rooms').find(query).toArray();

    // Spor mağazası formatına dönüştür
    const stores = rooms.map(room => ({
      id: room._id.toString(),
      place_id: placeId,
      room_id: room.originalId || room.room_id,
      floor: room.floor,
      name: room.name,
      category: room.category,
      created_at: room.created_at || new Date(),
    }));

    return NextResponse.json({
      success: true,
      stores: stores,
    });
  } catch (error) {
    console.error('Popüler mağazalar listelenemedi:', error);
    return NextResponse.json(
      { success: false, error: 'Popüler mağazalar listelenemedi' },
      { status: 500 }
    );
  }
}