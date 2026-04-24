
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function checkDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Place = mongoose.model('Place', new mongoose.Schema({}, { strict: false }), 'places');
    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }), 'rooms');

    const place = await Place.findOne({ slug: 'ankamall' });
    if (!place) {
      console.log("❌ Ankamall place not found!");
    } else {
      console.log("📍 Ankamall found:", {
        id: place._id,
        name: place.name,
        status: place.status,
        floors: place.floors ? Object.keys(place.floors) : []
      });

      const roomsCount = await Room.countDocuments({ place_id: place._id });
      console.log(`🏢 Rooms found for this place: ${roomsCount}`);
      
      if (roomsCount > 0) {
        const sampleRoom = await Room.findOne({ place_id: place._id });
        console.log("🔍 Sample room:", {
          name: sampleRoom.name,
          room_id: sampleRoom.room_id,
          floor: sampleRoom.floor
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkDB();
