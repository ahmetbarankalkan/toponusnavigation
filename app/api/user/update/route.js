// app/api/user/update/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      return NextResponse.json(
        { error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, currentPassword, newPassword, phone, dateOfBirth } = body;



    // MongoDB'ye bağlan
    await connectDB();

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    let updated = false;

    // Display name güncelleme
    if (displayName !== undefined && displayName !== user.displayName) {
      user.displayName = displayName.trim();
      updated = true;
    }

    // Phone güncelleme
    if (phone !== undefined && phone !== user.phone) {
      user.phone = phone.trim() === '' ? null : phone.trim();
      updated = true;
    }

    // Doğum tarihi güncelleme
    if (dateOfBirth !== undefined && dateOfBirth !== user.dateOfBirth) {
      user.dateOfBirth = dateOfBirth.trim() === '' ? null : dateOfBirth.trim();
      updated = true;
    }

    // Şifre güncelleme
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mevcut şifre gerekli' },
          { status: 400 }
        );
      }

      // Mevcut şifreyi kontrol et
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre hatalı' },
          { status: 400 }
        );
      }

      // Yeni şifre uzunluğu kontrolü
      if (newPassword.length < 4) {
        return NextResponse.json(
          { error: 'Yeni şifre en az 4 karakter olmalı' },
          { status: 400 }
        );
      }

      user.password = newPassword; // Model'deki middleware otomatik hash'leyecek
      updated = true;

    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Değişiklik yapılmadı' },
        { status: 400 }
      );
    }

    // Değişiklikleri kaydet
    await user.save();

    // Güncellenmiş kullanıcı bilgilerini döndür
    const userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      displayName: user.displayName,
      visitedStores: user.visitedStores || [],
      favoriteStores: user.favoriteStores || [],
      favoriteCampaigns: user.favoriteCampaigns || [],
    };



    return NextResponse.json({
      success: true,
      user: userInfo,
      message: 'Profil başarıyla güncellendi',
    });
  } catch (error) {
    console.error('❌ Update error:', error);
    return NextResponse.json(
      {
        error: 'Güncelleme hatası',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
