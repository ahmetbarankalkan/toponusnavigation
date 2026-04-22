'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';
import {
  isPWAInstalled,
  setupPWAInstallPrompt,
  showPWAInstallPrompt,
} from '@/utils/notifications';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 4 * 60 * 60 * 1000; // 4 saat (milisaniye)

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // iOS kontrolü
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // PWA kurulu mu kontrol et
    const installed = isPWAInstalled();
    setIsInstalled(installed);

    if (installed) {
      return;
    }

    // Kullanıcı daha önce kapatmış mı kontrol et
    const dismissedTime = localStorage.getItem(DISMISS_KEY);
    if (dismissedTime) {
      const timePassed = Date.now() - parseInt(dismissedTime);
      if (timePassed < DISMISS_DURATION) {
        // Henüz 4 saat geçmemiş, gösterme
        return;
      } else {
        // 4 saat geçmiş, kaydı temizle
        localStorage.removeItem(DISMISS_KEY);
      }
    }

    // Android için Install prompt'u dinle
    setupPWAInstallPrompt();

    // 3 saniye sonra prompt'u göster
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS için talimatları göster
      setShowIOSInstructions(true);
    } else {
      // Android/Desktop için native prompt'u tetikle
      const accepted = await showPWAInstallPrompt();
      if (accepted) {
        setShowPrompt(false);
        setIsInstalled(true);
        localStorage.removeItem(DISMISS_KEY);
      } else {
        // Eğer prompt tetiklenemezse (örn: tarayıcı desteklemiyor veya event yakalanamadı)
        // Kullanıcıya manuel bilgi verilebilir veya hiçbir şey yapılmaz
        console.log('Install prompt could not be shown or was dismissed');
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
    setShowIOSInstructions(false);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Ana Prompt */}
      <div className="fixed bottom-36 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <div
          className="text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3"
          style={{ backgroundColor: '#00334E' }}
        >
          <div className="bg-white/20 p-3 rounded-xl">
            <Download className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm">Uygulamayı Yükle</h3>
            <p className="text-xs text-white/90">
              Daha hızlı erişim için ana ekrana ekle
            </p>
          </div>

          <button
            onClick={handleInstall}
            className="bg-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
            style={{ color: '#00334E' }}
          >
            {isIOS ? 'Nasıl?' : 'Yükle'}
          </button>

          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* iOS Talimatları Modalı */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00334E]">
                iOS Kurulumu
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Share className="w-6 h-6 text-[#007AFF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    1. Tarayıcınızın altındaki <span className="font-bold text-black">Paylaş</span> butonuna tıklayın.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <div className="w-6 h-6 border-2 border-gray-400 rounded flex items-center justify-center">
                    <span className="text-lg font-bold leading-none text-gray-600">+</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    2. Aşağı kaydırın ve <span className="font-bold text-black">Ana Ekrana Ekle</span> seçeneğine dokunun.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <span className="text-sm font-bold text-[#007AFF]">Ekle</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    3. Sağ üst köşedeki <span className="font-bold text-black">Ekle</span> butonuna tıklayarak tamamlayın.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 bg-[#00334E] text-white py-3 rounded-xl font-semibold hover:bg-[#002335] transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </>
  );
}
