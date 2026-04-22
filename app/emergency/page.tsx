'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  MapPin,
  Navigation,
  Phone,
  Users,
} from 'lucide-react';

export default function EmergencyPage() {
  const [emergencyType, setEmergencyType] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">
                Acil Durum Yönlendirme Sistemi
              </h1>
              <p className="text-red-100 mt-1">
                Gerçek zamanlı güvenli tahliye rotası
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-100 p-3 rounded-lg">
              <Flame className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Toponus Acil Durum Rotalama Sistemi
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Yangın, deprem, sel veya diğer acil durumlarda güvenli tahliye
                için gerçek zamanlı rota planlaması ve anlık bildirimler sunan
                akıllı sistem.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
              <MapPin className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">
                Akıllı Rotalama
              </h3>
              <p className="text-sm text-gray-600">
                Tehlike bölgelerinden uzak, en güvenli tahliye rotasını hesaplar
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-lg border border-orange-200">
              <Navigation className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">
                Gerçek Zamanlı
              </h3>
              <p className="text-sm text-gray-600">
                Anlık konum takibi ve dinamik rota güncellemeleri
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-green-50 p-6 rounded-lg border border-yellow-200">
              <Phone className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">
                Anlık Bildirim
              </h3>
              <p className="text-sm text-gray-600">
                Push bildirimleri ve SMS ile acil durum uyarıları
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <Users className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">
                Toplu Tahliye
              </h3>
              <p className="text-sm text-gray-600">
                Kalabalık yönetimi ve koordineli tahliye planlaması
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Types */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Desteklenen Acil Durum Türleri
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Yangın', icon: '🔥', color: 'red' },
              { type: 'Deprem', icon: '🌍', color: 'orange' },
              { type: 'Sel/Su Baskını', icon: '🌊', color: 'blue' },
              { type: 'Gaz Kaçağı', icon: '💨', color: 'yellow' },
              { type: 'Terör/Güvenlik', icon: '🚨', color: 'purple' },
              { type: 'Diğer', icon: '⚠️', color: 'gray' },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => setEmergencyType(item.type)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  emergencyType === item.type
                    ? `border-${item.color}-500 bg-${item.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-800">{item.type}</div>
              </button>
            ))}
          </div>

          {emergencyType && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">
                ⚠️ Seçilen acil durum:{' '}
                <span className="text-red-600">{emergencyType}</span>
              </p>
              <p className="text-sm text-red-700 mt-2">
                Sistem aktif hale getirildiğinde bu acil durum türü için özel
                rotalama yapılacaktır.
              </p>
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Sistem Nasıl Çalışır?
          </h3>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Acil Durum Tespiti
                </h4>
                <p className="text-gray-600 text-sm">
                  Sensörler, kameralar veya manuel bildirimlerle acil durum
                  tespit edilir
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Anlık Bildirim</h4>
                <p className="text-gray-600 text-sm">
                  Bölgedeki tüm kullanıcılara push bildirimi ve SMS gönderilir
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Rota Hesaplama</h4>
                <p className="text-gray-600 text-sm">
                  AI destekli algoritma, tehlike bölgelerinden uzak en güvenli
                  rotayı hesaplar
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Güvenli Tahliye</h4>
                <p className="text-gray-600 text-sm">
                  Kullanıcılar gerçek zamanlı yönlendirme ile güvenli bölgeye
                  ulaştırılır
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
