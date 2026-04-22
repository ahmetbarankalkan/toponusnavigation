'use client';

import { Package } from 'lucide-react';

export default function ProductCampaigns({ productRooms, onRoomSelect }) {
  // Eğer hiç ürün kampanyası yoksa, component'i gösterme
  if (productRooms.length === 0) {
    return null;
  }

  return (
    <div className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-[25px] h-[25px] bg-[#1B3349] rounded-full flex items-center justify-center">
            <Package size={13} className="text-[#D9D9D9]" />
          </div>
          <h3 className="text-[#1B3349] text-[15px] font-bold font-poppins">Ürün Kampanyaları</h3>
        </div>
        <div className="border border-[#1B3349] rounded-[20px] px-[10px] h-[22px] shadow-[0px_0px_4px_rgba(0,0,0,0.15)] bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
          <span className="text-[#1B3349] text-[9px] font-bold tracking-tight font-poppins leading-none">
            {productRooms.flatMap(r => r.product_campaigns || []).length} Ürün
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-10 pb-16">
        {productRooms.map((room, roomIdx) => (
          <div 
            key={room.id || roomIdx} 
            className="bg-[#C8C8C896] rounded-[32px] p-6 shadow-[0px_0px_40px_rgba(0,0,0,0.4)] space-y-7 border border-black/10"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                <div className="h-[28px] min-w-[85px] bg-white rounded-[16px] px-4 flex items-center justify-center shadow-[0px_0px_15px_rgba(0,0,0,0.12)]">
                  <span className="text-black text-[10px] font-bold uppercase font-poppins tracking-wider leading-none">
                    {room.name}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => onRoomSelect(room)}
                className="h-[30px] bg-[#1B3349] text-white rounded-[16px] px-6 flex items-center justify-center text-[9px] font-bold shadow-[0px_0px_15px_rgba(0,0,0,0.2)] hover:bg-[#253C51] transition-all font-poppins uppercase tracking-wider leading-none"
              >
                Yol Tarifi Al
              </button>
            </div>

            {/* Multiple Product Rows - Structure Reverted */}
            <div className="flex flex-col gap-4">
              {(room.product_campaign_list || room.product_campaigns || []).slice(0, 3).map((camp, campIdx) => {
                // Support new populated structure and old embedded structure
                const product = camp.productId || camp; 
                const name = product.product_name || product.name || camp.title;
                const image = product.image || camp.image;
                const discount = camp.discountPercentage || camp.discount_percentage;
                
                // Calculate discounted price if not present (from product price and discount)
                let discountedPrice = camp.discounted_price;
                if (!discountedPrice && product.price) {
                  if (camp.discountPercentage) {
                    discountedPrice = product.price * (1 - camp.discountPercentage / 100);
                  } else if (camp.discountAmount) {
                    discountedPrice = product.price - camp.discountAmount;
                  }
                }

                return (
                  <div
                    key={campIdx}
                    onClick={() => onRoomSelect(room)}
                    className="w-full h-[70px] bg-[#FFFFFF57] rounded-[24px] px-4 flex items-center justify-between border border-white/20 shadow-[0px_0px_15px_rgba(0,0,0,0.08)] cursor-pointer hover:bg-white/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                          className="w-[52px] h-[52px] rounded-[16px] bg-cover bg-center overflow-hidden flex-shrink-0 bg-gray-100 shadow-inner border border-black/5"
                          style={{ backgroundImage: image ? `url(${image.startsWith('http') || image.startsWith('/') ? image : '/' + image})` : 'none' }}
                      />
                      <div className="flex flex-col">
                        <h4 className="text-black text-[13px] font-bold font-poppins">
                          {name}
                        </h4>
                        <p className="text-black/50 text-[9px] font-bold font-poppins mt-0.5">
                          {discount ? `%${discount} İndirim Fırsatı` : 'Özel Fırsat'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pr-1">
                      <span className="text-black text-[16px] font-bold font-poppins whitespace-nowrap">
                        {discountedPrice ? Math.round(discountedPrice) : (product.price || '0')} TL
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
