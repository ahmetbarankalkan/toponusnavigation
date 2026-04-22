// components/UI/LoginPromptModal.jsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, X } from 'lucide-react';

export default function LoginPromptModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    router.push('/profile');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn size={32} />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giriş Gerekli</h2>
        <p className="text-gray-600 mb-8">
          Bu özelliği kullanabilmek için lütfen giriş yapın.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLoginRedirect}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
          >
            Giriş Yap
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
