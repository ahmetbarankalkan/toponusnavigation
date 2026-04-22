import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const userId = searchParams.get('userId');


    const { db } = await connectToDatabase();
    const ratings = db.collection('ratings');

    if (storeId && userId) {
      // Belirli kullanıcının belirli mağaza için verdiği puanı getir
      const userRating = await ratings.findOne({ storeId, userId });
      return NextResponse.json({ rating: userRating?.rating || 0 });
    } else if (storeId) {
      // Mağazanın ortalama puanını getir
      const result = await ratings.aggregate([
        { $match: { storeId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]).toArray();

      const avgRating = result.length > 0 ? result[0].avgRating : 0;
      const count = result.length > 0 ? result[0].count : 0;

      return NextResponse.json({ 
        avgRating: Math.round(avgRating * 10) / 10, 
        count 
      });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Rating GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { storeId, userId, rating } = await request.json();


    if (!storeId || !userId || !rating) {

      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {

      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const ratings = db.collection('ratings');

    // Kullanıcının daha önce bu mağazaya puan verip vermediğini kontrol et
    const existingRating = await ratings.findOne({ storeId, userId });

    if (existingRating) {
      // Güncelle
      await ratings.updateOne(
        { storeId, userId },
        { $set: { rating, updatedAt: new Date() } }
      );
    } else {
      // Yeni kayıt oluştur
      await ratings.insertOne({
        storeId,
        userId,
        rating,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rating POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}