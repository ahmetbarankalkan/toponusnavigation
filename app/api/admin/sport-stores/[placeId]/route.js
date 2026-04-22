/**
 * Spor Mağazaları API
 * Admin paneli için spor mağazası yönetimi
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Spor mağazalarını listele
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

// Spor mağazası ekle
export async function POST(request, { params }) {
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
    const { room_id, floor } = await request.json();

    if (!room_id || floor === undefined) {
      return NextResponse.json(
        { success: false, error: 'room_id ve floor gerekli' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Zaten var mı kontrol et
    const existing = await db.collection('sport_stores').findOne({
      place_id: placeId,
      room_id: room_id,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu mağaza zaten spor mağazası olarak işaretli' },
        { status: 400 }
      );
    }

    // Yeni spor mağazası ekle
    const result = await db.collection('sport_stores').insertOne({
      place_id: placeId,
      room_id: room_id,
      floor: parseInt(floor),
      created_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Spor mağazası eklenemedi:', error);
    return NextResponse.json(
      { success: false, error: 'Spor mağazası eklenemedi' },
      { status: 500 }
    );
  }
}

// Spor mağazası kaldır
export async function DELETE(request, { params }) {
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
    const { room_id } = await request.json();

    if (!room_id) {
      return NextResponse.json(
        { success: false, error: 'room_id gerekli' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const result = await db.collection('sport_stores').deleteOne({
      place_id: placeId,
      room_id: room_id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Spor mağazası bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Spor mağazası kaldırıldı',
    });
  } catch (error) {
    console.error('Spor mağazası kaldırılamadı:', error);
    return NextResponse.json(
      { success: false, error: 'Spor mağazası kaldırılamadı' },
      { status: 500 }
    );
  }
}