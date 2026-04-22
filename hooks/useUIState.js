'use client';

import { useState } from 'react';

export function useUIState() {
  const [isCardMinimized, setIsCardMinimized] = useState(true); // Mobilde başlangıçta kapalı
  const [activeNavItem, setActiveNavItem] = useState(1); // 0: Rota, 1: Asistan, 2-3: Boş
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Desktop'ta sol panel açık/kapalı
  const [showAllQuickAccess, setShowAllQuickAccess] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [discoverPanelHeight, setDiscoverPanelHeight] = useState(320); // Keşfet paneli yüksekliği
  const [isFloorPanelOpen, setIsFloorPanelOpen] = useState(true); // Kat paneli açık/kapalı durumu
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const [discoverHeight, setDiscoverHeight] = useState(50); // Yüzde cinsinden (50% = yarım ekran)
  const [showFloorDropdown, setShowFloorDropdown] = useState(false);
  const [isAssistantPopupOpen, setIsAssistantPopupOpen] = useState(false);
  const [hasClosedAssistant, setHasClosedAssistant] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  return {
    isCardMinimized,
    setIsCardMinimized,
    activeNavItem,
    setActiveNavItem,
    isSidebarOpen,
    setIsSidebarOpen,
    showAllQuickAccess,
    setShowAllQuickAccess,
    showLocationWarning,
    setShowLocationWarning,
    discoverPanelHeight,
    setDiscoverPanelHeight,
    isFloorPanelOpen,
    setIsFloorPanelOpen,
    isDiscoverOpen,
    setIsDiscoverOpen,
    discoverHeight,
    setDiscoverHeight,
    showFloorDropdown,
    setShowFloorDropdown,
    isAssistantPopupOpen,
    setIsAssistantPopupOpen,
    hasClosedAssistant,
    setHasClosedAssistant,
    isTranscribing,
    setIsTranscribing,
  };
}