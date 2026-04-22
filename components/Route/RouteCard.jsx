'use client';

import { X } from 'lucide-react';

export default function RouteCard({
  selectedEndRoom,
  rooms,
  totalDistance,
  routeSteps,
  getInstruction,
  handleFinish,
  handlePreviousFloor,
  handleNextFloor,
  routeByFloor,
  currentFloor,
  selectedStartRoom,
  isMobile = false,
}) {
  const endRoom = rooms.find(r => r.id === selectedEndRoom);

  if (!endRoom) return null;

  const startRoom = rooms.find(r => r.id === selectedStartRoom);
  const isGoingUp = endRoom?.floor > startRoom?.floor;

  const floors = Object.keys(routeByFloor)
    .map(Number)
    .sort((a, b) => (isGoingUp ? a - b : b - a));

  const currentIndex = floors.indexOf(currentFloor);
  const isPrevDisabled = currentIndex <= 0;
  const isNextDisabled = currentIndex >= floors.length - 1;

  return (
    <div className={isMobile ? 'md:hidden' : 'hidden md:block'}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {endRoom.logo && (
            <img
              src={endRoom.logo}
              alt={`${endRoom.name} Logo`}
              className="h-10 w-10 object-contain rounded-md border p-1"
            />
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-800">{endRoom.name}</h2>
            {endRoom.category && endRoom.category !== 'general' && (
              <p className="text-xs text-brand-dark font-semibold">
                #{endRoom.category}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleFinish}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-lg"
        >
          Rotayı Kapat
        </button>
      </div>

      {/* Rota Özet Bilgileri */}
      <div className="flex items-center justify-between text-sm mb-3">
        <span>{Math.ceil(totalDistance / 80)} min</span>
        <span>{Math.round(totalDistance)} m</span>
        <span>
          {new Date(
            Date.now() + (totalDistance / 80) * 60000
          ).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Yönlendirme mesajı */}
      <div className="mb-3 p-3 bg-brand-light rounded-lg border-l-4 border-brand">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-brand-darkest text-sm font-medium flex-1">
            {getInstruction()}
          </div>
        </div>

        {/* İleri/Geri butonları - sadece çok katlı rotalarda */}
        {floors.length > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Kat {currentFloor} - {currentIndex + 1}/{floors.length}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePreviousFloor}
                disabled={isPrevDisabled}
                className={`text-white text-xs px-2 py-1 rounded transition ${
                  isPrevDisabled
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                Geri
              </button>

              <button
                onClick={handleNextFloor}
                disabled={isNextDisabled}
                className={`text-white text-xs px-2 py-1 rounded transition ${
                  isNextDisabled
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-brand to-brand-dark hover:from-brand-dark hover:to-brand-darkest'
                }`}
              >
                İlerle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
