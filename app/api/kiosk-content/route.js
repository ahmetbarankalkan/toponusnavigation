// app/api/kiosk-content/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KioskContent from '@/models/KioskContent';

export const dynamic = 'force-dynamic';

// Public API - Kiosk içerik ayarlarını getir (token gerektirmez)
export async function GET(request) {
  try {
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
