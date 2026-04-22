// components/kiosk/KioskAssistant.jsx
'use client';

import { useState } from 'react';
import {
  Send,
  Mic,
  Sparkles,
  MapPin,
  Store,
  Coffee,
  Utensils,
  ShoppingBag,
} from 'lucide-react';

export default function KioskAssistant({ rooms, onRoomSelect }) {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      text:
        'Merhaba! Size nasıl yardımcı olabilirim? Mağaza aramak, kategori bulmak veya yol tarifi almak için bana sorabilirsiniz.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Hızlı sorular
  const quickQuestions = [
    { icon: Store, text: 'Moda mağazaları nerede?', category: 'fashion' },
    { icon: Coffee, text: 'En yakın kafe', category: 'cafe' },
    { icon: Utensils, text: 'Yemek alanı', category: 'food' },
    { icon: ShoppingBag, text: 'Popüler mağazalar', category: 'popular' },
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;

    // Kullanıcı mesajını ekle
    setMessages(prev => [...prev, { type: 'user', text: inputText }]);

    // Basit AI yanıtı simülasyonu
    setTimeout(() => {
      const response = generateResponse(inputText, rooms);
      setMessages(prev => [
        ...prev,
        { type: 'assistant', text: response.text },
      ]);

      // Eğer mağaza önerisi varsa
      if (response.store) {
        onRoomSelect(response.store);
      }
    }, 500);

    setInputText('');
  };

  const handleQuickQuestion = question => {
    setInputText(question.text);
    handleSend();
  };

  const handleVoice = () => {
    setIsListening(!isListening);
    // Sesli komut entegrasyonu buraya eklenebilir
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Mesaj Alanı */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 md:px-6 py-3 md:py-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-600">
                    Asistan
                  </span>
                </div>
              )}
              <p className="text-sm md:text-base leading-relaxed">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Hızlı Sorular */}
      {messages.length === 1 && (
        <div className="px-4 md:px-6 pb-4">
          <p className="text-xs md:text-sm font-bold text-gray-600 mb-3">
            Hızlı Sorular:
          </p>
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {quickQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(q)}
                className="flex items-center gap-2 md:gap-3 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 p-3 md:p-4 rounded-xl transition-all hover:scale-105 border border-blue-200/50"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <q.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-900 text-left">
                  {q.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Alanı */}
      <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={handleVoice}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Mic className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Bir şey sorun..."
            className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Basit yanıt üretici
function generateResponse(input, rooms) {
  const lowerInput = input.toLowerCase();

  // Kategori araması
  if (lowerInput.includes('moda') || lowerInput.includes('giyim')) {
    const fashionStores = rooms.filter(
      r =>
        r.category?.toLowerCase().includes('fashion') ||
        r.category?.toLowerCase().includes('giyim')
    );
    if (fashionStores.length > 0) {
      return {
        text: `${
          fashionStores.length
        } adet moda mağazası buldum. Örneğin: ${fashionStores
          .slice(0, 3)
          .map(s => s.name)
          .join(', ')}. Hangisine gitmek istersiniz?`,
        store: fashionStores[0],
      };
    }
  }

  if (lowerInput.includes('kafe') || lowerInput.includes('kahve')) {
    const cafes = rooms.filter(
      r =>
        r.category?.toLowerCase().includes('cafe') ||
        r.category?.toLowerCase().includes('kahve')
    );
    if (cafes.length > 0) {
      return {
        text: `Size en yakın kafeler: ${cafes
          .slice(0, 3)
          .map(s => s.name)
          .join(', ')}. Yol tarifi almak ister misiniz?`,
        store: cafes[0],
      };
    }
  }

  if (lowerInput.includes('yemek') || lowerInput.includes('restoran')) {
    const restaurants = rooms.filter(
      r =>
        r.category?.toLowerCase().includes('food') ||
        r.category?.toLowerCase().includes('yemek')
    );
    if (restaurants.length > 0) {
      return {
        text: `Yemek alanında ${
          restaurants.length
        } restoran var. Popüler olanlar: ${restaurants
          .slice(0, 3)
          .map(s => s.name)
          .join(', ')}.`,
        store: restaurants[0],
      };
    }
  }

  if (lowerInput.includes('popüler') || lowerInput.includes('öneri')) {
    const popularStores = rooms
      .filter(r => r.rating && r.rating >= 4.0)
      .slice(0, 5);
    if (popularStores.length > 0) {
      return {
        text: `En popüler mağazalar: ${popularStores
          .map(s => s.name)
          .join(', ')}. Hangisini keşfetmek istersiniz?`,
        store: popularStores[0],
      };
    }
  }

  // Mağaza ismi araması
  const foundStore = rooms.find(
    r =>
      r.name.toLowerCase().includes(lowerInput) ||
      lowerInput.includes(r.name.toLowerCase())
  );

  if (foundStore) {
    return {
      text: `${foundStore.name} mağazasını buldum! ${
        foundStore.floor !== undefined
          ? `Kat ${foundStore.floor === 0 ? 'Zemin' : foundStore.floor}'de`
          : ''
      } bulunuyor. Yol tarifi almak ister misiniz?`,
      store: foundStore,
    };
  }

  // Genel yanıt
  return {
    text:
      'Size yardımcı olmak isterim! Mağaza ismi, kategori (moda, kafe, yemek) veya "popüler mağazalar" diyerek arama yapabilirsiniz.',
  };
}
