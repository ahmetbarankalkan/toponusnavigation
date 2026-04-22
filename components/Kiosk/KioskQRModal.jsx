'use client';
import React, { useEffect, useState } from 'react';
import { X, QrCode, Smartphone, CheckCircle } from 'lucide-react';
import QRCodeReact from 'qrcode.react';

export default function KioskQRModal({ isOpen, onClose, routeData }) {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (isOpen && routeData) {
      // QR kod için URL oluştur
      const baseUrl = window.location.origin;
      const qrData = {
        type: 'route',
        from: routeData.from,
        to: routeData.to,
        timestamp: Date.now(),
      };
      const qrUrl = `${baseUrl}/?route=${encodeURIComponent(
        JSON.stringify(qrData)
      )}`;
      setQrValue(qrUrl);
    }
  }, [isOpen, routeData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-12 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl p-12 text-center max-w-3xl relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-2xl flex items-center justify-center transition-all hover:rotate-90"
        >
          <X className="w-7 h-7 text-gray-600" />
        </button>

        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <QrCode className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-5xl font-black text-gray-900 mb-4">
            Telefonunuzla Devam Et
          </h2>
          <p className="text-2xl text-gray-600">
            QR kodu okutarak rotanızı telefonunuza aktarın
          </p>
        </div>

        {/* QR Kod */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 mb-8">
          {qrValue ? (
            <div className="bg-white p-8 rounded-2xl inline-block shadow-lg">
              <QRCodeReact value={qrValue} size={320} level="H" />
            </div>
          ) : (
            <div className="w-80 h-80 bg-gray-200 rounded-2xl mx-auto flex items-center justify-center">
              <div className="text-6xl animate-pulse">📱</div>
            </div>
          )}
        </div>

        {/* Adımlar */}
        <div className="grid grid-cols-3 gap-6 text-left">
          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              1. Kamerayı Aç
            </h3>
            <p className="text-sm text-gray-600">
              Telefonunuzun kamera uygulamasını açın
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              2. QR'ı Okut
            </h3>
            <p className="text-sm text-gray-600">
              Kamerayı QR koduna doğrultun
            </p>
          </div>

          <div className="bg-green-50 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              3. Devam Et
            </h3>
            <p className="text-sm text-gray-600">
              Açılan linke tıklayın ve yola çıkın
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
