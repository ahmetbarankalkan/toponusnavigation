'use client';

import KioskDiscover from '@/components/Kiosk/KioskDiscover';
import { Suspense } from 'react';

function DiscoverPageContent() {
    return <KioskDiscover />;
}

export default function KioskDiscoverPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">Yükleniyor...</div>}>
      <DiscoverPageContent />
    </Suspense>
  );
}