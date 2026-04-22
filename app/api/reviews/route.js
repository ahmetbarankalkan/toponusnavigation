import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const userId = searchParams.get('userId');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');

    // Tüm onaylanmış ve aktif yorumları getir
    const allReviews = await reviews
      .find({ 
        storeId,
        approved: true,
        isActive: { $ne: false }
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    if (userId) {
      // Kullanıcının kendi yorumunu da getir (onay durumu önemli değil)
      const userReview = await reviews.findOne({ storeId, userId });
      
      return NextResponse.json({ 
        review: userReview,
        reviews: allReviews
      });
    } else {
      // Giriş yapılmamışsa sadece onaylanmış yorumları göster
      return NextResponse.json({ reviews: allReviews });
    }
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { storeId, userId, userName, rating, comment } = await request.json();


    // Validasyon
    if (!storeId || !userId || !userName || !rating || !comment) {

      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {

      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (comment.length > 500) {
      return NextResponse.json({ error: 'Comment too long (max 500 characters)' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');

    // Kullanıcının daha önce bu mağazaya yorum yapıp yapmadığını kontrol et
    const existingReview = await reviews.findOne({ storeId, userId });

    const reviewData = {
      storeId,
      userId,
      userName,
      rating,
      comment: comment.trim(),
      updatedAt: new Date(),
      approved: false, // Yeni yorumlar onay bekliyor
      isActive: true
    };

    if (existingReview) {
      // Güncelle
      await reviews.updateOne(
        { storeId, userId },
        { $set: reviewData }
      );

    } else {
      // Yeni kayıt oluştur
      reviewData.createdAt = new Date();
      await reviews.insertOne(reviewData);

    }

    // Aynı zamanda ratings koleksiyonunu da güncelle
    const ratings = db.collection('ratings');
    const existingRating = await ratings.findOne({ storeId, userId });

    const ratingData = {
      storeId,
      userId,
      rating,
      updatedAt: new Date()
    };

    if (existingRating) {
      await ratings.updateOne(
        { storeId, userId },
        { $set: ratingData }
      );
    } else {
      ratingData.createdAt = new Date();
      await ratings.insertOne(ratingData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const userId = searchParams.get('userId');

    if (!storeId || !userId) {
      return NextResponse.json({ error: 'storeId and userId are required' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');

    const result = await reviews.deleteOne({ storeId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reviews DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}