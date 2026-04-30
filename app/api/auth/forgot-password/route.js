import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { getJWTSecret } from '@/utils/auth';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-posta adresi gerekli' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      // Güvenlik için kullanıcı yoksa da "gönderildi" diyebiliriz ama şimdilik hata verelim
      return NextResponse.json(
        { success: false, error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Sıfırlama token'ı oluştur (1 saat geçerli)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      getJWTSecret(),
      { expiresIn: '1h' }
    );

    // E-posta gönderim ayarları (Nodemailer)
    // NOT: Kullanıcının gerçek SMTP bilgilerini buraya eklemesi gerekecek
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Dinamik olarak base URL'i belirle (Env varsa onu kullan, yoksa isteğin geldiği adresi kullan)
    const host = request.headers.get('host');
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const fallbackUrl = `${protocol}://${host}`;
    
    const appUrl = fallbackUrl;
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

    const mailOptions = {
      from: `"Toponus Destek" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: 'Şifre Sıfırlama İsteği',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B3349;">Şifre Sıfırlama Talebi</h2>
          <p>Merhaba,</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1B3349; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Şifremi Sıfırla</a>
          </div>
          <p>Bu buton çalışmıyorsa aşağıdaki linki tarayıcınıza yapıştırabilirsiniz:</p>
          <p>${resetUrl}</p>
          <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Bu e-posta Toponus Navigasyon Sistemi tarafından otomatik olarak gönderilmiştir.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return NextResponse.json({
        success: true,
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
      });
    } catch (mailError) {
      console.error('Mail gönderme hatası:', mailError);
      return NextResponse.json(
        { success: false, error: 'E-posta gönderilemedi. Lütfen sistem yöneticisi ile iletişime geçin.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
