
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function checkSpecificCampaigns() {
  try {
    await mongoose.connect(MONGODB_URI);
    const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }), 'campaigns');
    
    const campaigns = await Campaign.find({ type: { $in: ['product', 'popular'] } });
    
    console.log(`🔍 Checking ${campaigns.length} non-store campaigns:`);
    campaigns.forEach(c => {
      console.log(`- Title: ${c.title}, Type: ${c.type}, placeId: ${c.placeId}, isActive: ${c.isActive}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkSpecificCampaigns();
