
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function checkRoomType() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }), 'rooms');
    
    const sample = await Room.findOne({});
    if (sample) {
      console.log("🔍 Sample Room place_id type:", typeof sample.place_id);
      console.log("🔍 Sample Room place_id value:", sample.place_id);
      console.log("🔍 Sample Room place_id is ObjectId:", sample.place_id instanceof mongoose.Types.ObjectId);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkRoomType();
