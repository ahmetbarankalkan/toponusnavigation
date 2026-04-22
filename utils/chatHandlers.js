/**
 * Chat Handler Functions
 * OpenAI function call handler'ları
 */

import { specialLocations, geojsonURLS } from './utils.js';
import { findRoomByName, findClosestSpecialLocation } from './roomHelpers.js';

/**
 * Mağaza arama - fuzzy matching ile
 */
export function searchStores(query, rooms) {
  const lowerQuery = query.toLowerCase().trim();
  
  return rooms.filter(room => {
    // Özel lokasyonları hariç tut
    if (room.is_special) return false;
    
    const name = room.name?.toLowerCase() || '';
    const category = room.category?.toLowerCase() || '';
    
    // Tam eşleşme
    if (name.includes(lowerQuery)) return true;
    
    // Kategori eşleşmesi
    if (category.includes(lowerQuery)) return true;
    
    // Kısmi eşleşme
    const words = lowerQuery.split(' ');
    return words.some(word => name.includes(word) || category.includes(word));
  });
}

/**
 * Kullanıcıya en yakın mağazaları bul
 */
export function findNearbyStores(userRoom, rooms, graph, preferredTransport, allGeoData, limit = 5) {
  if (!userRoom || !graph) return [];
  
  const storesWithDistance = rooms
    .filter(room => {
      // Kendisini ve özel lokasyonları hariç tut
      if (room.id === userRoom.id) return false;
      if (room.is_special) return false;
      // Koordinat bilgisi olmayan odaları hariç tut
      if (!room.center && !room.coordinates) return false;
      return true;
    })
    .map(room => {
      // Mesafe hesapla (basit Euclidean)
      const center = room.center || room.coordinates;
      if (!center || center.length < 2) return null;
      
      const dx = center[0] - userRoom.center[0];
      const dy = center[1] - userRoom.center[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return {
        ...room,
        distance
      };
    })
    .filter(room => room !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  
  return storesWithDistance;
}

/**
 * Kampanyalı mağazaları getir
 */
export function getStoresWithCampaigns(rooms) {
  return rooms.filter(room => {
    // Özel lokasyonları hariç tut
    if (room.is_special) return false;
    
    // Kampanyaları kontrol et - GeoJSON properties'den veya doğrudan room'dan
    const campaigns = room.campaigns || room.properties?.campaigns || [];
    const productCampaigns = room.product_campaigns || room.properties?.product_campaigns || [];
    
    const hasCampaigns = Array.isArray(campaigns) && campaigns.length > 0;
    const hasProductCampaigns = Array.isArray(productCampaigns) && productCampaigns.some(p => p.is_active);
    
    return hasCampaigns || hasProductCampaigns;
  });
}

/**
 * Chat handler'ları için factory fonksiyonu
 * State ve setter'ları parametre olarak alır
 */
export function createChatHandlers({
  rooms,
  setRooms, // Koordinat odası eklemek için gerekli
  currentFloor,
  chatMessages,
  functions,
  graph,
  preferredTransport,
  allGeoData,
  setSelectedStartRoom,
  setSelectedEndRoom,
  setCurrentFloor,
  setChatMessages,
  changeFloor,
  setQrHighlightedRoom,
  mapRef,
  setIsAssistantOpen,
  searchParams, // URL parametrelerini almak için eklendi
  t, // Translation function
}) {
  const handleNavigateUser = async (argumentsStr) => {
    const args = JSON.parse(argumentsStr);
    
    // Onay kontrolü - eğer confirm parametresi yoksa veya false ise, önce onay iste
    if (!args.confirm) {
      let fromRoom = null;
      
      // Eğer 'from' parametresi varsa, onu kullan
      if (args.from) {
        fromRoom = findRoomByName(args.from, rooms);
      }
      
      const toRoom = findRoomByName(args.to, rooms);

      // Eğer başlangıç konumu yoksa, URL'den koordinat kontrolü yap
      if (!fromRoom && searchParams) {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const floorParam = searchParams.get('floor');
        
        if (lat && lng) {
          const coordinates = [parseFloat(lng), parseFloat(lat)];
          const targetFloor = floorParam ? parseInt(floorParam) : 0;
          
          // Koordinat odasını bul veya oluştur
          let coordinateRoom = rooms.find(r => r.isCoordinate);
          
          if (!coordinateRoom) {
            coordinateRoom = {
              id: `coordinate-qr-${Date.now()}`,
              name: '📍 Şu an buradasınız',
              floor: targetFloor,
              coordinates: coordinates,
              center: coordinates,
              doorId: `coordinate-door-${Date.now()}`,
              isCoordinate: true,
              is_special: false,
            };
            
            setRooms(prevRooms => {
              const filteredRooms = prevRooms.filter(r => !r.isCoordinate);
              return [...filteredRooms, coordinateRoom];
            });
          }
          
          fromRoom = coordinateRoom;
        }
      }

      if (!fromRoom || !toRoom) {
        let errorMsg = '';
        
        if (!toRoom) {
          // Benzer mağazaları bul
          const query = args.to.toLowerCase();
          const similarStores = rooms
            .filter(r => !r.is_special && r.name && r.name.toLowerCase().includes(query))
            .slice(0, 3);
          
          if (similarStores.length > 0) {
            errorMsg = `"${args.to}" mağazası bulunamadı. Bunu mu demek istediniz?\n${similarStores.map(s => `• ${s.name}`).join('\n')}`;
          }
        } else if (!fromRoom) {
          errorMsg = t('errors.locationNotFound') || 'Başlangıç konumu bulunamadı.';
        }
        
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: errorMsg },
        ]);
        return;
      }

      // Onay mesajı gönder - Özel format ile
      const confirmMessage = `[ROUTE_CONFIRM]${JSON.stringify({
        fromRoom: {
          name: fromRoom.name || 'Bilinmeyen Konum',
          logo: fromRoom.logo || fromRoom.properties?.logo || '',
          floor: fromRoom.floor !== undefined ? fromRoom.floor : 0,
          isCoordinate: fromRoom.isCoordinate || false
        },
        toRoom: {
          name: toRoom.name || 'Bilinmeyen Konum',
          logo: toRoom.logo || toRoom.properties?.logo || '',
          floor: toRoom.floor !== undefined ? toRoom.floor : 0
        },
        language: args.language || 'tr'
      })}[/ROUTE_CONFIRM]`;
      
      setChatMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: confirmMessage,
          pendingNavigation: {
            from: args.from,
            to: args.to,
            fromRoom: fromRoom,
            toRoom: toRoom
          }
        },
      ]);
      return;
    }

    // Onay verildi, rotayı oluştur
    let fromRoom = null;
    
    // Eğer 'from' parametresi varsa, onu kullan
    if (args.from) {
      fromRoom = findRoomByName(args.from, rooms);
    }
    
    const toRoom = findRoomByName(args.to, rooms);

    // Eğer başlangıç konumu yoksa, URL'den koordinat kontrolü yap
    if (!fromRoom && searchParams) {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const floorParam = searchParams.get('floor');
      
      if (lat && lng) {
        
        const coordinates = [parseFloat(lng), parseFloat(lat)];
        const targetFloor = floorParam ? parseInt(floorParam) : 0;
        
        // Koordinat odasını bul veya oluştur
        let coordinateRoom = rooms.find(r => r.isCoordinate);
        
        if (!coordinateRoom) {
          coordinateRoom = {
            id: `coordinate-qr-${Date.now()}`,
            name: '📍 Şu an buradasınız',
            floor: targetFloor,
            coordinates: coordinates,
            center: coordinates,
            doorId: `coordinate-door-${Date.now()}`,
            isCoordinate: true,
            is_special: false,
          };
          
          setRooms(prevRooms => {
            const filteredRooms = prevRooms.filter(r => !r.isCoordinate);
            return [...filteredRooms, coordinateRoom];
          });
        }
        
        fromRoom = coordinateRoom;
        
        // Kullanıcıya bilgi ver
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `📍 ${t('errors.creatingRoute')} ${args.to}${t('errors.toStore')}`,
          },
        ]);
      }
    }

    if (!fromRoom || !toRoom) {
      let errorMsg = '';
      
      if (!toRoom) {
        // Benzer mağazaları bul
        const query = args.to.toLowerCase();
        const similarStores = rooms
          .filter(r => !r.is_special && r.name && r.name.toLowerCase().includes(query))
          .slice(0, 3);
        
        if (similarStores.length > 0) {
          errorMsg = `"${args.to}" mağazası bulunamadı. Bunu mu demek istediniz?\n${similarStores.map(s => `• ${s.name}`).join('\n')}`;
        } else {
          errorMsg = `"${args.to}" mağazası bulunamadı. Lütfen mağaza adını kontrol edin.`;
        }
      } else if (!fromRoom) {
        errorMsg = t('errors.locationNotFound') || 'Başlangıç konumu bulunamadı.';
      }
      
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMsg },
      ]);
      return;
    }

    setSelectedStartRoom(fromRoom.id);
    setSelectedEndRoom(toRoom.id);

    if (fromRoom.floor !== currentFloor) {
      setCurrentFloor(fromRoom.floor);
      changeFloor(fromRoom.floor);
    }

    // Rota oluşturulduktan sonra asistanı kapat
    if (setIsAssistantOpen) {
      setTimeout(() => {
        setIsAssistantOpen(false);
      }, 1500);
    }
  };

  /**
   * Mağaza arama ve önerme
   */
  const handleSearchStores = async (argumentsStr) => {
    const args = JSON.parse(argumentsStr);
    
    const results = searchStores(args.query, rooms);
    
    // Eğer show_on_map true ve tek sonuç varsa, direkt haritada göster (QR gibi)
    if (args.show_on_map && results.length > 0) {
      const targetRoom = results[0];
      
      // QR gibi highlight et
      if (setQrHighlightedRoom) {
        setQrHighlightedRoom(targetRoom);
      }
      
      // Mağazayı seç (başlangıç noktası olarak)
      setSelectedStartRoom(targetRoom.id);
      
      // Eğer farklı kattaysa, kat değiştir
      if (targetRoom.floor !== currentFloor) {
        setCurrentFloor(targetRoom.floor);
        changeFloor(targetRoom.floor);
        
        // Kat değiştikten sonra zoom yap
        setTimeout(() => {
          if (mapRef?.current && targetRoom.coordinates) {
            mapRef.current.flyTo({
              center: targetRoom.coordinates,
              zoom: 20,
              duration: 2000,
            });
          }
        }, 1500);
      } else {
        // Aynı kattaysa direkt zoom yap
        if (mapRef?.current && targetRoom.coordinates) {
          setTimeout(() => {
            mapRef.current.flyTo({
              center: targetRoom.coordinates,
              zoom: 20,
              duration: 2000,
            });
          }, 500);
        }
      }
      
      // Kampanyaları kontrol et
      const campaigns = targetRoom.campaigns || targetRoom.properties?.campaigns || [];
      const productCampaigns = targetRoom.product_campaigns || targetRoom.properties?.product_campaigns || [];
      const hasCampaigns = (Array.isArray(campaigns) && campaigns.length > 0) || 
                          (Array.isArray(productCampaigns) && productCampaigns.some(p => p.is_active));
      
      // Kullanıcıya bilgi ver
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `${targetRoom.name} ${t('errors.showingOnMap')}. ${targetRoom.floor}${t('errors.onFloor')}. ${
            hasCampaigns ? t('errors.hasCampaigns') : ''
          }`,
        },
      ]);
      
      // Asistan chatini kapat
      if (setIsAssistantOpen) {
        setTimeout(() => {
          setIsAssistantOpen(false);
        }, 1500);
      }
      
      return;
    }
    
    const functionResult = {
      success: true,
      query: args.query,
      results: results.slice(0, 5).map(room => {
        // Kampanyaları GeoJSON properties'den veya doğrudan room'dan al
        const campaigns = room.campaigns || room.properties?.campaigns || [];
        const productCampaigns = room.product_campaigns || room.properties?.product_campaigns || [];
        
        return {
          name: room.name,
          category: room.category,
          floor: room.floor,
          logo: room.logo,
          has_campaigns: (Array.isArray(campaigns) && campaigns.length > 0) || 
                        (Array.isArray(productCampaigns) && productCampaigns.some(p => p.is_active))
        };
      })
    };

    const newMessages = [
      ...chatMessages,
      {
        role: 'function',
        name: 'search_stores',
        content: JSON.stringify(functionResult),
      },
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          functions: functions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      const followup = data.choices[0].message;
      setChatMessages(prev => [...prev, followup]);
    } catch (err) {
      console.error('Search stores error:', err);
    }
  };

  /**
   * Yakındaki mağazaları göster
   */
  const handleShowNearbyStores = async (argumentsStr) => {
    const args = JSON.parse(argumentsStr);
    
    let userRoom = null;
    if (args.user_location) {
      userRoom = findRoomByName(args.user_location, rooms);
    }

    if (!userRoom) {
      const functionResult = {
        error: t('errors.locationRequired'),
        message: t('errors.nearbyNeedLocation'),
        needs_user_location: true,
      };

      const newMessages = [
        ...chatMessages,
        {
          role: 'function',
          name: 'show_nearby_stores',
          content: JSON.stringify(functionResult),
        },
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            functions: functions,
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }

        const data = await response.json();
        const followup = data.choices[0].message;
        setChatMessages(prev => [...prev, followup]);
      } catch (err) {
        console.error('Nearby stores error:', err);
      }
      return;
    }

    const nearbyStores = findNearbyStores(userRoom, rooms, graph, preferredTransport, allGeoData, 5);
    
    const functionResult = {
      success: true,
      user_location: userRoom.name,
      nearby_stores: nearbyStores.map(room => {
        // Kampanyaları GeoJSON properties'den veya doğrudan room'dan al
        const campaigns = room.campaigns || room.properties?.campaigns || [];
        const productCampaigns = room.product_campaigns || room.properties?.product_campaigns || [];
        
        return {
          name: room.name,
          category: room.category,
          floor: room.floor,
          logo: room.logo,
          distance: room.distance.toFixed(1),
          has_campaigns: (Array.isArray(campaigns) && campaigns.length > 0) || 
                        (Array.isArray(productCampaigns) && productCampaigns.some(p => p.is_active))
        };
      })
    };

    const newMessages = [
      ...chatMessages,
      {
        role: 'function',
        name: 'show_nearby_stores',
        content: JSON.stringify(functionResult),
      },
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          functions: functions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      const followup = data.choices[0].message;
      setChatMessages(prev => [...prev, followup]);
    } catch (err) {
      console.error('Nearby stores follow-up error:', err);
    }
  };

  /**
   * Kampanyalı mağazaları göster - Direkt formatla
   */
  const handleShowCampaigns = async (argumentsStr) => {
    console.log('🎯 handleShowCampaigns çağrıldı');
    const args = JSON.parse(argumentsStr);
    const lang = args.language || 'tr';
    
    // Dil bazlı çeviri fonksiyonu
    const translate = (key) => {
      // Eğer t fonksiyonu varsa ve dil eşleşiyorsa onu kullan
      // Ancak burada manuel olarak dil dosyasından çekmek daha güvenli olabilir
      // Basitçe translations objesine erişelim (import edilmesi gerekebilir ama şimdilik t üzerinden gidelim)
      // t fonksiyonu genellikle mevcut dili kullanır. Bizim bunu override etmemiz lazım.
      // Bu yüzden translations objesini import etmemiz lazım.
      // Ancak bu dosyanın başında import yok.
      // O yüzden basit bir mapping yapalım veya t fonksiyonuna güvenmeyip manuel stringler kullanalım.
      
      // En iyisi translations objesini kullanmak ama bu dosyada yok.
      // Bu yüzden basitçe hardcoded stringler veya t fonksiyonunu manipüle etme şansımız yok.
      // Ancak, createChatHandlers'a translations objesini de geçebiliriz.
      // Şimdilik basitçe if-else ile çözelim.
      
      if (lang === 'en') {
        if (key === 'campaigns.header') return 'Current campaigns at Ankamall:';
        if (key === 'campaigns.footer') return 'Which store would you like to go to?';
        if (key === 'campaigns.off') return 'off';
        if (key === 'campaigns.specialCampaign') return 'Special Campaign';
        if (key === 'campaigns.productCampaign') return 'Product Campaign';
        if (key === 'campaigns.specialOffers') return 'Special Offers';
        if (key === 'campaigns.available') return 'available';
      } else {
        if (key === 'campaigns.header') return "Ankamall'daki güncel kampanyalar:";
        if (key === 'campaigns.footer') return 'Hangi mağazaya gitmek istersiniz?';
        if (key === 'campaigns.off') return 'indirim';
        if (key === 'campaigns.specialCampaign') return 'Özel Kampanya';
        if (key === 'campaigns.productCampaign') return 'Ürün Kampanyası';
        if (key === 'campaigns.specialOffers') return 'Özel Fırsatlar';
        if (key === 'campaigns.available') return 'mevcut';
      }
      return t(key); // Fallback
    };

    const campaignStores = getStoresWithCampaigns(rooms);
    
    if (campaignStores.length === 0) {
      console.log('❌ Kampanya bulunamadı');
      setChatMessages(prev => {
        console.log('📝 Mesaj ekleniyor (kampanya yok)');
        return [
          ...prev,
          {
            role: 'assistant',
            content: lang === 'en' 
              ? '😔 There are no active campaigns at the moment. New campaigns will be added soon!'
              : '😔 Şu anda aktif kampanya bulunmamaktadır. Yakında yeni kampanyalar eklenecek!',
          },
        ];
      });
      return;
    }
    
    // Kampanyaları formatla - AssistantModal'ın anlayacağı formatta
    let campaignText = `${translate('campaigns.header')}\n\n`;
    
    campaignStores.slice(0, 10).forEach((room, index) => {
      const campaigns = room.campaigns || room.properties?.campaigns || [];
      const productCampaigns = room.product_campaigns || room.properties?.product_campaigns || [];
      
      // Mağaza adı
      campaignText += `${index + 1}. **${room.name}**: `;
      
      // Kampanya detayları
      if (campaigns.length > 0) {
        const campaign = campaigns[0];
        const discount = campaign.discount_percentage ? `%${campaign.discount_percentage}` : '';
        campaignText += `- **${campaign.title || translate('campaigns.specialCampaign')}** ${discount} ${campaign.description || translate('campaigns.off')}\n`;
      } else if (productCampaigns.length > 0) {
        const pCampaign = productCampaigns.find(p => p.is_active);
        if (pCampaign) {
          const discount = pCampaign.discount_percentage ? `%${pCampaign.discount_percentage}` : '';
          campaignText += `- **${pCampaign.product_name || translate('campaigns.productCampaign')}** ${discount} ${translate('campaigns.off')}\n`;
        }
      } else {
        campaignText += `- **${translate('campaigns.specialOffers')}** ${translate('campaigns.available')}\n`;
      }
    });
    
    campaignText += `\n${translate('campaigns.footer')}`;
    
    console.log('📝 Kampanya metni:', campaignText);
    
    // Direkt mesaj olarak ekle
    setTimeout(() => {
      setChatMessages(prev => {
        console.log('📝 Mesaj ekleniyor, önceki mesaj sayısı:', prev.length);
        const newMessages = [
          ...prev,
          {
            role: 'assistant',
            content: campaignText,
          },
        ];
        console.log('📝 Yeni mesaj sayısı:', newMessages.length);
        // localStorage'a da kaydet
        localStorage.setItem('assistant_chat_history', JSON.stringify(newMessages));
        return newMessages;
      });
    }, 100);
    
    console.log('✅ handleShowCampaigns tamamlandı');
  };

  /**
   * Kat değiştirme işlemini yapar
   */
  const handleChangeFloor = argumentsStr => {
    const args = JSON.parse(argumentsStr);
    let newFloor = currentFloor;

    if (args.direction === 'up') {
      const availableFloors = Object.keys(geojsonURLS)
        .map(Number)
        .sort((a, b) => a - b);
      const upperFloors = availableFloors.filter(f => f > currentFloor);
      if (upperFloors.length > 0) {
        newFloor = upperFloors[0];
      }
    } else if (args.direction === 'down') {
      const availableFloors = Object.keys(geojsonURLS)
        .map(Number)
        .sort((a, b) => b - a);
      const lowerFloors = availableFloors.filter(f => f < currentFloor);
      if (lowerFloors.length > 0) {
        newFloor = lowerFloors[0];
      }
    }

    if (newFloor !== currentFloor) {
      setCurrentFloor(newFloor);
      changeFloor(newFloor);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `${newFloor}${t('errors.floorChanged')}${t('errors.floorChangedEnd')}`,
        },
      ]);
    } else {
      const errorMsg = args.direction === 'up' ? t('errors.noUpperFloor') : t('errors.noLowerFloor');
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: errorMsg,
        },
      ]);
    }
  };

  /**
   * Özel lokasyon bulma (WC, ATM, Eczane vb.)
   */
  const handleFindSpecialLocation = async argsStr => {
    const args = JSON.parse(argsStr);
    const locationType = args.location_type;
    const locationInfo = specialLocations[locationType];

    // Kullanıcının konumunu belirle
    let userLocation = null;
    if (args.user_location) {
      userLocation = findRoomByName(args.user_location, rooms);
    }

    // Eğer konum belirsizse, URL'den koordinat kontrolü yap
    if (!userLocation && searchParams) {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const floorParam = searchParams.get('floor');
      
      if (lat && lng) {
        const coordinates = [parseFloat(lng), parseFloat(lat)];
        const targetFloor = floorParam ? parseInt(floorParam) : 0;
        
        // Koordinat odasını bul veya en yakın mağazayı bul
        let coordinateRoom = rooms.find(r => r.isCoordinate);
        
        if (!coordinateRoom) {
          // En yakın mağazayı bul
          let nearestRoom = null;
          let minDistance = Infinity;
          
          rooms.forEach(room => {
            if (!room.coordinates || room.coordinates.length !== 2 || room.is_special) {
              return;
            }
            
            // Aynı kattaki mağazaları önceliklendir
            if (room.floor !== targetFloor) {
              return;
            }
            
            const roomLng = room.coordinates[0];
            const roomLat = room.coordinates[1];
            
            const distance = Math.sqrt(
              Math.pow(coordinates[0] - roomLng, 2) + 
              Math.pow(coordinates[1] - roomLat, 2)
            );
            
            if (distance < minDistance) {
              minDistance = distance;
              nearestRoom = room;
            }
          });
          
          userLocation = coordinateRoom;
        }
      }
    }

    // Eğer hala konum belirsizse, koordinat odası oluştur
    if (!userLocation && searchParams) {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const floorParam = searchParams.get('floor');
      
      if (lat && lng) {
        const coordinates = [parseFloat(lng), parseFloat(lat)];
        const targetFloor = floorParam ? parseInt(floorParam) : 0;
        
        // Koordinat odasını bul veya oluştur
        let coordinateRoom = rooms.find(r => r.isCoordinate);
        
        if (!coordinateRoom) {
          coordinateRoom = {
            id: `coordinate-special-${Date.now()}`,
            name: '📍 Şu an buradasınız',
            floor: targetFloor,
            coordinates: coordinates,
            center: coordinates,
            doorId: `coordinate-door-${Date.now()}`, // Rota hesaplama için gerekli
            isCoordinate: true,
            is_special: false,
          };
          
          // Rooms listesine ekle
          setRooms(prevRooms => {
            const filteredRooms = prevRooms.filter(r => !r.isCoordinate);
            return [...filteredRooms, coordinateRoom];
          });
        }
        
        userLocation = coordinateRoom;
        
        // Kullanıcıya bilgi ver
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `📍 ${t('errors.searchingFrom')} ${locationInfo.name}${t('errors.searchingFromEnd') || '...'}`,
          },
        ]);
      }
    }
    
    // Eğer hala konum belirsizse, GPT'ye söyle
    if (!userLocation) {
      const functionResult = {
        error: t('errors.locationRequired'),
        message: `${t('errors.needLocation')} ${locationInfo.name}.`,
        needs_user_location: true,
      };

      const newMessages = [
        ...chatMessages,
        {
          role: 'function',
          name: 'find_special_location',
          content: JSON.stringify(functionResult),
        },
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            functions: functions,
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }

        const data = await response.json();
        const followup = data.choices[0].message;
        setChatMessages(prev => [...prev, followup]);
      } catch (err) {
        console.error('Special location error:', err);
      }
      return;
    }

    // En yakın özel lokasyonu bul
    const closestLocation = findClosestSpecialLocation(
      userLocation,
      locationType,
      rooms,
      graph,
      preferredTransport,
      allGeoData
    );

    if (!closestLocation) {
      const errorResult = {
        error: t('errors.locationNotFoundShort'),
        message: `${t('errors.notFoundNearby')} ${locationInfo.name} ${t('errors.notFound')}`,
        success: false,
      };

      const newMessages = [
        ...chatMessages,
        {
          role: 'function',
          name: 'find_special_location',
          content: JSON.stringify(errorResult),
        },
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            functions: functions,
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }

        const data = await response.json();
        const followup = data.choices[0].message;
        setChatMessages(prev => [...prev, followup]);
      } catch (err) {
        console.error('Special location follow-up error:', err);
      }
      return;
    }

    // Rotayı çiz
    setSelectedStartRoom(userLocation.id);
    setSelectedEndRoom(closestLocation.id);

    // Başlangıç katına geç
    if (userLocation.floor !== currentFloor) {
      setCurrentFloor(userLocation.floor);
      changeFloor(userLocation.floor);
    }

    // Sonucu GPT'ye bildir
    setTimeout(async () => {
      const successResult = {
        success: true,
        found_location: {
          name: closestLocation.display_name || closestLocation.name,
          floor: closestLocation.floor,
          user_floor: userLocation.floor,
          distance: closestLocation.routeDistance.toFixed(1),
          icon: locationInfo.icon,
        },
      };

      const newMessages = [
        ...chatMessages,
        {
          role: 'function',
          name: 'find_special_location',
          content: JSON.stringify(successResult),
        },
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            functions: functions,
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat API error: ${response.status}`);
        }

        const data = await response.json();
        const followup = data.choices[0].message;
        setChatMessages(prev => [...prev, followup]);
      } catch (err) {
        console.error('Special location follow-up error:', err);
      }
    }, 1000);
  };

  /**
   * Kullanıcı kayıt işlemi
   */
  const handleRegisterUser = async argsStr => {
    const args = JSON.parse(argsStr);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: args.username,
          password: args.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `${t('errors.welcomeRegister')} ${args.username}${t('errors.registerSuccess')}`,
          },
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `${t('errors.registerFailed')} ${data.error}`,
          },
        ]);
      }
    } catch (error) {
      console.error('Register error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: t('errors.registerError'),
        },
      ]);
    }
  };

  /**
   * Kullanıcı giriş işlemi
   */
  const handleLoginUser = async argsStr => {
    const args = JSON.parse(argsStr);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: args.username, // API email bekliyor
          password: args.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `${t('errors.welcomeLogin')} ${args.username}${t('errors.loginSuccess')}`,
          },
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `${t('errors.loginFailed')} ${data.error}`,
          },
        ]);
      }
    } catch (error) {
      console.error('Login error:', error);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: t('errors.loginError'),
        },
      ]);
    }
  };

  return {
    handleNavigateUser,
    handleChangeFloor,
    handleFindSpecialLocation,
    handleRegisterUser,
    handleLoginUser,
    handleSearchStores,
    handleShowNearbyStores,
    handleShowCampaigns,
  };
}
