'use client';
import { X, AlertCircle } from 'lucide-react';

export default function DemoPopup({ isOpen, onClose }) {
  const handleClose = () => {
    // Cookie'yi set et (30 gün boyunca geçerli)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    document.cookie = `demoPopupSeen=true; expires=${expiryDate.toUTCString()}; path=/`;

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          Demo
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6 leading-relaxed">
          Görüntülemekte olduğunuz bu arayüz, Toponus ürününün bir demo
          sürümüdür. Sunulan veriler ve özellikler temsilidir ve yalnızca
          tanıtım amacıyla kullanılmaktadır.
        </p>

        {/* Button */}
        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Anladım
        </button>
      </div>
    </div>
  );
}
