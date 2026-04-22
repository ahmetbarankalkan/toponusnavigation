'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function KioskMapsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Kiosk mode ile ana haritaya yönlendir
    router.replace('/?slug=ankamall&kiosk=true');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Haritaya yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
