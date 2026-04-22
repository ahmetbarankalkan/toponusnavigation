'use client';

import { useState, useCallback, useEffect } from 'react';

// Mağaza keywords - direkt kod içinde
const STORE_KEYWORDS = {
  "Starbucks": { category: "Yeme-İçme", keywords: ["starbucks", "kahve", "cafe", "içecek", "coffee", "frappuccino", "latte", "çay", "tatlı", "kek", "sandviç"] },
  "5M Migros": { category: "Market", keywords: ["migros", "market", "süpermarket", "gıda", "5m", "alışveriş", "yiyecek", "içecek", "manav", "kasap", "temizlik"] },
  "Mumuso": { category: "Ev/Yaşam", keywords: ["mumuso", "hediyelik", "aksesuar", "kore", "japon", "kırtasiye", "kozmetik", "oyuncak", "ev eşyası", "dekorasyon", "çanta"] },
  "H&M": { category: "Giyim", keywords: ["h&m", "hm", "giyim", "kıyafet", "moda", "pantolon", "t-shirt", "elbise", "kadın giyim", "erkek giyim", "çocuk giyim", "basic"] },
  "SuperStep": { category: "Ayakkabı/Çanta", keywords: ["superstep", "ayakkabı", "spor ayakkabı", "sneaker", "nike", "adidas", "puma", "vans", "converse", "new balance", "spor giyim"] },
  "Boyner": { category: "Giyim", keywords: ["boyner", "giyim", "kozmetik", "parfüm", "ayakkabı", "çanta", "aksesuar", "ev", "dekorasyon", "kadın giyim", "erkek giyim", "çocuk giyim", "departman mağaza"] },
  "Elle": { category: "Ayakkabı/Çanta", keywords: ["elle", "ayakkabı", "çanta", "deri", "cüzdan", "kadın ayakkabı", "topuklu ayakkabı", "bot", "erkek ayakkabı"] },
  "İpekyol": { category: "Giyim", keywords: ["ipekyol", "giyim", "kadın", "elbise", "moda", "kadın giyim", "abiye", "ofis giyim", "ceket", "bluz", "pantolon"] },
  "Damat Tween": { category: "Giyim", keywords: ["damat", "tween", "erkek giyim", "takım elbise", "smokin", "gömlek", "kravat", "ceket", "pantolon", "damatlık", "klasik giyim"] },
  "Tüzün": { category: "Giyim", keywords: ["tüzün", "giyim", "kadın giyim", "elbise", "bluz", "ceket", "abiye", "klasik giyim", "ofis giyim"] },
  "Kahve Dünyası": { category: "Yeme-İçme", keywords: ["kahve dünyası", "kahve", "çikolata", "cafe", "türk kahvesi", "dondurma", "tatlı", "pasta", "içecek", "salep"] },
  "SAMSONITE": { category: "Ayakkabı/Çanta", keywords: ["samsonite", "bavul", "valiz", "çanta", "seyahat", "bagaj", "laptop çantası", "sırt çantası"] },
  "Kiko": { category: "Sağlık/Kozmetik", keywords: ["kiki", "kiko", "milano", "kozmetik", "makyaj", "ruj", "far", "oje", "maskara", "fondöten", "italyan kozmetik"] },
  "SWAROVSKI": { category: "Aksesuar/Mücevher", keywords: ["swarovski", "mücevher", "kristal", "takı", "kolye", "küpe", "yüzük", "bileklik", "saat", "hediyelik"] },
  "Mudo City": { category: "Ev/Yaşam", keywords: ["mudo", "city", "ev", "dekorasyon", "mobilya", "aksesuar", "mutfak", "tekstil", "ev tekstili", "giyim"] },
  "VENESSA": { category: "Aksesuar/Mücevher", keywords: ["venessa", "çanta", "cüzdan", "kadın çanta", "deri çanta", "aksesuar"] },
  "Lokman Hekim": { category: "Hizmet", keywords: ["lokman hekim", "sağlık", "hastane", "doktor", "poliklinik", "randevu", "acil", "muayene", "sağlık hizmeti"] },
  "Gülaylar Altın": { category: "Aksesuar/Mücevher", keywords: ["gülaylar", "altın", "kuyumcu", "mücevher", "pırlanta", "yüzük", "kolye", "bilezik", "küpe", "takı", "düğün"] },
  "Zen Pırlanta": { category: "Aksesuar/Mücevher", keywords: ["zen", "diamond", "pırlanta", "mücevher", "yüzük", "tektaş", "alyans", "kolye", "küpe", "takı", "elmas"] },
  "Etap Saat": { category: "Aksesuar/Mücevher", keywords: ["etap", "saat", "aksesuar", "kol saati", "marka saat", "takı"] },
  "Altın Çizgi": { category: "Aksesuar/Mücevher", keywords: ["altın çizgi", "altın", "kuyumcu", "mücevher", "takı", "pırlanta", "yüzük", "bilezik"] },
  "Abdullah Kiğılı": { category: "Giyim", keywords: ["abdullah kiğılı", "kiğılı", "erkek giyim", "takım elbise", "gömlek", "ceket", "pantolon", "kravat", "klasik giyim"] },
  "ADL": { category: "Giyim", keywords: ["adl", "kadın giyim", "moda", "elbise", "abiye", "gece elbisesi", "ofis giyim", "ceket", "bluz", "pantolon"] },
  "Ekol": { category: "Giyim", keywords: ["ekol", "giyim", "kadın giyim", "elbise", "bluz", "pantolon", "ceket", "moda"] },
  "Love My Body": { category: "Giyim", keywords: ["love my body", "büyük beden", "giyim", "kadın giyim", "elbise", "pantolon", "bluz", "büyük beden kadın"] },
  "Sevil Parfümeri": { category: "Sağlık/Kozmetik", keywords: ["sevil", "parfümeri", "parfüm", "kozmetik", "makyaj", "cilt bakımı", "deodorant", "marka parfüm", "krem"] },
  "Parisli Cemil": { category: "Hizmet", keywords: ["parisli cemil", "kuaför", "saç", "saç kesim", "boya", "fön", "manikür", "pedikür", "güzellik salonu", "berber"] },
  "Eczane": { category: "Sağlık/Kozmetik", keywords: ["eczane", "ilaç", "sağlık", "reçete", "vitamin", "medikal", "sağlık ürünleri", "nöbetçi eczane", "dermokozmetik"] },
  "Göz Grup": { category: "Sağlık/Kozmetik", keywords: ["göz grup", "optik", "gözlük", "lens", "kontakt lens", "güneş gözlüğü", "numaralı gözlük", "gözlük çerçevesi"] },
  "RAVELLI": { category: "Ayakkabı/Çanta", keywords: ["ravelli", "çanta", "valiz", "bavul", "seyahat", "deri çanta", "cüzdan"] },
  "ETS TUR": { category: "Hizmet", keywords: ["ets", "tur", "seyahat", "tatil", "otel", "uçak bileti", "turizm", "acenta", "rezervasyon", "yurt dışı", "yurt içi"] },
  "COLLEZIONE": { category: "Giyim", keywords: ["collezione", "giyim", "moda", "genç", "t-shirt", "jean", "pantolon", "genç giyim", "spor giyim"] },
  "BAMBİ": { category: "Ayakkabı/Çanta", keywords: ["bambi", "ayakkabı", "çanta", "kadın ayakkabı", "erkek ayakkabı", "bot", "cüzdan", "topuklu ayakkabı", "stiletto", "babet"] },
  "RAMSEY": { category: "Giyim", keywords: ["ramsey", "erkek giyim", "takım elbise", "gömlek", "ceket", "pantolon", "klasik giyim", "kravat", "smokin"] },
  "BOYNER SPORT": { category: "Giyim", keywords: ["boyner", "sport", "spor", "giyim", "sneaker", "spor ayakkabı", "eşofman", "nike", "adidas", "puma", "spor malzemeleri", "koşu"] },
  "Deichmann": { category: "Ayakkabı/Çanta", keywords: ["deichmann", "ayakkabı", "çanta", "kadın ayakkabı", "erkek ayakkabı", "çocuk ayakkabı", "bot", "spor ayakkabı", "terlik", "uygun fiyatlı"] },
  "igs": { category: "Giyim", keywords: ["igs", "erkek giyim", "takım elbise", "gömlek", "ceket", "pantolon", "klasik giyim", "kravat"] },
  "G-LINGERIE": { category: "Giyim", keywords: ["g-lingerie", "lingerie", "iç giyim", "sütyen", "külot", "pijama", "çorap", "kadın iç giyim", "fantezi iç giyim"] },
  "SARAR WOMAN": { category: "Giyim", keywords: ["sarar", "bayan", "woman", "kadın giyim", "klasik giyim", "ofis giyim", "elbise", "ceket", "bluz", "pantolon", "döpiyes"] },
  "Gratis": { category: "Sağlık/Kozmetik", keywords: ["gratis", "kozmetik", "makyaj", "bakım", "kişisel bakım", "şampuan", "ruj", "oje", "parfüm", "maske", "cilt bakımı", "saç boyası"] },
  "Naramaxx": { category: "Giyim", keywords: ["naramaxx", "giyim", "kadın", "büyük beden", "kadın giyim", "elbise", "pantolon", "bluz", "büyük beden kadın"] },
  "Teknosa": { category: "Elektronik", keywords: ["teknosa", "elektronik", "bilgisayar", "laptop", "telefon", "tv", "tablet", "beyaz eşya", "oyun konsolu", "kamera", "teknoloji", "kulaklık", "cep telefonu"] },
  "Koçtaş": { category: "Ev/Yaşam", keywords: ["koçtaş", "yapı market", "ev", "bahçe", "nalbur", "mobilya", "banyo", "mutfak", "dekorasyon", "boya", "tamirat", "aydınlatma", "bitki"] },
  "KEMAL TANCA": { category: "Ayakkabı/Çanta", keywords: ["kemal tanca", "ayakkabı", "çanta", "deri", "cüzdan", "kemer", "kadın ayakkabı", "erkek ayakkabı", "deri ceket", "bot", "klasik ayakkabı"] },
  "Colins": { category: "Giyim", keywords: ["colins", "colin's", "giyim", "moda", "jean", "kot", "pantolon", "t-shirt", "gömlek", "genç giyim", "mont", "ceket"] },
  "KIP": { category: "Giyim", keywords: ["kip", "erkek giyim", "takım elbise", "gömlek", "ceket", "pantolon", "klasik giyim", "kravat"] },
  "Altınbaş": { category: "Aksesuar/Mücevher", keywords: ["altınbaş", "kuyumcu", "altın", "pırlanta", "mücevher", "yüzük", "tektaş", "alyans", "kolye", "bilezik", "takı"] },
  "CACHAREL": { category: "Giyim", keywords: ["cacharel", "erkek giyim", "gömlek", "takım elbise", "pantolon", "ceket", "kravat", "klasik giyim", "triko", "parfüm"] },
  "Seçil": { category: "Giyim", keywords: ["seçil", "giyim", "kadın giyim", "tesettür", "elbise", "tunik", "pardesü", "ferace", "eşarp", "büyük beden", "bone"] },
  "Sarar": { category: "Giyim", keywords: ["sarar", "erkek giyim", "kadın giyim", "takım elbise", "gömlek", "klasik giyim", "ofis giyim", "ceket", "pantolon", "döpiyes", "kravat"] },
  "SAAT&SAAT": { category: "Aksesuar/Mücevher", keywords: ["saat&saat", "saat", "aksesuar", "kol saati", "marka saat", "takı", "güneş gözlüğü", "swatch", "fossil", "guess"] },
  "Atasay": { category: "Aksesuar/Mücevher", keywords: ["atasay", "kuyumcu", "altın", "pırlanta", "mücevher", "yüzük", "tektaş", "alyans", "kolye", "bilezik", "takı", "elmas"] },
  "Blue Diamond": { category: "Aksesuar/Mücevher", keywords: ["blue diamond", "pırlanta", "mücevher", "yüzük", "tektaş", "alyans", "kolye", "küpe", "takı", "elmas", "safir"] },
  "MISSHA": { category: "Sağlık/Kozmetik", keywords: ["missha", "kozmetik", "makyaj", "kore", "kore kozmetiği", "cilt bakımı", "bb krem", "maske", "krem", "k-beauty", "güneş kremi"] },
  "Karel": { category: "Hizmet", keywords: ["karel", "döviz", "altın", "döviz bürosu", "altın alım satım", "para değişimi", "exchange", "kur", "yatırım"] },
  "Network": { category: "Giyim", keywords: ["network", "giyim", "moda", "ofis", "kadın giyim", "erkek giyim", "klasik giyim", "ofis giyim", "takım elbise", "elbise", "ceket", "lüks giyim"] },
  "İşbir Yatak": { category: "Ev/Yaşam", keywords: ["işbir", "yatak", "mobilya", "ev", "baza", "başlık", "yastık", "yorgan", "ev tekstili", "uyku merkezi", "visco"] },
  "Mado": { category: "Yeme-İçme", keywords: ["mado", "dondurma", "tatlı", "cafe", "kahvaltı", "künefe", "baklava", "pasta", "yemek", "maraş dondurması", "türk mutfağı"] },
  "Play Home": { category: "Ev/Yaşam", keywords: ["play home", "oyuncak", "çocuk", "oyun", "eğitici oyuncak", "bebek", "araba", "kutu oyunu", "lego", "oyuncakçı"] },
  "LC Waikiki": { category: "Giyim", keywords: ["lcw", "lc waikiki", "waikiki", "giyim", "kıyafet", "ucuz giyim", "kadın giyim", "erkek giyim", "çocuk giyim", "bebek giyim", "t-shirt", "pantolon", "okul kıyafeti"] },
  "SEPHORA": { category: "Sağlık/Kozmetik", keywords: ["sephora", "kozmetik", "makyaj", "parfüm", "cilt bakımı", "lüks kozmetik", "marka parfüm", "ruj", "fondöten", "maskara", "bakım", "fenty", "dior"] },
  "DESA": { category: "Ayakkabı/Çanta", keywords: ["desa", "deri", "çanta", "ayakkabı", "deri ceket", "cüzdan", "kemer", "deri mont", "kadın ayakkabı", "erkek ayakkabı", "deri giyim"] },
  "OPMAR OPTİK": { category: "Sağlık/Kozmetik", keywords: ["opmar", "optik", "gözlük", "lens", "güneş gözlüğü", "numaralı gözlük", "kontakt lens", "gözlük çerçevesi", "marka gözlük", "rayban", "prada"] },
  "POLO GARAGE": { category: "Giyim", keywords: ["polo garage", "polo", "giyim", "t-shirt", "polo yaka", "gömlek", "pantolon", "moda", "kadın giyim", "erkek giyim", "triko"] },
  "Koray Spor": { category: "Ayakkabı/Çanta", keywords: ["koray", "ayakkabı", "spor ayakkabı", "spor giyim", "sneaker", "eşofman", "nike", "adidas", "puma", "spor malzemeleri", "krampon", "forma"] }
};

// Türkçe karakterleri normalize et ve karşılaştırma için hazırla
const normalizeText = text => {
  return text
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]/g, ''); // Özel karakterleri kaldır
};

// İki ismin eşleşip eşleşmediğini kontrol et
const namesMatch = (roomName, storeName) => {
  if (!roomName || !storeName) return false;
  
  const normalizedRoom = normalizeText(roomName);
  const normalizedStore = normalizeText(storeName);
  
  // Tam eşleşme
  if (normalizedRoom === normalizedStore) return true;
  
  // Birbirini içerme (en az 3 karakter)
  if (normalizedRoom.length >= 3 && normalizedStore.length >= 3) {
    if (normalizedRoom.includes(normalizedStore) || normalizedStore.includes(normalizedRoom)) {
      return true;
    }
  }
  
  return false;
};

export function useSearch(rooms) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Arama fonksiyonu - keyword bazlı ve ID bazlı
  const handleSearch = useCallback(
    query => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const searchTerm = normalizeText(query);
      const matchedRooms = new Set();

      // ID formatı kontrolü (id-100 formatı)
      const isLocationId = query.match(/^id-\d+$/);
      
      if (isLocationId) {
        console.log('🆔 Konum ID\'si algılandı:', query);
        
        // Basit ID formatı: id-100
        console.log('✅ ID numarası:', query);
        
        // localStorage'dan koordinat bilgisini al
        let locationData = null;
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(query);
          if (stored) {
            try {
              locationData = JSON.parse(stored);
            } catch (e) {
              console.error('localStorage parse hatası:', e);
            }
          }
        }
        
        // Koordinat bilgisi varsa kullan, yoksa varsayılan konum
        const coordinates = locationData ? locationData.coordinates : [32.8316, 39.9507];
        const floor = locationData ? locationData.floor : 0;
        
        const coordinateRoom = {
          id: `coordinate-${Date.now()}`,
          name: `📍 Şu an buradasınız - Konum ${query}`,
          floor: floor,
          coordinates: coordinates,
          isCoordinate: true,
          isCurrentLocation: true,
          locationId: query
        };
        
        setSearchResults([coordinateRoom]);
        return;
      }

      // Eski format desteği (room ID'leri için)
      if (query.includes('room-')) {
        const roomIdMatch = query.match(/room-(.+)$/);
        if (roomIdMatch) {
          const roomId = roomIdMatch[1];
          const targetRoom = rooms.find(r => r.id === roomId);
          if (targetRoom) {
            console.log('✅ Room ID ile oda bulundu:', targetRoom.name);
            const currentLocationRoom = {
              ...targetRoom,
              name: `📍 ${targetRoom.name} - Şu an buradasınız`,
              isCurrentLocation: true
            };
            setSearchResults([currentLocationRoom]);
            return;
          }
        }
      }

      // Normal arama devam eder
      rooms.forEach(room => {
        if (!room.name) return;
        
        let isMatch = false;
        const normalizedRoomName = normalizeText(room.name);

        // 1. Mağaza ismine göre arama
        if (normalizedRoomName.includes(searchTerm)) {
          isMatch = true;
        }

        // 2. Keyword ve kategori bazlı arama
        if (!isMatch) {
          // Bu room için keyword bilgilerini bul
          const storeData = STORE_KEYWORDS[room.name] || 
                           Object.entries(STORE_KEYWORDS).find(([key]) => 
                             namesMatch(room.name, key)
                           )?.[1];

          if (storeData) {
            // Kategori kontrolü
            if (normalizeText(storeData.category).includes(searchTerm)) {
              isMatch = true;
            }

            // Keyword kontrolü
            if (!isMatch) {
              isMatch = storeData.keywords.some(keyword =>
                normalizeText(keyword).includes(searchTerm)
              );
            }
          }
        }

        // 3. Özel lokasyon kontrolü
        if (!isMatch && room.is_special && room.special_type) {
          if (normalizeText(room.special_type).includes(searchTerm)) {
            isMatch = true;
          }
        }

        if (isMatch) {
          matchedRooms.add(room);
        }
      });

      const results = Array.from(matchedRooms);
      setSearchResults(results);
    },
    [rooms]
  );

  // Arama query'si değiştiğinde sonuçları güncelle
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Arama sonucu seçildiğinde
  const handleSearchResultSelect = useCallback(
    (room, callbacks) => {
      const { 
        setSelectedStartRoom, 
        setSelectedEndRoom, 
        setIsSelectingStartRoom, 
        setActiveNavItem, 
        setIsCardMinimized,
        isSelectingStartRoom,
        mapRef 
      } = callbacks;

      setSearchQuery(room.name);
      setShowSearchDropdown(false);
      setIsSearchFocused(false);

      // Oda seçimini yap - başlangıç veya bitiş noktası olarak
      if (isSelectingStartRoom) {
        setSelectedStartRoom(room.id);
        setIsSelectingStartRoom(false);
        console.log(`🎯 Arama sonucu başlangıç noktası seçildi: ${room.name}`);
      } else {
        setSelectedEndRoom(room.id);
        console.log(`🎯 Arama sonucu bitiş noktası seçildi: ${room.name}`);
      }

      // Rota panelini aç
      setActiveNavItem(0); // Rota navbar'ına geç
      setIsCardMinimized(false); // Paneli aç

      // Seçilen odayı haritada göster
      if (mapRef.current && room.coordinates) {
        mapRef.current.flyTo({
          center: [room.coordinates[0], room.coordinates[1]],
          zoom: 18,
          duration: 1000,
        });
      }

      // Kartı açık tut
      setIsCardMinimized(false);
    },
    []
  );

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setIsSearchFocused(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    showSearchDropdown,
    setShowSearchDropdown,
    searchResults,
    setSearchResults,
    isSearchFocused,
    setIsSearchFocused,
    handleSearch,
    handleSearchResultSelect,
    clearSearch,
  };
}