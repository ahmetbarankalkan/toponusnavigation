// app/api/admin/kiosk-content/route.js
import { NextResponse } from 'next/server';
import { verifyJWTToken } from '@/utils/auth.js';
import connectDB from '@/lib/mongodb';
import KioskContent from '@/models/KioskContent';

export const dynamic = 'force-dynamic';

// Kiosk içerik ayarlarını kaydet
export async function POST(request) {
  try {


    // Token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);

    } catch (error) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    // Admin kontrolü
    if (user.role !== 'admin' && user.role !== 'place_owner') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { placeId, selectedStores, selectedDiscounts } = body;



    if (!placeId) {
      return NextResponse.json({ error: 'Place ID gerekli' }, { status: 400 });
    }

    // Maksimum 8 mağaza kontrolü
    if (selectedStores && selectedStores.length > 8) {
      return NextResponse.json({ error: 'Maksimum 8 mağaza seçilebilir' }, { status: 400 });
    }

    await connectDB();

    // Veritabanına kaydet veya güncelle
    const kioskContent = await KioskContent.findOneAndUpdate(
      { place_id: placeId },
      {
        place_id: placeId,
        selectedStores: selectedStores || [],
        selectedDiscounts: selectedDiscounts || [],
        updatedBy: user.username || user.email,
        updatedAt: new Date(),
      },
      {
        upsert: true, // Yoksa oluştur, varsa güncelle
        new: true, // Güncellenmiş veriyi döndür
      }
    );



    return NextResponse.json({
      success: true,
      message: 'Kiosk içerik ayarları başarıyla kaydedildi',
      data: {
        placeId: kioskContent.place_id,
        selectedStores: kioskContent.selectedStores,
        selectedDiscounts: kioskContent.selectedDiscounts,
        updatedAt: kioskContent.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ Kiosk içerik kaydetme hatası:', error);
    return NextResponse.json(
      {
        error: 'Kaydetme hatası',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Kiosk içerik ayarlarını getir
export async function GET(request) {
  try {


    // Token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'Place ID gerekli' }, { status: 400 });
    }

    await connectDB();

    // Veritabanından ayarları çek
    const kioskContent = await KioskContent.findOne({ place_id: placeId });

    if (!kioskContent) {

      return NextResponse.json({
        success: true,
        data: {
          selectedStores: [],
          selectedDiscounts: [],
        },
      });
    }



    return NextResponse.json({
      success: true,
      data: {
        selectedStores: kioskContent.selectedStores || [],
        selectedDiscounts: kioskContent.selectedDiscounts || [],
        updatedAt: kioskContent.updatedAt,
        updatedBy: kioskContent.updatedBy,
      },
    });
  } catch (error) {
    console.error('❌ Kiosk içerik getirme hatası:', error);
    return NextResponse.json(
      {
        error: 'Getirme hatası',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
