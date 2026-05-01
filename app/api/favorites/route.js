import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getJWTSecret } from '@/utils/auth';

// GET - Return all favorites for current user
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token missing' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJWTSecret());
    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      favorites: user.favoriteStores || [],
      campaigns: user.favoriteCampaigns || [],
      products: user.favoriteProducts || [],
    });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Toggle favorite (store / campaign / product)
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token missing' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJWTSecret());
    const { storeId, storeName, type = 'store', roomData, productData, campaignData } =
      await request.json();

    if (!storeId || !storeName) {
      return NextResponse.json(
        { success: false, error: 'Missing fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let action = '';

    if (type === 'product') {
      if (!user.favoriteProducts) user.favoriteProducts = [];
      const idx = user.favoriteProducts.findIndex(
        f => f.productId === storeId || f.storeId === storeId
      );
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
          addedDate: new Date(),
        });
        action = 'added';
      }
    } else if (type === 'campaign') {
      if (!user.favoriteCampaigns) user.favoriteCampaigns = [];
      const idx = user.favoriteCampaigns.findIndex(
        f => f.campaignId === storeId || f.storeId === storeId
      );
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
          addedDate: new Date(),
        });
        action = 'added';
      }
    } else {
      if (!user.favoriteStores) user.favoriteStores = [];
      const idx = user.favoriteStores.findIndex(f => f.storeId === storeId);
      if (idx > -1) {
        user.favoriteStores.splice(idx, 1);
        action = 'removed';
      } else {
        user.favoriteStores.push({
          storeId,
          storeName,
          roomData,
          addedDate: new Date(),
        });
        action = 'added';
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      action,
      favorites: user.favoriteStores || [],
      campaigns: user.favoriteCampaigns || [],
      products: user.favoriteProducts || [],
    });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Mark a favorite item as used (campaign/product). MUST be by favorite item id (not store-wide).
export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token missing' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, getJWTSecret());
    const { id, type = 'campaign' } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const normalize = v => String(v || '').trim().toLowerCase();
    const requestedId = normalize(id);

    const matchesId = f =>
      [
        f.id,
        f.campaignId,
        f.productId,
        f.storeId,
        f.campaignData?._id,
        f.campaignData?.id,
        f.campaignData?.campaignId,
        f.productData?._id,
        f.productData?.id,
        f.productData?.productId,
      ]
        .map(normalize)
        .filter(Boolean)
        .includes(requestedId);

    let marked = false;
    const markUsed = item => {
      item.is_used = true;
      item.usedDate = new Date();
      marked = true;
    };

    if (type === 'campaign' && user.favoriteCampaigns) {
      const idx = user.favoriteCampaigns.findIndex(matchesId);
      if (idx > -1) markUsed(user.favoriteCampaigns[idx]);
    }
    if (type === 'product' && user.favoriteProducts) {
      const idx = user.favoriteProducts.findIndex(matchesId);
      if (idx > -1) markUsed(user.favoriteProducts[idx]);
    }

    // If type is wrong, still try both lists using id
    if (!marked && user.favoriteCampaigns) {
      const idx = user.favoriteCampaigns.findIndex(matchesId);
      if (idx > -1) markUsed(user.favoriteCampaigns[idx]);
    }
    if (!marked && user.favoriteProducts) {
      const idx = user.favoriteProducts.findIndex(matchesId);
      if (idx > -1) markUsed(user.favoriteProducts[idx]);
    }

    if (!marked) {
      return NextResponse.json(
        {
          success: false,
          marked: false,
          favorites: user.favoriteStores || [],
          campaigns: user.favoriteCampaigns || [],
          products: user.favoriteProducts || [],
          error: 'Favorite not found',
        },
        { status: 404 }
      );
    }

    user.markModified('favoriteCampaigns');
    user.markModified('favoriteProducts');
    await user.save();

    return NextResponse.json({
      success: true,
      marked: true,
      favorites: user.favoriteStores || [],
      campaigns: user.favoriteCampaigns || [],
      products: user.favoriteProducts || [],
    });
  } catch (error) {
    console.error('Favorites PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

