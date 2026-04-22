// Test API - MongoDB'de products var mı kontrol et
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || 'room-101';
    
    const room = await Room.findOne({ room_id: roomId }).lean();
    
    return NextResponse.json({
      roomId: room?.room_id,
      hasContent: !!room?.content,
      contentKeys: Object.keys(room?.content || {}),
      products: room?.content?.products || [],
      productsCount: room?.content?.products?.length || 0,
      events: room?.content?.events || [],
      discounts: room?.content?.discounts || [],
      fullContent: room?.content,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
