const { MongoClient } = require('mongodb');

const uri = "mongodb://admin:102938admin@ac-3d8yyop-shard-00-00.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-01.rtvtju1.mongodb.net:27017,ac-3d8yyop-shard-00-02.rtvtju1.mongodb.net:27017/?ssl=true&replicaSet=atlas-certf3-shard-0&authSource=admin&appName=toponus-navigation";

async function scanDatabases() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Scan started...");
    
    // Tüm veritabanlarını listele
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log("Found Databases:");
    for (let dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      
      console.log(`\n--- DB: ${dbInfo.name} ---`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      for (let col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - ${col.name}: ${count} docs`);
      }
    }

  } catch (err) {
    console.error("Scan error:", err);
  } finally {
    await client.close();
  }
}

scanDatabases();
