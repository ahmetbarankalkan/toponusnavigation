
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function checkCampaignTypes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }), 'campaigns');
    
    const productCount = await Campaign.countDocuments({ type: 'product' });
    const popularCount = await Campaign.countDocuments({ type: 'popular' });
    const storeCount = await Campaign.countDocuments({ type: 'store' });

    console.log(`📊 Campaign Stats:`);
    console.log(`🎁 Product: ${productCount}`);
    console.log(`🌟 Popular: ${popularCount}`);
    console.log(`🏪 Store: ${storeCount}`);

    if (productCount > 0) {
      const pSample = await Campaign.findOne({ type: 'product' });
      console.log("🔍 Sample Product Campaign:", pSample.title);
    }
    
    if (popularCount > 0) {
      const popSample = await Campaign.findOne({ type: 'popular' });
      console.log("🔍 Sample Popular Campaign:", popSample.title);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkCampaignTypes();
