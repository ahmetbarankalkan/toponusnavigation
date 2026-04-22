/**
 * Public Spor Mağazaları API
 * Ana sayfa için public erişim
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Spor mağazalarını listele (Public)
export async function GET(request, { params }) {
  try {
    const { placeId } = params;
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');

    const { db } = await connectToDatabase();
    
    let query = { place_id: placeId };
    if (floor !== null) {
      query.floor = parseInt(floor);
    }

    const stores = await db.collection('sport_stores').find(query).toArray();

    return NextResponse.json({
      success: true,
      stores: stores.map(store => ({
        id: store._id.toString(),
        place_id: store.place_id,
        room_id: store.room_id,
        floor: store.floor,
        created_at: store.created_at,
      })),
    });
  } catch (error) {
    console.error('Spor mağazaları listelenemedi:', error);
    return NextResponse.json(
      { success: false, error: 'Spor mağazaları listelenemedi' },
      { status: 500 }
    );
  }
}