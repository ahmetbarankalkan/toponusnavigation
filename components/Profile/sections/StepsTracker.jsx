'use client';

import { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function StepsTracker({ setActiveSection }) {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // in seconds
  const [sessionSteps, setSessionSteps] = useState(0);
  const [stepsData, setStepsData] = useState({ total: 278, routes: [] });
  const [showAllRoutes, setShowAllRoutes] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Load initial data
  useEffect(() => {
    try {
      const data = JSON.parse(
        localStorage.getItem('user_steps') || '{"total": 278, "routes": []}'
      );
      setStepsData(data);
    } catch (err) {
      console.error('Steps load error:', err);
    }
  }, []);

  // Tracking Logic (Simulated for Demo)
  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
        const newSteps = Math.floor(Math.random() * 2) + 1;
        setSessionSteps((prev) => prev + newSteps);
        
        setStepsData((prevData) => {
          const newData = { ...prevData, total: prevData.total + newSteps };
          localStorage.setItem('user_steps', JSON.stringify(newData));
          return newData;
        });
      }, 1000);
    } else if (!isTracking && sessionTime !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTracking, sessionTime]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateCalories = (steps) => {
    return (steps * 0.045).toFixed(1);
  };

  // Mini Map Initializer
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://api.maptiler.com/maps/basic/style.json?key=c2b5poelsH66NYMBeaq6', // Basic light map style
      center: [32.8305, 39.9502],
      zoom: 17,
      interactive: false,
      attributionControl: false
    });

    mapRef.current.on('load', () => {
      mapRef.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [32.8285, 39.9505],
              [32.8295, 39.9507],
              [32.8305, 39.9490],
              [32.8315, 39.9495]
            ]
          }
        }
      });

      mapRef.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#253C51',
          'line-width': 6
        }
      });

      mapRef.current.addSource('points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [32.8285, 39.9505] }
            },
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [32.8315, 39.9495] }
            }
          ]
        }
      });

      mapRef.current.addLayer({
        id: 'points',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#253C51',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#EAEAEA] overflow-hidden relative">
      {/* Curved Header Block */}
      <div 
        className="relative bg-[#253C51] pt-12 shrink-0 flex flex-col items-center"
        style={{ height: '206px', borderRadius: '0px 0px 20px 20px' }}
      >
        <div className="w-full px-6 flex items-center justify-between mb-2">
          {/* Back Button */}
          <button 
            onClick={() => setActiveSection('main')} 
            className="text-white p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Title */}
          <h2
            className="text-white text-[16px] font-medium absolute left-1/2 -translate-x-1/2 mt-1"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Adım
          </h2>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Floating Center Icon */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '140px' }}>
        <div 
          className="bg-white flex items-center justify-center relative rounded-[20px]"
          style={{ width: '110px', height: '105px', boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.25)' }}
        >
          {/* Exact 'Adım' Profile Menu SVG Icon scaled up */}
          <svg width="45" height="45" viewBox="0 -1 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_528_2713)">
              <path
                d="M13.5 5.625C13.9973 5.625 14.4742 5.42746 14.8258 5.07583C15.1775 4.72419 15.375 4.24728 15.375 3.75C15.375 3.25272 15.1775 2.77581 14.8258 2.42417C14.4742 2.07254 13.9973 1.875 13.5 1.875C13.0027 1.875 12.5258 2.07254 12.1742 2.42417C11.8225 2.77581 11.625 3.25272 11.625 3.75C11.625 4.24728 11.8225 4.72419 12.1742 5.07583C12.5258 5.42746 13.0027 5.625 13.5 5.625Z"
                stroke="#1B3349"
                strokeOpacity="0.95"
                strokeWidth="2"
              />
              <path
                d="M4.49996 6.28874L7.50109 5.24924L11.625 7.21761L7.50109 10.2915L11.625 13.0065L9.00296 16.4992M13.245 8.11611L14.2507 8.66324L16.5 6.54974M6.31834 11.8294L5.20459 13.2964L1.50146 15.3739"
                stroke="#1B3349"
                strokeOpacity="0.95"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_528_2713">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-[80px] pb-[160px] flex flex-col items-center">
        
        {/* Tracker Card - Strictly matching Figma sizes/colors */}
        <div 
          className="mx-auto flex shadow-[0px_0px_15.9px_rgba(0,0,0,0.25)] rounded-[20px] p-[13px] relative w-full max-w-[357px]"
          style={{ height: '129px', background: '#F8F9FA' }}
        >
          {/* Left Side: Dark Total Steps Box */}
          <div 
            className="rounded-[20px] bg-[#253C51] flex flex-col items-center justify-center shrink-0 relative"
            style={{ width: '96px', height: '102px' }}
          >
            {/* Sneaker Icon Exact Match SVG */}
            <svg 
              className="mt-[4px]" 
              width="35" 
              height="35" 
              viewBox="0 0 29 29" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
               <path d="M4.71518 10.5237H0.0725411C0.169263 10.1851 0.296451 9.86449 0.454108 9.56176C0.611764 9.25902 0.79892 8.96305 1.01558 8.67385L6.60124 1.20211C7.01231 0.645965 7.56266 0.276972 8.25228 0.0951353C8.94191 -0.0867012 9.60058 -0.00787334 10.2283 0.331619L11.2439 0.839408C11.7517 1.10539 12.1448 1.4681 12.4234 1.92752C12.702 2.38695 12.8408 2.89474 12.8398 3.45089V6.49762L15.5238 5.80848C16.2492 5.61503 16.9505 5.70595 17.6275 6.08123C18.3046 6.45651 18.764 6.99428 19.0058 7.69455L21.3634 14.8036L27.5294 20.9696C28.013 21.4532 28.3457 21.9731 28.5275 22.5292C28.7094 23.0854 28.7998 23.6778 28.7988 24.3065C28.7988 25.2011 28.557 25.9991 28.0734 26.7003C27.5898 27.4016 26.9611 27.9214 26.1874 28.26L9.72052 12.5185C9.01928 11.8657 8.24551 11.37 7.3992 11.0314C6.55288 10.6929 5.65821 10.5237 4.71518 10.5237ZM17.4099 28.6589C16.6845 28.6589 15.9953 28.5259 15.3425 28.26C14.6896 27.994 14.0851 27.6192 13.5289 27.1356L1.74099 16.4358C1.28156 16.0247 0.906764 15.5595 0.6166 15.0401C0.326435 14.5207 0.120902 13.9824 0 13.4253H4.71518C5.27132 13.4253 5.80958 13.522 6.32994 13.7155C6.8503 13.9089 7.31553 14.2112 7.72563 14.6222L22.379 28.6589H17.4099Z" fill="white"/>
            </svg>
            <span className="text-[6px] font-semibold leading-[9px] mt-2 mb-[2px]" style={{ color: 'rgba(255, 255, 255, 0.61)', fontFamily: 'Poppins, sans-serif' }}>
              Toplam Adım
            </span>
            <span className="text-white text-[24px] font-bold leading-[28px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {stepsData.total}
            </span>
          </div>

          {/* Right Side: Stats & Action */}
          <div className="flex-1 ml-[18px] mr-[10px] flex flex-col justify-between py-1 relative">
            <div className="flex justify-between items-start mt-[1px]">
              {/* Süre */}
              <div className="flex flex-col gap-[1px]">
                <span className="text-[14px] font-normal leading-[16px]" style={{ color: 'rgba(0, 0, 0, 0.64)', fontFamily: 'Poppins, sans-serif' }}>Süre</span>
                <span className="text-[#000000] text-[15px] font-semibold leading-[22px]" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}>
                  {formatTime(sessionTime)}
                </span>
              </div>
              
              {/* Enerji */}
              <div className="flex flex-col gap-[1px] border-none">
                <span className="text-[14px] font-normal leading-[16px]" style={{ color: 'rgba(0, 0, 0, 0.65)', fontFamily: 'Poppins, sans-serif' }}>Enerji</span>
                <div className="flex items-baseline gap-[3px]">
                  <span className="text-[#000000] text-[15px] font-semibold leading-[22px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {calculateCalories(stepsData.total)}
                  </span>
                  <span className="text-[#000000] text-[10px] font-semibold leading-[15px]" style={{ fontFamily: 'Poppins, sans-serif' }}>kcal</span>
                </div>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={toggleTracking}
              className="mt-[14px] w-full transition-all flex flex-col items-center justify-center bg-transparent active:bg-black/5"
              style={{
                height: '38px',
                border: '1px solid #253C51',
                borderRadius: '20px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#000000'
              }}
            >
              <div className="mt-[-1px]">{isTracking ? 'Duraklat' : 'Başlat'}</div>
            </button>
          </div>
        </div>

        {/* Dynamic Map Container with styling embedded seamlessly */}
        <div className="w-full px-4 max-w-[370px] flex-shrink-0 min-h-[200px] mt-8 rounded-[20px] overflow-hidden relative shadow-md border border-gray-200">
          <div ref={mapContainerRef} className="w-full h-[250px]" />
          
          {/* Floating Distance Badge (Group 316) */}
          <div className="absolute top-4 right-4 bg-[#253C51] text-white px-4 py-[6px] rounded-[20px] flex items-center shadow-lg z-10" style={{ height: '28px' }}>
            <span className="text-[12px] font-normal leading-[18px]" style={{ fontFamily: 'Poppins, sans-serif' }}>120 m</span>
          </div>

          {/* Frosted Glass Overlay simulation at bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[40px] pointer-events-none"
            style={{ 
              background: 'linear-gradient(to top, rgba(234, 234, 234, 0.9) 0%, rgba(234, 234, 234, 0) 100%)',
              backdropFilter: 'blur(2px)' 
            }}
          />
        </div>

        {/* Previous Routes Section */}
        <div className="w-full px-4 max-w-[370px] mt-8 mb-4">
          <h3
            className="text-[#253C51] text-[16px] font-medium mb-4 ml-1"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Önceki Rotalar
          </h3>
          
          {stepsData.routes.length === 0 ? (
            <div className="text-center py-6 bg-white/40 rounded-[20px] shadow-[0px_0px_7px_rgba(0,0,0,0.15)] border border-transparent">
              <p className="text-gray-500 text-[13px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Henüz kayıtlı rotanız bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showAllRoutes ? stepsData.routes : stepsData.routes.slice(0, 3)).map((route, index) => (
                <div key={index} className="bg-white/40 rounded-[20px] p-4 shadow-[0px_0px_7px_rgba(0,0,0,0.15)] flex items-center justify-between transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-[#253c51] text-[13px] font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {route.from || 'Bilinmeyen'}
                    </p>
                    <div className="flex items-center gap-1 my-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-gray-400 text-[11px]">→</span>
                    </div>
                    <p className="text-[#253c51] text-[13px] font-medium truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {route.to || 'Bilinmeyen'}
                    </p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="text-[#253c51] text-[16px] font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {route.steps || Math.floor(Math.random() * 500) + 100}
                    </p>
                    <p className="text-[#253c51]/60 text-[10px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      adım
                    </p>
                    <p className="text-[#253c51]/40 text-[9px] mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {formatDate(route.createdAt || new Date())}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show All Toggle */}
          {stepsData.routes.length > 3 && (
            <button
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className="w-[204px] mx-auto block mt-6 transition-all flex items-center justify-center bg-transparent active:bg-black/5"
              style={{
                height: '38px',
                border: '1px solid #253C51',
                borderRadius: '20px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                color: '#000000'
              }}
            >
              {showAllRoutes ? 'Daha Az Göster' : 'Tümünü Görüntüle'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
