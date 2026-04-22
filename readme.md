# Toponus - Akıllı Kapalı Alan Navigasyon Sistemi

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-13.5-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=for-the-badge&logo=mongodb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-blue?style=for-the-badge&logo=openai)
![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)
![MapLibre](https://img.shields.io/badge/MapLibre-GL-orange?style=for-the-badge)

**Toponus**, AVM, hastane, okul, havalimanı gibi büyük kapalı mekanlarda kullanıcıların sesli komutlarla veya dokunmatik etkileşimlerle kolayca yön bulmasını sağlayan gelişmiş bir web uygulamasıdır.

[Özellikler](#ozellikler) • [Kurulum](#kurulum) • [API Referansı](#api-referansi) • [Mimari](#mimari) • [Katkıda Bulunma](#katkida-bulunma)

</div>

---

## İçindekiler

- [Proje Hakkında](#proje-hakkinda)
- [Özellikler](#ozellikler)
- [Teknoloji Yığını](#teknoloji-yigini)
- [Kurulum](#kurulum)
- [Environment Değişkenleri](#environment-degiskenleri)
- [Proje Yapısı](#proje-yapisi)
- [Veri Modelleri](#veri-modelleri)
- [API Referansı](#api-referansi)
- [Hooks](#hooks)
- [Kullanım](#kullanim)
- [Kiosk Modu](#kiosk-modu)
- [Admin Paneli](#admin-paneli)
- [PWA Özellikleri](#pwa-ozellikleri)
- [Güvenlik](#guvenlik)
- [Dağıtım](#dagitim)
- [Sorun Giderme](#sorun-giderme)

---

## Proje Hakkında

**Toponus**, Signolog tarafından geliştirilen, kapalı mekanlarda navigasyon sağlayan akıllı bir web uygulamasıdır. OpenAI ile entegre sesli asistan, Dijkstra algoritması ile en kısa yol hesaplama, çok katlı harita desteği ve kapsamlı mekan yönetimi özellikleri sunar.

### Temel Özellikler:
- **Sesli Navigasyon**: Doğal dil işleme ile "Starbucks'a nasıl giderim?" gibi sorulara yanıt
- **Çok Katlı Haritalar**: GeoJSON formatında kat planları
- **PWA Desteği**: Çevrimdışı çalışabilme ve mobil kurulum
- **Mekan Yönetimi**: Admin paneli ile mağaza, kampanya ve içerik yönetimi
- **Kiosk Modu**: AVM'lerde kullanılmak üzere özel bilgi kiosk arayüzü

---

## Özellikler

### Akıllı Navigasyon Sistemi

| Özellik | Açıklama |
|---------|----------|
| **Dijkstra Algoritması** | En kısa yol hesaplama ile optimum rota belirleme |
| **Gelişmiş Rotalama** | `advancedRouting.js` ile çoklu kat geçişi ve asansör/yürüyen merdiven desteği |
| **Gerçek Zamanlı Güncelleme** | Kullanıcı konumuna göre dinamik rota güncelleme |
| **Özel Lokasyonlar** | Tuvalet, ATM, acil çıkış, engelli rampaları gibi önemli noktalar |
| **Kat Değiştirme** | "Alt kata indim" gibi sesli komutlarla kat güncellemesi |

### Sesli Etkileşim ve AI

| Özellik | Açıklama |
|---------|----------|
| **OpenAI Entegrasyonu** | GPT modeli ile doğal dil anlama ve yanıt üretme |
| **VAD (Voice Activity Detection)** | `@ricky0123/vad-web` ile gerçek zamanlı ses algılama |
| **Web Speech API** | Tarayıcı tabanlı ses tanıma desteği |
| **iOS Safari Uyumluluğu** | Özel `useSafariVoice.js` hook'u ile Safari desteği |
| **Çoklu Dil Desteği** | Türkçe, İngilizce, Almanca dil seçenekleri |

### Mekan ve İçerik Yönetimi

| Özellik | Açıklama |
|---------|----------|
| **Çoklu Rol Sistemi** | Admin, mekan sahibi, mağaza sahibi, temel/gelişmiş kullanıcı rolleri |
| **Kampanya Yönetimi** | İndirim, promosyon ve ürün kampanyaları oluşturma |
| **Mağaza Profilleri** | Logo, açıklama, iletişim bilgileri, sosyal medya hesapları |
| **Etkinlik Yönetimi** | Mekan etkinliklerinin planlanması ve yayınlanması |
| **Değerlendirme Sistemi** | Mağaza puanlama ve yorum özellikleri |

### Kiosk Modu

AVM'lerde bulunan bilgi kioskları için özel arayüz:

- **Ana Sayfa**: AVM bilgileri, popüler mağazalar, güncel kampanyalar
- **Kategoriler**: Mağaza kategorilerine göre filtreleme
- **Harita Görünümü**: Etkileşimli kat haritaları
- **AI Asistan**: Sesli sorgu desteği
- **Selfie Noktası**: Ziyaretçiler için fotoğraf çekimi
- **Etkinlikler**: AVM etkinlikleri listesi
- **İndirimler**: Güncel kampanya ve fırsatlar

### PWA Özellikleri

- **Çevrimdışı Çalışma**: Service Worker ile önbellek yönetimi
- **Mobil Kurulum**: iOS ve Android cihazlara kurulum desteği
- **Push Bildirimler**: Kampanya ve güncellemelerden haberdar olma
- **Hızlı Yükleme**: Optimize edilmiş kaynak önbellekleme

---

## Teknoloji Yığını

### Frontend
| Teknoloji | Sürüm | Açıklama |
|-----------|-------|----------|
| **Next.js** | 13.5.1 | React tabanlı full-stack framework |
| **React** | 18.2.0 | UI kütüphanesi |
| **TypeScript** | 5.2.2 | Tip güvenli JavaScript |
| **Tailwind CSS** | 3.3.3 | Utility-first CSS framework |
| **MapLibre GL** | 5.12.0 | Açık kaynak harita görselleştirme |
| **Radix UI** | çeşitli | Erişilebilir UI bileşenleri |
| **Recharts** | 2.12.7 | Grafik ve veri görselleştirme |
| **Three.js** | 0.181.1 | 3D harita desteği |

### Backend
| Teknoloji | Sürüm | Açıklama |
|-----------|-------|----------|
| **MongoDB** | 6.x | NoSQL veritabanı |
| **Mongoose** | 8.19.1 | MongoDB ODM |
| **JWT** | 9.0.2 | Token tabanlı kimlik doğrulama |
| **bcryptjs** | 3.0.2 | Şifre hashleme |

### AI ve Ses
| Teknoloji | Sürüm | Açıklama |
|-----------|-------|----------|
| **OpenAI API** | - | GPT modeli ile doğal dil işleme |
| **@ricky0123/vad-web** | 0.0.28 | Ses aktivite algılama |
| **Web Speech API** | - | Tarayıcı tabanlı ses tanıma |
| **ONNX Runtime** | 1.14.0 | AI model çalıştırma |

### Diğer
| Teknoloji | Açıklama |
|-----------|----------|
| **next-pwa** | Progressive Web App desteği |
| **Zustand** | State management |
| **React Hook Form** | Form yönetimi |
| **Zod** | Schema validation |
| **QRCode.react** | QR kod oluşturma |
| **GSAP** | Animasyonlar |

---

## Kurulum

### Ön Gereksinimler

- **Node.js** 18.x
- **npm** 9.x
- **MongoDB** 6.x veya MongoDB Atlas hesabı
- **OpenAI API anahtarı**

### Adım Adım Kurulum

1. **Repoyu klonlayın:**
   ```bash
   git clone https://github.com/signolog/toponus.git
   cd toponus
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment dosyasını oluşturun:**
   ```bash
   cp .env.example .env.local
   ```

4. **Environment değişkenlerini düzenleyin** (aşağıdaki bölüme bakın)

5. **Veritabanını hazırlayın:**
   ```bash
   # Test verilerini yüklemek için
   node scripts/migrateToMongoDB.js
   
   # Test kullanıcısı oluşturmak için
   node scripts/createTestUser.js
   ```

6. **Geliştirme sunucusunu başlatın:**
   ```bash
   # Normal başlatma
   npm run dev
   
   # LAN üzerinden erişim için
   npm run dev:lan
   ```

7. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

### Üretim Build

```bash
# Build oluşturma
npm run build

# Üretim sunucusunu başlatma
npm start
```

---

## Environment Değişkenleri

`.env.local` dosyasında aşağıdaki değişkenlerin tanımlı olması gerekir:

### Zorunlu Değişkenler

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `JWT_SECRET` | JWT token imzalama için secret key (min. 16 karakter) | `your_super_secure_jwt_secret_key_here` |
| `MONGODB_URI` | MongoDB bağlantı string'i | `mongodb://localhost:27017/toponus` |
| `OPENAI_API_KEY` | OpenAI API anahtarı | `sk-your-openai-api-key-here` |

### Opsiyonel Değişkenler

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `NEXT_PUBLIC_APP_URL` | Uygulamanın public URL'i | `http://localhost:3000` |
| `NODE_ENV` | Çalışma ortamı | `development` |

### Örnek .env.local

```bash
# JWT Secret - Güvenlik için zorunlu
JWT_SECRET=toponus_super_secure_secret_key_2024_version

# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toponus?retryWrites=true&w=majority

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Public URL (production için)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Proje Yapısı

```
toponus/
├── app/                             # Next.js App Router
│   ├── admin/                       # Admin panel sayfaları
│   │   ├── analytics/               # Analitik dashboard
│   │   ├── campaigns/               # Kampanya yönetimi
│   │   ├── kiosk-detail/            # Kiosk detay yönetimi
│   │   ├── kiosk-screen/            # Kiosk ekran yönetimi
│   │   ├── locations/               # Lokasyon yönetimi
│   │   ├── login/                   # Admin giriş
│   │   ├── places/                  # Mekan yönetimi
│   │   ├── reviews/                 # Değerlendirme yönetimi
│   │   ├── rooms/                   # Oda/mağaza yönetimi
│   │   ├── security/                # Güvenlik ayarları
│   │   ├── settings/                # Sistem ayarları
│   │   ├── sport-stores/            # Spor mağazaları
│   │   ├── users/                   # Kullanıcı yönetimi
│   │   └── page.jsx                 # Admin ana sayfa
│   │
│   ├── api/                         # API Route Handlers
│   │   ├── admin/                   # Admin API'ları
│   │   │   ├── campaigns/           # Kampanya CRUD
│   │   │   ├── places/              # Mekan CRUD
│   │   │   ├── rooms/               # Oda/mağaza CRUD
│   │   │   ├── stats/               # İstatistikler
│   │   │   └── users/               # Kullanıcı yönetimi
│   │   ├── auth/                    # Kimlik doğrulama
│   │   │   ├── login/               # Giriş
│   │   │   ├── logout/              # Çıkış
│   │   │   ├── me/                  # Mevcut kullanıcı
│   │   │   └── register/            # Kayıt
│   │   ├── chat/                    # AI sohbet API
│   │   ├── favorites/               # Favoriler API
│   │   ├── geojson/                 # Harita verileri
│   │   ├── kiosk/                   # Kiosk API'ları
│   │   ├── mall-info/               # AVM bilgileri
│   │   ├── places/                  # Mekan API
│   │   ├── popular-stores/          # Popüler mağazalar
│   │   ├── ratings/                 # Değerlendirmeler
│   │   ├── reviews/                 # Yorumlar
│   │   └── rooms/                   # Oda/mağaza API
│   │
│   ├── ankamall/                    # AnkaMall özel sayfası
│   ├── emergency/                   # Acil durum sayfası
│   ├── entry/                       # Giriş sayfası
│   ├── favorites/                   # Favoriler sayfası
│   ├── kiosk/                       # Kiosk modu sayfaları
│   │   ├── ai/                      # AI asistan
│   │   ├── avm/                     # AVM bilgileri
│   │   ├── categories/              # Kategoriler
│   │   ├── discount/                # İndirimler
│   │   ├── discover/                # Keşfet
│   │   ├── events/                  # Etkinlikler
│   │   ├── location/                # Lokasyon
│   │   ├── maps/                    # Haritalar
│   │   ├── product/                 # Ürünler
│   │   ├── selfie/                  # Selfie noktası
│   │   ├── stores/                  # Mağazalar
│   │   └── page.jsx                 # Kiosk ana sayfa
│   │
│   ├── profile/                     # Kullanıcı profili
│   ├── qr-generator/                # QR kod oluşturucu
│   ├── globals.css                  # Global stiller
│   ├── layout.tsx                   # Ana layout
│   └── page.jsx                     # Ana sayfa (harita)
│
├── components/                      # React bileşenleri
│   ├── admin/                       # Admin panel bileşenleri
│   │   ├── campaigns/               # Kampanya bileşenleri
│   │   ├── places/                  # Mekan bileşenleri
│   │   ├── rooms/                   # Oda bileşenleri
│   │   └── users/                   # Kullanıcı bileşenleri
│   ├── Assistant/                   # AI asistan bileşenleri
│   ├── Discover/                    # Keşfet bileşenleri
│   ├── Kiosk/                       # Kiosk bileşenleri
│   ├── Map/                         # Harita bileşenleri
│   ├── Navigation/                  # Navigasyon bileşenleri
│   ├── Profile/                     # Profil bileşenleri
│   ├── Rating/                      # Değerlendirme bileşenleri
│   ├── Route/                       # Rota bileşenleri
│   ├── Search/                      # Arama bileşenleri
│   ├── Store/                       # Mağaza bileşenleri
│   ├── UI/                          # Temel UI bileşenleri
│   ├── AssistantModal.jsx           # AI asistan modal
│   ├── DiscoverModal.jsx            # Keşfet modal
│   ├── LanguageSelector.jsx         # Dil seçici
│   ├── PWAInstallPrompt.jsx         # PWA kurulum prompt
│   ├── QuickAccessButtons.jsx       # Hızlı erişim butonları
│   ├── SimpleMicrophoneButton.jsx   # Basit mikrofon butonu
│   └── VoiceMicrophoneButton.jsx    # Gelişmiş mikrofon butonu
│
├── contexts/                        # React Context'ler
│   └── ...
│
├── hooks/                           # Custom React Hooks
│   ├── useAuth.js                   # Kimlik doğrulama
│   ├── useChatApi.js                # AI sohbet API
│   ├── useChatManagement.js         # Sohbet yönetimi
│   ├── useFloorManagement.js        # Kat yönetimi
│   ├── useGraphBuilder.js           # Graf oluşturma
│   ├── useIOSVoiceRecorder.js       # iOS ses kayıt
│   ├── useLocationDetection.js      # Konum algılama
│   ├── useMapNavigation.js          # Harita navigasyonu
│   ├── useMapSetup.js               # Harita kurulumu
│   ├── useNotifications.js          # Bildirimler
│   ├── usePathDrawing.js            # Rota çizimi
│   ├── usePlatformVoice.js          # Platform ses desteği
│   ├── useQRProcessing.js           # QR kod işleme
│   ├── useRouteActions.js           # Rota aksiyonları
│   ├── useRouteAnimation.js         # Rota animasyonu
│   ├── useRouteCalculation.js       # Rota hesaplama
│   ├── useRouteManagement.js        # Rota yönetimi
│   ├── useSafariVoice.js            # Safari ses desteği
│   ├── useSearch.js                 # Arama işlevleri
│   ├── useSearchHandlers.js         # Arama handler'ları
│   ├── useSimpleVoice.js            # Basit ses
│   ├── useUIState.js                # UI durumu
│   ├── useVoiceRecorder.js          # Ses kayıt
│   └── useWebSpeechRecognition.js   # Web Speech API
│
├── lib/                             # Kütüphane yardımcıları
│   ├── mongodb.js                   # MongoDB bağlantısı
│   └── utils.js                     # Genel yardımcılar
│
├── models/                          # Mongoose modelleri
│   ├── KioskContent.js              # Kiosk içeriği
│   ├── Place.js                     # Mekan modeli
│   ├── Room.js                      # Oda/mağaza modeli
│   ├── User.js                      # Kullanıcı modeli
│   ├── UserSavm.js                  # Kullanıcı AVM ilişkisi
│   └── Visit.js                     # Ziyaret modeli
│
├── public/                          # Statik dosyalar
│   ├── assets/                      # Görseller, ikonlar
│   ├── icons/                       # PWA ikonları
│   ├── manifest.json                # PWA manifest
│   └── sw.js                        # Service Worker
│
├── scripts/                         # Yardımcı scriptler
│   ├── addRoomTypeProperty.js       # Oda tipi ekleme
│   ├── createTestUser.js            # Test kullanıcısı
│   ├── generate-icons.js            # İkon oluşturma
│   ├── importRoomsFromBase.js       # Oda import
│   ├── migrateReviews.js            # Yorum migrasyonu
│   └── migrateToMongoDB.js          # MongoDB migrasyonu
│
├── types/                           # TypeScript tipleri
│   └── index.ts
│
├── utils/                           # Yardımcı fonksiyonlar
│   ├── advancedRouting.js           # Gelişmiş rotalama
│   ├── auth.js                      # Kimlik doğrulama
│   ├── chatHandlers.js              # Chat handler'ları
│   ├── dijkstra.js                  # Dijkstra algoritması
│   ├── functionCallHandler.js       # Fonksiyon çağrı işleme
│   ├── icons.js                     # İkon yardımcıları
│   ├── locationHelpers.js           # Konum yardımcıları
│   ├── logger.js                    # Loglama
│   ├── mapHelpers.js                # Harita yardımcıları
│   ├── mapPageHelpers.js            # Sayfa yardımcıları
│   ├── markerHelpers.js             # Marker yardımcıları
│   ├── notifications.js             # Bildirim yardımcıları
│   ├── roomHelpers.js               # Oda yardımcıları
│   ├── routeHelpers.js              # Rota yardımcıları
│   ├── translations.js              # Çeviriler
│   └── utils.js                     # Genel yardımcılar
│
├── .env.example                     # Örnek env dosyası
├── .env.local                       # Lokal environment
├── middleware.js                    # Next.js middleware
├── next.config.js                   # Next.js konfigürasyonu
├── package.json                     # Bağımlılıklar
├── tailwind.config.ts               # Tailwind konfigürasyonu
└── tsconfig.json                    # TypeScript konfigürasyonu
```

---

## Veri Modelleri

### User (Kullanıcı)

```javascript
{
  username: String,          // Benzersiz kullanıcı adı
  password: String,          // Hash'lenmiş şifre (bcrypt)
  email: String,             // Email adresi
  phone: String,             // Telefon numarası
  displayName: String,       // Görünen isim
  role: String,              // "admin" | "place_owner" | "store_owner" | "basic_user" | "advanced_user"
  
  // Aktivite takibi
  visitedStores: [{
    storeId: String,
    storeName: String,
    visitDate: Date
  }],
  favoriteStores: [{
    storeId: String,
    storeName: String,
    addedDate: Date
  }],
  favoriteCampaigns: [{
    campaignId: String,
    campaignTitle: String,
    addedDate: Date
  }],
  
  // Rol-spesifik alanlar
  place_id: ObjectId,        // Mekan sahibi için
  store_id: String,          // Mağaza sahibi için (room-157 formatı)
  
  last_login: Date,
  is_active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Place (Mekan)

```javascript
{
  name: String,              // Mekan adı
  slug: String,              // URL-friendly isim
  legacy_id: String,         // Eski sistem ID'si
  
  center: {
    type: "Point",
    coordinates: [Number, Number]  // [longitude, latitude]
  },
  
  zoom: Number,              // Varsayılan harita zoom seviyesi
  status: String,            // "draft" | "published"
  
  floors: Map,               // Kat numarası -> GeoJSON dosya yolu
  floor_photos: Map,         // Kat numarası -> Fotoğraf yolu
  
  content: {
    description: String,
    header_image: String,
    logo: String,
    gallery: [String],
    working_hours: {
      monday: { open: String, close: String, closed: Boolean },
      // ... diğer günler
    },
    contact: {
      phone: String,
      email: String,
      website: String,
      address: String
    },
    amenities: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Room (Oda/Mağaza)

```javascript
{
  room_id: String,           // Oda tanımlayıcısı
  place_id: ObjectId,        // Bağlı olduğu mekan
  floor: Number,             // Kat numarası
  name: String,              // Oda/mağaza adı
  
  geometry: {
    type: String,            // "Polygon" | "Point" | "LineString"
    coordinates: Mixed       // GeoJSON koordinatları
  },
  
  content: {
    type: String,            // GeoJSON tipi
    category: String,        // Kategori
    subtype: String,         // Alt tip
    icon: String,            // İkon adı
    is_special: Boolean,     // Özel lokasyon mu
    special_type: String,    // Özel tip (wc, atm, exit vb.)
    status: String,
    phone: String,
    hours: String,
    promotion: String,
    
    description: String,
    header_image: String,
    logo: String,
    website: String,
    email: String,
    instagram: String,
    twitter: String,
    services: String,        // Virgülle ayrılmış
    tags: String,            // Virgülle ayrılmış
    
    // Ürünler
    products: [{
      id: String,
      title: String,
      description: String,
      price: Number,
      image: String,
      isActive: Boolean,
      createdAt: Date
    }],
    
    // Etkinlikler
    events: [{
      id: String,
      title: String,
      description: String,
      startDate: Date,
      endDate: Date,
      image: String,
      isActive: Boolean,
      createdAt: Date
    }],
    
    // İndirimler
    discounts: [{
      id: String,
      title: String,
      description: String,
      discount: Number,
      oldPrice: Number,
      newPrice: Number,
      image: String,
      isActive: Boolean,
      createdAt: Date
    }],
    
    // Kampanyalar
    campaigns: [{
      title: String,
      description: String,
      discount_percentage: Number,
      discount_amount: Number,
      start_date: Date,
      end_date: Date,
      image: String,
      is_active: Boolean,
      created_at: Date,
      updated_at: Date
    }],
    
    // Popüler yerler kampanyası
    popular_campaign: {
      is_active: Boolean,
      start_date: Date,
      end_date: Date,
      duration: Number
    },
    
    // Ürün kampanyaları
    product_campaigns: [{
      product_name: String,
      description: String,
      original_price: Number,
      discounted_price: Number,
      discount_percentage: Number,
      image: String,
      is_active: Boolean,
      created_at: Date,
      updated_at: Date
    }]
  },
  
  last_synced: Date,
  needs_sync: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Referansı

### Kimlik Doğrulama

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/auth/login` | POST | Kullanıcı girişi |
| `/api/auth/logout` | POST | Kullanıcı çıkışı |
| `/api/auth/register` | POST | Yeni kullanıcı kaydı |
| `/api/auth/me` | GET | Mevcut kullanıcı bilgisi |

### AI Chat

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/chat` | POST | AI asistana mesaj gönderme |

**İstek Gövdesi:**
```json
{
  "message": "Starbucks'a nasıl giderim?",
  "currentFloor": 1,
  "userLocation": { "x": 100, "y": 200 }
}
```

### Mekan API

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/places` | GET | Tüm mekanları listele |
| `/api/places/[id]` | GET | Tek mekan detayı |
| `/api/geojson` | GET | Harita GeoJSON verisi |
| `/api/mall-info` | GET | AVM bilgileri |

### Oda/Mağaza API

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/rooms` | GET | Tüm odaları listele |
| `/api/rooms/[id]` | GET | Tek oda detayı |
| `/api/popular-stores` | GET | Popüler mağazalar |
| `/api/sport-stores` | GET | Spor mağazaları |

### Admin API

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/admin/users` | GET/POST | Kullanıcı yönetimi |
| `/api/admin/places` | GET/POST | Mekan yönetimi |
| `/api/admin/rooms` | GET/POST/PUT | Oda yönetimi |
| `/api/admin/campaigns` | GET/POST/PUT | Kampanya yönetimi |
| `/api/admin/stats` | GET | İstatistikler |

### Kiosk API

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/kiosk` | GET | Kiosk içeriği |
| `/api/kiosk/events` | GET | Kiosk etkinlikleri |
| `/api/kiosk/discounts` | GET | Kiosk indirimleri |
| `/api/kiosk-content` | GET/POST | Kiosk içerik yönetimi |

### Diğer API'lar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/favorites` | GET/POST/DELETE | Favori yönetimi |
| `/api/ratings` | GET/POST | Değerlendirmeler |
| `/api/reviews` | GET/POST | Yorumlar |
| `/api/user` | GET/PUT | Kullanıcı profili |

---

## Hooks

### Navigasyon Hooks

| Hook | Açıklama |
|------|----------|
| `useMapNavigation` | Harita navigasyon işlemleri, kat değiştirme |
| `useRouteCalculation` | Dijkstra ile rota hesaplama |
| `useRouteAnimation` | Rota animasyonu gösterimi |
| `usePathDrawing` | Harita üzerinde yol çizimi |
| `useFloorManagement` | Kat yönetimi ve geçişleri |
| `useGraphBuilder` | Navigasyon grafı oluşturma |

### Ses Hooks

| Hook | Açıklama |
|------|----------|
| `useVoiceRecorder` | Genel ses kayıt hook'u |
| `useSafariVoice` | Safari özel ses desteği |
| `useIOSVoiceRecorder` | iOS cihazlar için ses kayıt |
| `useSimpleVoice` | Basitleştirilmiş ses arayüzü |
| `useWebSpeechRecognition` | Web Speech API entegrasyonu |
| `usePlatformVoice` | Platform bağımsız ses yönetimi |

### UI Hooks

| Hook | Açıklama |
|------|----------|
| `useUIState` | Genel UI durumu yönetimi |
| `useSearch` | Arama işlevleri ve sonuçları |
| `useSearchHandlers` | Arama event handler'ları |
| `useNotifications` | Bildirim yönetimi |

### Veri Hooks

| Hook | Açıklama |
|------|----------|
| `useAuth` | Kimlik doğrulama durumu |
| `useChatApi` | AI sohbet API iletişimi |
| `useChatManagement` | Sohbet geçmişi yönetimi |
| `useLocationDetection` | Kullanıcı konumu algılama |
| `useQRProcessing` | QR kod okuma ve işleme |
| `useRouteActions` | Rota aksiyon yönetimi |
| `useRouteManagement` | Genel rota yönetimi |

---

## Kullanım

### Temel Navigasyon

1. **Sesli Sorgu**: Mikrofon butonuna tıklayarak "X mağazasına nasıl giderim?" diye sorun
2. **Yazılı Sorgu**: Arama kutusuna mağaza veya konum adı yazın
3. **Harita Etkileşimi**: Harita üzerinde herhangi bir konuma tıklayarak detayları görün

### Sesli Komut Örnekleri

```
"Starbucks'a nasıl giderim?"
"En yakın tuvalet nerede?"
"ATM arıyorum"
"Acil çıkış nerede?"
"Alt kata indim"
"Üst kata çıktım"
"Spor mağazaları nerede?"
"Restoran önerir misin?"
```

### Özel Lokasyonlar

| Sembol | Lokasyon Tipi |
|--------|---------------|
| WC | Tuvalet |
| ATM | ATM |
| EXIT | Acil çıkış |
| ACC | Engelli erişim |
| LIFT | Asansör |
| ESC | Yürüyen merdiven |
| INFO | Danışma |
| PARK | Otopark |

### Kat Değiştirme

Sesli komutlarla veya harita üzerindeki kat seçicisi ile katlar arasında geçiş yapabilirsiniz:
- "Alt kata indim" / "Üst kata çıktım"
- Kat numarasını söyleyerek: "1. kata git"

---

## Kiosk Modu

AVM'lerde kullanılmak üzere özel bilgi kiosk arayüzü.

### Kiosk Sayfaları

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/kiosk` | AVM genel bilgileri ve menü |
| AI Asistan | `/kiosk/ai` | Sesli sorgu arayüzü |
| AVM Bilgisi | `/kiosk/avm` | AVM detaylı bilgiler |
| Kategoriler | `/kiosk/categories` | Mağaza kategorileri |
| İndirimler | `/kiosk/discount` | Güncel kampanyalar |
| Keşfet | `/kiosk/discover` | Popüler mağazalar |
| Etkinlikler | `/kiosk/events` | AVM etkinlikleri |
| Konum | `/kiosk/location` | Mevcut konum |
| Haritalar | `/kiosk/maps` | Kat haritaları |
| Ürünler | `/kiosk/product` | Ürün detayları |
| Selfie | `/kiosk/selfie` | Fotoğraf çekimi |
| Mağazalar | `/kiosk/stores` | Mağaza listesi |

### Kiosk Özellikleri

- **Dokunmatik Optimize**: Büyük butonlar ve kolay navigasyon
- **Sesli Yönlendirme**: AI asistan ile sesli etkileşim
- **Anlık Güncelleme**: Kampanya ve etkinlik güncellemeleri
- **QR Kod**: Ziyaretçilerin telefonlarına rota gönderme
- **Çoklu Dil**: Türkçe, İngilizce, Almanca desteği

---

## Admin Paneli

Admin paneli `/admin` URL'inde bulunur ve yetkilendirme gerektirir.

### Admin Modülleri

| Modül | URL | Açıklama |
|-------|-----|----------|
| Dashboard | `/admin` | Genel istatistikler |
| Kullanıcılar | `/admin/users` | Kullanıcı yönetimi |
| Mekanlar | `/admin/places` | Mekan/AVM yönetimi |
| Odalar | `/admin/rooms` | Mağaza/oda yönetimi |
| Kampanyalar | `/admin/campaigns` | Kampanya yönetimi |
| Yorumlar | `/admin/reviews` | Değerlendirme yönetimi |
| Analitik | `/admin/analytics` | Detaylı analizler |
| Kiosk Ekran | `/admin/kiosk-screen` | Kiosk içerik yönetimi |
| Ayarlar | `/admin/settings` | Sistem ayarları |
| Güvenlik | `/admin/security` | Güvenlik ayarları |

### Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| `admin` | Tam erişim, tüm mekan ve kullanıcıları yönetebilir |
| `place_owner` | Kendi mekanını ve mağazalarını yönetebilir |
| `store_owner` | Sadece kendi mağazasını yönetebilir |
| `advanced_user` | Gelişmiş kullanıcı özellikleri |
| `basic_user` | Temel kullanıcı özellikleri |

### Admin Giriş

```
URL: /admin/login
Varsayılan test kullanıcısı:
- Kullanıcı adı: admin
- Şifre: (scripts/createTestUser.js ile oluşturun)
```

---

## PWA Özellikleri

### Service Worker Özellikleri

- **Google Fonts Cache**: 365 gün önbellek
- **Statik Dosyalar**: Görüntü, font, JS, CSS önbellekleme
- **API Cache**: NetworkFirst stratejisi
- **Offline Desteği**: Temel sayfalar çevrimdışı erişilebilir

### Önbellek Stratejileri

| Kaynak Tipi | Strateji | TTL |
|-------------|----------|-----|
| Google Fonts | CacheFirst | 365 gün |
| Görseller | StaleWhileRevalidate | 24 saat |
| JavaScript | StaleWhileRevalidate | 24 saat |
| CSS | StaleWhileRevalidate | 24 saat |
| API | NetworkFirst | - |
| Diğer | NetworkFirst | 24 saat |

### PWA Kurulum

iOS ve Android cihazlarda "Ana Ekrana Ekle" seçeneği ile uygulama kurulabilir. `PWAInstallPrompt.jsx` bileşeni kullanıcıyı kuruluma yönlendirir.

---

## Güvenlik

### Güvenlik Önlemleri

| Önlem | Uygulama |
|-------|----------|
| **Şifre Hashleme** | bcryptjs ile salt+hash |
| **JWT Doğrulama** | Token tabanlı oturum yönetimi |
| **CORS Koruması** | Sadece izinli originler |
| **Rate Limiting** | API isteklerinde limit |
| **Input Validation** | Zod ile şema doğrulama |
| **Cookie Güvenliği** | HttpOnly, Secure, SameSite |

### Önemli Güvenlik Notları

> **UYARI**:
> - `JWT_SECRET` en az 32 karakter uzunluğunda güçlü bir secret olmalıdır
> - `OPENAI_API_KEY` asla client tarafında expose edilmemelidir
> - `.env.local` dosyası asla git'e commit edilmemelidir
> - Production'da HTTPS kullanılmalıdır

### Middleware Koruması

`middleware.js` dosyası şu korumaları sağlar:
- Admin rotaları için yetkilendirme kontrolü
- Cache-busting headers
- Slug tabanlı yönlendirme

---

## Dağıtım

### DigitalOcean App Platform

1. **Yeni App oluşturun** ve GitHub reposunu bağlayın

2. **Environment variables** ekleyin:
   ```
   JWT_SECRET=your_production_secret
   MONGODB_URI=mongodb+srv://...
   OPENAI_API_KEY=sk-...
   NEXT_PUBLIC_APP_URL=https://your-app.ondigitalocean.app
   ```

3. **Build komutu**:
   ```bash
   npm run build
   ```

4. **Run komutu**:
   ```bash
   npm start
   ```

### Docker ile Dağıtım

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel ile Dağıtım

1. Vercel hesabınızla GitHub reposunu bağlayın
2. Environment variables'ları ayarlayın
3. Deploy butonuna tıklayın

---

## Sorun Giderme

### Yaygın Sorunlar

#### MongoDB Bağlantı Hatası
```
Error: MongoNetworkError: failed to connect to server
```
**Çözüm**: 
- `MONGODB_URI` değerini kontrol edin
- MongoDB servisinin çalıştığından emin olun
- IP whitelist ayarlarını kontrol edin (Atlas için)

#### JWT Authentication Hatası
```
Error: jwt malformed
```
**Çözüm**:
- `JWT_SECRET` değerinin doğru ayarlandığından emin olun
- Tarayıcı cookie'lerini temizleyin
- Yeniden giriş yapın

#### OpenAI API Hatası
```
Error: Invalid API key
```
**Çözüm**:
- `OPENAI_API_KEY` değerini kontrol edin
- API key'in aktif olduğundan emin olun
- OpenAI hesabınızda bakiye olduğunu kontrol edin

#### Build Hatası
```
Error: FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed
```
**Çözüm**:
```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

#### Voice Recognition Çalışmıyor
**iOS Safari için**:
- Settings > Safari > Microphone izni verin
- HTTPS üzerinden eriştiğinizden emin olun

**Chrome için**:
- Site izinlerinden mikrofon erişimi verin
- `chrome://flags` altında Web Speech API'yi etkinleştirin

### Debug Modu

```bash
# Debug logları ile başlatma
DEBUG=* npm run dev

# Sadece MongoDB logları
DEBUG=mongodb* npm run dev
```

### Log Dosyaları

```javascript
// utils/logger.js kullanımı
import { log } from '@/utils/logger';

log.info('Info mesajı');
log.error('Hata mesajı');
log.debug('Debug mesajı');
```

---

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Kod Standartları

- ESLint kurallarına uyun
- TypeScript tiplerini kullanın
- Commit mesajlarında conventional commits kullanın
- Her PR için test yazın

---

## Lisans

Bu proje **ISC** lisansı altında lisanslanmıştır.

---

## Ekip

**Signolog** tarafından geliştirilmiştir.

- **Geliştirici**: Ali Nahmet Tekin

---

## İletişim

- **Web**: [signolog.com](https://signolog.com)
- **Email**: info@signolog.com
- **GitHub**: [github.com/signolog](https://github.com/signolog)

---

## Hızlı Başlangıç Komutları

```bash
# Geliştirme
npm run dev                    # Normal başlatma
npm run dev:lan                # LAN erişimli başlatma (http://192.168.x.x:3000)

# Build & Production
npm run build                  # Production build
npm start                      # Production sunucu

# Scripts
node scripts/createTestUser.js      # Test kullanıcısı oluştur
node scripts/migrateToMongoDB.js    # Veri migrasyonu
node scripts/importRoomsFromBase.js # Oda import
```

---

<div align="center">

**Toponus ile kapalı mekanlarda kaybolmak artık geçmişte kalacak!**

</div>