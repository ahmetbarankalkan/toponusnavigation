import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAuth(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

// POST - Popüler Yerler Kampanyası Aktif Et
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, placeId, duration, endDate } = await request.json();

    await connectDB();
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.content) room.content = {};

    // Popüler yerler kampanyasını ekle
    room.content.popular_campaign = {
      is_active: true,
      start_date: new Date().toISOString(),
      end_date: endDate,
      duration: duration,
    };

    room.markModified('content');
    await room.save();

    return NextResponse.json({
      success: true,
      message: 'Popüler yerler kampanyası aktif edildi',
    });
  } catch (error) {
    console.error('Popular campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Popüler Yerler Kampanyasını İptal Et
export async function DELETE(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, placeId } = await request.json();

    await connectDB();
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Popüler yerler kampanyasını kaldır
    if (room.content && room.content.popular_campaign) {
      delete room.content.popular_campaign;
      room.markModified('content');
      await room.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Popüler yerler kampanyası iptal edildi',
    });
  } catch (error) {
    console.error('Delete popular campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
