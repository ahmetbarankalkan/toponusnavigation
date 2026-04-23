import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getJWTSecret } from '@/utils/auth';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(token, getJWTSecret());
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya süresi dolmuş bağlantı' },
        { status: 401 }
      );
    }

    if (decoded.type !== 'password-reset') {
      return NextResponse.json(
        { success: false, error: 'Geçersiz işlem tipi' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Şifreyi güncelle (User modelindeki pre-save hook otomatik hash'leyecek)
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.',
    });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
