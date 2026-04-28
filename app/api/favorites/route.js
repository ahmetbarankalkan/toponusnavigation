import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getJWTSecret } from '@/utils/auth';

// GET - Kullanıcının tüm favorilerini getir
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

    // Tüm favori tiplerini birleştirip döndür
    return NextResponse.json({
      success: true,
      favorites: user.favoriteStores || [],
      campaigns: user.favoriteCampaigns || [],
      products: user.favoriteProducts || [],
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
    const { storeId, storeName, type = 'store', roomData, productData, campaignData } = await request.json();

    if (!storeId || !storeName) {
      return NextResponse.json(
        { success: false, error: 'Bilgiler eksik' },
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

    let action = '';
    let targetArray = '';

    // Tipe göre ilgili array'i seç
    if (type === 'product') {
      if (!user.favoriteProducts) user.favoriteProducts = [];
      const idx = user.favoriteProducts.findIndex(f => f.productId === storeId || f.storeId === storeId);
      if (idx > -1) {
        user.favoriteProducts.splice(idx, 1);
        action = 'removed';
      } else {
        user.favoriteProducts.push({
          storeId,
          storeName,
          productId: storeId,
          roomData,
          productData,
          addedDate: new Date()
        });
        action = 'added';
      }
      targetArray = 'products';
    } else if (type === 'campaign') {
      if (!user.favoriteCampaigns) user.favoriteCampaigns = [];
      const idx = user.favoriteCampaigns.findIndex(f => f.campaignId === storeId || f.storeId === storeId);
      if (idx > -1) {
        user.favoriteCampaigns.splice(idx, 1);
        action = 'removed';
      } else {
        user.favoriteCampaigns.push({
          storeId,
          storeName,
          campaignId: storeId,
          campaignTitle: campaignData?.title,
          roomData,
          campaignData,
          addedDate: new Date()
        });
        action = 'added';
      }
      targetArray = 'campaigns';
    } else {
      // Varsayılan: Store
      const idx = user.favoriteStores.findIndex(f => f.storeId === storeId);
      if (idx > -1) {
        user.favoriteStores.splice(idx, 1);
        action = 'removed';
      } else {
        user.favoriteStores.push({
          storeId,
          storeName,
          roomData,
          addedDate: new Date()
        });
        action = 'added';
      }
      targetArray = 'stores';
    }

    await user.save();

    return NextResponse.json({
      success: true,
      action,
      favorites: user.favoriteStores,
      campaigns: user.favoriteCampaigns,
      products: user.favoriteProducts,
      message: action === 'added' ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı',
    });
  } catch (error) {
    console.error('Favori işlemi hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Favoriyi faydalanıldı olarak işaretle
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJWTSecret());
    const { id, room_id, storeName, type = 'campaign' } = await request.json();

    if (!id && !room_id && !storeName) {
      return NextResponse.json(
        { success: false, error: 'ID eksik' },
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

    // Eşleştirme fonksiyonu: id, room_id veya storeName ile bul
    const matchFav = (f) => {
      if (id && (f.campaignId === id || f.storeId === id || f.productId === id)) return true;
      if (room_id && (f.campaignId === room_id || f.storeId === room_id)) return true;
      if (storeName && f.storeName && f.storeName.toLowerCase() === storeName.toLowerCase()) return true;
      return false;
    };

    let marked = false;
    if (type === 'campaign' && user.favoriteCampaigns) {
      const idx = user.favoriteCampaigns.findIndex(matchFav);
      if (idx > -1) {
        user.favoriteCampaigns[idx].is_used = true;
        marked = true;
      }
    }
    if (type === 'product' && user.favoriteProducts) {
      const idx = user.favoriteProducts.findIndex(matchFav);
      if (idx > -1) {
        user.favoriteProducts[idx].is_used = true;
        marked = true;
      }
    }
    // Kampanya bulunamadıysa ürünlerde de ara (ve tersi)
    if (!marked && user.favoriteCampaigns) {
      const idx = user.favoriteCampaigns.findIndex(matchFav);
      if (idx > -1) {
        user.favoriteCampaigns[idx].is_used = true;
        marked = true;
      }
    }
    if (!marked && user.favoriteProducts) {
      const idx = user.favoriteProducts.findIndex(matchFav);
      if (idx > -1) {
        user.favoriteProducts[idx].is_used = true;
        marked = true;
      }
    }

    if (marked) {
      user.markModified('favoriteCampaigns');
      user.markModified('favoriteProducts');
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Faydalanıldı olarak işaretlendi'
    });
  } catch (error) {
    console.error('Favori güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
