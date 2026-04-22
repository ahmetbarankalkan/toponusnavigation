/**
 * Test kullanıcısı oluşturma scripti
 * Admin dashboard'u test etmek için
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, sparse: true },
  role: { 
    type: String, 
    enum: ["admin", "place_owner", "store_owner", "basic_user", "advanced_user"],
    default: "basic_user",
    required: true 
  },
  place_id: { type: mongoose.Schema.Types.ObjectId, ref: "Place" },
  store_id: { type: String },
  last_login: { type: Date },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

async function createTestUsers() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Test kullanıcılarını oluştur
    const testUsers = [
      {
        username: 'admin',
        password: 'admin123',
        email: 'admin@signolog.com',
        role: 'admin'
      },
      {
        username: 'test_place_owner',
        password: 'place123',
        email: 'place@signolog.com',
        role: 'place_owner'
      },
      {
        username: 'test_store_owner',
        password: 'store123',
        email: 'store@signolog.com',
        role: 'store_owner'
      }
    ];

    for (const userData of testUsers) {
      // Kullanıcı zaten var mı kontrol et
      const existingUser = await User.findOne({ username: userData.username });
      
      if (existingUser) {
        console.log(`⚠️  Kullanıcı zaten mevcut: ${userData.username}`);
        continue;
      }

      // Yeni kullanıcı oluştur
      const user = new User(userData);
      await user.save();
      console.log(`✅ Kullanıcı oluşturuldu: ${userData.username} (${userData.role})`);
    }

    console.log('\n🎉 Test kullanıcıları hazır!');
    console.log('Admin Dashboard test için:');
    console.log('- Username: admin');
    console.log('- Password: admin123');
    console.log('\nURL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

createTestUsers();