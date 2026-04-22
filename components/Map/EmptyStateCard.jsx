'use client';

export default function EmptyStateCard() {
  return (
    <div className="hidden md:block absolute bottom-4 left-16 max-w-sm min-w-[380px] z-40">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 min-h-[190px]">
        <div className="text-center py-4">
          <div className="text-gray-400 mb-3">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 6-3v13l-6 3-6-3z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">Henüz bir oda seçilmedi</p>
          <p className="text-xs text-gray-400">
            Yukarıdaki arama kısmından oda seçebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}
