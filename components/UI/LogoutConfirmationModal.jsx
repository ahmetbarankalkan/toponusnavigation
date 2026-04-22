'use client';

import React from 'react';
import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Çıkış Yap</h2>
        <p className="text-gray-600 mb-8">
          Hesabınızdan çıkış yapmak istediğinize emin misiniz?
        </p>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            Evet, Çıkış Yap
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
