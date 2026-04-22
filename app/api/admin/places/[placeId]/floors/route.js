/**
 * Admin Places Floors API
 * Belirli bir yerin katlarını listeler
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Yer katları listesi
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
    const { db } = await connectToDatabase();
    
    // Bu yerdeki odaları bul ve katları çıkar
    const rooms = await db.collection('rooms').find({ place_id: placeId }).toArray();
    
    // Unique katları al ve sırala
    const floors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);

    return NextResponse.json({
      success: true,
      floors: floors,
    });
  } catch (error) {
    console.error('Katlar listelenemedi:', error);
    return NextResponse.json(
      { success: false, error: 'Katlar listelenemedi' },
      { status: 500 }
    );
  }
}