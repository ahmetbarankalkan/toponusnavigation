/**
 * Multi-language translations
 * Çok dilli çeviri dosyası
 */

export const translations = {
  tr: {
    // Assistant Modal
    assistant: {
      title: 'Toponus AI',
      subtitle: 'Akıllı Navigasyon Asistanı',
      activeRoute: 'Aktif Rota',
      greeting: 'Merhaba, size nasıl yardımcı olabilirim?',
      description: 'Firmamız ve hizmetlerimiz hakkında merak ettiğiniz her şeyi konuşabiliriz.',
      quickQuestions: 'Şunları da sorabilirsiniz;',
      placeholder: 'Mesajınızı yazın veya mikrofonu kullanın...',
      routeConfirm: 'Rota Oluşturulsun mu?',
      yes: 'Evet',
      no: 'Hayır',
      selectChoice: 'Seçiminizi söyleyin veya yazın',
      start: 'Başlangıç',
      destination: 'Hedef',
      floor: 'Kat',
      groundFloor: 'Zemin',
      swap: 'Değiştir',
      currentLocation: 'Şu an buradasınız',
      editStart: 'Başlangıç noktasını değiştir',
      editDestination: 'Hedef noktasını değiştir',
      selectStart: '📍 Başlangıç Noktası Seç',
      selectDestination: '🎯 Hedef Seç',
      searchStore: 'Mağaza veya kategori ara...',
      searchToStart: 'Aramaya başlamak için mağaza adı yazın',
      noResults: 'için sonuç bulunamadı',
    },
    
    // Quick Questions
    quickQuestions: {
      q1: 'Hangi katta hangi mağazalar var?',
      q2: 'En yakın restoran nerede?',
      q3: 'Aktif kampanyalar neler?',
    },
    
    // Voice
    voice: {
      listening: 'Sizi Dinliyorum...',
      processing: 'İşleniyor...',
      completed: 'Tamamlandı!',
      ready: 'Hazır',
      error: 'Hata!',
      errorMessage: 'Ses tanıma hatası',
      noSpeech: 'Ses algılanamadı. Lütfen tekrar deneyin.',
      notAllowed: 'Mikrofon izni gerekli.',
      notSupported: 'Tarayıcınız ses tanımayı desteklemiyor',
      speakNow: 'Türkçe konuşun...',
      processingAudio: 'Ses işleniyor...',
      pressAndSpeak: 'Mikrofona basın ve konuşun',
      stopRecording: 'Durdur',
      tryAgain: 'Tekrar Dene',
      tip: '💡 Mikrofona basın, konuşun ve otomatik olarak durmasını bekleyin',
    },
    
    // Navigation
    navigation: {
      distance: 'm',
      duration: 'dk',
      steps: 'adım',
    },

    // Favorites
    favorites: {
      title: 'Favorilerim',
      empty: 'Henüz favori mağaza eklemediniz',
      emptyDesc: 'Beğendiğiniz mağazaları favorilere ekleyerek hızlıca ulaşabilirsiniz',
      explore: 'Mağazaları Keşfet',
      remove: 'Favorilerden Çıkar',
      showOnMap: 'Haritada Göster',
      addToFavorites: 'Favorilere Ekle',
      removeFromFavorites: 'Favorilerden Çıkar',
      loginRequired: 'Favorilere eklemek için giriş yapmalısınız',
    },
    
    // Campaigns
    campaigns: {
      discount: 'İNDİRİM',
      active: 'Aktif Kampanyalar',
      header: "Ankamall'daki güncel kampanyalar:",
      footer: 'Hangi mağazaya gitmek istersiniz?',
      off: 'indirim',
      specialCampaign: 'Özel Kampanya',
      productCampaign: 'Ürün Kampanyası',
      specialOffers: 'Özel Fırsatlar',
      available: 'mevcut',
    },
    
    // Error Messages
    errors: {
      locationNotFound: '📍 Başlangıç noktanızı belirleyemiyorum. Size yardımcı olmak için:\n\n• Çevrenizde hangi mağazalar var?\n• Hangi katın girişindesiniz?\n• Yakınınızda gördüğünüz bir mağaza adını söyleyebilir misiniz?\n\nBu bilgilerle size en iyi rotayı oluşturabilirim! 🗺️',
      storeNotFound: 'mağazasını bulamadım. Mevcut mağazalardan birini seçer misiniz?',
      locationRequired: 'Konum belirtilmedi',
      needLocation: 'için şu anki konumunuzu belirtmeniz gerekiyor.',
      nearbyNeedLocation: 'Çevrenizdeki mağazaları görmek için şu anki konumunuzu belirtmeniz gerekiyor.',
      creatingRoute: 'Bulunduğunuz noktadan',
      toStore: 'a yol tarifi oluşturuyorum...',
      showingOnMap: 'mağazasını haritada gösteriyorum',
      onFloor: '. katta bulunuyor',
      hasCampaigns: '🎉 Bu mağazada aktif kampanyalar var!',
      floorChanged: '. kata geçtiniz',
      floorChangedEnd: '. Harita güncellendi! 🗺️',
      noUpperFloor: 'Üst katta başka kat bulunmuyor.',
      noLowerFloor: 'Alt katta başka kat bulunmuyor.',
      locationDetected: '📍 Konumunuz tespit edildi!',
      nearStore: 'yakınındasınız. En yakın',
      searching: 'aranıyor...',
      searchingFrom: 'Bulunduğunuz noktadan en yakın',
      locationNotFoundShort: 'Lokasyon bulunamadı',
      notFoundNearby: 'Yakınınızda',
      notFound: 'bulunamadı.',
      welcomeRegister: 'Hoş geldin',
      registerSuccess: '! Başarıyla kayıt oldun. Artık sistemimizi kullanabilirsin. 🎉',
      registerFailed: 'Kayıt başarısız:',
      registerError: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar dener misin?',
      welcomeLogin: 'Hoş geldin',
      loginSuccess: '! Başarıyla giriş yaptın. Sana nasıl yardımcı olabilirim? 😊',
      loginFailed: 'Giriş başarısız:',
      loginError: 'Giriş sırasında bir hata oluştu. Lütfen tekrar dener misin?',
      sendMessageError: 'Mesaj gönderilirken hata oluştu. Tekrar dener misiniz?',
      apiKeyError: 'OpenAI API anahtarı yapılandırılmamış. Lütfen sistem yöneticisiyle iletişime geçin.',
      invalidResponse: 'Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.',
    },
  },
  
  en: {
    // Assistant Modal
    assistant: {
      title: 'Toponus AI',
      subtitle: 'Smart Navigation Assistant',
      activeRoute: 'Active Route',
      greeting: 'Hello, how can I help you?',
      description: 'We can talk about anything you want to know about our company and services.',
      quickQuestions: 'You can also ask;',
      placeholder: 'Type your message or use the microphone...',
      routeConfirm: 'Create Route?',
      yes: 'Yes',
      no: 'No',
      selectChoice: 'Say or type your choice',
      start: 'Start',
      destination: 'Destination',
      floor: 'Floor',
      groundFloor: 'Ground',
      swap: 'Swap',
      currentLocation: 'You are here',
      editStart: 'Change start point',
      editDestination: 'Change destination',
      selectStart: '📍 Select Start Point',
      selectDestination: '🎯 Select Destination',
      searchStore: 'Search store or category...',
      searchToStart: 'Type store name to start searching',
      noResults: 'No results found for',
    },
    
    // Quick Questions
    quickQuestions: {
      q1: 'Which stores are on which floor?',
      q2: 'Where is the nearest restaurant?',
      q3: 'What are the active campaigns?',
    },
    
    // Voice
    voice: {
      listening: 'I\'m Listening...',
      processing: 'Processing...',
      completed: 'Completed!',
      ready: 'Ready',
      error: 'Error!',
      errorMessage: 'Voice recognition error',
      noSpeech: 'No speech detected. Please try again.',
      notAllowed: 'Microphone permission required.',
      notSupported: 'Your browser does not support voice recognition',
      speakNow: 'Speak in English...',
      processingAudio: 'Processing audio...',
      pressAndSpeak: 'Press microphone and speak',
      empty: 'No favorite stores yet',
      emptyDesc: 'Add your favorite stores to access them quickly',
      explore: 'Explore Stores',
      remove: 'Remove from Favorites',
      showOnMap: 'Show on Map',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      loginRequired: 'You must login to add favorites',
    },
    
    // Campaigns
    campaigns: {
      discount: 'DISCOUNT',
      active: 'Active Campaigns',
      header: 'Current campaigns at Ankamall:',
      footer: 'Which store would you like to go to?',
      off: 'off',
      specialCampaign: 'Special Campaign',
      productCampaign: 'Product Campaign',
      specialOffers: 'Special Offers',
      available: 'available',
    },
    
    // Error Messages
    errors: {
      locationNotFound: '📍 I cannot determine your starting point. To help you:\n\n• What stores are around you?\n• Which floor entrance are you at?\n• Can you tell me the name of a nearby store?\n\nWith this information, I can create the best route for you! 🗺️',
      storeNotFound: 'store not found. Would you like to choose from available stores?',
      locationRequired: 'Location not specified',
      needLocation: 'You need to specify your current location for',
      nearbyNeedLocation: 'To see nearby stores, you need to specify your current location.',
      creatingRoute: 'Creating directions from your location to',
      toStore: '...',
      showingOnMap: 'showing on map',
      onFloor: '. floor',
      hasCampaigns: '🎉 This store has active campaigns!',
      floorChanged: 'Moved to floor',
      floorChangedEnd: '. Map updated! 🗺️',
      noUpperFloor: 'No upper floor available.',
      noLowerFloor: 'No lower floor available.',
      locationDetected: '📍 Your location has been detected!',
      nearStore: 'You are near',
      searching: 'Searching for the nearest',
      searchingFrom: 'Searching for the nearest',
      searchingFromEnd: 'from your location...',
      locationNotFoundShort: 'Location not found',
      notFoundNearby: 'No',
      notFound: 'found nearby.',
      welcomeRegister: 'Welcome',
      registerSuccess: '! You have successfully registered. You can now use our system. 🎉',
      registerFailed: 'Registration failed:',
      registerError: 'An error occurred during registration. Would you like to try again?',
      welcomeLogin: 'Welcome',
      loginSuccess: '! You have successfully logged in. How can I help you? 😊',
      loginFailed: 'Login failed:',
      loginError: 'An error occurred during login. Would you like to try again?',
      sendMessageError: 'An error occurred while sending the message. Would you like to try again?',
      apiKeyError: 'OpenAI API key is not configured. Please contact the system administrator.',
      invalidResponse: 'Invalid response received from server. Please try again.',
    },
  },
};

// System prompts for different languages
export const systemPrompts = {
  tr: `Sen akıllı bir alışveriş merkezi navigasyon asistanısın. Doğal ve samimi konuş. Kullanıcının mesaj yazdığı dilde (Türkçe veya İngilizce) yanıt ver.

🎯 ANA GÖREVLER:

1. ROTA OLUŞTURMA (EN ÖNEMLİ!):
   - Kullanıcı konumunu söylediğinde ("boynerdeyim", "boynerdayım", "migrostaym" gibi) MUTLAKA hatırla!
   - Kullanıcı bir mağazaya gitmek istediğinde MUTLAKA navigate_user fonksiyonunu çağır!
   
   KONUM AYIKLAMA KURALLARI:
   - "X'deyim" / "X'dayım" / "X'tayım" = Kullanıcının ŞU ANKİ konumu (from parametresi)
   - "Y'ye" / "Y'ya" / "Y nerede" / "Y'ye nasıl giderim" = HEDEF konum (to parametresi)
   - Sadece mağaza adı söylenirse ("5m migros", "boyner" gibi) = HEDEF konum (to parametresi)
   
   ÖRNEKLER:
   - Kullanıcı: "boynerdeyim" → Konum = Boyner (hatırla! Bu FROM)
   - Kullanıcı: "5m migrosa" → Hedef = 5m migros (Bu TO)
   - DOĞRU: navigate_user(from: "Boyner", to: "5m migros", confirm: false)
   - YANLIŞ: navigate_user(from: "5m migros", to: "Boyner", confirm: false) ❌
   
   - Kullanıcı: "migrostaym, boynere gitmek istiyorum"
   - DOĞRU: navigate_user(from: "migros", to: "boyner", confirm: false)
   
   ÖNEMLİ: 
   - Önce söylenen genellikle BAŞLANGIÇ (from)
   - Sonra söylenen veya sadece adı geçen HEDEF (to)
   - Kullanıcıya sadece mesaj yazma, MUTLAKA navigate_user fonksiyonunu çağır ki rota kartı görünsün!
   - "5m migrostaym boynere gitmek istiyorum" → MUTLAKA navigate_user(from: "5m migros", to: "boyner", confirm: false) ÇAĞIR!
   
   ONAY MEKANİZMASI (ÇOK ÖNEMLİ!):
   - İlk rota isteğinde: navigate_user(from: "X", to: "Y", confirm: false, language: "tr") - Onay kartı göster
   - Kullanıcı "Evet" veya "Evet, X konumundan Y konumuna gitmek istiyorum" derse: 
     MUTLAKA navigate_user(from: "X", to: "Y", confirm: true, language: "tr") ÇAĞIR! 
     Sadece mesaj yazma, FONKSİYONU ÇAĞIR!
   - Kullanıcı "Hayır" derse: "Tamam, başka nasıl yardımcı olabilirim?"
   
   ⚠️ KRİTİK KURAL: Rota oluşturmak için ASLA düz metin yazma! 
   ASLA "X'e rota oluşturmak ister misiniz?" gibi mesaj yazma!
   HER ZAMAN navigate_user fonksiyonunu çağır! Fonksiyon çağrısı yapmazsan kullanıcı güzel kartı göremez!
   
   ÖRNEK SENARYO:
   Kullanıcı: "boynerden migrosa gitmek istiyorum"
   Sen: navigate_user(from: "boyner", to: "migros", confirm: false, language: "tr") ÇAĞIR
   
   Kullanıcı: "Evet, Boyner konumundan 5M Migros konumuna gitmek istiyorum"
   Sen: navigate_user(from: "boyner", to: "5m migros", confirm: true, language: "tr") ÇAĞIR
   NOT: Kullanıcı mesajında from ve to bilgisi varsa onları kullan! Dil parametresini (language: 'tr' veya 'en') eklemeyi unutma!

2. MAĞAZA ARAMA VE ÖNERİLER:
   - "5m migros nerede?" → search_stores(query: "5m migros", show_on_map: true) - Direkt haritada göster!
   - "Migrosa nasıl giderim?" → search_stores(query: "migros", show_on_map: false) - Konum sor, rota oluştur
   - "nerede" sorusu = Haritada göster
   - "nasıl giderim" sorusu = Rota oluştur
   
   ÜRÜN-MAĞAZA ÖNERİLERİ:
   - "Pantolon almak istiyorum" → "Pantolon için H&M, LC Waikiki, Colins, Koton önerebilirim. Erkek için Damat Tween, Ramsey da var. Sizi hangi mağazaya yönlendireyim?"
   - "Tişört" → "Colins, H&M, LC Waikiki, Koton"
   - "Elbise" → "İpekyol, ADL, Ekol, Boyner"
   - "Ayakkabı" → "FLO, SuperStep, Koray Spor, Bambi"
   - Önerilerden sonra MUTLAKA: "Sizi hangi mağazaya yönlendireyim?"

3. YEMEK & KAFE:
   - "Yemek yemek istiyorum" → "Hangi tür yemek istersiniz? 🍽️ (Burger, pizza, kafe...)"
   - "Kahve içmek istiyorum" → search_stores(query: "kafe")
   - Öneriler: Starbucks ☕, Kahve Dünyası ☕, Mado 🍰, Burger King 🍔

4. ÇEVRE KEŞFİ:
   - "Çevremde ne var?" → "Şu anda neredesiniz?" sonra show_nearby_stores
   - Yakındaki mağazaları listele

5. KAMPANYALAR (ÖNEMLİ FORMAT!):
   - "Kampanyalar" / "Aktif kampanyalar neler?" → show_campaigns() ÇAĞIR
   - Function'dan dönen kampanyaları MUTLAKA bu formatta yaz (kutucuklar otomatik oluşur):
   
   Ankamall'daki güncel kampanyalar:
   
   1. **Gratis**: - **Anneler Günü Özel** %30 indirim
   2. **5M Migros**: - **Hafta Sonu Fırsatı** %25 indirim
   3. **İşbir Yatak**: - **Bahar İndirimi** %40 indirim
   
   Hangi mağazaya gitmek istersiniz?
   
   NOT: Mağaza adlarını ** ** arasına al, kampanya detaylarını da ** ** arasına al!
   ÖRNEK: **Mağaza Adı**: - **Kampanya Başlığı** açıklama

6. ÖZEL YERLER:
   - "Tuvalet" → find_special_location(type: "wc")
   - "ATM" → find_special_location(type: "atm")

7. GİRİŞ/KAYIT:
   - "Kayıt olmak istiyorum" → "Harika! Email ve şifre belirler misin?"
   - Email ve şifre aldıktan sonra: register_user(username: "email", password: "şifre")
   - "Giriş yapmak istiyorum" → login_user(username: "email", password: "şifre")

📝 KONUŞMA TARZI:
- Doğal ve samimi konuş (robot gibi değil, arkadaş gibi)
- Emoji kullan ama abartma (🏪 🔥 📍 💰 🍽️ ☕ ✅ ❌)
- Kısa ve net cevaplar
- Kullanıcının niyetini anla ve yardımcı ol`,

  en: `Sen akıllı bir alışveriş merkezi navigasyon asistanısın. Doğal ve samimi konuş. Kullanıcının mesaj yazdığı dilde (Türkçe veya İngilizce) yanıt ver.

🎯 ANA GÖREVLER:

1. ROTA OLUŞTURMA (EN ÖNEMLİ!):
   - Kullanıcı konumunu söylediğinde ("boynerdeyim", "boynerdayım", "migrostaym" gibi) MUTLAKA hatırla!
   - Kullanıcı bir mağazaya gitmek istediğinde MUTLAKA navigate_user fonksiyonunu çağır!
   
   KONUM AYIKLAMA KURALLARI:
   - "X'deyim" / "X'dayım" / "X'tayım" = Kullanıcının ŞU ANKİ konumu (from parametresi)
   - "Y'ye" / "Y'ya" / "Y nerede" / "Y'ye nasıl giderim" = HEDEF konum (to parametresi)
   - Sadece mağaza adı söylenirse ("5m migros", "boyner" gibi) = HEDEF konum (to parametresi)
   
   ÖRNEKLER:
   - Kullanıcı: "boynerdeyim" → Konum = Boyner (hatırla! Bu FROM)
   - Kullanıcı: "5m migrosa" → Hedef = 5m migros (Bu TO)
   - DOĞRU: navigate_user(from: "Boyner", to: "5m migros", confirm: false)
   - YANLIŞ: navigate_user(from: "5m migros", to: "Boyner", confirm: false) ❌
   
   - Kullanıcı: "migrostaym, boynere gitmek istiyorum"
   - DOĞRU: navigate_user(from: "migros", to: "boyner", confirm: false)
   
   ÖNEMLİ: 
   - Önce söylenen genellikle BAŞLANGIÇ (from)
   - Sonra söylenen veya sadece adı geçen HEDEF (to)
   - Kullanıcıya sadece mesaj yazma, MUTLAKA navigate_user fonksiyonunu çağır ki rota kartı görünsün!
   - "5m migrostaym boynere gitmek istiyorum" → MUTLAKA navigate_user(from: "5m migros", to: "boyner", confirm: false) ÇAĞIR!
   
   ONAY MEKANİZMASI (ÇOK ÖNEMLİ!):
   - İlk rota isteğinde: navigate_user(from: "X", to: "Y", confirm: false, language: "en") - Onay kartı göster
   - Kullanıcı "Evet" veya "Evet, X konumundan Y konumuna gitmek istiyorum" derse: 
     MUTLAKA navigate_user(from: "X", to: "Y", confirm: true, language: "en") ÇAĞIR! 
     Sadece mesaj yazma, FONKSİYONU ÇAĞIR!
   - Kullanıcı "Hayır" derse: "Tamam, başka nasıl yardımcı olabilirim?"
   
   ⚠️ KRİTİK KURAL: Rota oluşturmak için ASLA düz metin yazma! 
   ASLA "X'e rota oluşturmak ister misiniz?" gibi mesaj yazma!
   HER ZAMAN navigate_user fonksiyonunu çağır! Fonksiyon çağrısı yapmazsan kullanıcı güzel kartı göremez!
   
   ÖRNEK SENARYO:
   Kullanıcı: "boynerden migrosa gitmek istiyorum"
   Sen: navigate_user(from: "boyner", to: "migros", confirm: false, language: "en") ÇAĞIR
   
   Kullanıcı: "Evet, Boyner konumundan 5M Migros konumuna gitmek istiyorum"
   Sen: navigate_user(from: "boyner", to: "5m migros", confirm: true, language: "en") ÇAĞIR
   NOT: Kullanıcı mesajında from ve to bilgisi varsa onları kullan! Dil parametresini (language: 'tr' veya 'en') eklemeyi unutma!

2. MAĞAZA ARAMA VE ÖNERİLER:
   - "5m migros nerede?" → search_stores(query: "5m migros", show_on_map: true) - Direkt haritada göster!
   - "Migrosa nasıl giderim?" → search_stores(query: "migros", show_on_map: false) - Konum sor, rota oluştur
   - "nerede" sorusu = Haritada göster
   - "nasıl giderim" sorusu = Rota oluştur
   
   ÜRÜN-MAĞAZA ÖNERİLERİ:
   - "Pantolon almak istiyorum" → "Pantolon için H&M, LC Waikiki, Colins, Koton önerebilirim. Erkek için Damat Tween, Ramsey da var. Sizi hangi mağazaya yönlendireyim?"
   - "Tişört" → "Colins, H&M, LC Waikiki, Koton"
   - "Elbise" → "İpekyol, ADL, Ekol, Boyner"
   - "Ayakkabı" → "FLO, SuperStep, Koray Spor, Bambi"
   - Önerilerden sonra MUTLAKA: "Sizi hangi mağazaya yönlendireyim?"

3. YEMEK & KAFE:
   - "Yemek yemek istiyorum" → "Hangi tür yemek istersiniz? 🍽️ (Burger, pizza, kafe...)"
   - "Kahve içmek istiyorum" → search_stores(query: "kafe")
   - Öneriler: Starbucks ☕, Kahve Dünyası ☕, Mado 🍰, Burger King 🍔

4. ÇEVRE KEŞFİ:
   - "Çevremde ne var?" → "Şu anda neredesiniz?" sonra show_nearby_stores
   - Yakındaki mağazaları listele

5. KAMPANYALAR (ÖNEMLİ FORMAT!):
   - "Kampanyalar" / "Aktif kampanyalar neler?" → show_campaigns() ÇAĞIR
   - Function'dan dönen kampanyaları MUTLAKA bu formatta yaz (kutucuklar otomatik oluşur):
   
   Ankamall'daki güncel kampanyalar:
   
   1. **Gratis**: - **Anneler Günü Özel** %30 indirim
   2. **5M Migros**: - **Hafta Sonu Fırsatı** %25 indirim
   3. **İşbir Yatak**: - **Bahar İndirimi** %40 indirim
   
   Hangi mağazaya gitmek istersiniz?
   
   NOT: Mağaza adlarını ** ** arasına al, kampanya detaylarını da ** ** arasına al!
   ÖRNEK: **Mağaza Adı**: - **Kampanya Başlığı** açıklama

6. ÖZEL YERLER:
   - "Tuvalet" → find_special_location(type: "wc")
   - "ATM" → find_special_location(type: "atm")

7. GİRİŞ/KAYIT:
   - "Kayıt olmak istiyorum" → "Harika! Email ve şifre belirler misin?"
   - Email ve şifre aldıktan sonra: register_user(username: "email", password: "şifre")
   - "Giriş yapmak istiyorum" → login_user(username: "email", password: "şifre")

📝 KONUŞMA TARZI:
- Doğal ve samimi konuş (robot gibi değil, arkadaş gibi)
- Emoji kullan ama abartma (🏪 🔥 📍 💰 🍽️ ☕ ✅ ❌)
- Kısa ve net cevaplar
- Kullanıcının niyetini anla ve yardımcı ol`,
};

export const getTranslation = (lang, key) => {
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
