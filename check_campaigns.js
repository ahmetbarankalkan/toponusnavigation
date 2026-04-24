
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function checkCampaigns() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }), 'campaigns');
    
    const campaignsCount = await Campaign.countDocuments({});
    console.log(`🎁 Total campaigns in DB: ${campaignsCount}`);

    if (campaignsCount > 0) {
      const sample = await Campaign.findOne({});
      console.log("🔍 Sample Campaign:", JSON.stringify(sample, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCampaigns();
