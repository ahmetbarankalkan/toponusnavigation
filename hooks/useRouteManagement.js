'use client';

import { useState, useCallback, useEffect } from 'react';

export function useRouteManagement() {
  const [selectedStartRoom, setSelectedStartRoom] = useState('');
  const [selectedEndRoom, setSelectedEndRoom] = useState('');
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const [routeByFloor, setRouteByFloor] = useState({});
  const [totalDistance, setTotalDistance] = useState(0);
  const [isSelectingStartRoom, setIsSelectingStartRoom] = useState(false);
  const [routeMode, setRouteMode] = useState('basit'); // Yeni: Rotalama modu

  // Rota temizleme fonksiyonu
  const clearRoute = useCallback(() => {
    setSelectedStartRoom('');
    setSelectedEndRoom('');
    setStartQuery('');
    setEndQuery('');
    setShowStartDropdown(false);
    setShowEndDropdown(false);
    setRouteSteps([]);
    setRouteByFloor({});
    setTotalDistance(0);
    setIsSelectingStartRoom(false);
    // routeMode'u temizleme - kullanıcı seçimini koru
  }, []);

  // Mevcut talimat alma
  const getCurrentInstruction = useCallback((rooms, currentFloor, preferredTransport) => {
    if (!routeSteps.length) return '';

    // Dinamik sıralama ekle
    const startRoom = rooms.find(r => r.id === selectedStartRoom);
    const endRoom = rooms.find(r => r.id === selectedEndRoom);
    const isGoingUp = endRoom?.floor > startRoom?.floor;

    const floors = Object.keys(routeByFloor)
      .map(Number)
      .sort((a, b) => (isGoingUp ? a - b : b - a));

    const currentIndex = floors.indexOf(currentFloor);
    const isLastFloor = currentIndex >= floors.length - 1;

    //Son katta isek hedefe doğru git
    if (isLastFloor) {
      const endRoom = rooms.find(r => r.id === selectedEndRoom);
      return `Hedefiniz ${endRoom?.name}'e doğru yolu takip edin`;
    }

    // Kat değişimi gerekiyorsa
    const nextFloor = floors[currentIndex + 1]; // ← Artık doğru sıradaki katı alacak
    const isGoingUpStep = nextFloor > currentFloor;
    const action = isGoingUpStep ? 'çıkın' : 'inin';

    // Transport türünü belirle
    const transportNames = {
      escalator: 'yürüyen merdiven',
      elevator: 'asansör',
      stairs: 'merdiven',
    };

    const transportName = transportNames[preferredTransport] || 'merdiven';

    // Kat isimlerini belirle
    const nextFloorName = nextFloor === 0 ? 'zemin kata' : `${nextFloor}. kata`;

    return `${transportName.charAt(0).toUpperCase() +
      transportName.slice(1)} ile ${nextFloorName} ${action}`;
  }, [routeSteps, selectedStartRoom, selectedEndRoom, routeByFloor]);

  return {
    selectedStartRoom,
    setSelectedStartRoom,
    selectedEndRoom,
    setSelectedEndRoom,
    startQuery,
    setStartQuery,
    endQuery,
    setEndQuery,
    showStartDropdown,
    setShowStartDropdown,
    showEndDropdown,
    setShowEndDropdown,
    routeSteps,
    setRouteSteps,
    routeByFloor,
    setRouteByFloor,
    totalDistance,
    setTotalDistance,
    isSelectingStartRoom,
    setIsSelectingStartRoom,
    routeMode,
    setRouteMode,
    clearRoute,
    getCurrentInstruction,
  };
}