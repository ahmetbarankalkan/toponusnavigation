/**
 * Function Call Handler Modülü
 * OpenAI function call'larını işleyen modül
 */

/**
 * Function call handler'ları
 * @param {Object} handlers - Handler fonksiyonları
 * @param {Function} handlers.navigateUser - Navigasyon handler'ı
 * @param {Function} handlers.changeFloor - Kat değiştirme handler'ı
 * @param {Function} handlers.findSpecialLocation - Özel lokasyon bulma handler'ı
 * @param {Function} handlers.registerUser - Kullanıcı kayıt handler'ı
 * @param {Function} handlers.loginUser - Kullanıcı giriş handler'ı
 * @param {Function} handlers.visitLocation - Lokasyon ziyaret handler'ı
 * @param {Function} handlers.searchStores - Mağaza arama handler'ı
 * @param {Function} handlers.showNearbyStores - Yakındaki mağazalar handler'ı
 * @param {Function} handlers.showCampaigns - Kampanyalar handler'ı
 * @returns {Function} Function call router'ı
 */
export function createFunctionCallRouter(handlers) {
  return async (functionCall) => {
    const { name, arguments: argsStr } = functionCall;

    console.log(`Fonksiyon çağrısı: ${name}`, argsStr);

    try {
      switch (name) {
        case "navigate_user":
          if (handlers.navigateUser) {
            await handlers.navigateUser(argsStr);
          }
          break;

        case "change_floor":
          if (handlers.changeFloor) {
            handlers.changeFloor(argsStr);
          }
          break;

        case "find_special_location":
          if (handlers.findSpecialLocation) {
            await handlers.findSpecialLocation(argsStr);
          }
          break;

        case "register_user":
          if (handlers.registerUser) {
            await handlers.registerUser(argsStr);
          }
          break;

        case "login_user":
          if (handlers.loginUser) {
            await handlers.loginUser(argsStr);
          }
          break;

        case "visit_location":
          if (handlers.visitLocation) {
            await handlers.visitLocation(argsStr);
          }
          break;

        case "search_stores":
          if (handlers.searchStores) {
            await handlers.searchStores(argsStr);
          }
          break;

        case "show_nearby_stores":
          if (handlers.showNearbyStores) {
            await handlers.showNearbyStores(argsStr);
          }
          break;

        case "show_campaigns":
          if (handlers.showCampaigns) {
            await handlers.showCampaigns(argsStr);
          }
          break;

        default:
          console.warn(`Bilinmeyen function call: ${name}`);
      }
    } catch (error) {
      console.error(`Function call hatası (${name}):`, error);
    }
  };
}

/**
 * OpenAI function tanımları
 */
export const OPENAI_FUNCTIONS = [
  {
    name: "navigate_user",
    description: "Kullanıcının navigasyon talebini işler. İLK ÇAĞRIDA confirm parametresini false veya boş bırak, kullanıcıya onay sorusu sor. Kullanıcı 'evet', 'tamam', 'olur' gibi onay verirse, confirm: true ile TEKRAR çağır. Eğer kullanıcı QR kod ile gelmiş ve konumu URL'de varsa, 'from' parametresi opsiyoneldir - sistem otomatik olarak en yakın mağazayı bulur.",
    parameters: {
      type: "object",
      properties: {
        from: { 
          type: "string",
          description: "Başlangıç konumu (mağaza adı). Eğer kullanıcı QR kod ile gelmişse ve konum belirtmemişse, boş bırakılabilir - sistem otomatik tespit eder."
        },
        to: { 
          type: "string",
          description: "Hedef konum (mağaza adı)"
        },
        confirm: {
          type: "boolean",
          description: "Kullanıcı onayı. İLK ÇAĞRIDA false veya boş bırak. Kullanıcı 'evet', 'tamam', 'olur' derse true yap ve tekrar çağır."
        },
        language: {
          type: "string",
          enum: ["tr", "en"],
          description: "Kullanıcının konuştuğu dil. Eğer kullanıcı İngilizce konuşuyorsa 'en', Türkçe konuşuyorsa 'tr' gönder."
        }
      },
      required: ["to"],
    },
  },
  {
    name: "change_floor",
    description: "Kullanıcı kat değişikliği belirttiğinde çağrılır (indim, çıktım, vb.)",
    parameters: {
      type: "object",
      properties: {
        direction: { type: "string", enum: ["up", "down"] },
      },
      required: ["direction"],
    },
  },
  {
    name: "find_special_location",
    description: "Kullanıcının özel bir lokasyon tipine (tuvalet, atm, acil çıkış vb.) yönlendirilmesi",
    parameters: {
      type: "object",
      properties: {
        location_type: {
          type: "string",
          enum: [
            "wc",
            "exit",
            "entrance",
            "baby-care",
            "fire-exit",
            "emergency-exit",
            "first-aid",
            "atm",
            "info-desk",
            "pharmacy",
            "point"
          ],
          description: "Aranan özel lokasyon tipi",
        },
        user_location: {
          type: "string",
          description: "Kullanıcının şu anki konumu (opsiyonel)",
        },
      },
      required: ["location_type"],
    },
  },
  {
    name: "register_user",
    description: "Kullanıcı kayıt işlemi - sadece kullanıcı adı ve şifre ile temel kullanıcı oluşturur",
    parameters: {
      type: "object",
      properties: {
        username: { type: "string", description: "Kullanıcı adı" },
        password: { type: "string", description: "Şifre (en az 4 karakter)" },
      },
      required: ["username", "password"],
    },
  },
  {
    name: "login_user",
    description: "Kullanıcı giriş işlemi",
    parameters: {
      type: "object",
      properties: {
        username: { type: "string" },
        password: { type: "string" },
      },
      required: ["username", "password"],
    },
  },
  {
    name: "visit_location",
    description: "Kullanıcının bir lokasyonu ziyaret ettiğini kaydet",
    parameters: {
      type: "object",
      properties: {
        location_id: { type: "string" },
        location_name: { type: "string" },
      },
      required: ["location_id", "location_name"],
    },
  },
  {
    name: "search_stores",
    description: "Kullanıcı bir mağaza veya kategori aradığında kullanılır (örn: 'Migros', 'elektronik mağazası', 'kafe'). Eğer kullanıcı 'nerede', 'göster', 'haritada göster' gibi ifadeler kullanıyorsa show_on_map: true yap.",
    parameters: {
      type: "object",
      properties: {
        query: { 
          type: "string", 
          description: "Aranacak mağaza adı veya kategori" 
        },
        show_on_map: {
          type: "boolean",
          description: "Kullanıcı mağazayı haritada görmek istiyorsa true (örn: 'nerede', 'göster', 'haritada göster'), rota oluşturmak istiyorsa false. Varsayılan: true"
        }
      },
      required: ["query"],
    },
  },
  {
    name: "show_nearby_stores",
    description: "Kullanıcının bulunduğu konuma yakın mağazaları gösterir. Kullanıcı 'çevremdeki mağazalar', 'yakınımda ne var' gibi sorular sorduğunda kullanılır.",
    parameters: {
      type: "object",
      properties: {
        user_location: { 
          type: "string", 
          description: "Kullanıcının şu anki konumu (mağaza adı). Eğer belirtilmemişse kullanıcıya sor." 
        },
        category: {
          type: "string",
          description: "Filtrelemek için kategori (opsiyonel, örn: 'giyim', 'yemek')"
        }
      },
      required: [],
    },
  },
  {
    name: "show_campaigns",
    description: "Aktif kampanyaları ve indirimleri gösterir. Kullanıcı 'kampanyalar', 'indirimler', 'hangi ürün var' gibi sorular sorduğunda kullanılır.",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Belirli bir kategorideki kampanyalar (opsiyonel)"
        },
        language: {
          type: "string",
          enum: ["tr", "en"],
          description: "Kullanıcının konuştuğu dil. Eğer kullanıcı İngilizce konuşuyorsa 'en', Türkçe konuşuyorsa 'tr' gönder."
        }
      },
      required: [],
    },
  },
];
