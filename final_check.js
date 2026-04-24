
async function finalCheck() {
  try {
    console.log("🔗 Checking local API: http://localhost:3000/api/places?slug=ankamall");
    const response = await fetch("http://localhost:3000/api/places?slug=ankamall");
    const data = await response.json();
    
    if (data.error) {
      console.log("❌ API Error:", data.error);
    } else {
      console.log("✅ API Success!");
      console.log("🏢 Rooms:", data.rooms ? data.rooms.length : 0);
      console.log("📣 Discover Campaigns:", data.campaigns ? data.campaigns.length : 0);
      
      // Detaylı kontrol
      if (data.rooms && data.rooms.length > 0) {
        const sample = data.rooms.find(r => r.popular_campaign || r.product_campaigns.length > 0);
        if (sample) {
          console.log("📍 Found room with campaigns:", sample.name);
          console.log("⭐ Popular Campaign:", sample.popular_campaign ? "YES" : "NO");
          console.log("🎁 Product Campaigns:", sample.product_campaigns.length);
        }
      }
    }
  } catch (error) {
    console.error("❌ Fetch failed:", error.message);
  }
}

finalCheck();
