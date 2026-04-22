// components/ScriptLoader.tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export default function ScriptLoader() {
  const loadingRef = useRef(false);

  useEffect(() => {
    // Sadece bir kez çalışsın
    if (loadingRef.current) return;
    loadingRef.current = true;

    const loadScript = (src: string, name: string) => {
      return new Promise<void>((resolve, reject) => {
        // Zaten yüklü mü kontrol et
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          console.log(`✅ ${name} zaten yüklü`);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Sıralı yüklensin

        script.onload = () => {
          console.log(`✅ ${name} yüklendi`);
          resolve();
        };

        script.onerror = e => {
          console.error(`❌ ${name} yüklenemedi:`, e);
          reject(new Error(`${name} yüklenemedi`));
        };

        document.head.appendChild(script);
      });
    };

    // Scriptleri sırayla yükle
    const loadAllScripts = async () => {
      try {
        await loadScript('/js/ort.js', 'ONNX Runtime');
        await loadScript('/js/bundle.min.js', 'VAD Library');

        // VAD modellerini önceden yükle (opsiyonel)
        console.log('🔄 VAD modelleri hazırlanıyor...');

        // Global VAD konfigürasyonu
        if (typeof window !== 'undefined') {
          // ONNX Runtime WASM yolunu ayarla - Type-safe approach
          try {
            const globalWindow = window as any;
            if (globalWindow.ort?.env?.wasm) {
              globalWindow.ort.env.wasm.wasmPaths =
                'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';
              console.log('✅ ONNX Runtime WASM yolu ayarlandı');
            }
          } catch (error) {
            console.warn('⚠️ ONNX Runtime konfigürasyonu atlandı:', error);
          }

          console.log('✅ VAD sistemi hazır');
        }
      } catch (error) {
        console.error('❌ Script yükleme hatası:', error);
      }
    };

    loadAllScripts();
  }, []);

  return null; // Hiçbir şey render etme
}
