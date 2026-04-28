const { MongoClient } = require('mongodb'); 
async function run() { 
  const client = new MongoClient('mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/signolog_assist?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation'); 
  await client.connect(); 
  const db = client.db('signolog_assist'); 
  const rooms = await db.collection('rooms').find({ $or: [{ 'popular_campaign.is_active': true }, { 'content.popular_campaign.is_active': true }] }).toArray(); 
  console.log('ACTIVE CAMPAIGNS:', rooms.length); 
  if (rooms.length > 0) {
    rooms.forEach(r => console.log(`${r.name} - place_id: ${r.place_id}`));
  }
  await client.close(); 
} 
run();
