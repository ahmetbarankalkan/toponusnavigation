'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import gsap from 'gsap';

export default function AnkamallPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Refs for UI elements
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const introOverlayRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Map Initialization
    if (!mapContainer.current || map.current) return;

    const apiKey = 'vzCCQdEhdPjFn0pVzI88';
    const ankamallCoordinates: [number, number] = [
      32.82984195070501,
      39.95179367569976,
    ];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
      center: ankamallCoordinates,
      zoom: 16.8,
      pitch: 70,
      bearing: 90,
      maxBounds: [
        [32.8248, 39.9488],
        [32.8348, 39.9548],
      ],
      minZoom: 16.5,
      maxZoom: 18.5,
      attributionControl: false,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      const layers = map.current.getStyle().layers;
      layers.forEach((layer: any) => {
        if (
          layer.type === 'symbol' &&
          layer.layout &&
          layer.layout['text-field']
        ) {
          map.current?.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });

      map.current.addLayer({
        id: '3d-buildings',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#FF0000',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 1,
        },
      });

      // Pan the map slightly to the right to shift view
      // Pan by 200 pixels horizontally (positive x) with no animation
      map.current?.panBy([0, 0], { duration: 0 });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    // GSAP Animations with performance optimization
    gsap.config({ force3D: true });
    const tl = gsap.timeline();

    // 1. Texts Appear
    tl.to('.intro-text', {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      delay: 0.3,
      force3D: true,
    });

    // 2. Texts Disappear
    tl.to('.intro-text', {
      y: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.4,
      ease: 'power2.in',
      force3D: true,
    });

    // 3. Button Appears
    tl.to(buttonWrapperRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'back.out(1.4)',
      force3D: true,
    });

    // Overlay changes opacity
    tl.to(
      introOverlayRef.current,
      {
        opacity: 0.5,
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '<'
    );

    // --- HEARTBEAT (Optimized) ---
    gsap.to('.circle-btn', {
      scale: 1.03,
      duration: 1.8,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      force3D: true,
    });

    // --- SLIME EFFECT (Simplified) ---
    gsap.to('.slime-blob', {
      scale: 0.97,
      borderRadius: '48%',
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      force3D: true,
    });

    gsap.to('.slime-blob-2', {
      scale: 1.03,
      opacity: 0.5,
      borderRadius: '52%',
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      force3D: true,
    });

    // Slow rotation
    gsap.to(['.slime-blob', '.slime-blob-2'], {
      rotation: 360,
      duration: 15,
      ease: 'none',
      repeat: -1,
      force3D: true,
    });

    // --- BLINK EFFECT FOR LABEL ---
    gsap.to('.btn-label', {
      opacity: 0.4,
      duration: 1.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }, []);

  const handleEnterClick = () => {
    // Animate out button
    gsap.to(buttonWrapperRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      force3D: true,
    });

    // Fade out overlay
    gsap.to(introOverlayRef.current, {
      opacity: 0,
      duration: 0.8,
      force3D: true,
    });

    // Zoom map with smoother easing
    if (map.current) {
      map.current.flyTo({
        center: [32.82984195070501, 39.95179367569976],
        zoom: 19,
        pitch: 0,
        duration: 1500,
        easing: t => 1 - Math.pow(1 - t, 3), // Smooth cubic easing
      });
    }

    // Redirect
    setTimeout(() => {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/?slug=ankamall`;
    }, 2000);
  };

  return (
    <div id="app-screen">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css"
        rel="stylesheet"
      />

      <style jsx global>{`
        /* --- GENERAL SETTINGS --- */
        body,
        html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          background-color: #dedcd5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        #app-screen {
          position: relative;
          width: 100%;
          height: 100vh;
          background-color: #e3e1d5;
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
          will-change: transform;
        }

        /* --- LAYERS --- */

        /* 1. Outdoor Map */
        #outdoor-map {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        /* NEW: White Overlay Layer */
        #white-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #ffffff;
          opacity: 0.9; /* Initially 90% opaque */
          z-index: 3; /* Above map, below text */
          pointer-events: none;
        }

        /* 3. Text Area */
        .text-container {
          position: absolute;
          top: 42%;
          left: 0;
          width: 100%;
          transform: translateY(-50%);
          text-align: center;
          z-index: 5;
          pointer-events: none;
        }

        .intro-text {
          display: block;
          font-weight: 800;
          color: #1c2a3a;
          line-height: 1.1;
          opacity: 0;
          transform: translateY(40px);
          will-change: transform, opacity;
        }

        .text-1 {
          font-size: 2rem;
          font-weight: 400;
          margin-bottom: 5px;
          color: #4a5b6d;
        }
        .text-2 {
          font-size: 3.5rem;
          color: #1c2a3a;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .text-3 {
          font-size: 1.3rem;
          font-weight: 500;
          margin-top: 15px;
          color: rgba(28, 42, 58, 0.6);
          letter-spacing: 1px;
        }

        /* 4. Slime Button */
        .button-wrapper {
          position: absolute;
          bottom: 18%;
          left: 50%;
          transform: translateX(-50%) scale(0);
          width: 210px;
          height: 210px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 6;
          cursor: pointer;
          opacity: 0;
          will-change: transform, opacity;
        }

        /* Back Slime Layers */
        .slime-blob,
        .slime-blob-2 {
          position: absolute;
          inset: 0;
          margin: auto;
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 45%;
          z-index: 1;
          mix-blend-mode: normal;
          will-change: transform;
        }

        .slime-blob {
          opacity: 1;
          filter: blur(0px);
          box-shadow: 0 5px 25px rgba(255, 255, 255, 0.6),
            0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .slime-blob-2 {
          width: 105%;
          height: 105%;
          opacity: 0.6;
          z-index: 0;
          filter: blur(5px);
          background-color: #f0f4f8;
        }

        /* Front Circle Button */
        .circle-btn {
          position: relative;
          width: 160px;
          height: 160px;
          background-color: #1c2a3a;
          border-radius: 50%;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          box-shadow: 0 15px 40px rgba(28, 42, 58, 0.4);
          transform-origin: center;
          flex-direction: column;
          will-change: transform;
        }

        .sparkle-icon {
          width: 90px;
          height: 90px;
          fill: #ffffff;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
        }

        .btn-label {
          font-size: 22px;
          font-weight: 700;
          margin-top: 0;
          color: #1c2a3a;
          position: absolute;
          bottom: -60px;
          width: 100%;
          text-align: center;
          letter-spacing: 0.5px;
          font-family: 'Poppins', sans-serif;
        }

        .restart-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          z-index: 100;
          font-size: 12px;
          font-weight: 600;
          color: #1c2a3a;
          font-family: 'Poppins', sans-serif;
          box-shadow: none;
        }

        /* MapLibre Overrides */
        .maplibregl-ctrl-attrib {
          display: none !important;
        }
        .maplibregl-ctrl-logo {
          display: none !important;
        }
      `}</style>
      {/* 1. OUTDOOR MAP (MapLibre) */}
      <style
        jsx
      >{`\n        @media (max-width: 768px) {\n          #white-overlay {\n            display: none;\n          }\n          .button-wrapper {\n            bottom: 30%;\n          }\n        }\n      `}</style>
      <div id="outdoor-map" ref={mapContainer}></div>

      {/* NEW: White Overlay Layer */}
      <div id="white-overlay" ref={introOverlayRef}></div>

      {/* 2. TEXTS */}
      <div className="text-container" ref={textContainerRef}>
        <span className="intro-text text-1">Ankamall’ü</span>
        <span className="intro-text text-2">Keşfetmeye</span>
        <span className="intro-text text-3">Başlamak İçin</span>
      </div>

      {/* 3. SLIME BUTTON */}
      <div
        className="button-wrapper"
        ref={buttonWrapperRef}
        onClick={handleEnterClick}
      >
        <div className="slime-blob-2"></div>
        <div className="slime-blob"></div>

        <div className="circle-btn">
          <svg
            className="sparkle-icon"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 15 L58 42 L85 50 L58 58 L50 85 L42 58 L15 50 L42 42 Z" />
            <path
              d="M75 15 L78 25 L88 28 L78 31 L75 41 L72 31 L62 28 L72 25 Z"
              opacity="0.9"
            />
            <path
              d="M25 65 L28 72 L35 75 L28 78 L25 85 L22 78 L15 75 L22 72 Z"
              opacity="0.9"
            />
          </svg>
        </div>
        <div className="btn-label">Dokun</div>
      </div>
    </div>
  );
}
