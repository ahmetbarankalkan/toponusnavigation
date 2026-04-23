'use client';
export const dynamic = 'force-dynamic';
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Suspense,
  lazy,
} from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  specialLocations,
  geojsonURLS,
  getQuickAccessList,
} from '../utils/utils.js';
import { elevatorIcon, escalatorIcon, arrowIcon } from '../utils/icons.js';

// Lazy load modals and heavy UI components for mobile performance
const DiscoverModal = nextDynamic(() => import('@/components/DiscoverModal'), {
  ssr: false,
  loading: () => null,
});
const QRPopup = nextDynamic(() => import('@/components/UI/QRPopup'), {
  ssr: false,
  loading: () => null,
});
const DemoPopup = nextDynamic(() => import('@/components/UI/DemoPopup'), {
  ssr: false,
  loading: () => null,
});
const StoreInfoPanel = nextDynamic(
  () => import('@/components/Store/StoreInfoPanel'),
  {
    ssr: false,
    loading: () => null,
  }
);
const StoreQuickInfoPanel = nextDynamic(
  () => import('@/components/Store/StoreQuickInfoPanel'),
  {
    ssr: false,
    loading: () => null,
  }
);

// Keep critical components as regular imports
import FloorSelector from '@/components/UI/FloorSelector';
import LocationCloseConfirmModal from '@/components/Map/LocationCloseConfirmModal';
import MapHeaderControls from '@/components/Map/MapHeaderControls';
import MapSidebar from '@/components/Map/MapSidebar';
import MapHeader from '@/components/Map/MapHeader';
import QuickAccessButtons from '@/components/QuickAccessButtons';
import MobileRouteCard from '@/components/Route/MobileRouteCard';

import { useLanguage } from '@/contexts/LanguageContext';

import SearchBar from '@/components/Search/SearchBar';
import RouteInputs from '@/components/Search/RouteInputs';
import SearchResults from '@/components/Search/SearchResults';
import {
  findRoomByName,
  findClosestSpecialLocation,
} from '../utils/roomHelpers.js';
import { createChatHandlers } from '../utils/chatHandlers.js';
import {
  isEscalatorEntranceStep,
  isEscalatorExitStep,
  extractCorridorName,
  shouldSkipCorridorBouncing,
  shouldSkipStep,
  calculateBearing,
  getCurrentInstruction,
} from '../utils/routeHelpers.js';

import {
  fitMapToPath,
  highlightRoom,
  highlightQrRoom,
  clearHighlightFromAllFloors,
  applyDualRoomHighlight,
} from '../utils/mapHelpers.js';
import { useChatManagement } from '../hooks/useChatManagement';
import { useMapNavigation } from '../hooks/useMapNavigation';
import { useSearch } from '../hooks/useSearch';
import { useRouteManagement } from '../hooks/useRouteManagement';
import { useUIState } from '../hooks/useUIState';
import { useLocationDetection } from '../hooks/useLocationDetection';
import { useQRProcessing } from '../hooks/useQRProcessing';
import { useRouteAnimation } from '../hooks/useRouteAnimation';
import { useRouteCalculation } from '../hooks/useRouteCalculation';
import { useRouteActions } from '../hooks/useRouteActions';
import { useSearchHandlers } from '../hooks/useSearchHandlers';
import { useChatApi } from '../hooks/useChatApi';
import { usePathDrawing } from '../hooks/usePathDrawing';
import { useSimpleVoice } from '@/hooks/useSimpleVoice';
import { useGraphBuilder } from '../hooks/useGraphBuilder';
import { getCookie } from '../utils/markerHelpers';
// Lazy load heavy components for better mobile performance
const AssistantModal = nextDynamic(() => import('@/components/AssistantModal'), {
  ssr: false,
  loading: () => null,
});
import {
  createFunctionCallRouter,
  OPENAI_FUNCTIONS,
} from '../utils/functionCallHandler';
import {
  multiFloorDijkstra,
  calculatePathDistance,
} from '../utils/dijkstra.js';
import { calculateAdvancedRoute } from '../utils/advancedRouting.js';
import { detectUserLocation } from '../utils/locationHelpers.js';

const StarRating = nextDynamic(() => import('@/components/Rating/StarRating'), {
  ssr: false,
  loading: () => null,
});
import { useAuth } from '@/hooks/useAuth';
import BottomNavbar from '@/components/Navigation/BottomNavbar';
import {
  Bot,
  Route,
  Compass,
  User,
  X,
  HeartPulse,
  PersonStanding,
  Baby,
  DoorOpen,
  Flame,
  AlertTriangle,
  MapPin,
  Send,
  Search,
  Sparkles,
  Navigation,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Repeat2,
  Menu,
} from 'lucide-react';
function MapContent() {
  // ... rest of the component

  // Hydration-safe mounting check - MUST be first
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  // Kiosk mode kontrolü - hydration-safe
  const [isKioskMode, setIsKioskMode] = useState(false);

  useEffect(() => {
    setIsKioskMode(searchParams.get('kiosk') === 'true');
    if (searchParams.get('assistant') === 'true') {
      setIsAssistantOpen(true);
    }
  }, [searchParams]);

  const chatHook = useChatManagement({
    functions: OPENAI_FUNCTIONS,
    onFunctionCall: null,
    initialMessage:
      language === 'tr'
        ? 'Merhaba! Ben Toponus AI, navigasyon asistanınızım. Size yardımcı olmak için buradayım. Hangi mağazaya gitmek istiyorsunuz?'
        : 'Hello! I am Toponus AI, your navigation assistant. I am here to help you. Which store would you like to go to?',
    language: language,
    t: t,
  });
  const {
    chatMessages,
    input,
    setInput,
    isAssistantTyping,
    sendMessage,
    addMessage,
    setChatMessages,
    functions,
    setOnFunctionCall,
  } = chatHook;

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [allGeoData, setAllGeoData] = useState({});
  const [currentFloor, setCurrentFloor] = useState(0);
  const [graph, setGraph] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [doors, setDoors] = useState([]);
  const [selectedStartRoom, setSelectedStartRoom] = useState('');
  const [selectedEndRoom, setSelectedEndRoom] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [routeMode, setRouteMode] = useState('basit'); // Varsayılan: Basit mod
  const [isTranscribing, setIsTranscribing] = useState(false);
  const scrollToBottom = () => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (chatMessagesEndRefMobile.current) {
      chatMessagesEndRefMobile.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  const [currentUserLocation, setCurrentUserLocation] = useState('');
  const [preferredTransport, setPreferredTransport] = useState('escalator');
  const [selectedQuickAccess, setSelectedQuickAccess] = useState('');
  const [storeList, setStoreList] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [routeByFloor, setRouteByFloor] = useState({});
  const isSelectingStartRoomRef = useRef(false);
  const [startQuery, setStartQuery] = useState('');
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [endQuery, setEndQuery] = useState('');
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const [isCardMinimized, setIsCardMinimized] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllQuickAccess, setShowAllQuickAccess] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const routeStepsRef = useRef([]);
  const chatMessagesEndRef = useRef(null);
  const chatMessagesEndRefMobile = useRef(null);
  const [placeName, setPlaceName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(15);
  const [campaignRooms, setCampaignRooms] = useState([]);
  const [popularPlacesIndex, setPopularPlacesIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSelectingStartRoom, setIsSelectingStartRoom] = useState(false);
  const [discoverPanelHeight, setDiscoverPanelHeight] = useState(320);
  const [isFloorPanelOpen, setIsFloorPanelOpen] = useState(true);
  const [mapView, setMapView] = useState('3D');
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [discoverHeight, setDiscoverHeight] = useState(50);
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [qrHighlightedRoom, setQrHighlightedRoom] = useState(null);
  const [showQrPopup, setShowQrPopup] = useState(false);
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const {
    searchQuery,
    setSearchQuery,
    showSearchDropdown,
    setShowSearchDropdown,
    searchResults,
    setSearchResults,
    isSearchFocused,
    setIsSearchFocused,
    handleSearch: hookHandleSearch,
  } = useSearch(rooms);
  const [showLocationMarker, setShowLocationMarker] = useState(false);
  const [showLocationCloseConfirm, setShowLocationCloseConfirm] = useState(false);
  const [locationMarkerCoords, setLocationMarkerCoords] = useState(null);
  const [locationMarkerFloor, setLocationMarkerFloor] = useState(0);
  const qrProcessedRef = useRef(false);

  // Define changeFloor before it's used in other hooks
  const changeFloor = useCallback(newFloor => {
    setCurrentFloor(newFloor);
  }, []);

  const {
    animateIconAlongRoute,
    stopAnimation,
    startAnimation,
    isAnimationActiveRef,
    animationFrameIdRef,
  } = useRouteAnimation({ mapRef, currentFloor, changeFloor });
  const [showStoreRating, setShowStoreRating] = useState(false);
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);
  const [showQuickStoreInfo, setShowQuickStoreInfo] = useState(false);
  const [selectedQuickStore, setSelectedQuickStore] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Discover modal kontrolü - URL parametresinden
  useEffect(() => {
    const discoverParam = searchParams.get('discover');

    if (discoverParam === 'true') {

      setIsDiscoverOpen(true);
      setActiveNavItem(1);
      setDiscoverHeight(50);
      // URL'den parametreyi temizle
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('discover');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const {
    isDetectingLocation,
    handleDetectCurrentLocation,
  } = useLocationDetection({
    rooms,
    setRooms,
    currentFloor,
    setCurrentFloor,
    changeFloor: newFloor => {

      setCurrentFloor(newFloor);
    },
    setSelectedStartRoom,
    setStartQuery,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    setShowLocationMarker,
    setShowLocationCloseConfirm,
    mapRef,
    maplibregl,
    addMessage,
    setActiveNavItem,
    setIsCardMinimized,
  });

  useEffect(() => {
    isSelectingStartRoomRef.current = isSelectingStartRoom;
  }, [isSelectingStartRoom]);

  const { handleSearchResultSelect } = useSearchHandlers({
    setSearchQuery,
    setShowSearchDropdown,
    setIsSearchFocused,
    setRooms,
    setCurrentFloor,
    changeFloor,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    setShowLocationMarker,
    setSelectedStartRoom,
    setStartQuery,
    mapRef,
    setActiveNavItem,
    setIsCardMinimized,
    setSelectedEndRoom,
    isSelectingStartRoom,
    currentFloor,
    maplibregl,
    setShowLocationCloseConfirm,
  });

  const getInstruction = () => {
    return getCurrentInstruction(
      routeSteps,
      routeByFloor,
      currentFloor,
      selectedStartRoom,
      selectedEndRoom,
      rooms,
      preferredTransport
    );
  };

  const updateRoomClickHandlers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    Object.keys(geojsonURLS).forEach(floor => {
      const layerId = `rooms-floor-${floor}`;
      if (map.getLayer(layerId)) {
        map.off('click', layerId);
        map.off('mouseenter', layerId);
        map.off('mouseleave', layerId);
      }
    });
    Object.keys(geojsonURLS).forEach(floor => {
      const layerId = `rooms-floor-${floor}`;
      if (!map.getLayer(layerId)) return;
      map.on('click', layerId, e => {
        const layerVisibility = map.getLayoutProperty(layerId, 'visibility');
        if (layerVisibility === 'none') return;
        if (routeStepsRef.current.length > 0) return;
        setIsAssistantOpen(false);

        const roomFeature = e.features[0];
        const roomId = roomFeature.properties.id;
        const namespacedRoomId = `f${floor}-${roomId}`;
        const selectedRoom = rooms.find(r => r.id === namespacedRoomId);

        if (isSelectingStartRoomRef.current) {
          setSelectedStartRoom(namespacedRoomId);
          setIsSelectingStartRoom(false);
          if (selectedRoom) {
            setStartQuery(selectedRoom.name);
          }
          setActiveNavItem(0);
        } else {
          setSelectedEndRoom(namespacedRoomId);
          let roomData = selectedRoom;

          if (!roomData) {
            const props = roomFeature.properties;
            roomData = {
              id: namespacedRoomId,
              name: props.name || 'Bilinmeyen Oda',
              floor: parseInt(floor),
              is_special: props.type === 'special' || false,
              coordinates: roomFeature.geometry?.coordinates?.[0]?.[0] || null,
              description: props.description || '',
              hours: props.hours || '',
              phone: props.phone || '',
              website: props.website || '',
              logo: props.logo || '',
              header_image: props.header_image || '',
              services: props.services || '',
              promotion: props.promotion || '',
            };
          }

          if (roomData) {
            setEndQuery(roomData.name);
            if (!roomData.is_special) {
              // Hızlı bilgi panelini göster
              setSelectedQuickStore(roomData);
              setShowQuickStoreInfo(true);
              // Kartı kapalı tut, sadece hızlı panel göster
              setIsCardMinimized(true);

              // Mağaza geçmişine kaydet (son 5 mağaza)
              try {
                const historyKey = 'store_history';
                const existingHistory = JSON.parse(
                  localStorage.getItem(historyKey) || '[]'
                );
                const newEntry = {
                  id: roomData.id,
                  name: roomData.name,
                  floor: roomData.floor,
                  logo: roomData.logo || roomData.header_image,
                  visitedAt: new Date().toISOString(),
                };
                // Aynı mağaza varsa kaldır
                const filteredHistory = existingHistory.filter(
                  item => item.id !== roomData.id
                );
                // Başa ekle ve son 5'i al
                const updatedHistory = [newEntry, ...filteredHistory].slice(
                  0,
                  5
                );
                localStorage.setItem(
                  historyKey,
                  JSON.stringify(updatedHistory)
                );

              } catch (err) {
                console.error('Store history save error:', err);
              }
            } else {
              // Özel lokasyonlar için kartı aç
              setIsCardMinimized(false);
            }
          }
          setActiveNavItem(0);
        }
      });
      map.on('mouseenter', layerId, () => {
        const layerVisibility = map.getLayoutProperty(layerId, 'visibility');
        if (layerVisibility === 'none') return;
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }, [isSelectingStartRoom]);
  const handleQuickAccessItemClick = locationKey => {
    const specialLocation = specialLocations[locationKey];
    if (specialLocation) {
      const targetRoom = rooms.find(
        room => room.is_special && room.special_type === locationKey
      );
      if (targetRoom) {
        setSelectedEndRoom(targetRoom.id);
        setEndQuery(targetRoom.name);
      }
    }
    if (!currentUserLocation && !selectedStartRoom) {
      setActiveNavItem(0);
      setIsCardMinimized(false);
      setIsSelectingStartRoom(true);
      setSelectedStartRoom('');
      setStartQuery('');
      return;
    }
    setShowLocationWarning(false);
    handleSpecialLocationButton(locationKey);
  };

  // Favori durumunu kontrol et
  const checkFavoriteStatus = useCallback(async () => {
    if (!isAuthenticated || !user || !selectedQuickStore?.id) return;

    try {
      const token = localStorage.getItem('user_token');
      if (!token) return;

      const response = await fetch('/api/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const isFav = data.favorites.some(
          fav => fav.storeId === selectedQuickStore.id
        );
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Favori kontrol hatası:', error);
    }
  }, [isAuthenticated, user, selectedQuickStore?.id]);

  // Favori toggle
  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert(t('favorites.loginRequired'));
      return;
    }

    if (!selectedQuickStore?.id) return;

    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('user_token');
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: selectedQuickStore.id,
          storeName: selectedQuickStore.name,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsFavorite(data.action === 'added');

        // localStorage'daki user data'yı güncelle
        const userData = JSON.parse(localStorage.getItem('user_data'));
        if (userData) {
          userData.favoriteStores = data.favorites;
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
      } else {
        alert(data.error || t('errors.sendMessageError'));
      }
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
      alert(t('errors.sendMessageError'));
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Mağaza değiştiğinde favori durumunu kontrol et
  useEffect(() => {
    if (showQuickStoreInfo && selectedQuickStore) {
      checkFavoriteStatus();
    }
  }, [showQuickStoreInfo, selectedQuickStore, checkFavoriteStatus]);

  useEffect(() => {
    if (selectedStartRoom && selectedEndRoom && isSelectingStartRoom) {
      const endRoom = rooms.find(r => r.id === selectedEndRoom);
      if (endRoom && endRoom.is_special) {
        setIsSelectingStartRoom(false);
      }
    }
  }, [selectedStartRoom, selectedEndRoom, isSelectingStartRoom, rooms]);
  const handleLocationSelection = userLocationId => {
    if (!selectedQuickAccess || !userLocationId) return;
    setCurrentUserLocation(userLocationId);
    handleSpecialLocationButton(selectedQuickAccess);
    setSelectedQuickAccess('');
  };
  useEffect(() => {
    if (selectedEndRoom) {
      const endRoom = rooms.find(r => r.id === selectedEndRoom);
      setEndQuery(endRoom?.name || '');
    } else {
      setEndQuery('');
    }
  }, [selectedEndRoom, rooms]);
  useEffect(() => {
    if (selectedStartRoom) {
      const startRoom = rooms.find(r => r.id === selectedStartRoom);
      setStartQuery(startRoom?.name || '');
    } else {
      setStartQuery('');
    }
  }, [selectedStartRoom, rooms]);
  const quickAccessList = getQuickAccessList();

  const slug = searchParams.get('slug') || 'ankamall';
  
  useEffect(() => {
    if (slug !== 'ankamall') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('slug', 'ankamall');
      window.history.replaceState({}, '', newUrl.toString());
      return;
    }

    const demoPopupSeen = getCookie('demoPopupSeen');
    if (!demoPopupSeen) {
      setShowDemoPopup(true);
    }

    fetch('/api/places?slug=' + encodeURIComponent(slug))
      .then(res => res.json())
      .then(data => {
        if (data.error || !data.place) {
          throw new Error(data.error || 'Place data not found');
        }
        const name = data.place;
        const place_id = data.place_id;
        const floors = data.floors;
        const center = data.center;

        setPlaceName(name);
        setPlaceId(place_id);
        setAllGeoData(floors || {});
        setMapCenter(center || [0, 0]);
        setRooms(data.rooms || []);
        setDoors(data.doors || []);
        setCampaignRooms(data.campaigns || []);

        const storeListWithId = (data.rooms || [])
          .filter(room => room.type === 'room' && room.name)
          .map(room => ({
            id: room.id,
            room_id: room.room_id,
            name: room.name,
            floor: room.floor,
            logo: room.logo,
            description: room.description,
            category: room.category,
            tags: room.tags,
            website: room.website,
            phone: room.phone,
            hours: room.hours,
            images: room.images,
            rating: room.rating,
            coordinates: room.coordinates
          }));
        setStoreList(storeListWithId);

        if (floors) {
          Object.keys(floors).forEach(floor => {
            const floorNum = parseInt(floor);
            geojsonURLS[floorNum] = floors[floor];
          });
        }
        if (center) {
          setMapCenter(center);
        }
        if (zoom) {
          setMapZoom(zoom);
        }
        const currentStoreList = Array.from(storeList).sort();

        // URL'den QR parametrelerini kontrol et veya Kiosk mode
        let lat = searchParams.get('lat');
        let lng = searchParams.get('lng');
        let floorParam = searchParams.get('floor');

        // Kiosk mode ise sabit konumu kullan
        if (isKioskMode) {
          lat = '39.95026307131235';
          lng = '32.83056577782409';
          floorParam = '0';
        }

        const hasQRLocation = !!(lat && lng);

        const qrLocationInfo = hasQRLocation
          ? `\n## 🎯 KULLANICI DURUMU: ${
              isKioskMode ? 'KIOSK MODU' : 'QR KOD İLE GELDİ'
            }
              - ${
                isKioskMode
                  ? 'Kullanıcı kiosk cihazından bağlandı'
                  : 'Kullanıcı QR kod okutarak geldi'
              } ve TAM OLARAK bulunduğu nokta tespit edildi!
              - Koordinatlar: lat=${lat}, lng=${lng}, kat=${floorParam || 0}
              - Bu koordinat kullanıcının GERÇEK konumudur (bir mağaza değil, ${
                isKioskMode ? 'kiosk noktası' : 'koridordaki bir nokta'
              })
              - Kullanıcı rota istediğinde (örn: "Boyner'e gitmek istiyorum", "5m Migrosa nasıl giderim"):
                * İLK ÖNCE navigate_user(to: "hedef mağaza", confirm: false) ile çağır
                * Kullanıcıya "Emin misiniz?" diye sor
                * Kullanıcı "evet", "tamam", "olur" derse navigate_user(to: "hedef mağaza", confirm: true) ile TEKRAR çağır
                * MUTLAKA 'from' parametresini BOŞ BIRAK veya hiç gönderme
                * Sistem otomatik olarak ${
                  isKioskMode ? 'kiosk konumundan' : 'QR koordinatından'
                } başlayacak (en yakın mağaza DEĞİL!)
              - Kullanıcıya "Hangi mağazanın yanındasınız?" diye SORMA!
              - Rota "📍 ${
                isKioskMode ? 'Şu an bu kiosktasınız' : 'Şu an buradasınız'
              }" noktasından başlayacak`
          : `\n## 👤 KULLANICI DURUMU: NORMAL GİRİŞ
              - Kullanıcı QR kod ile gelmedi
              - Rota istediğinde:
                * İLK ÖNCE navigate_user(from: "başlangıç", to: "hedef", confirm: false) ile çağır
                * Kullanıcıya "Emin misiniz?" diye sor
                * Kullanıcı "evet", "tamam", "olur" derse navigate_user(from: "başlangıç", to: "hedef", confirm: true) ile TEKRAR çağır`;

        setChatMessages([
          {
            role: 'system',
            content: `
              # ${name} iç mekanında çalışan bir navigasyon asistanısın.
              ${qrLocationInfo}
              ## MEVCUT MAĞAZALAR: Bu Mağazalar şu an bulunan mağazalar. Bunların dışında kesinlikle mağaza ismi verme.
              Güncel ve anlık veriler bu mağazalar. İsimleri ve kullanıcıları bu mağazalara yönlendir. Bu Mağazalar paylaşılabilir, yönlendirilebilir.
              ${currentStoreList.join(', ')}
              ## MAĞAZA İSİM EŞLEŞTİRMESİ:
              - Kullanıcının söylediği mağaza isimlerini yukarıdaki listeden en yakın eşleşeni bul
              - "Starbucksa" → "Starbucks", "H&Me" → "H&M", Etstur -> Ets Tur gibi
              - 0. kat bilgilerini zemin kat veya giriş kat olarak algıla ve kullan.
              
              ## ÜRÜN-MAĞAZA EŞLEŞTİRMESİ (AKILLI TAHMİN + ALTERNATİFLER):
              - Kullanıcı bir ürün istediğinde, ÖNCE ana mağazayı öner, SONRA alternatif bölümleri de söyle:
              
              ### ANA MAĞAZA ÖNERİLERİ:
                * "Koçtaş" → Yapı market, hırdavat, kablo, vida, boya, el aletleri, bahçe malzemeleri
                * "Migros, 5M Migros" → Market, su, yiyecek, içecek, atıştırmalık, temel ihtiyaçlar
                * "Teknosa, Vatan Bilgisayar, Media Markt" → Elektronik, telefon, bilgisayar, kablo, kulaklık
                * "Boyner, Defacto, LC Waikiki, Koton, H&M, İpekyol, Naramaxx, Collezione, Colins" → Giyim, kıyafet, pantolon, gömlek, elbise, tişört, kazak
                * "Damat Tween, Ramsey, igs, Kip, Cacharel, Sarar" → Erkek giyim, takım elbise, klasik giyim, pantolon, gömlek
                * "İpekyol, ADL, Ekol, Tüzün, Seçil, Network, Sarar Woman" → Kadın giyim, elbise, bluz, pantolon, tesettür
                * "FLO, Ayakkabı Dünyası, SuperStep, Koray Spor" → Ayakkabı, spor ayakkabı
                * "D&R" → Kitap, dergi, kırtasiye
                * "Starbucks, Kahve Dünyası, Cafe Crown" → Kahve, çay, içecek
                * "Atasun Optik, Gözlükçü, Göz Grup, Opmar Optik" → Gözlük, güneş gözlüğü
                * "Gratis, Rossmann, Watsons, Sevil Parfümeri, Sephora, Kiko, Missha" → Kozmetik, makyaj, parfüm, kişisel bakım
                * "Eczane" → İlaç, sağlık ürünleri, vitamin
                * "Joker, Toyzz Shop, Play Home" → Oyuncak, çocuk ürünleri
              
              ### ÖZEL ÜRÜN ÖNERİLERİ:
              - "Pantolon almak istiyorum" → "Pantolon için harika seçenekler var! 👔 H&M, LC Waikiki, Colins, Koton gibi mağazalarda çeşitli pantolon modelleri bulabilirsiniz. Erkek pantolonu için Damat Tween, Ramsey veya Sarar'ı da önerebilirim. Sizi hangi mağazaya yönlendireyim?"
              - "Tişört arıyorum" → "Tişört için Colins, LC Waikiki, H&M, Koton gibi mağazaları önerebilirim. Hangi mağazayı tercih edersiniz?"
              - "Elbise almak istiyorum" → "Elbise için İpekyol, ADL, Ekol, Boyner gibi mağazalara bakabilirsiniz. Sizi hangi mağazaya yönlendireyim?"
              - "Ayakkabı arıyorum" → "Ayakkabı için FLO, Deichmann, Bambi, SuperStep veya Koray Spor'u önerebilirim. Spor ayakkabı mı klasik ayakkabı mı arıyorsunuz?"
              - "Çanta almak istiyorum" → "Çanta için Elle, Venessa, Desa, Ravelli veya Samsonite'ı önerebilirim. Hangi tarz çanta arıyorsunuz?"
              
              ### ALTERNATİF BÖLÜM ÖNERİLERİ (mutlaka ekle):
              Örnek format: "Kablo için en iyi seçenek Koçtaş. Alternatif olarak 5M Migros'un hırdavat bölümünde de bulabilirsiniz."
              
              Ürün bazlı alternatifler:
                * Kablo → Ana: Koçtaş | Alt: "5M Migros (hırdavat bölümü)", "Teknosa (aksesuar bölümü)"
                * Pil, batarya → Ana: Teknosa | Alt: "Migros (market bölümü)", "Koçtaş (hırdavat)"
                * Çanta → Ana: Giyim mağazaları | Alt: "Spor mağazaları (spor çanta)", "Ayakkabı mağazaları (aksesuar)"
                * Şarj aleti → Ana: Teknosa | Alt: "Koçtaş (elektrik bölümü)", "Migros (temel aksesuarlar)"
                * Oyuncak → Ana: Joker/Toyzz Shop | Alt: "Migros (çocuk bölümü)", "Kitap mağazaları"
                * Kırtasiye → Ana: D&R | Alt: "Migros (kırtasiye bölümü)"
                * Çikolata, atıştırmalık → Ana: Migros | Alt: "Kafeler (tatlı çeşitleri)"
              
              - Mağaza listesinde bu isimleri ara ve SADECE VARSA öner
              - ASLA olmayan mağaza önerme!
              
              ### MAĞAZA ÖNERİSİ SONRASI SORU FORMATI:
              - Mağaza önerisi yaptıktan sonra MUTLAKA şu ifadeyi kullan:
                ✅ "Sizi hangi mağazaya yönlendireyim?"
                ❌ "Hangi mağazaya yönlenmek istersiniz?" (KULLANMA)
              - Daha samimi ve yardımsever bir ton kullan
              ## KAMPANYA SORGUSU:
              - Kullanıcı "kampanyalar", "indirimler", "hangi ürünlerde indirim var", "aktif kampanyalar neler" gibi sorular sorduğunda:
                * show_campaigns fonksiyonunu çağır
                * Dönen kampanyaları kullanıcıya açık ve anlaşılır şekilde sunun
                * İndirim yüzdelerini ve ürün adlarını vurgula
                * Mağaza adını ve katını belirt
              
              ## ÖZEL LOKASYON ÖZELLİKLERİ - YENİ:
              - find_special_location fonksiyonunu kullandığında, dönen bilgileri dikkatli oku:
                * user_floor: Kullanıcının bulunduğu kat
                * floor: Hedef lokasyonun bulunduğu kat  
                * distance: Toplam mesafe
              # YENİ: ÖZEL LOKASYON ÖZELLİKLERİ
              - Kullanıcı özel lokasyonlar istediğinde find_special_location fonksiyonunu kullan:
                * "Tuvalete gitmek istiyorum" → wc
                * "Çıkış, normal çıkış kapısı" → exit
                * "Giriş, normal giriş kapısı" → entrance
                * "ATM arıyorum" → atm
                * "Eczane, ilaç" → pharmacy
                * "Acil çıkış nerede?" → emergency-exit
                * "Yangın merdiveni" → fire-exit
                * "Bebek bezini değiştirmem lazım" → baby-care
                * "İlk yardım" → first-aid
                * "Bilgi, danışma" → info-desk
              - Özel lokasyon ararken, eğer QR ile geldiyse 'user_location' parametresini boş bırak, sistem otomatik bulacak.
              # ÖNEMLİ: ROTA ONAY MEKANİZMASI
              - Kullanıcı bir mağazaya gitmek istediğinde (örn: "Boyner'e gideceğim", "5m Migrosa gitmek istiyorum", "Boyner'deyim 5 Migros'a gitmek istiyorum"):
                1. KONUM AYIKLAMA: Eğer kullanıcı "X'deyim Y'ye gitmek istiyorum" şeklinde söylüyorsa:
                   - X = başlangıç konumu (from)
                   - Y = hedef konum (to)
                   - Örn: "Boyner'deyim 5 Migros'a gitmek istiyorum" → from: "Boyner", to: "5 Migros"
                2. İLK ADIM: navigate_user fonksiyonunu confirm: false ile çağır (from ve to parametrelerini belirt)
                3. Kullanıcıya "🗺️ [başlangıç] → [hedef]\n\nBu rotayı oluşturmak istediğinizden emin misiniz?\n\n'Evet' veya 'Hayır' diyebilirsiniz." şeklinde sor
                4. Kullanıcı "evet", "tamam", "olur", "oluştur" gibi onay verirse: navigate_user fonksiyonunu confirm: true ile TEKRAR çağır
                5. Kullanıcı "hayır", "iptal" derse: "Rota oluşturma iptal edildi. Başka bir yere gitmek ister misiniz?" de
              - ASLA direkt rota oluşturma, her zaman önce onay iste!
              - KONUM AYIKLAMA ÖRNEKLERİ:
                * "Boyner'deyim 5 Migros'a gitmek istiyorum" → from: "Boyner", to: "5 Migros"
                * "Starbucks'tayım Teknosa'ya nasıl giderim?" → from: "Starbucks", to: "Teknosa"
                * "H&M'deyim Koçtaş'a gitmek istiyorum" → from: "H&M", to: "Koçtaş"
                * "Şu an Migros'tayım, Boyner'e gitmek istiyorum" → from: "Migros", to: "Boyner"
              
              # ÖNEMLİ KAT BİLGİSİ:
              - Kullanıcı "indim", "aşağı indim", "alt kata indim" dediğinde change_floor fonksiyonunu "down" parametresiyle çağır.
              - Kullanıcı "çıktım", "yukarı çıktım", "üst kata çıktım" dediğinde change_floor fonksiyonunu "up" parametresiyle çağır.
              - Kat değişimi yaptığında kullanıcıya hangi kata geçtiğini söyle.
              `,
          },
          {
            role: 'assistant',
            content: hasQRLocation
              ? `Merhaba! Ankamall'a hoş geldiniz.\n\n📍 ${
                  isKioskMode ? 'Şu an bu kiosktasınız' : 'Şu an buradasınız'
                }!\n\nSize mağazalar, etkinlikler veya yol tarifi konusunda nasıl yardımcı olabilirim?`
              : `Merhaba! Ankamall'a hoş geldiniz.\n\nSize mağazalar, etkinlikler veya yol tarifi konusunda nasıl yardımcı olabilirim?`,
          },
        ]);
      })
      .catch(err => {
        console.error('Place fetch error, using fallback:', err);
        if (slug === 'ankamall') {
          setPlaceName('Ankamall');
          setPlaceId('fallback-ankamall');
          setMapCenter([32.83056577782409, 39.95026307131235]);
          setMapZoom(18);
          geojsonURLS[0] = 'places/ankamall/final/floor_0.geojson';
          geojsonURLS[1] = 'places/ankamall/final/floor_1.geojson';
          geojsonURLS[2] = 'places/ankamall/final/floor_2.geojson';
        }
        setChatMessages([
          {
            role: 'assistant',
            content:
              'Merhaba! Ankamall\'a hoş geldiniz.\n\nSize mağazalar, etkinlikler veya yol tarifi konusunda nasıl yardımcı olabilirim?',
          },
        ]);
      });
  }, [searchParams]);

  useEffect(() => {
    if (storeList.length > 0 && chatMessages.length > 0) {
      const updatedMessages = [...chatMessages];
      if (updatedMessages[0]?.role === 'system') {
        updatedMessages[0].content = updatedMessages[0].content.replace(
          /## MEVCUT MAĞAZALAR:.*?(\n\s*\n)/s,
          `## MEVCUT MAĞAZALAR: Bu Mağazalar şu an bulunan mağazalar. Bunların dışında kesinlikle mağaza ismi verme.
              Güncel ve anlık veriler bu mağazalar. İsimleri ve kullanıcıları bu mağazalara yönlendir. Bu Mağazalar paylaşılabilir, yönlendirilebilir.
              ${storeList.join(', ')}
              `
        );
        setChatMessages(updatedMessages);
      }
    }
  }, [storeList]);
  useEffect(() => {
    const targetRoom = searchParams.get('targetRoom');
    const selectStart = searchParams.get('selectStart');
    if (targetRoom && rooms.length > 0) {
      const room = rooms.find(r => r.id === targetRoom || r.room_id === targetRoom);
      if (room) {
        if (selectStart === 'true') {
          setSelectedEndRoom(room.id);
          setEndQuery(room.name);
          setActiveNavItem(0);
          setIsCardMinimized(true);
          setIsSelectingStartRoom(true);
        } else {
          // Open store info panel directly
          setSelectedStoreForRating(room);
          setShowStoreRating(true);
          
          // Close other panels to make sure store info is visible
          setIsDiscoverOpen(false);
          setIsAssistantOpen(false);
          
          // Optionally fly to the room
          if (mapRef.current && room.coordinates) {
            mapRef.current.flyTo({
              center: room.coordinates,
              zoom: 18,
              duration: 1500
            });
          }
        }
        // Clean URL to prevent re-opening
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('targetRoom');
        newUrl.searchParams.delete('selectStart');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, rooms]);
  useEffect(() => {
    const navigate = searchParams.get('navigate');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (navigate === 'true' && from && to && rooms.length > 0) {
      const fromRoom = rooms.find(
        r => r.name && r.name.toLowerCase().trim() === from.toLowerCase().trim()
      );
      const toRoom = rooms.find(
        r => r.name && r.name.toLowerCase().trim() === to.toLowerCase().trim()
      );
      if (fromRoom && toRoom) {
        setSelectedStartRoom(fromRoom.id);
        setSelectedEndRoom(toRoom.id);
        setStartQuery(fromRoom.name);
        setEndQuery(toRoom.name);
        setActiveNavItem(0);
        setIsCardMinimized(false);
        if (fromRoom.floor !== currentFloor) {
          setCurrentFloor(fromRoom.floor);
          changeFloor(fromRoom.floor);
        }
      }
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('navigate');
      newUrl.searchParams.delete('from');
      newUrl.searchParams.delete('to');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, rooms, currentFloor]);

  // Hash kontrolü - Asistan modalını aç
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#assistant') {
      setIsAssistantOpen(true);
      // Hash'i temizle
      window.history.replaceState(
        {},
        '',
        window.location.pathname + window.location.search
      );
    }
  }, []);
  useQRProcessing({
    searchParams,
    rooms,
    setRooms,
    currentFloor,
    setCurrentFloor,
    changeFloor: newFloor => {

      setCurrentFloor(newFloor);
    },
    setQrHighlightedRoom,
    setShowQrPopup,
    setSelectedStartRoom,
    setStartQuery,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    setShowLocationMarker,
    setShowLocationCloseConfirm,
    mapRef,
    maplibregl,
    isKioskMode,
  });

  useEffect(() => {
    const openDiscover = searchParams.get('openDiscover');
    if (openDiscover === 'true') {
      setIsDiscoverOpen(true);
      setDiscoverHeight(50);
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('openDiscover');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery && rooms.length > 0) {
      const foundRoom = findRoomByName(searchQuery, rooms);

      if (foundRoom) {
        // Mağazayı seç (bitiş noktası olarak)
        setSelectedEndRoom(foundRoom.id);

        // Haritayı mağazaya odakla
        if (mapRef.current && foundRoom.center) {
          mapRef.current.flyTo({
            center: foundRoom.center,
            zoom: 19,
            duration: 1500,
          });
        }

        // Katı değiştir
        if (foundRoom.floor !== currentFloor) {
          setCurrentFloor(foundRoom.floor);
        }

        // Kartı aç
        setIsCardMinimized(false);
        setActiveNavItem(0); // Rota sekmesine geç

        // URL'den search parametresini temizle
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('search');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, rooms, currentFloor]);
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setCenter(mapCenter);
      mapRef.current.setZoom(mapZoom);
    }
  }, [mapCenter, mapZoom]);
  const { handleFinish, handleLocationClose, clearRoute, handleCompleteRoute } = useRouteActions({
    totalDistance,
    selectedEndRoom,
    setSelectedStartRoom,
    setSelectedEndRoom,
    setRouteSteps,
    setRouteByFloor,
    setTotalDistance,
    setIsSelectingStartRoom,
    setIsCardMinimized,
    setStartQuery,
    setEndQuery,
    setSearchQuery,
    setSearchResults,
    setShowSearchDropdown,
    setShowStartDropdown,
    setShowEndDropdown,
    setRouteMode,
    setRooms,
    setShowLocationMarker,
    setLocationMarkerCoords,
    setLocationMarkerFloor,
    isAnimationActiveRef,
    animationFrameIdRef,
    rooms,
    setChatMessages,
    mapRef,
    setShowLocationCloseConfirm,
    selectedStartRoom,
    routeSteps,
  });

  const handleNextFloor = () => {
    const startRoom = rooms.find(r => r.id === selectedStartRoom);
    const endRoom = rooms.find(r => r.id === selectedEndRoom);
    const isGoingUp = endRoom?.floor > startRoom?.floor;
    const floors = Object.keys(routeByFloor)
      .map(Number)
      .sort((a, b) => (isGoingUp ? a - b : b - a));
    const currentIndex = floors.indexOf(currentFloor);
    const nextFloor = floors[currentIndex + 1];
    if (nextFloor !== undefined) {
      changeFloor(nextFloor);
    }
  };
  const handlePreviousFloor = () => {
    const startRoom = rooms.find(r => r.id === selectedStartRoom);
    const endRoom = rooms.find(r => r.id === selectedEndRoom);
    const isGoingUp = endRoom?.floor > startRoom?.floor;
    const floors = Object.keys(routeByFloor)
      .map(Number)
      .sort((a, b) => (isGoingUp ? a - b : b - a));
    const currentIndex = floors.indexOf(currentFloor);
    const prevFloor = floors[currentIndex - 1];
    if (prevFloor !== undefined) {
      changeFloor(prevFloor);
    }
  };
  useEffect(() => {
    if (mapRef.current?.isStyleLoaded()) {
      applyDualRoomHighlight(
        mapRef.current,
        selectedStartRoom,
        selectedEndRoom,
        rooms,
        geojsonURLS,
        qrHighlightedRoom
      );
    }
  }, [selectedStartRoom, selectedEndRoom, rooms, qrHighlightedRoom]);
  const handleSpecialLocationButton = specialType => {

    if (!currentUserLocation) {

      return;
    }

    const fromRoom = rooms.find(r => r.id === currentUserLocation);
    if (!fromRoom) {

      return;
    }
    const specialRooms = rooms.filter(room => {
      return (
        room.is_special === true &&
        room.special_type === specialType &&
        room.floor === fromRoom.floor
      );
    });

    if (specialRooms.length === 0) {
      const { getSpecialLocationsByType } = require('../utils/roomHelpers.js');
      const allSpecialRooms = getSpecialLocationsByType(specialType, rooms);

      if (allSpecialRooms.length === 0) {

        return;
      }
    }
    const closestRoom = findClosestSpecialLocation(
      fromRoom,
      specialType,
      rooms,
      graph,
      preferredTransport,
      allGeoData
    );
    if (!closestRoom) {

      return;
    }




    setSelectedStartRoom(fromRoom.id);
    setSelectedEndRoom(closestRoom.id);

  };
  function shouldSkipCorridorBouncing(steps, currentIndex) {
    const currentStep = steps[currentIndex];
    const currentDistance = parseFloat(currentStep.distance) || 0;
    if (currentDistance === 0.0) {

      return true;
    }
    if (currentIndex > 0 && currentIndex < steps.length - 1) {
      const prevStep = steps[currentIndex - 1];
      const nextStep = steps[currentIndex + 1];
      const prevCorridor =
        extractCorridorName(prevStep.from) || extractCorridorName(prevStep.to);
      const currentCorridorFrom = extractCorridorName(currentStep.from);
      const currentCorridorTo = extractCorridorName(currentStep.to);
      const nextCorridor =
        extractCorridorName(nextStep.from) || extractCorridorName(nextStep.to);
      if (
        prevCorridor &&
        nextCorridor &&
        (currentCorridorFrom || currentCorridorTo) &&
        prevCorridor === nextCorridor &&
        currentCorridorFrom !== prevCorridor &&
        currentCorridorTo !== prevCorridor
      ) {
        if (currentDistance < 5) {

          return true;
        }
      }
    }
    if (currentIndex >= 2 && currentIndex <= steps.length - 3) {
      const step1 = steps[currentIndex - 2];
      const step2 = steps[currentIndex - 1];
      const step3 = steps[currentIndex];
      const step4 = steps[currentIndex + 1];
      const step5 = steps[currentIndex + 2];
      const corridor1 =
        extractCorridorName(step1.from) || extractCorridorName(step1.to);
      const corridor2 =
        extractCorridorName(step2.from) || extractCorridorName(step2.to);
      const corridor3 =
        extractCorridorName(step3.from) || extractCorridorName(step3.to);
      const corridor4 =
        extractCorridorName(step4.from) || extractCorridorName(step4.to);
      const corridor5 =
        extractCorridorName(step5.from) || extractCorridorName(step5.to);
      if (
        corridor1 &&
        corridor2 &&
        corridor3 &&
        corridor4 &&
        corridor5 &&
        corridor1 === corridor2 &&
        corridor4 === corridor5 &&
        corridor1 === corridor4 &&
        corridor3 !== corridor1 &&
        currentDistance < 5
      ) {

        return true;
      }
    }
    return false;
  }
  function shouldSkipStep(steps, currentIndex) {
    if (
      !steps ||
      steps.length === 0 ||
      currentIndex < 0 ||
      currentIndex >= steps.length
    ) {
      console.warn(
        `⚠️ Invalid skip check: steps.length=${steps?.length}, currentIndex=${currentIndex}`
      );
      return false;
    }
    const currentStep = steps[currentIndex];
    if (!currentStep) {
      console.warn(`⚠️ currentStep is undefined at index ${currentIndex}`);
      return false;
    }
    if (!currentStep.hasOwnProperty('distance')) {
      console.warn(`⚠️ currentStep has no distance property:`, currentStep);
      return false;
    }
    const currentDistance = parseFloat(currentStep.distance) || 0;
    if (currentDistance === 0.0) {

      return true;
    }
    if (currentIndex > 0 && currentIndex < steps.length - 1) {
      const prevStep = steps[currentIndex - 1];
      const nextStep = steps[currentIndex + 1];
      if (!prevStep || !nextStep) {
        return false;
      }
      const prevCorridor =
        extractCorridorName(prevStep.from) || extractCorridorName(prevStep.to);
      const currentCorridor =
        extractCorridorName(currentStep.from) ||
        extractCorridorName(currentStep.to);
      const nextCorridor =
        extractCorridorName(nextStep.from) || extractCorridorName(nextStep.to);
      if (
        prevCorridor &&
        nextCorridor &&
        currentCorridor &&
        prevCorridor === nextCorridor &&
        currentCorridor !== prevCorridor &&
        currentDistance < 5
      ) {

        return true;
      }
    }
    return false;
  }
  const highlightQrRoom = useCallback((roomId, floor) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const originalId = roomId.includes('-')
      ? roomId
          .split('-')
          .slice(1)
          .join('-')
      : roomId;

    Object.keys(geojsonURLS).forEach(f => {
      const layerId = `rooms-floor-${f}`;
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-extrusion-color', '#eae6d9');
      }
    });
    const layerId = `rooms-floor-${floor}`;
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'fill-extrusion-color', [
        'case',
        ['==', ['get', 'id'], originalId],
        '#10B981',
        '#eae6d9',
      ]);
    }
  }, []);
  const clearHighlightFromAllFloors = () => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    Object.keys(geojsonURLS).forEach(floor => {
      try {
        const layerId = `rooms-floor-${floor}`;
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'fill-extrusion-color', '#eae6d9');
        }
      } catch (error) {
        console.warn(`Could not clear highlight for floor ${floor}:`, error);
      }
    });
    try {
      if (map.getSource('path')) {
        map.getSource('path').setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
        });
      }
      if (map.getSource('path-arrows')) {
        map.getSource('path-arrows').setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
    } catch (error) {
      console.warn('Could not clear path/arrows:', error);
    }
  };
  const highlightRoom = (roomIdOrFeature, targetFloor) => {
    const map = mapRef.current;
    if (!map) return;
    const roomId =
      typeof roomIdOrFeature === 'string'
        ? roomIdOrFeature
        : roomIdOrFeature?.properties?.id;
    if (!roomId) return;
    if (targetFloor !== currentFloor) {

      setCurrentFloor(targetFloor);
      setTimeout(() => {
        if (map.getLayer(`rooms-floor-${targetFloor}`)) {
          map.setPaintProperty(
            `rooms-floor-${targetFloor}`,
            'fill-extrusion-color',
            [
              'case',
              ['==', ['get', 'id'], qrHighlightedRoom?.id || ''],
              '#10B981',
              ['==', ['get', 'id'], roomId],
              '#1B3349',
              ['==', ['get', 'id'], 'room-101'], // 5M Migros için özel renk
              '#E8E8E8',
              '#eae6d9',
            ]
          );
        }
      }, 200);
    } else {
      if (map.getLayer(`rooms-floor-${targetFloor}`)) {
        map.setPaintProperty(
          `rooms-floor-${targetFloor}`,
          'fill-extrusion-color',
          [
            'case',
            ['==', ['get', 'id'], roomId],
            '#1B3349',
            ['==', ['get', 'id'], 'room-101'], // 5M Migros için özel renk
            '#E8E8E8',
            '#eae6d9',
          ]
        );
      }
    }
  };
  const loadCampaignRooms = useCallback(
    (floorData = null) => {
      try {

        const dataSource = floorData || allGeoData;
        if (!dataSource || Object.keys(dataSource).length === 0) {
          return;
        }
        const allRooms = [];
        Object.values(dataSource).forEach(floorData => {
          if (floorData.features) {
            floorData.features.forEach(feature => {
              if (feature.properties.type === 'room') {
                allRooms.push(feature.properties);
              }
            });
          }
        });
        setCampaignRooms(allRooms);

      } catch (error) {
        console.error('❌ Campaign verileri hazırlama hatası:', error);
      }
    },
    [allGeoData]
  );
  const loadAllFloors = async () => {
    const startTime = performance.now();
    try {
      const [floorDataResults, dbRoomsByFloor] = await Promise.all([
        Promise.all(
          Object.entries(geojsonURLS).map(async ([floor, url]) => {
            try {
              const response = await fetch(url);
              const data = await response.json();
              return [floor, data];
            } catch (err) {
              console.error(`Floor ${floor} load error:`, err);
              return [floor, { type: 'FeatureCollection', features: [] }];
            }
          })
        ),
        placeId
          ? fetch(`/api/rooms?place_id=${placeId}`)
              .then(res => res.json())
              .catch(err => {
                console.error('DB rooms load error:', err);
                return {};
              })
          : Promise.resolve({}),
      ]);
      const floorData = Object.fromEntries(floorDataResults);
      if (dbRoomsByFloor && !dbRoomsByFloor.error && Object.keys(dbRoomsByFloor).length > 0) {
        Object.keys(dbRoomsByFloor).forEach(floor => {
          const dbFloorData = dbRoomsByFloor[floor];
          // Kat verisinin ve features dizisinin geçerli olduğundan emin ol
          if (!dbFloorData || !dbFloorData.features || !Array.isArray(dbFloorData.features)) return;
          
          if (!floorData[floor]) {
            floorData[floor] = dbFloorData;
          } else {
            const finalFloorData = floorData[floor];
            const dbRoomIds = new Set(
              dbFloorData.features
                .filter(f => f && f.properties && f.properties.id)
                .map(f => f.properties.id)
            );
            const nonRoomFeatures = (finalFloorData.features || []).filter(
              feature => feature && feature.properties && !dbRoomIds.has(feature.properties.id)
            );
            const mergedDbFeatures = dbFloorData.features.map(dbFeature => {
              const match = (finalFloorData.features || []).find(
                f => f && f.properties && f.properties.id === dbFeature.properties.id
              );
              const mergedProperties = {
                ...(dbFeature.properties || {}),
              };
              return {
                type: 'Feature',
                properties: mergedProperties,
                geometry: match?.geometry || dbFeature.geometry,
              };
            });
            floorData[floor] = {
              ...finalFloorData,
              features: [...nonRoomFeatures, ...mergedDbFeatures],
            };
          }
        });
      }
      setAllGeoData(floorData);
      loadCampaignRooms(floorData);
      return floorData;
    } catch (error) {
      console.error('❌ Kat yükleme hatası:', error);
      setAllGeoData({});
      return {};
    }
  };
  useEffect(() => {
    if (!mapCenter || mapCenter[0] === 0 || mapCenter[1] === 0) {
      return;
    }
    if (mapRef.current) {
      mapRef.current.setCenter(mapCenter);
      mapRef.current.setZoom(mapZoom);
      return;
    }
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:
        'https://api.maptiler.com/maps/basic/style.json?key=c2b5poelsH66NYMBeaq6',
      center: mapCenter,
      zoom: mapZoom,
      minZoom: 16.5,
      maxZoom: 22,
      maxBounds: [
        [mapCenter[0] - 0.002, mapCenter[1] - 0.002], // Southwest coordinates
        [mapCenter[0] + 0.002, mapCenter[1] + 0.002], // Northeast coordinates
      ],
      attributionControl: false,
      pitch: 45,
      bearing: 0,
      interactive: true,
      dragPan: true,
      scrollZoom: true,
      touchZoomRotate: true,
      dragRotate: true,
    });
    mapRef.current = map;

    // Canvas arka plan rengini ayarla
    const canvas = map.getCanvas();
    if (canvas) {
      canvas.style.backgroundColor = 'transparent';
    }

    map.on('load', async () => {
      const style = map.getStyle();
      if (!style.glyphs) {
        style.glyphs =
          'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=c2b5poelsH66NYMBeaq6';
        map.setStyle(style);
      }
      if (style.layers) {
        style.layers.forEach(layer => {
          if (
            layer.source !== undefined &&
            !layer.id.includes('indoor') &&
            !layer.id.includes('path')
          ) {
            if (layer.type === 'background') {
              map.setPaintProperty(layer.id, 'background-color', '#FFFFFF');
              map.setPaintProperty(layer.id, 'background-opacity', 0);
            } else if (layer.type === 'fill-extrusion') {
              // Building katmanları - şeffaf
              map.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0);
            } else if (layer.type === 'fill') {
              map.setPaintProperty(layer.id, 'fill-opacity', 0);
            } else if (layer.type === 'line') {
              map.setPaintProperty(layer.id, 'line-opacity', 0);
            } else if (layer.type === 'symbol') {
              map.setPaintProperty(layer.id, 'text-opacity', 0);
              map.setPaintProperty(layer.id, 'icon-opacity', 0);
            } else if (layer.type === 'raster') {
              map.setPaintProperty(layer.id, 'raster-opacity', 0);
            }
          }
        });
      }
      const elevatorImg = new Image(36, 36);
      elevatorImg.onload = () => map.addImage('elevator-icon', elevatorImg);
      elevatorImg.src = elevatorIcon;
      const escalatorImg = new Image(36, 36);
      escalatorImg.onload = () => map.addImage('escalator-icon', escalatorImg);
      escalatorImg.src = escalatorIcon;
      const img = new Image(24, 24);
      img.onload = () => map.addImage('custom-arrow', img);
      img.src = arrowIcon;
      const mallMarkerImg = new Image(40, 40);
      mallMarkerImg.onload = () => map.addImage('mall-marker', mallMarkerImg);
      mallMarkerImg.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3C!-- Dış çember (glow efekti) --%3E%3Ccircle cx='50' cy='50' r='45' fill='rgba(255, 107, 107, 0.2)' stroke='rgba(255, 107, 107, 0.4)' stroke-width='2'%3E%3Canimate attributeName='r' from='40' to='45' dur='2s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' from='0.8' to='0.3' dur='2s' repeatCount='indefinite'/%3E%3C/circle%3E%3C!-- Ana marker çemberi --%3E%3Ccircle cx='50' cy='50' r='35' fill='%23FF6B6B' stroke='white' stroke-width='4'/%3E%3C!-- Mall ikonu --%3E%3Cpath d='M25 35h50v30H25z' fill='white'/%3E%3Cpath d='M20 30h60l-5-10H25z' fill='white'/%3E%3Crect x='30' y='40' width='8' height='15' fill='%23FF6B6B'/%3E%3Crect x='42' y='40' width='8' height='15' fill='%23FF6B6B'/%3E%3Crect x='54' y='40' width='8' height='15' fill='%23FF6B6B'/%3E%3Crect x='66' y='40' width='8' height='15' fill='%23FF6B6B'/%3E%3C!-- 'M' harfi --%3E%3Ctext x='50' y='75' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' font-weight='bold' fill='white'%3EM%3C/text%3E%3C/svg%3E";
      map.addSource('mall-location', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [32.7769, 39.8767],
          },
          properties: {
            name: 'Mall of Ankara',
            description: 'Ankamall - Alışveriş Merkezi',
          },
        },
      });
      map.addLayer({
        id: 'mall-location-layer',
        type: 'symbol',
        source: 'mall-location',
        layout: {
          'icon-image': 'mall-marker',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            0.8,
            15,
            1.2,
            18,
            0.6,
          ],
          'icon-anchor': 'center',
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            12,
            15,
            16,
            18,
            10,
          ],
          'text-anchor': 'top',
          'text-offset': [0, 2],
          'text-allow-overlap': false,
        },
        maxzoom: 18.5,
        paint: {
          'text-color': '#FF6B6B',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      });
      map.on('click', 'mall-location-layer', () => {
        map.flyTo({
          center: mapCenter,
          zoom: 19,
          duration: 2000,
          essential: true,
        });
      });
      map.on('mouseenter', 'mall-location-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'mall-location-layer', () => {
        map.getCanvas().style.cursor = '';
      });
      const personPing = new Image(48, 48);
      personPing.onload = () => map.addImage('person-ping-icon', personPing);
      personPing.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='rgba(0, 51, 78, 0.3)'%3E%3Canimate attributeName='r' from='35' to='50' dur='1.5s' begin='0s' repeatCount='indefinite'/%3E%3Canimate attributeName='opacity' from='1' to='0' dur='1.5s' begin='0s' repeatCount='indefinite'/%3E%3C/circle%3E%3Ccircle cx='50' cy='50' r='35' fill='%2300334E' stroke='white' stroke-width='4'/%3E%3Cg transform='translate(26, 26) scale(2)'%3E%3Cpath d='M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7' fill='white'/%3E%3C/g%3E%3C/svg%3E";
      if (!map.getSource('animation-icon-source')) {
        map.addSource('animation-icon-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [],
          },
        });
      }
      if (!map.getLayer('animation-icon-layer')) {
        map.addLayer({
          id: 'animation-icon-layer',
          type: 'symbol',
          source: 'animation-icon-source',
          layout: {
            'icon-image': 'person-ping-icon',
            'icon-size': 0.5,
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          },
        });
      }
      const floorData = await loadAllFloors();
      if (Object.keys(floorData).length > 0) {
        const {
          graph: g,
          rooms: r,
          doors: d,
          storeList: stores,
        } = buildMultiFloorGraph(floorData);
        setGraph(g);
        setRooms(r);
        setDoors(d);
        setStoreList(stores);
        const loadRoomLogos = async () => {
          const logoPromises = [];

          for (const [floor, data] of Object.entries(floorData)) {
            if (!data || !data.features) continue;
            for (const feature of data.features) {
              const props = feature.properties;
              if (
                props.type === 'room' &&
                props.logo &&
                props.logo.trim() !== ''
              ) {
                const logoId = `logo-${props.id}`;

                const logoPromise = new Promise(resolve => {
                  // Logo zaten yüklüyse atla
                  try {
                    if (map.hasImage(logoId)) {
                      resolve(true);
                      return;
                    }
                  } catch (e) {
                    // hasImage mevcut değilse devam et
                  }

                  try {
                    const img = new Image(55, 55);
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                      try {
                        const size = 55;
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = 'white';
                        ctx.beginPath();
                        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#e0e0e0';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(
                          size / 2,
                          size / 2,
                          size / 2 - 4,
                          0,
                          Math.PI * 2
                        );
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, 4, 4, size - 8, size - 8);
                        ctx.restore();
                        const imageData = ctx.getImageData(0, 0, size, size);
                        map.addImage(logoId, {
                          width: size,
                          height: size,
                          data: imageData.data,
                        });
                        resolve(true);
                      } catch (err) {
                        resolve(false);
                      }
                    };
                    img.onerror = () => resolve(false);
                    img.src = props.logo;
                  } catch (err) {
                    resolve(false);
                  }
                });
                logoPromises.push(logoPromise);
              }
            }
          }

          await Promise.all(logoPromises);
        };
        loadRoomLogos();
        // Harita hazır değilse hiçbir işlem yapma
        if (!map) return;

        Object.entries(floorData).forEach(([floor, data]) => {
          const floorNum = parseInt(floor);
          if (isNaN(floorNum)) return;

          const isCurrentFloor = floorNum === currentFloor;
          const sourceId = `indoor-floor-${floorNum}`;

          // Kaynak zaten varsa ekleme
          if (map.getSource(sourceId)) return;

          map.addSource(sourceId, { type: 'geojson', data });
          map.addLayer({
            id: `walkable-areas-floor-${floorNum}`,
            type: 'fill',
            source: sourceId,
            filter: [
              'all',
              ['==', ['get', 'type'], 'area'],
              ['==', ['get', 'subtype'], 'walkable'],
            ],
            paint: {
              'fill-color': '#FFFFFF',
              'fill-opacity': 1,
            },
            layout: {
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
          });
          map.addLayer({
            id: `non-walkable-areas-floor-${floorNum}`,
            type: 'fill-extrusion',
            source: sourceId,
            filter: [
              'all',
              ['==', ['get', 'type'], 'area'],
              ['==', ['get', 'subtype'], 'non-walkable'],
            ],
            paint: {
              'fill-extrusion-color': '#8E9AAF',
              'fill-extrusion-height': 1.2,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 1,
            },
            layout: {
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
          });
          // Zemin katmanı (mağazaların altı)
          map.addLayer({
            id: `room-base-floor-${floorNum}`,
            type: 'fill',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'room'],
            paint: {
              'fill-color': '#DCDCDC',
              'fill-opacity': 1,
            },
            layout: {
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
          });
          // Mağaza katmanı (3D)
          map.addLayer({
            id: `rooms-floor-${floorNum}`,
            type: 'fill-extrusion',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'room'],
            paint: {
              'fill-extrusion-color': [
                'case',
                ['==', ['get', 'id'], 'room-101'], // 5M Migros için özel renk
                '#E8E8E8', // Açık gri
                '#eae6d9', // Diğer mağazalar için normal renk
              ],
              'fill-extrusion-height': 1.5,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 1,
            },
            layout: {
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
          });
          map.addLayer({
            id: `floor-connectors-floor-${floorNum}`,
            type: 'symbol',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'floor-connector-node'],
            layout: {
              'icon-image': 'escalator-icon',
              'icon-size': 0.8,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-offset': [-18, 0],
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
            minzoom: 19,
          });
          map.addLayer({
            id: `floor-connectors-elevator-floor-${floorNum}`,
            type: 'symbol',
            source: sourceId,
            filter: ['==', ['get', 'type'], 'floor-connector-node'],
            layout: {
              'icon-image': 'elevator-icon',
              'icon-size': 0.8,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-offset': [18, 0],
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
            minzoom: 19,
          });
          // 5M Migros için özel gri label layer - Çatıda düz yazı
          map.addLayer({
            id: `room-labels-5m-migros-floor-${floorNum}`,
            type: 'symbol',
            source: sourceId,
            filter: [
              'all',
              ['==', ['get', 'type'], 'room'],
              ['==', ['get', 'id'], 'room-101'], // Sadece 5M Migros
            ],
            layout: {
              'text-field': ['get', 'name'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                16,
                8, // zoom 16'da 8px
                18,
                20, // zoom 18'de 20px
                20,
                32, // zoom 20'de 32px
                22,
                40, // zoom 22'de 40px
              ],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'symbol-placement': 'point',
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-anchor': 'center',
              'text-offset': [0, -0.8],
              'text-padding': 0,
              'text-rotation-alignment': 'map',
              'text-pitch-alignment': 'map',
              'text-radial-offset': 0,
              'text-variable-anchor': ['center'],
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
            paint: {
              'text-color': '#888888',
              'text-halo-color': '#f0f0f0',
              'text-halo-width': 4,
              'text-halo-blur': 1,
              'text-opacity': 1,
            },
          });

          // Diğer mağazalar için normal label layer (5M Migros hariç)
          map.addLayer({
            id: `room-labels-with-logo-floor-${floorNum}`,
            type: 'symbol',
            source: sourceId,
            filter: [
              'all',
              ['==', ['get', 'type'], 'room'],
              ['has', 'logo'],
              ['!=', ['get', 'logo'], null],
              ['!=', ['get', 'logo'], ''],
              ['!=', ['get', 'id'], 'room-101'], // 5M Migros hariç
            ],
            layout: {
              'text-field': ['get', 'name'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                16,
                6, // zoom 16'da 6px
                18,
                10, // zoom 18'de 10px
                20,
                14, // zoom 20'de 14px
                22,
                18, // zoom 22'de 18px
              ],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'symbol-placement': 'point',
              'icon-image': ['concat', 'logo-', ['get', 'id']],
              'icon-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                16,
                0.15, // zoom 16'da 0.15
                18,
                0.35, // zoom 18'de 0.35
                20,
                0.5, // zoom 20'de 0.50
                22,
                0.65, // zoom 22'de 0.65
              ],
              'icon-allow-overlap': true,
              'icon-ignore-placement': false,
              'text-allow-overlap': false,
              'text-ignore-placement': false,
              'text-anchor': 'top',
              'text-offset': [0, 0.2],
              'icon-anchor': 'bottom',
              'icon-text-fit': 'none',
              'text-padding': 2,
              'icon-padding': 2,
              'icon-pitch-alignment': 'viewport',
              'text-pitch-alignment': 'viewport',
              'icon-rotation-alignment': 'viewport',
              'text-rotation-alignment': 'viewport',
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
            paint: {
              'text-color': '#333',
              'text-halo-color': 'white',
              'text-halo-width': 2,
              'text-halo-blur': 1,
            },
          });
          map.addLayer({
            id: `room-labels-without-logo-floor-${floorNum}`,
            type: 'symbol',
            source: sourceId,
            filter: [
              'all',
              ['==', ['get', 'type'], 'room'],
              [
                'any',
                ['!', ['has', 'logo']],
                ['==', ['get', 'logo'], null],
                ['==', ['get', 'logo'], ''],
              ],
            ],
            layout: {
              'text-field': ['get', 'name'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                16,
                6, // zoom 16'da 6px
                18,
                10, // zoom 18'de 10px
                20,
                14, // zoom 20'de 14px
                22,
                18, // zoom 22'de 18px
              ],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'text-ignore-placement': false,
              'symbol-placement': 'point',
              'text-padding': 2,
              'text-pitch-alignment': 'viewport',
              'text-rotation-alignment': 'viewport',
              visibility: isCurrentFloor ? 'visible' : 'none',
            },
            paint: {
              'text-color': '#333',
              'text-halo-color': 'white',
              'text-halo-width': 2,
              'text-halo-blur': 1,
            },
          });
          if (!map.getSource('room-highlight')) {
            map.addSource('room-highlight', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [],
              },
            });
          }
          if (!map.getLayer('room-highlight-layer')) {
            map.addLayer({
              id: 'room-highlight-layer',
              type: 'fill',
              source: 'room-highlight',
              paint: {
                'fill-color': '#1B3349',
                'fill-opacity': 0.7,
              },
            });
          }
        });
        map.once('idle', () => {
          updateRoomClickHandlers();
        });
      }
    });
    setTimeout(updateRoomClickHandlers, 1000);
    return () => {
      if (mapRef.current) {

        mapRef.current.remove();
        mapRef.current = null;
      }
      if (qrHighlightedRoom) {
        const intervalId = setInterval(() => {
          if (map.isStyleLoaded()) {
            highlightQrRoom(qrHighlightedRoom.id, qrHighlightedRoom.floor);
            clearInterval(intervalId);
          }
        }, 100);
      }
    };
  }, [mapCenter, mapZoom, qrHighlightedRoom, highlightQrRoom]);

  const chatHandlers = createChatHandlers({
    rooms,
    setRooms,
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
    searchParams,
    t,
  });

  const handleFunctionCall = createFunctionCallRouter({
    navigateUser: chatHandlers.handleNavigateUser,
    changeFloor: chatHandlers.handleChangeFloor,
    findSpecialLocation: chatHandlers.handleFindSpecialLocation,
    registerUser: chatHandlers.handleRegisterUser,
    loginUser: chatHandlers.handleLoginUser,
    searchStores: chatHandlers.handleSearchStores,
    showNearbyStores: chatHandlers.handleShowNearbyStores,
    showCampaigns: chatHandlers.handleShowCampaigns,
    visitLocation: null,
  });

  useEffect(() => {
    if (handleFunctionCall && setOnFunctionCall) {
      setOnFunctionCall(handleFunctionCall);
    }
  }, [handleFunctionCall, setOnFunctionCall]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) {
      Object.keys(geojsonURLS).forEach(floor => {
        const floorNum = parseInt(floor);
        const visibility = floorNum === currentFloor ? 'visible' : 'none';
        [
          `walkable-areas-floor-${floorNum}`,
          `non-walkable-areas-floor-${floorNum}`,
          `room-base-floor-${floorNum}`,
          `rooms-floor-${floorNum}`,
          `doors-floor-${floorNum}`,
          `floor-connectors-floor-${floorNum}`,
          `floor-connectors-elevator-floor-${floorNum}`,
          `room-labels-floor-${floorNum}`,
          `room-labels-5m-migros-floor-${floorNum}`,
          `room-labels-with-logo-floor-${floorNum}`,
          `room-labels-without-logo-floor-${floorNum}`,
        ].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
          }
        });
      });
    }

    const coords = routeByFloor[currentFloor];
    if (!coords || coords.length === 0) {
      if (map.getSource('path')) {
        map.getSource('path').setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] },
        });
      }
      if (map.getSource('path-arrows')) {
        map.getSource('path-arrows').setData({
          type: 'FeatureCollection',
          features: [],
        });
      }
      return;
    }

    // Safari için hemen çiz, timeout'u kaldır
    if (map.isStyleLoaded()) {
      drawPathSafely(coords);
    } else {
      // Stil yüklenmemişse kısa bir timeout
      const timeoutId = setTimeout(() => {
        drawPathSafely(coords);
      }, 50);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [currentFloor, routeByFloor]);

  // Harita Görünümü (2D/3D) Değişikliği
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    Object.keys(geojsonURLS).forEach(floor => {
      const floorNum = parseInt(floor);
      
      // Odalar için yükseklik ayarı
      const roomLayerId = `rooms-floor-${floorNum}`;
      if (map.getLayer(roomLayerId)) {
        map.setPaintProperty(
          roomLayerId,
          'fill-extrusion-height',
          mapView === '2D' ? 0 : 1.5
        );
      }

      // Yürünemez alanlar (duvarlar vb.) için yükseklik ayarı
      const nonWalkableLayerId = `non-walkable-areas-floor-${floorNum}`;
      if (map.getLayer(nonWalkableLayerId)) {
        map.setPaintProperty(
          nonWalkableLayerId,
          'fill-extrusion-height',
          mapView === '2D' ? 0 : 1.2
        );
      }
    });
  }, [mapView]);

  useRouteCalculation({
    mapRef,
    graph,
    rooms,
    selectedStartRoom,
    selectedEndRoom,
    routeMode,
    placeId,
    preferredTransport,
    allGeoData,
    currentFloor,
    changeFloor,
    setTotalDistance,
    setRouteByFloor,
    setRouteSteps,
    setSearchQuery,
    isAnimationActiveRef,
    animationFrameIdRef,
    animateIconAlongRoute,
  });

  useEffect(() => {
    if (window.routeStartMarker) {
      window.routeStartMarker.remove();
      window.routeStartMarker = null;
    }
    if (window.routeEndMarker) {
      window.routeEndMarker.remove();
      window.routeEndMarker = null;
    }
  }, [selectedStartRoom, selectedEndRoom]);

  const { drawPathSafely, calculateBearing } = usePathDrawing({
    mapRef,
    fitMapToPath,
  });
  const { buildMultiFloorGraph } = useGraphBuilder();

  // Return null during SSR and initial client render to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden max-w-[100vw] relative bg-gray-50">
      <MapSidebar
        isKioskMode={isKioskMode}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        setIsAssistantOpen={setIsAssistantOpen}
      />
      {/* YENİ: Harita + Chat Wrapper */}
      <div className="flex-1 flex flex-col relative z-10">
        <MapHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowSearchDropdown={setShowSearchDropdown}
          setIsAssistantOpen={setIsAssistantOpen}
          setIsSearchFocused={setIsSearchFocused}
          showSearchDropdown={showSearchDropdown}
          searchResults={searchResults}
          handleSearchResultSelect={handleSearchResultSelect}
          isKioskMode={isKioskMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Harita - Tam ekran */}
        <div
          className="flex-1 h-full relative w-full overflow-hidden"
          style={{ backgroundColor: 'transparent' }}
        >
          {/* Kart - Always show when card is not minimized - Kiosk modda gizle */}
          {/* Oda kartı - sadece içerik varsa göster */}
          <Suspense fallback={null}>
            <MobileRouteCard
              isKioskMode={isKioskMode}
              isCardMinimized={isCardMinimized}
              selectedEndRoom={selectedEndRoom}
              routeSteps={routeSteps}
              activeNavItem={activeNavItem}
              rooms={rooms}
              handleFinish={handleFinish}
              handleCompleteRoute={handleCompleteRoute}
              totalDistance={totalDistance}
              getInstruction={getInstruction}
              routeByFloor={routeByFloor}
              currentFloor={currentFloor}
              selectedStartRoom={selectedStartRoom}
              handlePreviousFloor={handlePreviousFloor}
              handleNextFloor={handleNextFloor}
              isSelectingStartRoom={isSelectingStartRoom}
            />
          </Suspense>
          <div
            className="w-full h-full"
            style={{ backgroundColor: 'transparent' }}
            ref={mapContainerRef}
            onClick={() => {}}
          />
          {isSelectingStartRoom && selectedEndRoom && (
            <div className="fixed bottom-[135px] sm:bottom-[150px] md:bottom-[200px] left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="relative">
                <svg
                  height="83"
                  width="247"
                  fill="none"
                  viewBox="0 0 247 83"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-2xl"
                >
                  <rect
                    height="51"
                    width="51"
                    fill="#1B3349"
                    rx="23.5"
                    y="15.5"
                  />
                  <circle
                    cx="25.5"
                    cy="41"
                    r="13.5"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle cx="25.4999" cy="40.9997" fill="white" r="9.6671" />
                  <g filter="url(#filter0_d_733_878)">
                    <path
                      d="M212.346 14.5C223.392 14.5002 232.346 23.4545 232.346 34.5V47.8613C232.346 58.9069 223.392 67.8611 212.346 67.8613H45.2742C52.7138 62.3044 57.7312 51.8094 57.7312 39.7764C57.7312 29.5403 54.1002 20.4174 48.4363 14.5H212.346Z"
                      fill="white"
                    />
                  </g>
                  <text
                    x="76"
                    y="37"
                    fill="#1B3349"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    Haritadan Tıklayın
                  </text>
                  <text
                    x="76"
                    y="52"
                    fill="black"
                    fillOpacity="0.61"
                    fontSize="10"
                  >
                    Konumunuzu seçin
                  </text>

                  {/* X Butonu SVG içinde */}
                  <text
                    x="220"
                    y="42.5"
                    fill="black"
                    fillOpacity="0.4"
                    fontSize="18"
                    fontWeight="300"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="cursor-pointer hover:fill-red-600"
                    onClick={() => {
                      setSelectedEndRoom('');
                      setSelectedStartRoom('');
                      setIsSelectingStartRoom(false);
                      setEndQuery('');
                      setStartQuery('');
                      setIsCardMinimized(true);
                    }}
                  >
                    ✕
                  </text>

                  <defs>
                    <filter
                      height="82.3613"
                      id="filter0_d_733_878"
                      width="216.072"
                      x="30.7742"
                      y="0"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood result="BackgroundImageFix" floodOpacity="0" />
                      <feGaussianBlur stdDeviation="7.25" />
                      <feBlend
                        result="effect1_dropShadow_733_878"
                        in2="BackgroundImageFix"
                      />
                      <feBlend
                        result="shape"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_733_878"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          )}
          {/* Desktop Bilgi Kartları - GİZLENDİ */}
          {routeSteps.length > 0 ? (
            <div className="hidden absolute bottom-4 left-24 max-w-sm min-w-[380px] z-30">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 min-h-[190px]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {rooms.find(r => r.id === selectedEndRoom)?.logo && (
                      <img
                        src={rooms.find(r => r.id === selectedEndRoom)?.logo}
                        alt={`${
                          rooms.find(r => r.id === selectedEndRoom)?.name
                        } Logo`}
                        className="h-10 w-10 object-contain rounded-md border p-1"
                      />
                    )}
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {rooms.find(r => r.id === selectedEndRoom)?.name ||
                          'Seçili Oda'}
                      </h2>
                      {rooms.find(r => r.id === selectedEndRoom)?.category &&
                        rooms.find(r => r.id === selectedEndRoom)?.category !==
                          'general' && (
                          <p className="text-xs text-brand-dark font-semibold">
                            #
                            {
                              rooms.find(r => r.id === selectedEndRoom)
                                ?.category
                            }
                          </p>
                        )}
                    </div>
                  </div>
                  <button
                    onClick={handleFinish}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                    Rotayı Kapat
                  </button>
                </div>
                {/* Rota Özet Bilgileri */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <span>{Math.ceil(totalDistance / 80)} min</span>
                  <span>{Math.round(totalDistance)} m</span>
                  <span>
                    {new Date(
                      Date.now() + (totalDistance / 80) * 60000
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {/* Yönlendirme mesajı */}
                <div className="mb-3 p-3 bg-brand-light rounded-lg border-l-4 border-brand">
                  {/* Üst kısım: Yönlendirme mesajı */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-brand-darkest text-sm font-medium flex-1">
                      {getInstruction()}
                    </div>
                  </div>
                  {/* Alt kısım: İleri/Geri butonları - sadece çok katlı rotalarda */}
                  {Object.keys(routeByFloor).length > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Kat {currentFloor} -{' '}
                        {(() => {
                          const startRoom = rooms.find(
                            r => r.id === selectedStartRoom
                          );
                          const endRoom = rooms.find(
                            r => r.id === selectedEndRoom
                          );
                          const isGoingUp = endRoom?.floor > startRoom?.floor;
                          const floors = Object.keys(routeByFloor)
                            .map(Number)
                            .sort((a, b) => (isGoingUp ? a - b : b - a));
                          const currentIndex = floors.indexOf(currentFloor);
                          return `${currentIndex + 1}/${floors.length}`;
                        })()}
                      </div>
                      <div className="flex gap-2">
                        {/* Geri butonu */}
                        <button
                          onClick={handlePreviousFloor}
                          disabled={(() => {
                            const startRoom = rooms.find(
                              r => r.id === selectedStartRoom
                            );
                            const endRoom = rooms.find(
                              r => r.id === selectedEndRoom
                            );
                            const isGoingUp = endRoom?.floor > startRoom?.floor;
                            const floors = Object.keys(routeByFloor)
                              .map(Number)
                              .sort((a, b) => (isGoingUp ? a - b : b - a));
                            const currentIndex = floors.indexOf(currentFloor);
                            return currentIndex <= 0;
                          })()}
                          className={`text-white text-xs px-2 py-1 rounded transition ${
                            (() => {
                              const startRoom = rooms.find(
                                r => r.id === selectedStartRoom
                              );
                              const endRoom = rooms.find(
                                r => r.id === selectedEndRoom
                              );
                              const isGoingUp =
                                endRoom?.floor > startRoom?.floor;
                              const floors = Object.keys(routeByFloor)
                                .map(Number)
                                .sort((a, b) => (isGoingUp ? a - b : b - a));
                              const currentIndex = floors.indexOf(currentFloor);
                              return currentIndex <= 0;
                            })()
                              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                        >
                          Geri
                        </button>
                        {/* İleri butonu */}
                        <button
                          onClick={handleNextFloor}
                          disabled={(() => {
                            const startRoom = rooms.find(
                              r => r.id === selectedStartRoom
                            );
                            const endRoom = rooms.find(
                              r => r.id === selectedEndRoom
                            );
                            const isGoingUp = endRoom?.floor > startRoom?.floor;
                            const floors = Object.keys(routeByFloor)
                              .map(Number)
                              .sort((a, b) => (isGoingUp ? a - b : b - a));
                            const currentIndex = floors.indexOf(currentFloor);
                            return currentIndex >= floors.length - 1;
                          })()}
                          className={`text-white text-xs px-2 py-1 rounded transition ${
                            (() => {
                              const startRoom = rooms.find(
                                r => r.id === selectedStartRoom
                              );
                              const endRoom = rooms.find(
                                r => r.id === selectedEndRoom
                              );
                              const isGoingUp =
                                endRoom?.floor > startRoom?.floor;
                              const floors = Object.keys(routeByFloor)
                                .map(Number)
                                .sort((a, b) => (isGoingUp ? a - b : b - a));
                              const currentIndex = floors.indexOf(currentFloor);
                              return currentIndex >= floors.length - 1;
                            })()
                              ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                              : 'bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand-darkest'
                          }`}
                        >
                          İlerle
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : selectedEndRoom ? (
            <div className="hidden absolute bottom-4 left-16 max-w-md min-w-[420px] z-40">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header Image */}
                {rooms.find(r => r.id === selectedEndRoom)?.header_image && (
                  <div className="w-full h-32 overflow-hidden">
                    <img
                      src={
                        rooms.find(r => r.id === selectedEndRoom)?.header_image
                      }
                      alt={rooms.find(r => r.id === selectedEndRoom)?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {rooms.find(r => r.id === selectedEndRoom)?.logo && (
                        <img
                          src={rooms.find(r => r.id === selectedEndRoom)?.logo}
                          alt={rooms.find(r => r.id === selectedEndRoom)?.name}
                          className="h-12 w-12 object-contain rounded-md border p-1"
                        />
                      )}
                      <div>
                        <h2 className="text-base font-bold text-gray-800">
                          {rooms.find(r => r.id === selectedEndRoom)?.name ||
                            'Seçili Oda'}
                        </h2>
                        <p className="text-xs text-gray-500">
                          Kat{' '}
                          {rooms.find(r => r.id === selectedEndRoom)?.floor ??
                            '?'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEndRoom('');
                        setSelectedStartRoom('');
                        setIsSelectingStartRoom(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Store Info */}
                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                    {/* Rating Section - Mobile */}
                    {selectedEndRoom &&
                      !rooms.find(r => r.id === selectedEndRoom)
                        ?.is_special && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-gray-800">
                              Mağaza Değerlendirmesi
                            </h4>
                            {!isAuthenticated && (
                              <span className="text-xs text-gray-500">
                                Giriş yapın
                              </span>
                            )}
                          </div>
                          <div className="scale-90 origin-left">
                            <StarRating
                              storeId={selectedEndRoom}
                              userId={user?.id || user?._id}
                              userName={
                                user?.name ||
                                user?.username ||
                                'Anonim Kullanıcı'
                              }
                              showReviews={false}
                              onRatingChange={(rating, avgRating, count) => {

                              }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Description */}
                    {rooms.find(r => r.id === selectedEndRoom)?.description && (
                      <p className="text-xs text-gray-600">
                        {rooms.find(r => r.id === selectedEndRoom)?.description}
                      </p>
                    )}
                    {/* Hours */}
                    {rooms.find(r => r.id === selectedEndRoom)?.hours && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-700 font-medium">
                          {rooms.find(r => r.id === selectedEndRoom)?.hours}
                        </span>
                      </div>
                    )}
                    {/* Phone */}
                    {rooms.find(r => r.id === selectedEndRoom)?.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <a
                          href={`tel:${
                            rooms.find(r => r.id === selectedEndRoom)?.phone
                          }`}
                          className="text-brand-dark hover:underline"
                        >
                          {rooms.find(r => r.id === selectedEndRoom)?.phone}
                        </a>
                      </div>
                    )}
                    {/* Website */}
                    {rooms.find(r => r.id === selectedEndRoom)?.website && (
                      <div className="flex items-center gap-2 text-xs">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                        <a
                          href={
                            rooms.find(r => r.id === selectedEndRoom)?.website
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-dark hover:underline"
                        >
                          Web Sitesi
                        </a>
                      </div>
                    )}
                    {/* Promotion */}
                    {rooms.find(r => r.id === selectedEndRoom)?.promotion && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-orange-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                            />
                          </svg>
                          <span className="text-xs text-orange-700 font-medium">
                            {
                              rooms.find(r => r.id === selectedEndRoom)
                                ?.promotion
                            }
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Services */}
                    {rooms.find(r => r.id === selectedEndRoom)?.services && (
                      <div className="flex flex-wrap gap-1">
                        {rooms
                          .find(r => r.id === selectedEndRoom)
                          ?.services.split(',')
                          .map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-brand-light text-brand-darkest px-2 py-1 rounded-full"
                            >
                              {service.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      setIsSelectingStartRoom(true);
                      setSelectedStartRoom('');
                      setEndQuery(
                        rooms.find(r => r.id === selectedEndRoom)?.name || ''
                      );
                      setStartQuery('');
                    }}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-brand to-brand-dark text-white font-semibold text-sm hover:from-brand-dark hover:to-brand-darkest transition-all shadow-md hover:shadow-lg"
                  >
                    {isSelectingStartRoom
                      ? 'Konumunuzu Seçin'
                      : 'Yol Tarifi Al'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden absolute bottom-4 left-16 max-w-sm min-w-[380px] z-40">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 min-h-[190px]">
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-3">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v13l-6 3-6-3z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    Henüz bir oda seçilmedi
                  </p>
                  <p className="text-xs text-gray-400">
                    Yukarıdaki arama kısmından oda seçebilirsiniz
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Google Maps tarzı arama çubuğu - Harita üzerinde - Keşfet açılınca arka planda kalır */}
          <div className={(!showStoreRating) ? "contents" : "hidden"}>
            <MapHeaderControls
              isDiscoverOpen={isDiscoverOpen}
              isSelectingStartRoom={isSelectingStartRoom}
              routeSteps={routeSteps}
              routeMode={routeMode}
              setRouteMode={setRouteMode}
              startQuery={startQuery}
              setStartQuery={setStartQuery}
              setShowStartDropdown={setShowStartDropdown}
              setIsAssistantOpen={setIsAssistantOpen}
              showStartDropdown={showStartDropdown}
              rooms={rooms}
              setSelectedStartRoom={setSelectedStartRoom}
              setActiveNavItem={setActiveNavItem}
              setIsCardMinimized={setIsCardMinimized}
              handleFinish={handleFinish}
              endQuery={endQuery}
              setEndQuery={setEndQuery}
              setShowEndDropdown={setShowEndDropdown}
              showEndDropdown={showEndDropdown}
              setSelectedEndRoom={setSelectedEndRoom}
              isFloorPanelOpen={isFloorPanelOpen}
              setIsFloorPanelOpen={setIsFloorPanelOpen}
              changeFloor={changeFloor}
              mapView={mapView}
              setMapView={setMapView}
              currentFloor={currentFloor}
              floors={Object.keys(geojsonURLS).map(Number)}
              isKioskMode={isKioskMode}
              selectedStartRoom={selectedStartRoom}
              selectedEndRoom={selectedEndRoom}
            />
          </div>

          {/* Quick Access Buttons */}
          {!isKioskMode && !showStoreRating && !isDiscoverOpen && (
            <QuickAccessButtons
              rooms={rooms}
              onRoomSelect={handleSearchResultSelect}
              onQuickAccess={handleQuickAccessItemClick}
              onMenuToggle={isOpen => {
                if (isOpen) {
                  setIsCardMinimized(true);
                  // Ayrıca seçim modundaysa kapat
                  setIsSelectingStartRoom(false);
                }
              }}
            />
          )}
        </div>
        {/* Assistant FAB - Kaldırıldı */}
        {/* QR Kod Popup */}
        {showQrPopup &&
          qrHighlightedRoom &&
          !qrHighlightedRoom.isCoordinate && (
            <QRPopup
              room={qrHighlightedRoom}
              onClose={() => setShowQrPopup(false)}
            />
          )}
        {/* Keşfet Modal */}
        <DiscoverModal
          isOpen={isDiscoverOpen}
          onClose={() => {
            setIsDiscoverOpen(false);
            setIsAssistantOpen(false);
          }}
          placeName={placeName}
          discoverHeight={discoverHeight}
          setDiscoverHeight={setDiscoverHeight}
          rooms={rooms}
          placeId={placeId}
          onRoomSelect={room => {
            setIsDiscoverOpen(false);
            setIsAssistantOpen(false);
            if (room) {
              setSelectedEndRoom(room.id);
              setEndQuery(room.name);
              setIsSelectingStartRoom(true);
              setActiveNavItem(0);
              setIsCardMinimized(true);
            }
          }}
          onAssistantOpen={() => {
            setIsDiscoverOpen(false);
            setIsAssistantOpen(false);
          }}
        />

        {/* Bottom Navbar - Kiosk modda gizle */}
        {!isKioskMode && (
          <BottomNavbar
            activeNavItem={activeNavItem}
            setActiveNavItem={setActiveNavItem}
            selectedEndRoom={selectedEndRoom}
            routeSteps={routeSteps}
            isCardMinimized={isCardMinimized}
            setIsCardMinimized={setIsCardMinimized}
            isDiscoverOpen={isDiscoverOpen}
            setIsDiscoverOpen={setIsDiscoverOpen}
            setDiscoverHeight={setDiscoverHeight}
            searchParams={searchParams}
            setIsAssistantOpen={setIsAssistantOpen}
            isAssistantOpen={isAssistantOpen}
            showStoreRating={showStoreRating}
          />
        )}
      </div>

      {/* Demo Popup */}
      <DemoPopup
        isOpen={showDemoPopup}
        onClose={() => setShowDemoPopup(false)}
      />

      {/* Assistant Modal */}
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          // Diğer menüleri de kapat
          setShowSearchDropdown(false);
          setShowStartDropdown(false);
          setShowEndDropdown(false);
          setShowFloorDropdown(false);
          setIsSidebarOpen(false);
          setIsDiscoverOpen(false);
        }}
        chatMessages={chatMessages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isAssistantTyping={isAssistantTyping}
        currentInstruction={getInstruction()}
        hasActiveRoute={routeSteps.length > 0}
        totalDistance={totalDistance}
        rooms={rooms}
        selectedEndRoom={rooms.find(r => r.id === selectedEndRoom)}
        setIsDiscoverOpen={setIsDiscoverOpen}
        setIsAssistantOpen={setIsAssistantOpen}
        setActiveNavItem={setActiveNavItem}
        clearRoute={clearRoute}
        handleCompleteRoute={handleCompleteRoute}
      />

      {/* Modern Store Info Panel */}
      <StoreInfoPanel
        store={selectedStoreForRating}
        isOpen={showStoreRating}
        onClose={() => {
          setShowStoreRating(false);
          setSelectedStoreForRating(null);
        }}
        onNavigate={store => {
          // Mağazayı hedef olarak seç
          setSelectedEndRoom(store.id);
          setEndQuery(store.name);

          // QR koordinatı varsa otomatik olarak başlangıç noktası olarak kullan
          let coordinateRoom = rooms.find(r => r.isCoordinate);

          // Koordinat odası yoksa ama URL'de koordinat varsa, tekrar oluştur
          if (!coordinateRoom) {
            const lat = searchParams.get('lat');
            const lng = searchParams.get('lng');
            const floorParam = searchParams.get('floor');

            if (lat && lng) {


              const coordinates = [parseFloat(lng), parseFloat(lat)];
              const targetFloor = floorParam ? parseInt(floorParam) : 0;

              coordinateRoom = {
                id: `coordinate-${Date.now()}`,
                name: isKioskMode
                  ? '📍 Şu an bu kiosktasınız'
                  : '📍 Şu an buradasınız',
                floor: targetFloor,
                coordinates: coordinates,
                center: coordinates,
                doorId: `coordinate-door-${Date.now()}`,
                isCoordinate: true,
                is_special: false,
              };

              // Rooms listesine ekle
              setRooms(prevRooms => {
                const filteredRooms = prevRooms.filter(r => !r.isCoordinate);
                return [...filteredRooms, coordinateRoom];
              });
            }
          }

          if (coordinateRoom) {

            setSelectedStartRoom(coordinateRoom.id);
            setStartQuery(coordinateRoom.name);
            setIsSelectingStartRoom(false);
          } else {

            // Başlangıç noktası seçme modunu aç
            setIsSelectingStartRoom(true);
            setSelectedStartRoom('');
            setStartQuery('');
          }

          setActiveNavItem(0);
          setIsCardMinimized(false);
          setShowStoreRating(false);
          setSelectedStoreForRating(null);
        }}
        onToggleFavorite={handleFavoriteToggle}
        isFavorite={isFavorite}
        user={user}
        isAuthenticated={isAuthenticated}
      />

      <LocationCloseConfirmModal
        show={showLocationCloseConfirm}
        onClose={() => setShowLocationCloseConfirm(false)}
        onConfirm={handleLocationClose}
      />

      {/* Hızlı Mağaza Bilgi Paneli */}
      {showQuickStoreInfo && selectedQuickStore && (
        <StoreQuickInfoPanel
          store={selectedQuickStore}
          isFavorite={isFavorite}
          onClose={() => {
            setShowQuickStoreInfo(false);
            setSelectedQuickStore(null);
            setIsFavorite(false);
          }}
          onDetailsClick={() => {
            // Detaylı paneli aç
            setShowQuickStoreInfo(false);
            setSelectedStoreForRating(selectedQuickStore);
            setShowStoreRating(true);
          }}
          onRouteClick={() => {
            // Yol tarifi için başlangıç noktası seçme modunu aç
            setShowQuickStoreInfo(false);
            setIsSelectingStartRoom(true);
            setSelectedStartRoom('');
            setStartQuery('');
            setActiveNavItem(0);
            setIsCardMinimized(false);
          }}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </div>
  );
}

export default function MapLibreMap() {
  return (
    <Suspense fallback={null}>
      <MapContent />
    </Suspense>
  );
}
