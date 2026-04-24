
async function testLocalAPI() {
  try {
    console.log("🔗 Testing local API: http://localhost:3000/api/places?slug=ankamall");
    const response = await fetch("http://localhost:3000/api/places?slug=ankamall");
    const data = await response.json();
    
    if (data.error) {
      console.log("❌ API returned error:", data.error);
    } else {
      console.log("✅ API Success!");
      console.log("📍 Place:", data.place);
      console.log("🏢 Rooms count:", data.rooms ? data.rooms.length : 0);
      console.log("🚪 Doors count:", data.doors ? data.doors.length : 0);
      console.log("📣 Campaigns count:", data.campaigns ? data.campaigns.length : 0);
      
      if (data.rooms && data.rooms.length > 0) {
        console.log("🔍 Sample Room:", data.rooms[0].name);
      }
    }
  } catch (error) {
    console.error("❌ Failed to reach local API:", error.message);
    console.log("💡 Make sure 'npm run dev' is running on port 3000.");
  }
}

testLocalAPI();
