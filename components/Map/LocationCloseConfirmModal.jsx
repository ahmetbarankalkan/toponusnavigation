import React from 'react';

const LocationCloseConfirmModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-[90vw] mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-center">
          <div className="text-6xl mb-3">📍</div>
          <h2 className="text-white text-2xl font-bold">
            Konum Bilgisi Silinecek
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 text-center">
          <p className="text-gray-700 text-lg leading-relaxed mb-2">
            Konum bilginiz silinecek ve ana sayfaya yönlendirileceksiniz.
          </p>
          <p className="text-gray-600 text-base">Emin misiniz?</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 active:scale-95"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationCloseConfirmModal;
