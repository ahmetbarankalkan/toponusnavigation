'use client';

import {
  X,
  Bot,
  MapPin,
  Sparkles,
  User,
  Send,
  Mic,
  Map,
  Store,
  Tag,
  Navigation,
} from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EnhancedAssistantModal({
  isOpen,
  onClose,
  chatMessages,
  input,
  setInput,
  sendMessage,
  isAssistantTyping,
  handleVoiceButtonClick,
  isRecording,
  isVoiceProcessing,
  slug = 'ankamall',
}) {
  const chatMessagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  // Hazır sorular
  const quickQuestions = [
    {
      icon: <MapPin size={18} className="text-brand" />,
      text: 'Çevremdeki mağazalar',
      query: 'Çevremdeki mağazaları göster',
    },
    {
      icon: <Tag size={18} className="text-brand" />,
      text: 'Kampanyalar',
      query: 'Aktif kampanyaları göster',
    },
    {
      icon: <Store size={18} className="text-brand" />,
      text: 'Migros nerede?',
      query: 'Migros nerede?',
    },
    {
      icon: <User size={18} className="text-brand" />,
      text: 'Tuvalet',
      query: 'En yakın tuvalet nerede?',
    },
    {
      icon: <Navigation size={18} className="text-brand" />,
      text: 'Yemek yemek istiyorum',
      query: 'Yemek yiyebileceğim yerler',
    },
  ];

  // Mesaj içeriğini parse et - mağaza kartları için
  const parseMessageContent = content => {
    try {
      // JSON formatında mağaza bilgisi var mı kontrol et
      if (content.includes('"name"') && content.includes('"logo"')) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const stores = JSON.parse(jsonMatch[0]);
          return {
            type: 'stores',
            data: stores,
            text: content.replace(jsonMatch[0], ''),
          };
        }
      }

      // Kampanya bilgisi var mı kontrol et
      if (
        content.includes('"campaigns"') ||
        content.includes('"product_campaigns"')
      ) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const campaigns = JSON.parse(jsonMatch[0]);
          return {
            type: 'campaigns',
            data: campaigns,
            text: content.replace(jsonMatch[0], ''),
          };
        }
      }
    } catch (e) {
      // JSON parse hatası - normal metin olarak göster
    }

    return { type: 'text', text: content };
  };

  // Mağaza kartı bileşeni
  const StoreCard = ({ store, onNavigate }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 hover:bg-white/15 transition-all">
      <div className="flex items-center gap-3">
        {store.logo && (
          <img
            src={store.logo}
            alt={store.name}
            className="w-12 h-12 object-contain rounded-lg bg-white p-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">
            {store.name}
          </h4>
          <p className="text-white/60 text-xs">
            {store.category || 'Mağaza'} • Kat {store.floor}
          </p>
          {store.has_campaigns && (
            <span className="inline-block mt-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              🔥 Kampanya
            </span>
          )}
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate(store)}
            className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white text-xs rounded-lg transition-all"
          >
            Yol Tarifi
          </button>
        )}
      </div>
    </div>
  );

  // Kampanya kartı bileşeni
  const CampaignCard = ({ campaign }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all">
      {campaign.image && (
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          {campaign.logo && (
            <img
              src={campaign.logo}
              alt={campaign.name}
              className="w-8 h-8 object-contain rounded bg-white p-1"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm">
              {campaign.name}
            </h4>
            <p className="text-white/60 text-xs">Kat {campaign.floor}</p>
          </div>
        </div>

        {campaign.campaigns &&
          campaign.campaigns.map((c, idx) => (
            <div key={idx} className="mt-2">
              <p className="text-white text-sm font-medium">{c.title}</p>
              {c.description && (
                <p className="text-white/70 text-xs mt-1">{c.description}</p>
              )}
              {(c.discount_percentage || c.discount_amount) && (
                <div className="mt-2 flex gap-2">
                  {c.discount_percentage && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      %{c.discount_percentage} İndirim
                    </span>
                  )}
                  {c.discount_amount && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {c.discount_amount} TL İndirim
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

        {campaign.product_campaigns &&
          campaign.product_campaigns.slice(0, 2).map((p, idx) => (
            <div key={idx} className="mt-2 flex gap-2 items-start">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.product_name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium">
                  {p.product_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {p.original_price > p.discounted_price && (
                    <span className="text-white/50 text-xs line-through">
                      {p.original_price} ₺
                    </span>
                  )}
                  <span className="text-brand text-sm font-bold">
                    {p.discounted_price} ₺
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // Haritada göster butonu handler
  const handleShowOnMap = store => {
    router.push(`/?slug=${slug}&search=${encodeURIComponent(store.name)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div
          className="bg-brand px-6 py-4 flex items-center justify-between"
          style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Bot size={24} className="text-brand" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">Akıllı Asistan</h2>
              <p className="text-white/80 text-xs">
                🗺️ Navigasyon & Kampanyalar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {chatMessages.length === 0 ||
          chatMessages.filter(m => m.role !== 'system').length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="mb-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Bot size={40} className="text-white" />
                </div>
                <h1 className="text-white text-3xl font-bold mb-3">
                  Merhaba! 👋
                </h1>
                <p className="text-white/70 text-center max-w-md">
                  Size nasıl yardımcı olabilirim? Mağaza arayabilir,
                  kampanyaları görebilir veya yol tarifi alabilirsiniz.
                </p>
              </div>

              <div className="w-full max-w-md space-y-3">
                <p className="text-white/60 text-sm text-center mb-4">
                  Hızlı Sorular:
                </p>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(q.query);
                      sendMessage(q.query);
                    }}
                    className="w-full bg-gradient-to-r from-brand/20 to-brand/20 hover:from-brand/30 hover:to-brand/30 backdrop-blur-sm text-white py-4 px-6 rounded-xl transition-all text-left border border-white/20 shadow-lg flex items-center gap-3"
                  >
                    {q.icon}
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto py-4">
              {chatMessages
                .filter(m => m.role !== 'system')
                .map((msg, i) => {
                  const parsed = parseMessageContent(msg.content);

                  return (
                    <div
                      key={i}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-brand to-brand text-white rounded-2xl rounded-br-md px-5 py-4 shadow-lg'
                            : 'w-full'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-[15px] leading-relaxed">
                            {msg.content}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {parsed.text && (
                              <div className="bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl rounded-bl-md px-5 py-4 shadow-lg">
                                <p className="text-[15px] leading-relaxed">
                                  {parsed.text}
                                </p>
                              </div>
                            )}

                            {parsed.type === 'stores' && parsed.data && (
                              <div className="space-y-2">
                                {parsed.data.map((store, idx) => (
                                  <StoreCard
                                    key={idx}
                                    store={store}
                                    onNavigate={handleShowOnMap}
                                  />
                                ))}
                              </div>
                            )}

                            {parsed.type === 'campaigns' && parsed.data && (
                              <div className="space-y-3">
                                {parsed.data.map((campaign, idx) => (
                                  <CampaignCard key={idx} campaign={campaign} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {isAssistantTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-5 py-3 rounded-2xl rounded-bl-md bg-white/10 backdrop-blur-md border border-white/20">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div
          className="p-6"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                input.trim()
                  ? 'bg-gradient-to-r from-brand to-brand hover:from-brand hover:to-brand-dark'
                  : 'bg-white/10 cursor-not-allowed'
              }`}
            >
              <Send size={22} className="text-white" />
            </button>
            <button
              onClick={handleVoiceButtonClick}
              className="w-14 h-14 bg-gradient-to-r from-brand to-brand hover:from-brand hover:to-brand-dark rounded-full flex items-center justify-center transition-all shadow-lg relative"
            >
              {isVoiceProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Mic size={22} className="text-white" />
              )}
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-brand animate-ping opacity-30"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
