import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getJWTSecret } from '@/utils/auth';

// GET - Kullanıcının favori mağazalarını getir
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJWTSecret());
    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      favorites: user.favoriteStores || [],
    });
  } catch (error) {
    console.error('Favori getirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Favori ekle/çıkar (toggle)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJWTSecret());
    const { storeId, storeName } = await request.json();

    if (!storeId || !storeName) {
      return NextResponse.json(
        { success: false, error: 'Mağaza bilgileri eksik' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Favori var mı kontrol et
    const existingIndex = user.favoriteStores.findIndex(
      fav => fav.storeId === storeId
    );

    let action = '';
    if (existingIndex > -1) {
      // Favorilerden çıkar
      user.favoriteStores.splice(existingIndex, 1);
      action = 'removed';
    } else {
      // Favorilere ekle
      user.favoriteStores.push({
        storeId,
        storeName,
        addedDate: new Date(),
      });
      action = 'added';
    }

    await user.save();

    return NextResponse.json({
      success: true,
      action,
      favorites: user.favoriteStores,
      message: action === 'added' 
        ? 'Mağaza favorilere eklendi' 
        : 'Mağaza favorilerden çıkarıldı',
    });
  } catch (error) {
    console.error('Favori işlemi hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
