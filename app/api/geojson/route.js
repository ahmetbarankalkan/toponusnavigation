export const dynamic = 'force-dynamic';
// app/api/geojson/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const floor = searchParams.get('floor');
    const type = searchParams.get('type') || 'base'; // 'base' veya 'final'



    if (!slug || floor === null) {
      return NextResponse.json(
        { error: 'slug ve floor parametreleri gerekli' },
        { status: 400 }
      );
    }

    // Dosya yolu - Windows için normalize et
    const filePath = path.normalize(
      path.join(
        process.cwd(),
        'public',
        'places',
        slug,
        type,
        `floor_${floor}.geojson`
      )
    );



    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      console.error('❌ Dosya bulunamadı:', filePath);
      
      // Alternatif yolları dene
      const altPath1 = path.join(process.cwd(), 'public', 'places', slug, type);

      
      try {
        const files = fs.readdirSync(altPath1);

      } catch (e) {
        console.error('❌ Klasör okunamadı:', e.message);
      }
      
      return NextResponse.json(
        { error: 'GeoJSON dosyası bulunamadı', path: filePath },
        { status: 404 }
      );
    }

    // Dosyayı oku

    
    // BOM ve gereksiz karakterleri temizle
    fileContent = fileContent.trim();
    
    // UTF-8 BOM temizle
    if (fileContent.charCodeAt(0) === 0xFEFF) {
      fileContent = fileContent.substring(1);

    }
    
    // Başındaki gereksiz karakterleri temizle (örn: "3{" -> "{")
    // JSON { ile başlamalı
    const jsonStart = fileContent.indexOf('{');
    if (jsonStart > 0) {

      fileContent = fileContent.substring(jsonStart);
    }
    


    // JSON parse et

    const geoJson = JSON.parse(fileContent);



    // JSON olarak döndür
    return NextResponse.json(geoJson, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ GeoJSON API hatası:', error);
    console.error('❌ Hata detayı:', error.stack);
    return NextResponse.json(
      { error: 'GeoJSON okuma hatası', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
