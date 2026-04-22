// components/kiosk/QRCodeCTA.jsx
'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone, Sparkles } from 'lucide-react';

export default function QRCodeCTA({ url }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
      {/* Dekoratif Arka Plan */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 flex items-center gap-6">
        {/* QR Kod - Modern */}
        <div className="bg-white p-3 rounded-2xl shadow-2xl ring-4 ring-white/20">
          <QRCodeCanvas
            value={url}
            size={100}
            bgColor={'#ffffff'}
            fgColor={'#2563eb'}
            level={'H'}
            includeMargin={false}
          />
        </div>

        {/* Metin - Modern */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-black">Telefonunuzda Devam Edin!</h3>
          </div>
          <p className="text-base text-white/90 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            QR kodu okutarak rotayı telefonunuza gönderin
          </p>
        </div>
      </div>
    </div>
  );
}
