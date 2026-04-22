/**
 * Route Inputs Component
 * Rota seçim modu - Başlangıç ve bitiş noktası input'ları
 */

import { ArrowUpDown } from 'lucide-react';

export default function RouteInputs({
  startQuery,
  endQuery,
  showStartDropdown,
  showEndDropdown,
  rooms,
  onStartChange,
  onEndChange,
  onStartSelect,
  onEndSelect,
  onStartFocus,
  onStartBlur,
  onEndFocus,
  onEndBlur,
  onSwap,
  onClose,
  routeMode = 'basit',
  onRouteModeChange,
}) {
  return (
    <div className="relative">
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-4">
        {/* Boş beyaz kutucuk */}
      </div>
    </div>
  );
}
