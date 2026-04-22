/**
 * Admin Places API
 * Yerler listesi için API
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Yerler listesi
export async function GET(request) {
  try {
    // Auth kontrolü (basit)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    const places = await db.collection('places').find({}).toArray();

    return NextResponse.json({
      success: true,
      places: places.map(place => ({
        id: place._id.toString(),
        name: place.name,
        slug: place.slug,
        created_at: place.created_at,
      })),
    });
  } catch (error) {
    console.error('Yerler listelenemedi:', error);
    return NextResponse.json(
      { success: false, error: 'Yerler listelenemedi' },
      { status: 500 }
    );
  }
}