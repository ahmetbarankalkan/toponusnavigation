const specialLocations = {
  pharmacy: { name: "Eczane", icon: "💊" },
  "wc": { name: "Tuvalet", icon: "🚹" },
  // "wc-female": { name: "En Yakın Kadın Tuvaleti", icon: "🚺" },
  // "wc-disabled": { name: "En Yakın Engelli Tuvaleti", icon: "♿" },
  "baby-care": { name: "Bebek  Odası", icon: "👶" },
  "exit": { name: "Çıkış", icon: "🚪" },
  "entrance": { name: "Giriş", icon: "🚪" },
  "fire-exit": { name: "Yangın Merdiveni", icon: "🔥" },
  "emergency-exit": { name: "Acil Çıkış", icon: "🚪" },
  "point": { name: "Nokta", icon: "📍" },
  // "first-aid": { name: "En Yakın İlk Yardım", icon: "🏥" },
  // "info-desk": { name: "En Yakın Bilgi Danışma", icon: "ℹ️" },
};

// GeoJSON dosyalarının yollarını tanımlar - API'den dinamik olarak yüklenecek
const geojsonURLS = {
  // Base klasöründen yüklenecek
  0: "floor_0.geojson",
  1: "floor_1.geojson",
  2: "floor_2.geojson",
};

/**
 * Quick access listesi oluşturur
 */
export const getQuickAccessList = () => {
  return Object.entries(specialLocations).map(([key, value]) => ({
    key,
    name: value.name,
    icon: value.icon,
  }));
};

export { specialLocations, geojsonURLS };
