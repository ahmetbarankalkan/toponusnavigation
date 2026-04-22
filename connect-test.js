require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    const uri = "mongodb://signolog:LfvoVHz4hkpz4RLf@ac-z1xbmf6-shard-00-00.rzivdrk.mongodb.net:27017,ac-z1xbmf6-shard-00-01.rzivdrk.mongodb.net:27017,ac-z1xbmf6-shard-00-02.rzivdrk.mongodb.net:27017/signolog_assist?ssl=true&authSource=admin&replicaSet=atlas-ccumrh-shard-0&retryWrites=true&w=majority&appName=signolog";
    console.log("Testing direct direct-connection string (bypassing SRV)...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    process.exit(0);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

testConnection();
