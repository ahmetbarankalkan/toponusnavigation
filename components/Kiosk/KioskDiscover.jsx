'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import SubscriptionPopular from '@/components/Discover/SubscriptionPopular';
import Campaigns from '@/components/Discover/Campaigns';
import ProductCampaigns from '@/components/Discover/ProductCampaigns';
import AssistantDiscover from '@/components/Discover/AssistantDiscover';

export default function KioskDiscover() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enrichedRooms, setEnrichedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeName, setPlaceName] = useState('');
  const [placeId, setPlaceId] = useState(null);

  // Get placeId from slug
  useEffect(() => {
    const slug = searchParams.get('slug') || 'ankamall';
    async function fetchPlace() {
      try {
        const res = await fetch(`/api/places?slug=${slug}`);
        const data = await res.json();
        if (!data.error) {
          setPlaceName(data.place);
          setPlaceId(data.place_id);
        }
      } catch (error) {
        console.error('Place bilgileri alınamadı:', error);
      }
    }
    fetchPlace();
  }, [searchParams]);

  // Fetch enriched room data
  useEffect(() => {
    if (!placeId) return;

    const fetchEnrichedRooms = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/rooms?place_id=${placeId}`);
        const floorData = await response.json();

        const apiRooms = [];
        if (floorData && typeof floorData === 'object') {
            Object.entries(floorData).forEach(([floor, data]) => {
                if (data.features) {
                    data.features.forEach(feature => {
                        if (feature.properties.type === 'room') {
                            apiRooms.push({
                                ...feature.properties,
                                id: `f${floor}-${feature.properties.id}`,
                                floor: parseInt(floor),
                            });
                        }
                    });
                }
            });
        }
        setEnrichedRooms(apiRooms);
      } catch (error) {
        console.error('Enriched rooms fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrichedRooms();
  }, [placeId]);

  const handleRoomSelect = (room) => {
    const slug = searchParams.get('slug') || 'ankamall';
    router.push(`/kiosk/location?slug=${slug}&endRoomId=${room.id}`);
  };

  const handleAssistantOpen = () => {
    console.log("Assistant opened");
    // In the future, this could navigate to a dedicated assistant page for the kiosk
    // router.push('/kiosk/assistant');
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#00334e] px-6 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <button
                onClick={() => router.push('/kiosk')}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition"
            >
                <ArrowLeft size={24} className="text-white" />
            </button>
            <img src="/ankamall-logo.png" alt="Ankamall" className="w-14 h-14 rounded-2xl object-contain bg-white p-1" />
            <div>
                <h1 className="text-2xl font-bold text-white">{placeName ? `${placeName}'ü Keşfet` : "AVM'yi Keşfet"}</h1>
                <p className="text-sm text-white/90">Özel fırsatlar ve kampanyalar</p>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="relative inline-block">
              <div
                className="w-16 h-16 rounded-full mx-auto animate-spin"
                style={{ backgroundColor: '#00334e' }}
              ></div>
              <div className="w-12 h-12 bg-white rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <Sparkles
                  className="w-6 h-6 animate-pulse"
                  style={{ color: '#00334e' }}
                />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 mt-4">
              ✨ Kampanyalar yükleniyor...
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Harika fırsatları getiriyoruz
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <SubscriptionPopular
              popularRooms={enrichedRooms.filter(
                r =>
                  r.popular_campaign &&
                  r.popular_campaign.is_active &&
                  (!r.popular_campaign.end_date ||
                    new Date(r.popular_campaign.end_date) > new Date())
              )}
              onRoomSelect={handleRoomSelect}
            />
            <Campaigns
              campaignRooms={enrichedRooms.filter(
                r =>
                  r.campaigns &&
                  Array.isArray(r.campaigns) &&
                  r.campaigns.length > 0
              )}
              onRoomSelect={handleRoomSelect}
            />
            <AssistantDiscover onAssistantOpen={handleAssistantOpen} />
            <ProductCampaigns
              productRooms={enrichedRooms.filter(
                r =>
                  r.product_campaigns &&
                  Array.isArray(r.product_campaigns) &&
                  r.product_campaigns.some(p => p.is_active)
              )}
              onRoomSelect={handleRoomSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
