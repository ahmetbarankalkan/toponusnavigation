'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy,
  Download,
  MapPin,
  Building2,
  Search,
  Navigation,
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function QRGenerator() {
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState('room'); // 'room' veya 'corridor'
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [geoData, setGeoData] = useState(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);

  // Mekanları yükle
  useEffect(() => {
    fetch('/api/places')
      .then(res => res.json())
      .then(data => {

        // API object olarak dönüyor, array'e çevir
        const placesArray = Object.values(data).map(place => ({
          id: place.id,
          name: place.name,
          slug: place.slug,
        }));

        setPlaces(placesArray);
      })
      .catch(err => console.error('Mekanlar yüklenemedi:', err));
  }, []);

  // Seçilen mekana göre odaları yükle
  useEffect(() => {
    if (selectedPlace) {
      fetch(`/api/rooms?place_id=${selectedPlace}`)
        .then(res => res.json())
        .then(data => {
          // GeoJSON formatından room listesi oluştur
          const allRooms = [];
          Object.keys(data).forEach(floor => {
            if (data[floor].features) {
              data[floor].features.forEach(feature => {
                if (feature.properties.type === 'room') {
                  allRooms.push({
                    id: feature.properties.id,
                    name: feature.properties.name,
                    floor: feature.properties.floor,
                  });
                }
              });
            }
          });
          setRooms(allRooms.sort((a, b) => a.name.localeCompare(b.name)));
        })
        .catch(err => console.error('Odalar yüklenemedi:', err));
    } else {
      setRooms([]);
      setSelectedRoom('');
    }
  }, [selectedPlace]);

  // Koridor modu için harita verilerini yükle
  useEffect(() => {
    if (selectedPlace && selectionMode === 'corridor') {
      const place = places.find(p => p.id === selectedPlace);


      if (!place) {
        console.error('❌ Mekan bulunamadı!');
        setIsLoadingMap(false);
        return;
      }


      setIsLoadingMap(true);
      setShowMap(false);

      // API route kullan - sunucu tarafında temiz JSON döndürür
      const url = `/api/geojson?slug=${place.slug}&floor=${selectedFloor}&type=base`;


      fetch(url)
        .then(async res => {


          if (!res.ok) {
            const errorData = await res
              .json()
              .catch(() => ({ error: 'Bilinmeyen hata' }));
            console.error('❌ API Error:', errorData);
            throw new Error(errorData.error || `API hatası: ${res.status}`);
          }



          // API'den gelen JSON'u direkt al (sunucu zaten temizledi)
          return res.json();
        })
        .then(data => {

          setGeoData(data);
          setIsLoadingMap(false);
          // Haritayı göster - bir sonraki render'da
          setTimeout(() => {

            setShowMap(true);
          }, 100);
        })
        .catch(err => {
          console.error('❌ GeoJSON yüklenemedi:', err);
          alert(
            `Harita yüklenemedi: ${err.message}\n\nLütfen konsolu kontrol edin.`
          );
          setGeoData(null);
          setShowMap(false);
          setIsLoadingMap(false);
        });
    } else {
      // Mod değiştiğinde haritayı temizle

      setShowMap(false);
      setGeoData(null);
      setIsLoadingMap(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    }
  }, [selectedPlace, selectionMode, selectedFloor, places]);

  // Harita başlat
  useEffect(() => {
    // Harita zaten varsa temizle
    if (mapRef.current) {

      mapRef.current.remove();
      mapRef.current = null;
    }

    if (!showMap || !geoData || !mapContainerRef.current) {

      return;
    }



    // Harita merkezini hesapla
    const bounds = new maplibregl.LngLatBounds();
    let hasCoordinates = false;

    geoData.features.forEach(feature => {
      // Geometry null olabilir, kontrol et
      if (feature.geometry && feature.geometry.type === 'LineString') {
        feature.geometry.coordinates.forEach(coord => {
          bounds.extend(coord);
          hasCoordinates = true;
        });
      }
    });

    if (!hasCoordinates) {
      console.error("❌ GeoJSON'de koordinat bulunamadı");
      return;
    }

    const center = bounds.getCenter();


    try {
      mapRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        },
        center: [center.lng, center.lat],
        zoom: 18,
      });



      // Path'leri çiz
      mapRef.current.on('load', () => {


        mapRef.current.addSource('paths', {
          type: 'geojson',
          data: geoData,
        });

        mapRef.current.addLayer({
          id: 'paths-layer',
          type: 'line',
          source: 'paths',
          paint: {
            'line-color': '#00d4ff',
            'line-width': 4,
          },
        });



        // Haritanın her yerine tıklama eventi (sadece path'lere değil)
        mapRef.current.on('click', e => {
          const coordinates = e.lngLat;

          setSelectedCoordinates([coordinates.lng, coordinates.lat]);

          // Marker ekle/güncelle - SÜRÜKLENEBILIR
          if (markerRef.current) {
            markerRef.current.remove();
          }
          markerRef.current = new maplibregl.Marker({
            color: '#ff0000',
            draggable: true, // Sürüklenebilir yap
          })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(mapRef.current);

          // Marker sürüklendiğinde koordinatları güncelle
          markerRef.current.on('dragend', () => {
            const lngLat = markerRef.current.getLngLat();

            setSelectedCoordinates([lngLat.lng, lngLat.lat]);
          });
        });

        // Cursor değiştir
        mapRef.current.on('mouseenter', 'paths-layer', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });
        mapRef.current.on('mouseleave', 'paths-layer', () => {
          mapRef.current.getCanvas().style.cursor = '';
        });
      });
    } catch (error) {
      console.error('❌ Harita başlatma hatası:', error);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [showMap, geoData]);

  // QR URL'ini oluştur
  useEffect(() => {
    if (selectedPlace) {
      const place = places.find(p => p.id === selectedPlace);

      // Otomatik URL algılama
      let baseUrl = '';
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          baseUrl = `http://localhost:${window.location.port || 3000}`;
        } else {
          baseUrl = 'https://clownfish-app-cc787.ondigitalocean.app';
        }
      }

      if (selectionMode === 'room' && selectedRoom) {
        setQrUrl(`${baseUrl}/?slug=${place.slug}&room=${selectedRoom}`);
      } else if (selectionMode === 'corridor' && selectedCoordinates) {
        setQrUrl(
          `${baseUrl}/?slug=${place.slug}&lat=${selectedCoordinates[1]}&lng=${selectedCoordinates[0]}&floor=${selectedFloor}`
        );
      } else {
        setQrUrl('');
      }
    } else {
      setQrUrl('');
    }
  }, [
    selectedPlace,
    selectedRoom,
    selectedCoordinates,
    selectedFloor,
    selectionMode,
    places,
  ]);

  // Linki kopyala
  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR kodu indir
  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${selectedRoom}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Oda arama
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-brand-light to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand to-brand rounded-3xl shadow-2xl shadow-brand/40 mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-dark via-brand to-brand-darkest bg-clip-text text-transparent mb-3">
            QR Kod Oluşturucu
          </h1>
          <p className="text-gray-600 text-lg">
            ✨ Mağazalar için özel QR kod ve link oluşturun
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 mb-8">
          {/* Mekan Seçimi */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              Mekan Seçin
            </label>
            <select
              value={selectedPlace}
              onChange={e => setSelectedPlace(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand-light focus:outline-none transition-all text-base font-medium bg-white hover:border-brand cursor-pointer"
            >
              <option value="">Mekan seçin...</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seçim Modu */}
          {selectedPlace && (
            <div className="mb-8">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-dark rounded-lg flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                Konum Türü Seçin
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setSelectionMode('room');
                    setShowMap(false);
                    setSelectedCoordinates(null);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectionMode === 'room'
                      ? 'bg-gradient-to-br from-brand-light to-brand-light border-brand shadow-lg'
                      : 'bg-white border-gray-200 hover:border-brand'
                  }`}
                >
                  <MapPin
                    className={`w-8 h-8 mx-auto mb-2 ${
                      selectionMode === 'room' ? 'text-brand' : 'text-gray-400'
                    }`}
                  />
                  <div className="font-bold text-gray-800">Mağaza/Oda</div>
                  <div className="text-xs text-gray-600 mt-1">Listeden seç</div>
                </button>
                <button
                  onClick={() => {
                    setSelectionMode('corridor');
                    setSelectedRoom('');
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    selectionMode === 'corridor'
                      ? 'bg-gradient-to-br from-brand-light to-brand-light border-brand shadow-lg'
                      : 'bg-white border-gray-200 hover:border-brand'
                  }`}
                >
                  <Navigation
                    className={`w-8 h-8 mx-auto mb-2 ${
                      selectionMode === 'corridor'
                        ? 'text-brand'
                        : 'text-gray-400'
                    }`}
                  />
                  <div className="font-bold text-gray-800">Koridor Noktası</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Haritadan seç
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Oda Arama ve Seçimi */}
          {selectedPlace && selectionMode === 'room' && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-dark rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Mağaza/Oda Seçin
              </label>

              {/* Arama */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand" />
                <input
                  type="text"
                  placeholder="🔍 Mağaza ara..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand-light focus:outline-none transition-all text-base bg-white hover:border-brand"
                />
              </div>

              {/* Oda Listesi */}
              <div className="max-h-80 overflow-y-auto border-2 border-gray-200 rounded-2xl bg-gradient-to-b from-white to-gray-50">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full text-left px-5 py-4 hover:bg-brand-light transition-all border-b border-gray-100 last:border-b-0 group ${
                        selectedRoom === room.id
                          ? 'bg-gradient-to-r from-brand-light to-brand-light font-bold border-l-4 border-l-cyan-400'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base group-hover:text-brand-dark transition-colors">
                          {room.name}
                        </span>
                        <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded-full text-gray-600 group-hover:bg-brand-light group-hover:text-brand-dark transition-colors">
                          Kat {room.floor === 0 ? 'Zemin' : room.floor}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="font-medium">
                      {searchQuery ? 'Sonuç bulunamadı' : 'Oda bulunamadı'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Koridor Noktası Harita Seçimi */}
          {selectedPlace && selectionMode === 'corridor' && (
            <div className="mb-6">
              <label className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-dark rounded-lg flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                Koridor Noktası Seçin
              </label>

              {/* Kat Seçimi */}
              <div className="mb-4">
                <select
                  value={selectedFloor}
                  onChange={e => {
                    const newFloor = Number(e.target.value);

                    setSelectedFloor(newFloor);
                    setSelectedCoordinates(null);

                    // Haritayı temizle
                    if (mapRef.current) {
                      mapRef.current.remove();
                      mapRef.current = null;
                    }
                    if (markerRef.current) {
                      markerRef.current.remove();
                      markerRef.current = null;
                    }
                  }}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-brand focus:ring-4 focus:ring-brand-light focus:outline-none transition-all text-base font-medium bg-white hover:border-brand cursor-pointer"
                >
                  <option value={0}>Zemin Kat</option>
                  <option value={1}>1. Kat</option>
                  <option value={2}>2. Kat</option>
                  <option value={3}>3. Kat</option>
                </select>
              </div>

              {/* Harita */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl border-2 border-gray-200">
                <div className="relative">
                  <div
                    ref={mapContainerRef}
                    className="w-full h-96 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-gray-200"
                  />
                  {isLoadingMap && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/95 rounded-xl backdrop-blur-sm">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">
                          Harita yükleniyor...
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          Kat {selectedFloor === 0 ? 'Zemin' : selectedFloor}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-4 bg-brand-light rounded-xl">
                  <p className="text-sm text-brand-darkest font-medium flex items-center gap-2">
                    <span className="text-xl">👆</span>
                    {isLoadingMap
                      ? 'Harita yükleniyor...'
                      : selectedCoordinates
                      ? '✅ Nokta seçildi! QR kod oluşturuldu.'
                      : showMap
                      ? 'Mavi çizgiler üzerine tıklayarak bir nokta seçin'
                      : 'Harita hazırlanıyor...'}
                  </p>
                  {selectedCoordinates && (
                    <div className="mt-2">
                      <p className="text-xs text-brand-dark font-mono">
                        📍 Konum: {selectedCoordinates[1].toFixed(6)},{' '}
                        {selectedCoordinates[0].toFixed(6)}
                      </p>
                      <div className="mt-2 p-2 bg-white rounded-lg border border-brand-light">
                        <p className="text-xs text-brand-darkest font-semibold mb-1">
                          🆔 Konum ID'si:
                        </p>
                        <p className="text-sm font-mono text-brand-dark bg-gray-50 px-2 py-1 rounded">
                          {(() => {
                            // Çok basit ID oluştur: id-100 formatında
                            const lat = selectedCoordinates[1];
                            const lng = selectedCoordinates[0];
                            // Koordinatları basit bir sayıya çevir
                            const hash =
                              Math.abs(
                                Math.floor((lat * lng * 1000000) % 9999)
                              ) + 100;
                            const locationId = `id-${hash}`;

                            // Koordinatları localStorage'a kaydet
                            if (typeof window !== 'undefined') {
                              const locationData = {
                                id: locationId,
                                coordinates: [lng, lat],
                                floor: selectedFloor,
                                timestamp: Date.now(),
                              };
                              localStorage.setItem(
                                locationId,
                                JSON.stringify(locationData)
                              );
                            }

                            return locationId;
                          })()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Bu ID'yi arama kısmına yazarak bu konuma
                          gidebilirsiniz
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QR Kod ve Link Gösterimi */}
        {qrUrl && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-10">
              {/* QR Kod */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">QR Kod</h3>
                </div>
                <div className="bg-white p-8 rounded-2xl border-4 border-gradient-to-br from-brand-light to-blue-200 shadow-2xl shadow-brand/20 hover:shadow-brand/40 transition-all hover:scale-105 duration-300">
                  <QRCodeSVG
                    id="qr-code"
                    value={qrUrl}
                    size={220}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Konum ID'si Gösterimi */}
                <div className="mt-4 w-full max-w-sm">
                  <div className="bg-gradient-to-br from-brand-light to-brand-light p-4 rounded-2xl border-2 border-brand-light">
                    <div className="text-center">
                      <p className="text-sm font-bold text-brand-darkest mb-2">
                        🆔 Konum ID'si
                      </p>
                      <div className="bg-white px-3 py-2 rounded-lg border border-brand-light">
                        <p className="text-xs font-mono text-brand-dark break-all">
                          {(() => {
                            const place = places.find(
                              p => p.id === selectedPlace
                            );
                            if (selectionMode === 'room' && selectedRoom) {
                              const room = rooms.find(
                                r => r.id === selectedRoom
                              );
                              return `${place?.slug ||
                                'ankamall'}-room-${selectedRoom}`;
                            } else if (
                              selectionMode === 'corridor' &&
                              selectedCoordinates
                            ) {
                              // Çok basit ID oluştur: id-100 formatında
                              const lat = selectedCoordinates[1];
                              const lng = selectedCoordinates[0];
                              const hash =
                                Math.abs(
                                  Math.floor((lat * lng * 1000000) % 9999)
                                ) + 100;
                              const locationId = `id-${hash}`;

                              // Koordinatları localStorage'a kaydet
                              if (typeof window !== 'undefined') {
                                const locationData = {
                                  id: locationId,
                                  coordinates: [lng, lat],
                                  floor: selectedFloor,
                                  timestamp: Date.now(),
                                };
                                localStorage.setItem(
                                  locationId,
                                  JSON.stringify(locationData)
                                );
                              }

                              return locationId;
                            }
                            return '';
                          })()}
                        </p>
                      </div>
                      <p className="text-xs text-brand-darkest mt-2">
                        Bu ID'yi arama kısmına yazarak bu konuma gidebilirsiniz
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadQR}
                  className="mt-6 flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand via-brand-dark to-brand-darkest text-white rounded-2xl hover:from-brand-dark hover:via-brand-darkest hover:to-brand-darkest transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold text-base"
                >
                  <Download className="w-5 h-5" />
                  QR Kodu İndir
                </button>
              </div>

              {/* Link */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-xl flex items-center justify-center">
                    <Copy className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Link</h3>
                </div>
                <div className="flex-1 flex flex-col gap-5">
                  {/* Link Kutusu */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border-2 border-gray-200 break-all text-sm text-gray-700 font-mono shadow-inner">
                    {qrUrl}
                  </div>

                  {/* Butonlar */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl hover:from-brand-dark hover:to-brand-darkest transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold text-base"
                    >
                      <Copy className="w-5 h-5" />
                      {copied ? '✓ Kopyalandı!' : 'Linki Kopyala'}
                    </button>

                    <a
                      href={qrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-dark to-brand-darkest text-white rounded-2xl hover:from-brand-darkest hover:to-brand-darkest transition-all shadow-xl hover:shadow-2xl hover:scale-105 font-bold text-base"
                    >
                      <MapPin className="w-5 h-5" />
                      Haritada Aç
                    </a>
                  </div>

                  {/* Bilgi */}
                  <div className="mt-4 p-6 bg-gradient-to-br from-brand-light to-brand-light rounded-2xl border-2 border-brand-light shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-lg">💡</span>
                      </div>
                      <div>
                        <p className="text-base text-brand-darkest font-semibold mb-2">
                          Nasıl Kullanılır?
                        </p>
                        <ul className="text-sm text-brand-darkest space-y-1.5">
                          <li>✓ QR kodu yazdırıp mağazaya asın</li>
                          <li>
                            ✓ Müşteriler QR'ı okutunca otomatik konumları
                            belirlenir
                          </li>
                          <li>✓ Link'i paylaşarak da kullanabilirsiniz</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
