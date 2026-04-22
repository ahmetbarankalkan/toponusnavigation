// Mevcut yorumları yeni şemaya göre güncelleme scripti
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ankamall';

async function migrateReviews() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');

    const db = client.db();
    const reviews = db.collection('reviews');

    // Mevcut yorumları güncelle
    const result = await reviews.updateMany(
      {
        $or: [
          { approved: { $exists: false } },
          { isActive: { $exists: false } }
        ]
      },
      {
        $set: {
          approved: true, // Mevcut yorumları otomatik onayla
          isActive: true
        }
      }
    );

    console.log(`✅ ${result.modifiedCount} yorum güncellendi`);
    console.log('✅ Migration tamamlandı!');

  } catch (error) {
    console.error('❌ Migration hatası:', error);
  } finally {
    await client.close();
  }
}

migrateReviews();
