import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import { verify } from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAuth(request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// POST - Ürün Kampanyası Ekle
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const roomId = formData.get('roomId');
    const placeId = formData.get('placeId');
    const productName = formData.get('productName');
    const description = formData.get('description');
    const originalPrice = parseFloat(formData.get('originalPrice'));
    const discountedPrice = parseFloat(formData.get('discountedPrice'));
    const discountPercentage = parseFloat(formData.get('discountPercentage'));
    const isActive = formData.get('is_active') === 'true';
    const imageFile = formData.get('image');

    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
      try {


        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Dosya adını temizle ve güvenli hale getir
        const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `product-${Date.now()}-${cleanFileName}`;
        
        // Uploads klasörünü oluştur (yoksa)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });

        }
        
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        imagePath = `/uploads/${filename}`; // Başında / ile

      } catch (imageError) {
        console.error('❌ Görsel kaydetme hatası:', imageError);
        return NextResponse.json({ 
          error: 'Görsel kaydedilemedi', 
          details: imageError.message 
        }, { status: 500 });
      }
    } else {

    }

    await connectDB();
    

    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    
    if (!room) {

      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    


    if (!room.content) room.content = {};
    if (!room.content.product_campaigns) room.content.product_campaigns = [];

    const newProduct = {
      product_name: productName,
      description: description,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount_percentage: discountPercentage,
      image: imagePath,
      is_active: isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    room.content.product_campaigns.push(newProduct);
    
    // Mongoose'a content field'ının değiştiğini söyle (Mixed type için gerekli)
    room.markModified('content');
    

    
    // Timeout ile save işlemi
    const savePromise = room.save();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database save timeout')), 15000)
    );
    
    await Promise.race([savePromise, timeoutPromise]);


    return NextResponse.json({ 
      success: true, 
      message: 'Ürün kampanyası eklendi',
      productCount: room.content.product_campaigns.length
    });
  } catch (error) {
    console.error('❌ Product campaign error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// PUT - Ürün Kampanyası Güncelle
export async function PUT(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const roomId = formData.get('roomId');
    const placeId = formData.get('placeId');
    const productIndex = parseInt(formData.get('productIndex'));
    const productName = formData.get('productName');
    const description = formData.get('description');
    const originalPrice = parseFloat(formData.get('originalPrice'));
    const discountedPrice = parseFloat(formData.get('discountedPrice'));
    const discountPercentage = parseFloat(formData.get('discountPercentage'));
    const isActive = formData.get('is_active') === 'true';
    const imageFile = formData.get('image');

    await connectDB();
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    if (!room.content || !room.content.product_campaigns || !room.content.product_campaigns[productIndex]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let imagePath = room.content.product_campaigns[productIndex].image;
    if (imageFile && imageFile.size > 0) {
      try {


        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Dosya adını temizle ve güvenli hale getir
        const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `product-${Date.now()}-${cleanFileName}`;
        
        // Uploads klasörünü oluştur (yoksa)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });

        }
        
        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);
        imagePath = `/uploads/${filename}`; // Başında / ile

      } catch (imageError) {
        console.error('❌ Görsel güncelleme hatası:', imageError);
        return NextResponse.json({ 
          error: 'Görsel güncellenemedi', 
          details: imageError.message 
        }, { status: 500 });
      }
    }

    room.content.product_campaigns[productIndex] = {
      product_name: productName,
      description: description,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      discount_percentage: discountPercentage,
      image: imagePath,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    room.markModified('content');
    
    // Timeout ile save işlemi
    const savePromise = room.save();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database save timeout')), 15000)
    );
    
    await Promise.race([savePromise, timeoutPromise]);

    return NextResponse.json({ success: true, message: 'Ürün kampanyası güncellendi' });
  } catch (error) {
    console.error('Update product campaign error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

// DELETE - Ürün Kampanyası Sil
export async function DELETE(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { roomId, placeId, productIndex } = await request.json();

    await connectDB();
    const room = await Room.findOne({ room_id: roomId, place_id: placeId });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    if (!room.content || !room.content.product_campaigns || !room.content.product_campaigns[productIndex]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    room.content.product_campaigns.splice(productIndex, 1);
    room.markModified('content');
    
    // Timeout ile save işlemi
    const savePromise = room.save();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database save timeout')), 15000)
    );
    
    await Promise.race([savePromise, timeoutPromise]);

    return NextResponse.json({ success: true, message: 'Ürün kampanyası silindi' });
  } catch (error) {
    console.error('Delete product campaign error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
