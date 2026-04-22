'use client';
import React, { useState, useEffect } from 'react';
import StoreDetailDesign from './StoreDetailDesign';

const StoreInfoPanel = ({ 
  store, 
  isOpen, 
  onClose, 
  onNavigate, 
  onToggleFavorite, 
  isFavorite 
}) => {
  const [discoverHeight, setDiscoverHeight] = useState(50);

  useEffect(() => {
    if (isOpen) {
      setDiscoverHeight(50);
    }
  }, [isOpen]);

  if (!isOpen || !store) return null;

  const handleClose = () => {
    setDiscoverHeight(50);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[110] animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed left-0 right-0 z-[120] rounded-t-3xl animate-in slide-in-from-bottom duration-300 overflow-hidden flex flex-col bg-[#EAEAEA]"
        style={{
          bottom: 0,
          height: `${discoverHeight}vh`,
          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-30 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
              fill="#32475A"
            />
          </svg>
        </button>

        {/* Drag Handle */}
        <div
          className="w-full py-4 flex justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={e => {
            const startY = e.touches[0].clientY;
            const startHeight = discoverHeight;
            const startTime = Date.now();

            const handleTouchMove = e => {
              e.preventDefault();
              const currentY = e.touches[0].clientY;
              const delta = startY - currentY;

              const sensitivity = 0.15;
              const newHeight = Math.min(
                80,
                Math.max(
                  50,
                  startHeight + (delta / window.innerHeight) * 100 * sensitivity
                )
              );
              setDiscoverHeight(newHeight);
            };

            const handleTouchEnd = e => {
              const endY = e.changedTouches[0].clientY;
              const deltaY = startY - endY;
              const duration = Date.now() - startTime;
              const velocity = Math.abs(deltaY) / duration;

              // Snap to 50 or 80 based on direction and velocity
              if (Math.abs(deltaY) > 5) {
                if (velocity > 0.5 || Math.abs(deltaY) > 80) {
                  // Fast swipe or long drag
                  setDiscoverHeight(deltaY > 0 ? 80 : 50);
                } else {
                  // Slow drag - snap to nearest
                  const currentHeight =
                    startHeight + (deltaY / window.innerHeight) * 100 * 0.15;
                  setDiscoverHeight(currentHeight > 65 ? 80 : 50);
                }
              } else {
                // Very small movement - snap back to current state
                setDiscoverHeight(discoverHeight > 65 ? 80 : 50);
              }

              document.removeEventListener('touchmove', handleTouchMove);
              document.removeEventListener('touchend', handleTouchEnd);
              document.removeEventListener('touchcancel', handleTouchEnd);
            };

            document.addEventListener('touchmove', handleTouchMove, {
              passive: false,
            });
            document.addEventListener('touchend', handleTouchEnd);
            document.addEventListener('touchcancel', handleTouchEnd);
          }}
        >
          <div className="w-16 h-1.5 bg-gray-300 rounded-full transition-colors" />
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto bg-[#EAEAEA] p-4 pb-8"
          onScroll={e => {
            const scrollTop = e.target.scrollTop;
            if (scrollTop > 100 && discoverHeight < 75) {
              setDiscoverHeight(80);
            }
          }}
        >
          <div className="flex justify-center items-center">
            <StoreDetailDesign
              store={store}
              onGetDirections={() => {
                if (onNavigate) onNavigate(store);
              }}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default StoreInfoPanel;
