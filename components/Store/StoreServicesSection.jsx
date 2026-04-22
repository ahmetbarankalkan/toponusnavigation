'use client';
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const StoreServicesSection = ({ services }) => {
  if (!services || (Array.isArray(services) && services.length === 0)) {
    return null;
  }

  const serviceList = Array.isArray(services)
    ? services
    : services.split(',').map(s => s.trim());

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <CheckCircle2 className="w-5 h-5 mr-2 text-amber-600" />
        Hizmetler
      </h3>
      <div className="flex flex-wrap gap-2">
        {serviceList.map((service, index) => (
          <span
            key={index}
            className="inline-flex items-center text-xs bg-white text-amber-900 px-3 py-2 rounded-full font-medium shadow-sm border border-amber-200"
          >
            <CheckCircle2 className="w-3 h-3 mr-1.5 text-amber-600" />
            {service}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StoreServicesSection;
