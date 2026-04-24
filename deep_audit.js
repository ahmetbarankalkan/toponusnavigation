
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function deepAudit() {
  try {
    await mongoose.connect(MONGODB_URI);
    const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }), 'campaigns');
    const Room = mongoose.model('Room', new mongoose.Schema({}, { strict: false }), 'rooms');
    
    const campaigns = await Campaign.find({ isActive: true });
    console.log(`📋 Auditing ${campaigns.length} active campaigns:`);
    
    for (const c of campaigns) {
      const roomExists = await Room.findOne({ room_id: c.roomId });
      console.log(`- [${c.type}] Title: ${c.title}, roomId: ${c.roomId}, Room Found: ${roomExists ? 'YES (' + roomExists.name + ')' : '❌ NO'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

deepAudit();
