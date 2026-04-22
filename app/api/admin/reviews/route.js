import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Tüm yorumları getir
export async function GET(request) {
  try {

    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');

    // Tüm yorumları getir (en yeni önce)
    const allReviews = await reviews
      .find({})
      .sort({ createdAt: -1 })
      .limit(1000) // Maksimum 1000 yorum
      .toArray();

    return NextResponse.json({ reviews: allReviews });
  } catch (error) {
    console.error('Admin reviews GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Yorum güncelle
export async function PUT(request) {
  try {
    const { reviewId, comment, approved, isActive } = await request.json();


    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    if (comment && comment.length > 500) {
      return NextResponse.json({ error: 'Comment too long (max 500 characters)' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');

    const updateData = {
      updatedAt: new Date()
    };

    // Yorum metni güncelleniyorsa
    if (comment !== undefined) {
      updateData.comment = comment.trim();
      updateData.editedByAdmin = true;
    }

    // Onay durumu güncelleniyorsa
    if (approved !== undefined) {
      updateData.approved = approved;
      if (approved) {
        updateData.approvedAt = new Date();
      }
    }

    // Aktif/Pasif durumu güncelleniyorsa
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const result = await reviews.updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reviews PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Yorum sil
export async function DELETE(request) {
  try {
    const { reviewId } = await request.json();


    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');
    const ratings = db.collection('ratings');

    // Yorumu sil
    const reviewResult = await reviews.deleteOne({ _id: new ObjectId(reviewId) });

    if (reviewResult.deletedCount === 0) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // İlgili rating'i de sil (eğer varsa)
    // Not: Bu durumda storeId ve userId bilgisine ihtiyacımız var
    // Şimdilik sadece yorumu siliyoruz, rating ayrı kalıyor
    

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reviews DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}