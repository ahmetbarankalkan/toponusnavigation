'use client';

import {
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  User,
  Pencil,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { usePlatformVoice } from '@/hooks/usePlatformVoice';
import { useLanguage } from '@/contexts/LanguageContext';
import BottomNavbar from '@/components/Navigation/BottomNavbar';

// Rota Onay Kartı Bileşeni
const RouteConfirmationCard = ({ data, sendMessage, rooms }) => {
  const [routeData, setRouteData] = useState(data);
  const [editing, setEditing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const lang = data.language || 'tr';

  const translate = key => {
    const strings = {
      tr: {
        confirmText: 'Bu rotayı oluşturmak istediğinizden emin misiniz?',
        yes: 'Evet',
        no: 'Hayır',
        search: 'Mağaza ara...',
        selectStart: 'Başlangıç Seç',
        selectDest: 'Hedef Seç',
      },
      en: {
        confirmText: 'Create this route?',
        yes: 'Yes',
        no: 'No',
        search: 'Search store...',
        selectStart: 'Select Start',
        selectDest: 'Select Destination',
      }
    };
    return strings[lang][key] || key;
  };

  const handleSelect = room => {
    const field = editing === 'from' ? 'fromRoom' : 'toRoom';
    setRouteData(prev => ({
      ...prev,
      [field]: {
        name: room.name,
        logo: room.logo,
        floor: room.floor,
        isCoordinate: false,
      },
    }));
    setEditing(null);
    setSearchQuery('');
  };

  const filteredRooms = searchQuery
    ? rooms
        .filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()) && !r.is_special)
        .slice(0, 5)
    : [];

  if (editing) {
    return (
      <div className="bg-white/90 rounded-2xl p-4 border border-[#1B3349]/20 shadow-xl w-full my-4">
        <div className="flex items-center justify-between mb-3 text-[#1B3349]">
          <h4 className="font-bold text-xs uppercase tracking-wider">
            {editing === 'from' ? translate('selectStart') : translate('selectDest')}
          </h4>
          <button onClick={() => setEditing(null)}><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={translate('search')}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-3 text-sm text-[#1B3349] focus:outline-none focus:border-[#1B3349]"
            autoFocus
          />
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {filteredRooms.map(room => (
            <button key={room.id} onClick={() => handleSelect(room)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-[#1B3349] truncate">
              {room.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 my-4 animate-fadeIn">
      {/* Overlapping Route Card Container */}
      <div className="relative w-full max-w-[280px] h-[115px]">
        {/* Dark Overlapping Icon Box */}
        <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-[#1B3349] rounded-[20px] flex items-center justify-center z-20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {/* White Card Body - Now Split into Two Boxes */}
        <div className="w-full h-full flex flex-col gap-1 relative z-10">
          {/* Start Point Box */}
          <button 
            onClick={() => setEditing('from')} 
            className="flex-1 bg-white rounded-t-[20px] rounded-b-none shadow-[0px_-2px_10px_rgba(0,0,0,0.05),0px_4px_10px_rgba(0,0,0,0.15)] flex items-center pl-12 pr-4 hover:bg-gray-50 transition-colors group overflow-hidden"
          >
            <div className="w-[8px] h-[8px] rounded-full border-[1.5px] border-[#1B3349] flex items-center justify-center flex-shrink-0 mr-3">
              <div className="w-[4px] h-[4px] rounded-full bg-[#1B3349]" />
            </div>
            <span className="text-[#1B3349] text-[13px] font-medium truncate flex-1 text-left" style={{ fontFamily: 'Poppins' }}>
              {routeData.fromRoom.name}
            </span>
            {!routeData.fromRoom.isCoordinate && (
              <div className="border border-[#1B3349] rounded-[20px] px-2 py-0.5 text-[#1B3349] text-[6px] font-medium flex-shrink-0" style={{ fontFamily: 'Poppins' }}>
                {routeData.fromRoom.floor === 0 ? 'Zemin Kat' : `${routeData.fromRoom.floor}. Kat`}
              </div>
            )}
          </button>

          {/* End Point Box */}
          <button 
            onClick={() => setEditing('to')} 
            className="flex-1 bg-white rounded-t-none rounded-b-[20px] shadow-[0px_4px_10px_rgba(0,0,0,0.15)] flex items-center pl-12 pr-4 hover:bg-gray-50 transition-colors group overflow-hidden"
          >
            <svg width="8" height="11" viewBox="0 0 24 24" fill="#1B3349" className="mr-3 flex-shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span className="text-[#1B3349] text-[13px] font-medium truncate flex-1 text-left" style={{ fontFamily: 'Poppins' }}>
              {routeData.toRoom.name}
            </span>
            <div className="border border-[#1B3349] rounded-[20px] px-2 py-0.5 text-[#1B3349] text-[6px] font-medium flex-shrink-0" style={{ fontFamily: 'Poppins' }}>
              {routeData.toRoom.floor === 0 ? 'Zemin Kat' : `${routeData.toRoom.floor}. Kat`}
            </div>
          </button>
        </div>
      </div>

      {/* Confirmation Question */}
      <p className="text-[#1B3349] text-[11px] font-medium text-center mt-1" style={{ fontFamily: 'Poppins' }}>
        {translate('confirmText')}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => sendMessage(lang === 'en' ? `Yes, route from ${routeData.fromRoom.name} to ${routeData.toRoom.name}` : `Evet, ${routeData.fromRoom.name} konumundan ${routeData.toRoom.name} konumuna gitmek istiyorum`)}
          className="w-[109px] h-[27px] bg-[#1B3349] rounded-[20px] text-white text-[8px] font-normal flex items-center justify-center transition-all active:scale-95 shadow-md shadow-[#1B3349]/10"
          style={{ fontFamily: 'Poppins' }}
        >
          {translate('yes')}
        </button>
        <button
          onClick={() => sendMessage(lang === 'en' ? "No" : "Hayır")}
          className="w-[109px] h-[27px] bg-white border border-[#1B3349] rounded-[20px] text-black text-[8px] font-normal flex items-center justify-center transition-all active:scale-95"
          style={{ fontFamily: 'Poppins' }}
        >
          {translate('no')}
        </button>
      </div>
    </div>
  );
};

export default function AssistantModal({
  isOpen,
  onClose,
  chatMessages,
  input,
  setInput,
  sendMessage,
  isAssistantTyping,
  hasActiveRoute,
  totalDistance,
  rooms = [],
  selectedEndRoom,
  setIsDiscoverOpen,
  setActiveNavItem,
  setIsAssistantOpen,
  clearRoute,
  handleCompleteRoute,
}) {
  const { t, language } = useLanguage();
  const chatMessagesEndRef = useRef(null);
  const [completionSuccess, setCompletionSuccess] = useState(false);
  const { isRecording, isProcessing, error, handleVoiceButtonClick, platformIcon, transcript } = usePlatformVoice();
  const [isMicActive, setIsMicActive] = useState(false);

  useEffect(() => {
    if (isRecording && transcript) {
      setInput(transcript);
    }
  }, [transcript, isRecording, setInput]);

  // Kayıt dışarıdan biterse butonu da eski haline döndür
  useEffect(() => {
    if (!isRecording && !isProcessing) {
      setIsMicActive(false);
    }
  }, [isRecording, isProcessing]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAssistantTyping]);

  const handleMicClick = async () => {
    if (isMicActive) {
      setIsMicActive(false);
      handleVoiceButtonClick(); // Durdur
      return;
    }

    setIsMicActive(true);
    await handleVoiceButtonClick((result) => {
      if (result) {
        setInput(result);
        sendMessage(result);
      }
      setIsMicActive(false);
    });
  };

  const handleSendMessage = e => {
    e?.preventDefault();
    if (!input.trim()) return;
    sendMessage();
  };

  const suggestions = [
    'En yakın kahveci nerede?',
    'Bugün hangi kampanyalar var?',
    'Eczane hangi katta?',
  ];

  if (!isOpen) return null;

  const arrivalTime = new Date();
  arrivalTime.setMinutes(arrivalTime.getMinutes() + Math.ceil(totalDistance / 80));
  const arrivalStr = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="fixed inset-0 z-[9999] bg-[#FFFFFF] flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-[#D9D9D9]/38 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 mt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-5 flex items-center">
            <svg width="40" height="20" viewBox="0 0 103 51" fill="none">
              <path d="M28.4163 0.0233489C36.7188 -0.350734 42.5824 3.81605 47.9 9.22611C51.9409 13.3379 55.1407 18.2183 58.2745 23.1599C61.1404 27.6788 64.6009 31.4872 68.7507 34.7282C73.3519 38.3213 77.0217 36.2183 80.6542 33.3356C84.3368 30.4137 87.3517 26.7483 89.8092 22.4904C92.5462 17.7467 96.2532 16.843 100.131 19.6612C103.366 22.0141 103.826 26.4984 101.152 30.7045C99.8255 32.7918 98.4012 34.8194 96.8765 36.7354C92.5275 42.1989 87.8877 47.1311 81.3248 49.5359C74.9926 51.8559 69.023 51.4394 63.1823 48.1386C55.0991 43.5726 49.8259 35.8803 44.7977 27.9491C41.8587 23.314 38.5558 19.1173 34.0163 16.2394C29.7232 13.5186 25.86 14.4633 22.1744 17.6288C18.6852 20.6262 15.709 24.1156 13.3074 28.2258C11.7985 30.8082 9.78808 32.7352 6.74595 32.7415C1.78941 32.7525 -1.63962 27.2701 0.81071 22.5799C5.67984 13.2577 12.0263 5.53558 21.4236 1.28863C23.9828 0.133373 26.4847 0.266975 28.4163 0.0233489Z" fill="#1B3349" />
            </svg>
          </div>
          <div className="w-[1px] h-[21px] bg-[#1B3349] rounded-full mx-1" />
          <span className="text-[#1B3349] text-[15px] font-semibold tracking-wide" style={{ fontFamily: 'Poppins' }}>Asistan</span>
        </div>
        <button onClick={onClose} className="p-2">
          <X size={28} className="text-[#1B3349]" />
        </button>
      </header>
      {/* Active Route Card */}
      {hasActiveRoute && selectedEndRoom && (
        <div className="relative z-20 px-6 mb-12 flex items-center gap-2 animate-fadeIn">
          {/* Status Label (Horizontal Box) */}
          <div className="h-[75px] bg-[#1B3349] rounded-[24px] flex items-center justify-center px-3 shadow-lg flex-shrink-0">
            <span className="text-white text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Poppins' }}>Aktif</span>
          </div>
          
          {/* Main Card */}
          <div className="relative flex-1 h-[110px] bg-white rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.15)] flex items-center p-3 gap-3 overflow-visible">
            {/* Cancel Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearRoute();
              }}
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors z-30"
              title="Rotayı İptal Et"
            >
              <X size={16} className="text-[#1B3349]" />
            </button>

            {/* Store Icon */}
            <div className="w-[74px] h-[58px] bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex items-center justify-center p-2 border border-gray-50 flex-shrink-0 overflow-hidden">
              {selectedEndRoom.logo ? (
                <img src={selectedEndRoom.logo} alt={selectedEndRoom.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[#1B3349] font-bold text-xs">{selectedEndRoom.name?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <h3 className="text-[#253C51] text-[12px] font-semibold truncate" style={{ fontFamily: 'Poppins' }}>
                {selectedEndRoom.name?.toUpperCase()}
              </h3>
              <div className="flex gap-1.5">
                <div className="flex-1 h-[32px] border border-[#263D52] rounded-[20px] flex flex-col items-center justify-center px-0.5">
                  <span className="text-[#263D52] text-[6px] font-medium whitespace-nowrap">Varış Süresi</span>
                  <span className="text-[#263D52] text-[11px] font-semibold leading-none">{Math.ceil(totalDistance / 80)} dk</span>
                </div>
                <div className="flex-1 h-[32px] border border-[#263D52] rounded-[20px] flex flex-col items-center justify-center px-0.5">
                  <span className="text-[#263D52] text-[6px] font-medium whitespace-nowrap">Mesafe</span>
                  <span className="text-[#263D52] text-[11px] font-semibold leading-none">{Math.round(totalDistance)} m</span>
                </div>
                <div className="flex-1 h-[32px] border border-[#263D52] rounded-[20px] flex flex-col items-center justify-center px-0.5">
                  <span className="text-[#263D52] text-[6px] font-medium whitespace-nowrap">Varış Zamanı</span>
                  <span className="text-[#263D52] text-[11px] font-semibold leading-none">{arrivalStr}</span>
                </div>
              </div>
            </div>

            {/* Rotayı Tamamla Butonu - Floating like main screen */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-[60] w-full flex justify-center px-4">
              {typeof window !== 'undefined' && localStorage.getItem('user_token') ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (completionSuccess) return;
                    setCompletionSuccess(true);
                    setTimeout(() => {
                      handleCompleteRoute();
                      clearRoute();
                      setCompletionSuccess(false);
                    }, 1500);
                  }}
                  disabled={completionSuccess}
                  className={`
                    relative overflow-hidden transition-all duration-500 active:scale-95
                    ${completionSuccess ? 'bg-emerald-500 w-[160px]' : 'bg-[#1B3349] w-[140px]'}
                    h-[36px] rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.2)]
                    flex items-center justify-center gap-2 border border-white/20
                    backdrop-blur-md group
                  `}
                >
                  {completionSuccess ? (
                    <>
                      <span className="text-white text-[11px] font-bold tracking-wide animate-in fade-in zoom-in duration-300">
                        HEDEFE ULAŞILDI
                      </span>
                      <svg className="animate-in zoom-in spin-in-12 duration-500" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="text-white text-[10px] font-bold tracking-widest uppercase opacity-90 group-hover:opacity-100 italic">
                        Rotayı Tamamla
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <span className="text-gray-400 text-[9px] font-medium uppercase tracking-tight">Kayıt için giriş yapın</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Content */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
        {chatMessages
          .filter(m => m.role !== 'system')
          .map((msg, i) => {
            const isRouteConfirm = msg.role === 'assistant' && msg.content && (
              msg.content.includes('[ROUTE_CONFIRM]') || 
              msg.content.match(/emin misiniz|are you sure|oluşturmak.*ister.*misiniz|would you like.*route/i)
            );

            if (isRouteConfirm) {
              return (
                <div key={i} className="w-full flex flex-col gap-2">
                   {formatMessageContent(msg.content, sendMessage, t, rooms, language)}
                </div>
              );
            }

            return (
              <div key={i} className={`w-full flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} items-end gap-3`}>
                {msg.role === 'assistant' && (
                  <div className="w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100 flex-shrink-0">
                     <svg width="18" height="10" viewBox="0 0 103 51" fill="none"><path d="M28.4163 0.0233489C36.7188 -0.350734 42.5824 3.81605 47.9 9.22611C51.9409 13.3379 55.1407 18.2183 58.2745 23.1599C61.1404 27.6788 64.6009 31.4872 68.7507 34.7282C73.3519 38.3213 77.0217 36.2183 80.6542 33.3356C84.3368 30.4137 87.3517 26.7483 89.8092 22.4904C92.5462 17.7467 96.2532 16.843 100.131 19.6612C103.366 22.0141 103.826 26.4984 101.152 30.7045C99.8255 32.7918 98.4012 34.8194 96.8765 36.7354C92.5275 42.1989 87.8877 47.1311 81.3248 49.5359C74.9926 51.8559 69.023 51.4394 63.1823 48.1386C55.0991 43.5726 49.8259 35.8803 44.7977 27.9491C41.8587 23.314 38.5558 19.1173 34.0163 16.2394C29.7232 13.5186 25.86 14.4633 22.1744 17.6288C18.6852 20.6262 15.709 24.1156 13.3074 28.2258C11.7985 30.8082 9.78808 32.7352 6.74595 32.7415C1.78941 32.7525 -1.63962 27.2701 0.81071 22.5799C5.67984 13.2577 12.0263 5.53558 21.4236 1.28863C23.9828 0.133373 26.4847 0.266975 28.4163 0.0233489Z" fill="#1B3349" /></svg>
                  </div>
                )}
                <div className={`max-w-[252px] px-4 py-3 rounded-[20px] shadow-sm ${msg.role === 'assistant' ? 'bg-white text-black border border-[#1B3349] rounded-bl-[4px]' : 'bg-[#1B3349] text-white rounded-br-[4px]'}`} style={{ fontFamily: 'Poppins' }}>
                  {formatMessageContent(msg.content, sendMessage, t, rooms, language)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-[28px] h-[28px] bg-[#1B3349] rounded-full flex items-center justify-center shadow-lg flex-shrink-0 animate-fadeIn">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
        {isAssistantTyping && (
          <div className="flex justify-start items-center gap-3">
             <div className="w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center shadow-md animate-pulse">
                <Sparkles size={14} className="text-[#1B3349]" />
             </div>
             <div className="bg-white border border-[#1B3349] px-4 py-2 rounded-[15px]"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-[#1B3349] rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-[#1B3349] rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-[#1B3349] rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>
          </div>
        )}
        <div ref={chatMessagesEndRef} />
      </main>

      <div className="px-6 pb-44 sm:pb-52 relative z-20">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
          {/* Suggestions - only show before chat starts */}
          {chatMessages.filter(m => m.role !== 'system').length === 0 && (
          <div className="flex flex-col items-end gap-2.5">
            <span className="text-[11px] text-gray-500 font-medium" style={{ fontFamily: 'Poppins' }}>Şunları da sorabilirsiniz;</span>
            <div className="flex flex-col gap-2 items-end">
              {suggestions.map((s, idx) => (
                <button type="button" key={idx} onClick={() => sendMessage(s)} className="bg-white border border-[#1B3349] rounded-[20px] px-5 py-2 text-[10px] text-black font-semibold hover:bg-gray-50 transition-colors shadow-sm" style={{ fontFamily: 'Poppins' }}>{s}</button>
              ))}
            </div>
          </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white h-[48px] rounded-[15px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center px-4 border border-[#1B3349]/10 focus-within:border-[#1B3349]/30 transition-all">
              <input 
                type="text" 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                placeholder={isRecording ? "Dinleniyor..." : "Mesajınızı buraya yazın..."} 
                className={`w-full bg-transparent border-none outline-none text-[#1B3349] text-sm font-medium ${isRecording ? 'placeholder:text-red-500/50' : 'placeholder:text-gray-400'}`} 
                style={{ fontFamily: 'Poppins' }} 
              />
            </div>
            <button type="submit" disabled={!input.trim()} className={`w-[48px] h-[48px] rounded-[20px] shadow-lg flex items-center justify-center transition-all ${input.trim() ? 'bg-[#1B3349] hover:bg-[#253C51]' : 'bg-gray-300 cursor-not-allowed'}`}>
              <Send size={20} className="text-white" />
            </button>
            <button 
              type="button" 
              onClick={handleMicClick} 
              className={`w-[48px] h-[48px] rounded-full shadow-lg flex items-center justify-center transition-all relative ${isMicActive ? 'bg-[#FF3B30] scale-110 animate-pulse shadow-[0_0_25px_rgba(255,59,48,0.4)]' : isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-[#1B3349] hover:bg-[#253C51] active:bg-red-500/20 active:scale-95'}`}
              title={isMicActive ? 'Durdur' : 'Konuş'}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRecording ? (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                <Mic size={22} className="text-white" />
              )}

              {error && (
                <div className="absolute -top-12 right-0 bg-red-500 text-white text-[9px] px-2 py-1 rounded shadow-lg max-w-[150px] leading-tight">
                  {error}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Navbar Integrated */}
      <BottomNavbar 
        setIsDiscoverOpen={setIsDiscoverOpen}
        setActiveNavItem={setActiveNavItem}
        setIsAssistantOpen={setIsAssistantOpen}
        activeNavItem={2} // Asisten aktif
        isAssistantOpen={true}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}

const formatMessageContent = (content, sendMessage, t, rooms, language) => {
  if (!content) return null;
  const lang = language || 'tr';

  if (content.includes('[ROUTE_CONFIRM]')) {
    try {
      const match = content.match(/\[ROUTE_CONFIRM\]([\s\S]*?)\[\/ROUTE_CONFIRM\]/);
      if (match) {
        const routeData = JSON.parse(match[1]);
        return <RouteConfirmationCard data={{...routeData, language: lang}} sendMessage={sendMessage} rooms={rooms} />;
      }
    } catch (e) { console.error(e); }
  }

  // GPT route pattern detection
  const isRouteConfirmPattern = content.match(/emin misiniz|are you sure|oluşturmak.*ister.*misiniz|would you like.*route/i);
  if (isRouteConfirmPattern) {
      const nameMatch = content.match(/([A-ZÇĞİÖŞÜ][a-zçğışüö0-9\s]+)['"]? (?:ye|ya|a|e|konumuna|to)/i);
      if (nameMatch) {
          const targetName = nameMatch[1].trim();
          const targetRoom = rooms.find(r => r.name?.toLowerCase().includes(targetName.toLowerCase()));
          if (targetRoom) {
              const routeData = {
                  fromRoom: { name: lang === 'en' ? '📍 Your Location' : '📍 Mevcut Konum', isCoordinate: true },
                  toRoom: { name: targetRoom.name, logo: targetRoom.logo || '', floor: targetRoom.floor },
                  language: lang
              };
              return <RouteConfirmationCard data={routeData} sendMessage={sendMessage} rooms={rooms} />;
          }
      }
  }

  return <p className="text-[13px] leading-[1.6]">{content}</p>;
};
