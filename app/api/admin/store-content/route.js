// app/api/admin/store-content/route.js
import { NextResponse } from 'next/server';
import { verifyJWTToken } from '@/utils/auth.js';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// Store içeriği kaydet (products, events, discounts)
export async function POST(request) {
  try {


    // Token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'place_owner') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { roomId, contentType, item } = body;

    if (!roomId || !contentType || !item) {
      return NextResponse.json(
        { error: 'roomId, contentType ve item gerekli' },
        { status: 400 }
      );
    }

    // Base64 Image Handling
    if (item.image && item.image.startsWith('data:image')) {

      try {
        const matches = item.image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          throw new Error('Geçersiz base64 formatı');
        }
        
        const imageExtension = matches[1];
        const base64Data = matches[2];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        const filename = `${contentType}-${Date.now()}.${imageExtension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, filename);

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(filePath, imageBuffer);

        const fileUrl = `/uploads/${filename}`;
        item.image = fileUrl;


      } catch (uploadError) {
        console.error('❌ Görsel yükleme hatası:', uploadError);
        // Görsel yüklenemese bile devam et, ama image alanını temizle
        item.image = ''; 
      }
    }

    await connectDB();

    const room = await Room.findOne({ room_id: roomId });
    if (!room) {
      return NextResponse.json({ error: 'Room bulunamadı' }, { status: 404 });
    }



    const content = room.content || {};
    const arrayKey = `${contentType}s`;
    const currentArray = content[arrayKey] || [];



    let updatedArray;
    const existingItemIndex = currentArray.findIndex(i => i.id === item.id);



    if (existingItemIndex > -1) {
      // Güncelleme
      currentArray[existingItemIndex] = item;
      updatedArray = currentArray;

    } else {
      // Yeni ekleme
      updatedArray = [...currentArray, item];

    }

    // MongoDB Native Update - Schema bypass
    const db = room.db;
    const collection = db.collection('rooms');
    
    const updateResult = await collection.updateOne(
      { room_id: roomId },
      {
        $set: {
          [`content.${arrayKey}`]: updatedArray,
          needs_sync: true,
          last_synced: new Date(),
        },
      }
    );



    // Güncellenmiş room'u tekrar çek
    const freshDoc = await collection.findOne({ room_id: roomId });


    // Manuel olarak content'i oluştur
    const responseContent = {
      ...freshDoc.content,
      [arrayKey]: updatedArray, // Kesin olarak güncel array'i gönder
    };



    return NextResponse.json({
      success: true,
      message: 'İçerik başarıyla kaydedildi',
      room: {
        room_id: freshDoc.room_id,
        name: freshDoc.name,
        content: responseContent,
      },
    });
  } catch (error) {
    console.error('❌ Store içerik kaydetme hatası:', error);
    return NextResponse.json(
      {
        error: 'Kaydetme hatası',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Store içeriği sil
export async function DELETE(request) {
  try {


    // Token kontrolü
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token gerekli' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let user;
    try {
      user = verifyJWTToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
    }

    // Admin kontrolü
    if (user.role !== 'admin' && user.role !== 'place_owner') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { roomId, contentType, itemId } = body;



    if (!roomId || !contentType || !itemId) {
      return NextResponse.json(
        { error: 'roomId, contentType ve itemId gerekli' },
        { status: 400 }
      );
    }

    await connectDB();

    // Room'u bul
    const room = await Room.findOne({ room_id: roomId });
    if (!room) {
      return NextResponse.json({ error: 'Room bulunamadı' }, { status: 404 });
    }

    // Content objesini al
    const content = room.content || {};
    const arrayKey = `${contentType}s`;
    const currentArray = content[arrayKey] || [];

    // Item'i sil
    const updatedArray = currentArray.filter(i => i.id !== itemId);

    // MongoDB'de güncelle
    content[arrayKey] = updatedArray;
    room.content = content;
    room.needs_sync = true;
    room.last_synced = new Date();
    await room.save();



    return NextResponse.json({
      success: true,
      message: 'İçerik başarıyla silindi',
      room: {
        room_id: room.room_id,
        name: room.name,
        content: room.content,
      },
    });
  } catch (error) {
    console.error('❌ Store içerik silme hatası:', error);
    return NextResponse.json(
      {
        error: 'Silme hatası',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
