import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/utils/auth';

function getCandidateSecrets() {
  const primary = getJWTSecret().trim();
  const legacy = (process.env.JWT_SECRET_LEGACY || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return [primary, ...legacy];
}

function verifyWithCandidateSecrets(token) {
  const secrets = getCandidateSecrets();
  let lastError = null;

  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Token verification failed');
}

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();
    const normalizedToken = decodeURIComponent((token || '').trim()).replace(/\s/g, '');

    if (!normalizedToken || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token ve yeni sifre gereklidir' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Sifre en az 6 karakter olmalidir' },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = verifyWithCandidateSecrets(normalizedToken);
    } catch (err) {
      console.error('Reset password token verify failed:', err?.name || err?.message || err);
      return NextResponse.json(
        { success: false, error: 'Gecersiz veya suresi dolmus baglanti' },
        { status: 401 }
      );
    }

    if (decoded.type !== 'password-reset') {
      return NextResponse.json(
        { success: false, error: 'Gecersiz islem tipi' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanici bulunamadi' },
        { status: 404 }
      );
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Sifreniz basariyla guncellendi. Giris yapabilirsiniz.',
    });
  } catch (error) {
    console.error('Sifre guncelleme hatasi:', error);
    return NextResponse.json(
      { success: false, error: 'Bir hata olustu' },
      { status: 500 }
    );
  }
}
