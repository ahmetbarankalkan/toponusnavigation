/**
 * Database Debug API
 * Database içeriğini kontrol etmek için
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Collections'ları listele
    const collections = await db.listCollections().toArray();
    
    // Places collection'ını kontrol et
    const placesCount = await db.collection('places').countDocuments();
    const places = await db.collection('places').find({}).limit(5).toArray();
    
    // Rooms collection'ını kontrol et
    const roomsCount = await db.collection('rooms').countDocuments();
    const rooms = await db.collection('rooms').find({}).limit(5).toArray();
    
    // Sport stores collection'ını kontrol et
    const sportStoresCount = await db.collection('sport_stores').countDocuments();
    const sportStores = await db.collection('sport_stores').find({}).limit(5).toArray();

    return NextResponse.json({
      success: true,
      data: {
        collections: collections.map(c => c.name),
        places: {
          count: placesCount,
          samples: places.map(p => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
          }))
        },
        rooms: {
          count: roomsCount,
          samples: rooms.map(r => ({
            id: r._id.toString(),
            name: r.name,
            place_id: r.place_id,
            floor: r.floor,
            originalId: r.originalId,
          }))
        },
        sportStores: {
          count: sportStoresCount,
          samples: sportStores.map(s => ({
            id: s._id.toString(),
            place_id: s.place_id,
            room_id: s.room_id,
            floor: s.floor,
          }))
        }
      }
    });
  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}