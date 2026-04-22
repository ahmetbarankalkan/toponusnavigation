export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {

    const { db } = await connectToDatabase();
    
    // Önce rooms koleksiyonundan mağaza bilgilerini al
    let stores = [];
    
    try {
      const rooms = db.collection('rooms');
      const roomStores = await rooms.find({}).toArray();
      
      stores = roomStores.map(room => ({
        id: room.id || room._id,
        name: room.name || 'İsimsiz Mağaza',
        category: room.category || 'Genel',
        floor: room.floor || 0
      }));
      

    } catch (error) {

      
      // Alternatif: sport_stores koleksiyonunu dene
      try {
        const sportStores = db.collection('sport_stores');
        const sportStoreList = await sportStores.find({}).toArray();
        
        stores = sportStoreList.map(store => ({
          id: store.id || store._id,
          name: store.name || 'İsimsiz Mağaza',
          category: 'Spor',
          floor: store.floor || 0
        }));
        

      } catch (sportError) {

        
        // Son çare: reviews koleksiyonundan unique store ID'leri al
        try {
          const reviews = db.collection('reviews');
          const uniqueStoreIds = await reviews.distinct('storeId');
          
          stores = uniqueStoreIds.map(storeId => ({
            id: storeId,
            name: generateStoreName(storeId), // ID'den isim üret
            category: 'Bilinmeyen',
            floor: 0
          }));
          

        } catch (reviewError) {
          console.error('Hiçbir koleksiyondan mağaza verisi alınamadı:', reviewError);
        }
      }
    }

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Admin stores GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ID'den mağaza ismi üretme fonksiyonu
function generateStoreName(storeId) {
  // Yaygın mağaza isimlerini ID'lerden çıkarmaya çalış
  const storeMapping = {
    'boyner': 'Boyner',
    'lcw': 'LC Waikiki', 
    'lcwaikiki': 'LC Waikiki',
    'migros': 'Migros',
    '5m': '5M Migros',
    'zara': 'Zara',
    'hm': 'H&M',
    'nike': 'Nike',
    'adidas': 'Adidas',
    'mango': 'Mango',
    'koton': 'Koton',
    'defacto': 'DeFacto',
    'teknosa': 'Teknosa',
    'mediamarkt': 'Media Markt',
    'starbucks': 'Starbucks',
    'burger': 'Burger King',
    'mcdonalds': 'McDonald\'s',
    'kfc': 'KFC',
    'pizza': 'Pizza Hut',
    'cinema': 'Sinema',
    'sinema': 'Sinema',
    'pharmacy': 'Eczane',
    'eczane': 'Eczane',
    'bank': 'Banka',
    'atm': 'ATM',
    'wc': 'WC',
    'toilet': 'Tuvalet',
    'cafe': 'Cafe',
    'restaurant': 'Restoran'
  };

  const lowerStoreId = storeId.toLowerCase();
  
  // Mapping'de eşleşme ara
  for (const [key, value] of Object.entries(storeMapping)) {
    if (lowerStoreId.includes(key)) {
      return value;
    }
  }
  
  // Eşleşme bulunamazsa ID'yi temizle ve döndür
  return storeId
    .replace(/^f\d+-/, '') // f0-, f1- gibi prefixleri kaldır
    .replace(/^room-/, '') // room- prefixini kaldır
    .replace(/-/g, ' ') // tire işaretlerini boşlukla değiştir
    .replace(/\b\w/g, l => l.toUpperCase()); // Her kelimenin ilk harfini büyük yap
}