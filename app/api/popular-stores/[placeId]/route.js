/**
 * Public Popüler Mağazalar API
 * Ana sayfa için public erişim
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Popüler mağazaları listele (Public)
export async function GET(request, { params }) {
  try {
    const { placeId } = params;
    const { searchParams } = new URL(request.url);
    const floor = searchParams.get('floor');

    const { db } = await connectToDatabase();
    
    // Fallback ID kontrolü
    const actualPlaceId = placeId === 'fallback-ankamall' ? '68e90295ca69e5356cc2501b' : placeId;

    // Popüler kampanyası aktif olan mağazaları bul
    let query = {
      $or: [
        { 'popular_campaign.is_active': true },
        { 'content.popular_campaign.is_active': true }
      ]
    };

    if (actualPlaceId) {
      try {
        query.place_id = new ObjectId(actualPlaceId);
      } catch (e) {
        query.place_id = actualPlaceId;
      }
    }

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
      logo: room.content?.logo || room.logo || null,
      popular_campaign: room.popular_campaign || room.content?.popular_campaign || null,
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