'use client';
import React from 'react';
import { Sparkles, Clock, Phone, Globe, ExternalLink } from 'lucide-react';

const StoreInfoSection = ({ store }) => {
  if (!store.hours && !store.phone && !store.website) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
        Mağaza Bilgileri
      </h3>

      <div className="space-y-4">
        {/* Açılış Saatleri */}
        {store.hours && (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Açılış Saatleri
              </div>
              <div className="text-sm text-gray-600">{store.hours}</div>
            </div>
          </div>
        )}

        {/* Telefon */}
        {store.phone && (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Telefon</div>
              <a
                href={`tel:${store.phone}`}
                className="text-sm text-green-600 hover:underline"
              >
                {store.phone}
              </a>
            </div>
          </div>
        )}

        {/* Web Sitesi */}
        {store.website && (
          <a
            href={
              store.website.startsWith('http')
                ? store.website
                : `https://${store.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:from-blue-100 hover:to-indigo-100 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900">
                Web Sitesi
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {store.website.replace(/^https?:\/\//, '')}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </a>
        )}
      </div>
    </div>
  );
};

export default StoreInfoSection;
