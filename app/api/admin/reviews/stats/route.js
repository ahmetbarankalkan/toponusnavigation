import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request) {
  try {

    const { db } = await connectToDatabase();
    const reviews = db.collection('reviews');

    // Toplam yorum sayısı
    const totalReviews = await reviews.countDocuments();

    // Ortalama puan
    const avgRatingResult = await reviews.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]).toArray();
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    // Puan dağılımı
    const ratingDistributionResult = await reviews.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    const ratingDistribution = {};
    ratingDistributionResult.forEach(item => {
      ratingDistribution[item._id] = item.count;
    });

    // Son 7 günün yorumları
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReviews = await reviews.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Onay bekleyen yorumlar
    const pendingReviews = await reviews.countDocuments({
      approved: { $ne: true }
    });

    // Onaylanmış yorumlar
    const approvedReviews = await reviews.countDocuments({
      approved: true,
      isActive: { $ne: false }
    });

    // Pasif yorumlar
    const inactiveReviews = await reviews.countDocuments({
      isActive: false
    });

    // En aktif kullanıcılar (en çok yorum yapanlar)
    const topUsers = await reviews.aggregate([
      { $group: { _id: '$userName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Mağaza bazında yorum sayıları
    const storeStats = await reviews.aggregate([
      { 
        $group: { 
          _id: '$storeId', 
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    const stats = {
      totalReviews,
      avgRating,
      ratingDistribution,
      recentReviews,
      pendingReviews,
      approvedReviews,
      inactiveReviews,
      topUsers,
      storeStats
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Admin review stats GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}