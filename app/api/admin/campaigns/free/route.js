export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAuth(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// POST - Ücretsiz 10 Dakika Kampanya Başlat
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomId, placeId, endTime, campaignType = 'popular' } = await request.json();

    await connectDB();
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    if (!room.content) room.content = {};
    
    // Kampanya tipine göre ilgili alana kaydet
    if (campaignType === 'popular') {
      // Popüler yerler kampanyası olarak kaydet
      room.content.popular_campaign = {
        is_active: true,
        start_date: new Date().toISOString(),
        end_date: endTime,
        duration: 10,
        is_free: true // Ücretsiz olduğunu belirt
      };
    } else if (campaignType === 'store') {
      // Mağaza kampanyası olarak kaydet
      if (!room.content.campaigns) room.content.campaigns = [];
      room.content.campaigns.push({
        title: '⚡ 10 Dakika Ücretsiz Kampanya',
        description: 'Özel fırsat! Sadece 10 dakika.',
        discount_percentage: 0,
        start_date: new Date().toISOString(),
        end_date: endTime,
        is_active: true,
        is_free: true,
        created_at: new Date().toISOString()
      });
    } else if (campaignType === 'product') {
      // Ürün kampanyası olarak kaydet
      if (!room.content.product_campaigns) room.content.product_campaigns = [];
      room.content.product_campaigns.push({
        product_name: '⚡ Özel Fırsat',
        description: '10 dakikalık ücretsiz kampanya',
        original_price: 0,
        discounted_price: 0,
        discount_percentage: 0,
        is_active: true,
        is_free: true,
        created_at: new Date().toISOString()
      });
    }
    
    // Eski free_campaign field'ını da kaydet (backwards compatibility)
    room.content.free_campaign = {
      is_active: true,
      start_time: new Date().toISOString(),
      end_time: endTime,
      duration_minutes: 10,
      campaign_type: campaignType
    };

    room.markModified('content');
    await room.save();

    return NextResponse.json({ 
      success: true, 
      message: `Ücretsiz kampanya başlatıldı (${campaignType === 'popular' ? 'Popüler Yerler' : campaignType === 'store' ? 'Mağaza Kampanyaları' : 'Ürün Kampanyaları'})` 
    });
  } catch (error) {
    console.error('Free campaign error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// DELETE - Ücretsiz Kampanyayı İptal Et
export async function DELETE(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomId, placeId } = await request.json();

    await connectDB();
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    if (room.content && room.content.free_campaign) {
      delete room.content.free_campaign;
      room.markModified('content');
      await room.save();
    }

    return NextResponse.json({ success: true, message: 'Ücretsiz kampanya iptal edildi' });
  } catch (error) {
    console.error('Delete free campaign error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
