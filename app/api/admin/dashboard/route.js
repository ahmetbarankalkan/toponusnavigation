/**
 * Admin Dashboard API
 * Dashboard istatistikleri ve son aktiviteler
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    
    // Kullanıcı sayısı (eğer users collection'ı varsa)
    let totalUsers = 0;
    try {
      totalUsers = await db.collection('users').countDocuments();
    } catch (error) {

    }

    // Toplam lokasyon sayısı
    let totalLocations = 0;
    try {
      totalLocations = await db.collection('places').countDocuments();
    } catch (error) {

    }

    // Toplam oda/birim sayısı
    let totalRooms = 0;
    try {
      totalRooms = await db.collection('rooms').countDocuments();
    } catch (error) {

    }

    // Spor mağazası sayısı
    let totalSportStores = 0;
    try {
      totalSportStores = await db.collection('sport_stores').countDocuments();
    } catch (error) {

    }

    // Toplam yorum sayısı
    let totalReviews = 0;
    try {
      totalReviews = await db.collection('reviews').countDocuments();
    } catch (error) {

    }

    // Ortalama puan
    let avgRating = 0;
    try {
      const ratingResult = await db.collection('reviews').aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).toArray();
      avgRating = ratingResult.length > 0 ? ratingResult[0].avgRating : 0;
    } catch (error) {

    }

    // Bugünkü aktivite sayısı (proje canlıya alındığında implement edilecek)
    // const todayVisits = 0; // TODO: Gerçek analytics sistemi kurulduğunda aktif olacak

    // Aktif navigasyon sayısı (örnek)
    const activeNavigations = Math.floor(Math.random() * 50) + 10;

    const stats = {
      totalUsers,
      totalLocations,
      totalRooms,
      totalSportStores,
      totalReviews,
      avgRating,
      // todayVisits, // Proje canlıya alındığında aktif olacak
      activeNavigations
    };

    return NextResponse.json({
      success: true,
      data: {
        stats
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Dashboard verileri alınamadı',
        details: error.message 
      },
      { status: 500 }
    );
  }
}