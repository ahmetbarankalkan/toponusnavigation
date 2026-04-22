
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Room from '@/models/Room';

// Perform a quick check on the map service, which we'll simulate by timing a small database query.
async function checkMapServiceHealth() {
  const startTime = Date.now();
  try {
    await connectToDatabase();
    // Fetch one document to test connectivity and speed.
    // Using lean() for a lightweight, read-only query.
    await Room.findOne().lean(); 
    
    const duration = Date.now() - startTime;

    if (duration < 500) {
      return { status: 'Aktif', duration, color: 'bg-green-500', textColor: 'text-green-600' };
    } else {
      return { status: 'Yavaş', duration, color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Map service health check failed:', error);
    return { status: 'Hizmet Dışı', duration, color: 'bg-red-500', textColor: 'text-red-600' };
  }
}

export async function GET() {
  try {
    const health = await checkMapServiceHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'Hizmet Dışı', 
        error: 'An unexpected error occurred during health check.',
        color: 'bg-red-500',
        textColor: 'text-red-600'
      }, 
      { status: 500 }
    );
  }
}
