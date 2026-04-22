'use client';
export const dynamic = 'force-dynamic';

import ProfilePanel from '@/components/Profile/ProfilePanel';
import BottomNavbar from '@/components/Navigation/BottomNavbar';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const ProfilePage = () => {
  const searchParams = useSearchParams();
  const [activeNavItem, setActiveNavItem] = useState(4); // Profil aktif

  return (
    <div className="flex flex-col h-[100dvh] bg-[#eaeaea] overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ProfilePanel />
      </div>

      {/* Bottom Navbar - Keşfet butonu ana sayfaya yönlendirir */}
      <BottomNavbar
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
        searchParams={searchParams}
      />
    </div>
  );
};

export default ProfilePage;
