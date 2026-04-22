// app/api/mall-info/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Admin panelden gelecek dinamik veriler
    // Şimdilik statik veri döndürüyoruz
    const mallInfo = {
      name: 'AnkaMall',
      hours: '10:00 - 22:00',
      weekendHours: '10:00 - 23:00',
      phone: '0312 XXX XX XX',
      email: 'info@ankamall.com',
      address: 'Ankara, Türkiye',
      services: [
        'Ücretsiz WiFi',
        'Vale Hizmeti',
        'Çocuk Oyun Alanı',
        'Engelli Erişimi',
        'ATM',
        'Danışma',
      ],
      parking: {
        capacity: '3000+',
        freeHours: 2,
        price: '10₺/saat',
      },
      socialMedia: {
        instagram: '@ankamall',
        facebook: 'AnkaMall',
        twitter: '@ankamall',
      },
    };

    return NextResponse.json(mallInfo);
  } catch (error) {
    console.error('Mall info error:', error);
    return NextResponse.json(
      { error: 'AVM bilgileri alınamadı' },
      { status: 500 }
    );
  }
}
