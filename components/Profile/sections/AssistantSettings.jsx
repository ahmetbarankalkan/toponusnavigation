'use client';

import { useState } from 'react';
import { securityQuestions } from '../hooks/useAssistant';
import { Sparkles, Check, ChevronDown, KeyRound, RefreshCw } from 'lucide-react';

const funnyWords = [
  "Turşu 🥒",
  "Tornavida 🔧",
  "Pırasa 🥬",
  "Terlik 🩴",
  "Mandal 🧺",
  "Damacana 💧",
  "Kornişon 🥒",
  "Şempanze 🐒",
  "Zımba 📎",
  "Vantilatör 💨",
  "Dinozor 🦖",
  "Patates 🥔",
  "Brokoli 🥦",
  "Penguen 🐧",
  "Ahtapot 🐙",
  "Kaktüs 🌵",
  "Şemsiye ☂️",
  "Tost 🥪",
  "Çorap 🧦",
  "Karpuz 🍉",
  "Maydanoz 🌿",
  "Ejderha 🐉",
  "Uzaylı 👽",
  "Robot 🤖",
  "Panda 🐼"
];

export default function AssistantSettings({
  assistantForm,
  setAssistantForm,
  assistantLoading,
  assistantError,
  assistantSuccess,
  handleSaveAssistant,
  setActiveSection,
}) {
  const [suggestedAnswer, setSuggestedAnswer] = useState('');

  const handleSuggest = () => {
    const randomIndex = Math.floor(Math.random() * funnyWords.length);
    setSuggestedAnswer(funnyWords[randomIndex]);
  };

  const applySuggestion = () => {
    // Emojiyi temizleyip sadece kelimeyi alalım
    const cleanWord = suggestedAnswer.split(' ')[0];
    
    setAssistantForm({
      ...assistantForm,
      securityAnswer: cleanWord,
      securityQuestion: 'Sihirli kelime ne? 🔐'
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#EAEAEA] overflow-hidden relative">
      {/* Curved Header Block */}
      <div 
        className="relative bg-[#253C51] shrink-0 flex flex-col items-center"
        style={{ height: '180px', borderRadius: '0px 0px 20px 20px' }}
      >
        <div className="w-full px-6 flex items-center justify-between h-full">
          {/* Back Button */}
          <button 
            onClick={() => setActiveSection('main')} 
            className="text-white p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          {/* Title - Centered vertically and horizontally */}
          <h2
            className="text-white text-[16px] font-medium absolute left-1/2 -translate-x-1/2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Asistan Kullanıcı Adı
          </h2>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Floating Icon Card */}
      <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: '125px' }}>
        <div 
          className="bg-white flex items-center justify-center relative shadow-[0_1px_7.6px_rgba(0,0,0,0.25)] rounded-[20px]"
          style={{ width: '110px', height: '105px' }}
        >
          <div className="w-[66px] h-[66px] bg-[#253C51] rounded-full flex items-center justify-center border-2 border-white">
            <svg
              width="40"
              height="40"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9.5C19 14.1944 15.1944 18 10.5 18C5.80558 18 2 14.1944 2 9.5C2 4.80558 5.80558 1 10.5 1C15.1944 1 19 4.80558 19 9.5Z"
                stroke="white"
                strokeWidth="2"
              />
              <circle cx="7.5" cy="8.5" r="1.5" fill="white" />
              <circle cx="13.5" cy="8.5" r="1.5" fill="white" />
              <path
                d="M7 12.5C7 12.5 8.5 14 10.5 14C12.5 14 14 12.5 14 12.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-[80px] pb-[200px] flex flex-col items-center touch-pan-y overscroll-contain">
        <div className="w-full max-w-[357px] space-y-6">
          
          {/* Info Box */}
          <div className="bg-white rounded-[20px] p-5 shadow-[0px_0px_7px_rgba(0,0,0,0.15)] border border-white/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#253C51] rounded-full flex items-center justify-center p-2.5">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 
                  className="text-[#253C51] font-bold text-[13px] mb-1.5 uppercase" 
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Asistanın Seni Tanısın!
                </h3>
                <p
                  className="text-gray-600 text-[12px] leading-relaxed"
                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                >
                  Asistana <span className="font-bold text-[#253C51]">"Ben [kullanıcı adın]"</span> dediğinde seni tanıyacak!
                </p>
              </div>
            </div>
          </div>

          {assistantError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-[13px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {assistantError}
            </div>
          )}

          {assistantSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl text-[13px] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {assistantSuccess}
            </div>
          )}

          {/* Form Content */}
          <div className="bg-[rgba(255,255,255,0.55)] rounded-[25px] p-6 shadow-[0px_0px_7px_rgba(0,0,0,0.15)] space-y-5">
            {/* Username */}
            <div>
              <label
                className="block text-[#253c51] text-[13px] font-semibold mb-2 uppercase"
                style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}
              >
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={assistantForm.username}
                onChange={e =>
                  setAssistantForm({
                    ...assistantForm,
                    username: e.target.value,
                  })
                }
                placeholder="Örn: Ahmet, Ayşe"
                className="w-full bg-white rounded-[15px] px-4 py-3.5 text-[14px] text-[#253c51] border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#253c51]/10 transition-all font-medium"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>

            {/* Security Question */}
            <div>
              <label
                className="block text-[#253c51] text-[13px] font-semibold mb-2 uppercase"
                style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}
              >
                Güvenlik Sorusu
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assistantForm.securityQuestion}
                  onChange={e =>
                    setAssistantForm({
                      ...assistantForm,
                      securityQuestion: e.target.value,
                    })
                  }
                  list="classic-questions"
                  placeholder="Bir soru seçin veya yazın"
                  className="w-full bg-white rounded-[15px] px-4 py-3.5 text-[14px] text-[#253c51] border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#253c51]/10 transition-all font-medium pr-10"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#253c51]">
                  <ChevronDown size={18} />
                </div>
              </div>
              <datalist id="classic-questions">
                {securityQuestions.map((q, i) => (
                  <option key={i} value={q} />
                ))}
              </datalist>
            </div>

            {/* Security Answer */}
            <div>
              <label
                className="block text-[#253c51] text-[13px] font-semibold mb-2 uppercase"
                style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.05em' }}
              >
                Güvenlik Cevabı
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={assistantForm.securityAnswer}
                  onChange={e =>
                    setAssistantForm({
                      ...assistantForm,
                      securityAnswer: e.target.value,
                    })
                  }
                  placeholder="Cevabınız"
                  className="w-full bg-white rounded-[15px] px-4 py-3.5 text-[14px] text-[#253c51] border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#253c51]/10 transition-all font-medium pr-10"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#253c51]">
                  <KeyRound size={18} />
                </div>
              </div>
            </div>

            {/* Suggestion Section */}
            <div className="pt-2 border-t border-gray-100 mt-4">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleSuggest}
                  className="flex-1 bg-white text-[#253c51] border border-gray-200 hover:bg-gray-50 rounded-xl py-3 text-[11px] font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <RefreshCw size={14} />
                  {suggestedAnswer ? 'BAŞKA ÖNER' : 'SORU/CEVAP ÖNER'}
                </button>
                
                {suggestedAnswer && (
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="flex-1 bg-[#253C51] text-white hover:bg-[#1a2a3a] rounded-xl py-3 text-[11px] font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Check size={14} />
                    BUNU KULLAN
                  </button>
                )}
              </div>
              
              {suggestedAnswer && (
                <div className="bg-[#253C51]/5 rounded-lg p-2 text-center border border-[#253C51]/10 animate-in fade-in zoom-in duration-300">
                  <span className="text-[#253C51] text-[12px] font-bold">"{suggestedAnswer}"</span>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveAssistant}
            disabled={assistantLoading}
            className="w-full bg-[#253c51] text-white shadow-lg shadow-[#253c51]/20 rounded-[20px] py-4 text-[14px] font-bold hover:bg-[#1a2b3a] active:scale-95 disabled:bg-gray-400 transition-all uppercase tracking-wider"
            style={{
              fontFamily: 'Poppins, sans-serif',
              touchAction: 'manipulation',
            }}
          >
            {assistantLoading ? 'KAYDEDİLİYOR...' : 'AYARLARI KAYDET'}
          </button>
        </div>
      </div>
    </div>
  );
}
