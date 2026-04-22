'use client';

import { useState } from 'react';
import PopularPlacesCampaign from './campaigns/PopularPlacesCampaign';
import StoreCampaign from './campaigns/StoreCampaign';
import ProductCampaign from './campaigns/ProductCampaign';
import FreeCampaign from './campaigns/FreeCampaign';

export default function CampaignTabs({ room, placeId, onCampaignUpdate }) {
  const [activeTab, setActiveTab] = useState('popular');

  const tabs = [
    { id: 'popular', label: 'Popüler Yerler', icon: '🔥' },
    { id: 'store', label: 'Mağaza Kampanyası', icon: '🏪' },
    { id: 'product', label: 'Ürün Kampanyası', icon: '🎁' },
    { id: 'free', label: 'Ücretsiz Kampanya', icon: '⚡' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Header */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-light0 text-brand-dark bg-brand-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'popular' && (
          <PopularPlacesCampaign
            room={room}
            placeId={placeId}
            onCampaignUpdate={onCampaignUpdate}
          />
        )}
        {activeTab === 'store' && (
          <StoreCampaign
            room={room}
            placeId={placeId}
            onCampaignUpdate={onCampaignUpdate}
          />
        )}
        {activeTab === 'product' && (
          <ProductCampaign
            room={room}
            placeId={placeId}
            onCampaignUpdate={onCampaignUpdate}
          />
        )}
        {activeTab === 'free' && (
          <FreeCampaign
            room={room}
            placeId={placeId}
            onCampaignUpdate={onCampaignUpdate}
          />
        )}
      </div>
    </div>
  );
}
