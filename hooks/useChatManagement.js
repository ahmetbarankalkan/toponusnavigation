/**
 * Chat Yönetimi Hook'u
 * ChatGPT entegrasyonu ve mesaj yönetimi için hook
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useChatApi } from "./useChatApi";
import { systemPrompts } from "@/utils/translations";

/**
 * Chat yönetimi hook'u
 * @param {Object} config - Konfigürasyon objesi
 * @param {Array} config.functions - OpenAI function'ları
 * @param {Function} config.onFunctionCall - Function call handler'ı
 * @param {string} config.initialMessage - İlk sistem mesajı
 * @param {string} config.language - Dil kodu (tr, en)
 * @param {Function} config.t - Translation function
 * @returns {Object} Chat state'leri ve fonksiyonları
 */
export function useChatManagement({ functions, onFunctionCall, initialMessage, language = 'tr', t }) {
  // Chat API hook'u
  const { sendMessage: sendChatMessage, isLoading: isChatLoading } = useChatApi();
  
  // Chat state'leri
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // Sohbet geçmişini localStorage'dan yükle
  useEffect(() => {
    const savedHistory = localStorage.getItem('assistant_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatMessages(parsed);
        console.log('💾 Sohbet geçmişi yüklendi:', parsed.length, 'mesaj');
        return; // Eğer geçmiş varsa, initial message ekleme
      } catch (e) {
        console.error('Sohbet geçmişi yüklenemedi:', e);
      }
    }
  }, []);

  // İlk sistem mesajını ayarla ve dil değiştiğinde güncelle
  useEffect(() => {
    const systemPrompt = {
      role: "system",
      content: systemPrompts[language] || systemPrompts.tr
    };

    // Eğer localStorage'da mesaj yoksa, yeni başlat
    const savedHistory = localStorage.getItem('assistant_chat_history');
    if (!savedHistory || chatMessages.length === 0) {
      if (initialMessage) {
        setChatMessages([systemPrompt, { role: "assistant", content: initialMessage }]);
      } else {
        setChatMessages([systemPrompt]);
      }
    } else {
      // Eğer mesajlar varsa, sadece system prompt'u güncelle
      setChatMessages(prev => {
        if (prev.length === 0) {
          return initialMessage 
            ? [systemPrompt, { role: "assistant", content: initialMessage }]
            : [systemPrompt];
        }
        // İlk mesaj system prompt ise güncelle
        if (prev[0]?.role === 'system') {
          return [systemPrompt, ...prev.slice(1)];
        }
        // System prompt yoksa başa ekle
        return [systemPrompt, ...prev];
      });
    }
  }, [initialMessage, language]);

  // onFunctionCall ref'i - dinamik olarak güncellenebilir
  const onFunctionCallRef = useRef(onFunctionCall);
  
  useEffect(() => {
    onFunctionCallRef.current = onFunctionCall;
  }, [onFunctionCall]);

  // Mesaj gönderme fonksiyonu
  const sendMessage = useCallback(
    async (messageText = null) => {
      const message = messageText || input.trim();
      if (!message) return;

      // Kullanıcı tanıma kontrolü - "ben [isim]" formatı
      const lowerMessage = message.toLowerCase().trim();
      const benMatch = lowerMessage.match(/^ben\s+(.+)$/i);
      
      if (benMatch) {
        const saidName = benMatch[1].trim();
        
        try {
          const assistantData = JSON.parse(localStorage.getItem('assistant_credentials') || '{}');
          
          if (assistantData.username && saidName.toLowerCase() === assistantData.username.toLowerCase()) {
            // Kullanıcı adı eşleşti! Güvenlik sorusu sor
            const newMessages = [...chatMessages, { role: "user", content: message }];
            
            const funnyResponses = [
              `Ooo ${assistantData.username}! 🎉 Seni tanıdım gibi ama emin olmam lazım... Hadi bakalım, ${assistantData.securityQuestion.toLowerCase()} 🤔`,
              `Hmm ${assistantData.username} ha? 🧐 Gerçekten sen misin yoksa ikizin mi? Kanıtla bakalım: ${assistantData.securityQuestion.toLowerCase()} 😄`,
              `${assistantData.username}! 👋 Uzun zamandır görüşmedik... ya da görüştük mü? Şunu bi' cevaplayıver: ${assistantData.securityQuestion.toLowerCase()} 🎭`,
              `Selam ${assistantData.username}! 🌟 Seni tanıyorum ama hafızam biraz karışık bugün. Şu soruya cevap ver de emin olayım: ${assistantData.securityQuestion.toLowerCase()} 🤓`,
            ];
            
            const randomResponse = funnyResponses[Math.floor(Math.random() * funnyResponses.length)];
            
            setChatMessages([...newMessages, { role: "assistant", content: randomResponse }]);
            setInput("");
            localStorage.setItem('assistant_chat_history', JSON.stringify([...newMessages, { role: "assistant", content: randomResponse }]));
            localStorage.setItem('assistant_pending_verification', assistantData.username);
            return;
          }
        } catch (err) {
          console.error('Assistant verification error:', err);
        }
      }

      // Güvenlik cevabı kontrolü
      const pendingUser = localStorage.getItem('assistant_pending_verification');
      if (pendingUser) {
        try {
          const assistantData = JSON.parse(localStorage.getItem('assistant_credentials') || '{}');
          
          if (lowerMessage === assistantData.securityAnswer.toLowerCase()) {
            // Doğru cevap!
            const newMessages = [...chatMessages, { role: "user", content: message }];
            
            const successResponses = [
              `Tamam tamam, gerçekten ${pendingUser} olduğuna ikna oldum! 🎊 Hoş geldin! Sana nasıl yardımcı olabilirim?`,
              `Bingo! 🎯 ${pendingUser}, seni tanıdım! Artık sohbet edebiliriz. Ne yapmak istersin?`,
              `Evet! Doğru cevap! 🏆 Merhaba ${pendingUser}, seninle konuşmak güzel. Bugün ne arıyorsun?`,
              `Harika! 🌈 ${pendingUser} olduğun doğrulandı. Şimdi sana nasıl yardımcı olabilirim?`,
            ];
            
            const randomSuccess = successResponses[Math.floor(Math.random() * successResponses.length)];
            
            setChatMessages([...newMessages, { role: "assistant", content: randomSuccess }]);
            setInput("");
            localStorage.setItem('assistant_chat_history', JSON.stringify([...newMessages, { role: "assistant", content: randomSuccess }]));
            localStorage.removeItem('assistant_pending_verification');
            localStorage.setItem('assistant_verified_user', pendingUser);
            return;
          } else {
            // Yanlış cevap
            const newMessages = [...chatMessages, { role: "user", content: message }];
            
            const failResponses = [
              `Hmm, bu cevap doğru değil gibi... 🤔 Tekrar dener misin? Ya da belki ${pendingUser} değilsindir? 😅`,
              `Oops! Bu cevabı beklemiyordum. 😬 Bir daha dene, belki yanlış hatırladın?`,
              `Yanlış cevap! 🙈 Ama sorun değil, tekrar deneyebilirsin. ${pendingUser} gerçekten sen misin?`,
            ];
            
            const randomFail = failResponses[Math.floor(Math.random() * failResponses.length)];
            
            setChatMessages([...newMessages, { role: "assistant", content: randomFail }]);
            setInput("");
            localStorage.setItem('assistant_chat_history', JSON.stringify([...newMessages, { role: "assistant", content: randomFail }]));
            return;
          }
        } catch (err) {
          console.error('Security answer check error:', err);
          localStorage.removeItem('assistant_pending_verification');
        }
      }

      // Mesajı chat'e ekle
      const newMessages = [...chatMessages, { role: "user", content: message }];
      setChatMessages(newMessages);
      setInput("");
      
      // localStorage'a kaydet
      localStorage.setItem('assistant_chat_history', JSON.stringify(newMessages));

      try {
        // Assistant typing'i başlat
        setIsAssistantTyping(true);

        // Chat API hook'u ile gönder
        console.log('📤 API\'ye gönderilen functions:', functions);
        console.log('📤 API\'ye gönderilen messages:', newMessages);
        const data = await sendChatMessage(newMessages, functions);
        const reply = data.choices[0].message;

        // Yanıtı chat'e ekle
        setChatMessages((prev) => {
          const updated = [...prev, reply];
          // localStorage'a kaydet
          localStorage.setItem('assistant_chat_history', JSON.stringify(updated));
          return updated;
        });

        // Function call kontrolü
        const functionCall = reply?.function_call;
        console.log('🔍 GPT Yanıtı:', reply);
        console.log('🔍 Function Call:', functionCall);
        console.log('🔍 onFunctionCallRef.current:', onFunctionCallRef.current);
        
        if (functionCall && onFunctionCallRef.current) {
          console.log(`✅ Fonksiyon çağrısı: ${functionCall.name}`, functionCall.arguments);
          await onFunctionCallRef.current(functionCall);
        } else if (functionCall && !onFunctionCallRef.current) {
          console.error('❌ Function call var ama handler yok!');
        } else if (!functionCall) {
          console.log('ℹ️ GPT function call yapmadı, sadece metin yanıt verdi');
        }
      } catch (error) {
        console.error("Chat API hatası:", error);
        
        // Hata türüne göre mesaj belirle
        let errorMessage = t ? t('errors.sendMessageError') : "Mesaj gönderilirken hata oluştu. Tekrar dener misiniz?";
        
        if (error.message.includes('502') || error.message.includes('503') || error.message.includes('504')) {
          errorMessage = "🔄 Sunucu geçici olarak erişilemez. Lütfen birkaç saniye sonra tekrar deneyin.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "⏱️ İstek zaman aşımına uğradı. Lütfen tekrar deneyin.";
        } else if (error.message.includes('fetch')) {
          errorMessage = "🌐 Ağ bağlantısı sorunu. İnternet bağlantınızı kontrol edin.";
        }
        
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: errorMessage },
        ]);
      } finally {
        setIsAssistantTyping(false);
      }
    },
    [chatMessages, input, functions, sendChatMessage]
  );

  // Mesaj ekleme fonksiyonu (ses işleme için)
  const addMessage = useCallback((role, content) => {
    setChatMessages((prev) => {
      const newMessages = [...prev, { role, content }];
      // localStorage'a kaydet
      localStorage.setItem('assistant_chat_history', JSON.stringify(newMessages));
      return newMessages;
    });
  }, []);

  // Chat'i temizleme fonksiyonu
  const clearChat = useCallback(() => {
    setChatMessages([]);
    localStorage.removeItem('assistant_chat_history');
    console.log('🗑️ Sohbet geçmişi temizlendi');
  }, []);

  // Mesajları güncelleme fonksiyonu
  const updateMessages = useCallback((newMessages) => {
    setChatMessages(newMessages);
  }, []);

  // onFunctionCall'u dinamik olarak set etme fonksiyonu
  const setOnFunctionCall = useCallback((newHandler) => {
    onFunctionCallRef.current = newHandler;
  }, []);

  return {
    // State'ler
    chatMessages,
    input,
    setInput,
    isAssistantTyping,

    // Fonksiyonlar
    sendMessage,
    addMessage,
    clearChat,
    updateMessages,
    setChatMessages,
    setOnFunctionCall,
  };
}
