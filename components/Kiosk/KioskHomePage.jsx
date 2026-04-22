// components/Kiosk/KioskHomePage.jsx
'use client';

import { Navigation, Compass, Sparkles, Map } from 'lucide-react';

/**
 * Kiosk ana menü sayfası. Ana eylemleri büyük kartlar halinde sunar.
 *
 * @param {object} props - Komponent propları
 * @param {function} props.onNavigate - Rota planlayıcıyı açar.
 * @param {function} props.onDiscover - Haritayı keşfetme modunda açar.
 * @param {function} props.onAssistant - AI asistanı açar.
 */
export default function KioskHomePage({
  onNavigate,
  onDiscover,
  onAssistant,
}) {
  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-b from-gray-900 to-blue-900 text-white p-8">
      {/* Header */}
      <div className="text-center pt-16 pb-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Ne yapmak istersiniz?
        </h1>
        <p className="text-xl text-blue-200 mt-3">
          Size nasıl yardımcı olabilirim?
        </p>
      </div>

      {/* Action Cards */}
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          <ActionCard
            icon={Navigation}
            title="Rota Bul"
            description="Belirli bir yere en kısa rotayı oluşturun."
            onClick={onNavigate}
            color="blue"
          />
          <ActionCard
            icon={Map}
            title="AVM'yi Keşfet"
            description="Tüm kat planını ve mağazaları serbestçe inceleyin."
            onClick={onDiscover}
            color="green"
          />
          <ActionCard
            icon={Sparkles}
            title="AI Asistan"
            description="Sesli veya yazılı komutlarla yardım alın."
            onClick={onAssistant}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colors[color]} rounded-3xl p-8 text-left flex flex-col justify-between aspect-square transform hover:scale-105 transition-transform duration-300 shadow-2xl`}
    >
      <div>
        <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
          <Icon size={32} />
        </div>
      </div>
      <div>
        <h2 className="text-4xl font-bold">{title}</h2>
        <p className="text-lg text-white/80 mt-2">{description}</p>
      </div>
    </button>
  );
}
