'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNavbarSVG from './BottomNavbarSVG';

export default function BottomNavbar({
  setIsDiscoverOpen,
  setActiveNavItem,
  setIsAssistantOpen,
  searchParams: propsSearchParams,
  activeNavItem,
  isDiscoverOpen,
  isAssistantOpen,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Hydration-safe mounting check
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return null during SSR and initial client render to prevent hydration mismatch
  if (!isMounted) return null;

  const slug =
    propsSearchParams?.get('slug') || searchParams.get('slug') || 'ankamall';

  const handleRotaClick = () => {
    router.push(`/?slug=${slug}`);
    setIsDiscoverOpen && setIsDiscoverOpen(false);
    setActiveNavItem && setActiveNavItem(0);
    setIsAssistantOpen && setIsAssistantOpen(false);
  };

  const handleKesfetClick = () => {
    console.log('🔍 Keşfet clicked, setIsDiscoverOpen:', !!setIsDiscoverOpen);
    if (setIsDiscoverOpen) {
      // Ana sayfadaysak, modalı aç
      console.log('✅ Opening discover modal directly');
      setIsDiscoverOpen(true);
      setActiveNavItem && setActiveNavItem(1);
      setIsAssistantOpen && setIsAssistantOpen(false);
    } else {
      // Başka sayfadaysak, ana sayfaya yönlendir ve discover parametresi ekle
      console.log('🔄 Redirecting to home with discover=true');
      router.push(`/?slug=${slug}&discover=true`);
    }
  };

  const handleAsistanClick = () => {
    if (setIsAssistantOpen) {
      setIsAssistantOpen(prev => !prev);
      setIsDiscoverOpen && setIsDiscoverOpen(false);
    } else {
      router.push(`/?slug=${slug}&assistant=true`);
    }
  };

  const handleFavorilerClick = () => {
    router.push(`/favorites?slug=${slug}`);
    setActiveNavItem && setActiveNavItem(3);
    setIsDiscoverOpen && setIsDiscoverOpen(false);
    setIsAssistantOpen && setIsAssistantOpen(false);
  };

  const handleProfilClick = () => {
    router.push(`/profile?slug=${slug}`);
    setActiveNavItem && setActiveNavItem(4);
    setIsDiscoverOpen && setIsDiscoverOpen(false);
    setIsAssistantOpen && setIsAssistantOpen(false);
  };

  return (
    <>
      {/* Transparent Footer Background */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] pb-safe-bottom touch-none">
        <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 w-full">
          <div
            className="absolute left-0 right-0 top-5 sm:top-6 md:top-7 lg:top-8 bottom-0 rounded-t-3xl"
            style={{
              backgroundColor: 'rgba(217, 217, 217, 0.61)',
              backdropFilter: 'blur(4.35px) brightness(100%)',
              WebkitBackdropFilter: 'blur(4.35px) brightness(100%)',
            }}
          >
            {/* SVG Design in the center */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 sm:-top-9 md:-top-10 lg:-top-11 pointer-events-none">
              <BottomNavbarSVG
                className="w-auto h-[110px] sm:h-[120px] md:h-[135px] lg:h-[150px]"
                activeItem={activeNavItem}
                isAssistantOpen={isAssistantOpen}
              />
            </div>

            {/* Clickable buttons with colored backgrounds */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-[374px] h-[117px] pointer-events-none">
              {/* Rota button */}
              <button
                onClick={handleRotaClick}
                className="absolute left-[18px] top-[52px] w-[60px] h-[60px] cursor-pointer pointer-events-auto outline-none focus:outline-none bg-transparent active:bg-[#00334E]/10 transition-colors rounded-lg"
                aria-label="Rota"
              />

              {/* Keşfet button */}
              <button
                onClick={handleKesfetClick}
                className="absolute left-[74px] top-[52px] w-[60px] h-[60px] cursor-pointer pointer-events-auto outline-none focus:outline-none bg-transparent active:bg-[#00334E]/10 transition-colors rounded-lg"
                aria-label="Keşfet"
              />

              {/* Asistan button - center (the circle) */}
              <button
                onClick={handleAsistanClick}
                className="absolute left-[142px] top-[7px] w-[90px] h-[90px] cursor-pointer rounded-full pointer-events-auto outline-none focus:outline-none bg-transparent active:bg-[#00334E]/20 transition-colors"
                aria-label="Asistan"
              />

              {/* Favoriler button */}
              <button
                onClick={handleFavorilerClick}
                className="absolute left-[240px] top-[52px] w-[60px] h-[60px] cursor-pointer pointer-events-auto outline-none focus:outline-none bg-transparent active:bg-[#00334E]/10 transition-colors rounded-lg"
                aria-label="Favoriler"
              />

              {/* Profil button */}
              <button
                onClick={handleProfilClick}
                className="absolute left-[296px] top-[52px] w-[60px] h-[60px] cursor-pointer pointer-events-auto outline-none focus:outline-none bg-transparent active:bg-[#00334E]/10 transition-colors rounded-lg"
                aria-label="Profil"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
