// hooks/useWebSpeechRecognition.js
// Tarayıcı tabanlı hızlı ses tanıma (Chrome, Edge, Safari)
import { useState, useRef, useCallback, useEffect } from 'react';

export const useWebSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    // Web Speech API desteğini kontrol et - Safe approach
    const SpeechRecognition = (typeof window !== 'undefined') ? 
      (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    
    // Platform kontrolü
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Safari için özel kontrol - Safari'de Web Speech API bazen sorunlu olabilir
    // Bu yüzden Safari için ayrı hook kullanmayı tercih ediyoruz
    const shouldUseWebSpeech = !!SpeechRecognition && !isSafari;
    
    setIsSupported(shouldUseWebSpeech);
    
    if (shouldUseWebSpeech) {
      console.log('✅ Web Speech API destekleniyor (Safari hariç)');
    } else if (isSafari) {
      console.log('🦁 Safari tespit edildi - özel Safari hook kullanılacak');
    } else {
      console.log('❌ Web Speech API desteklenmiyor');
    }
  }, []);

  const startRecording = useCallback(async (onTranscript) => {
    if (!isSupported) {
      setError('Tarayıcınız ses tanımayı desteklemiyor');
      return false;
    }

    // Mikrofon izni kontrolü
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Mikrofon izni mevcut');
    } catch (permError) {
      console.error('❌ Mikrofon izni hatası:', permError);
      setError('Mikrofon izni gerekli. Lütfen tarayıcı ayarlarından mikrofon iznini verin.');
      return false;
    }

    // Mevcut kayıt varsa önce durdur
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current = null;
        console.log('🔄 Önceki recognition temizlendi');
      } catch (e) {
        console.log('Önceki recognition zaten temizdi');
      }
      // Kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      const SpeechRecognition = (typeof window !== 'undefined') ? 
        (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
      
      if (!SpeechRecognition) {
        setError('Web Speech API bu tarayıcıda desteklenmiyor');
        return false;
      }
      
      const recognition = new SpeechRecognition();
      
      // Platform kontrolü
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      // Platform özel ayarlar
      if (isAndroid) {
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'tr-TR';
        recognition.maxAlternatives = 1;
      } else if (isIOS) {
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'tr-TR';
        recognition.maxAlternatives = 3;
        recognition.serviceURI = null;
      } else {
        // Desktop için stabil ayarlar
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'tr-TR';
        recognition.maxAlternatives = 1;
      }

      onTranscriptRef.current = onTranscript;
      let finalTranscript = '';
      let lastSpeechTime = Date.now();
      let hasBeenSent = false; // Çoklu gönderim önleyici

      recognition.onstart = () => {
        console.log('🎤 Web Speech: Kayıt başladı');
        setIsRecording(true);
        setError(null);
        setTranscript('');
        finalTranscript = '';
        lastSpeechTime = Date.now();
        hasBeenSent = false; // Reset flag
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        const isAndroid = /Android/.test(navigator.userAgent);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += result;
            console.log('✅ Web Speech: Final sonuç:', result);
            
            // Çoklu gönderim kontrolü
            if (hasBeenSent) {
              console.log('⚠️ Zaten gönderildi, tekrar gönderim engellendi');
              return;
            }
            
            // Android'de final sonuç gelince kısa gecikme ile gönder (devam edebilsin)
            if (isAndroid && finalTranscript.trim() && onTranscriptRef.current) {
              setTimeout(() => {
                if (!hasBeenSent && finalTranscript.trim()) {
                  console.log('🤖 Android gecikmiş gönderim:', finalTranscript.trim());
                  hasBeenSent = true;
                  onTranscriptRef.current(finalTranscript.trim());
                  recognition.stop();
                }
              }, 1000); // 1 saniye bekle
              return;
            }
            
            // iOS'ta final sonuç gelince kısa gecikme ile gönder (devam edebilsin)
            if (isIOS && finalTranscript.trim() && onTranscriptRef.current) {
              const cleanedText = finalTranscript.trim()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\sğüşıöçĞÜŞİÖÇ.,!?]/g, '');
              
              setTimeout(() => {
                if (!hasBeenSent && cleanedText) {
                  console.log('📱 iOS gecikmiş gönderim:', cleanedText);
                  hasBeenSent = true;
                  onTranscriptRef.current(cleanedText);
                  recognition.stop();
                }
              }, 1000); // 1 saniye bekle
              return;
            }
          } else {
            interimTranscript += result;
            lastSpeechTime = Date.now();
          }
        }

        // Canlı transkripti güncelle
        const currentTranscript = (finalTranscript + interimTranscript).trim();
        if (currentTranscript) {
          setTranscript(currentTranscript);
        }

        // Tüm platformlar için sessizlik kontrolü - uzun dinleme
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        if (finalTranscript.trim() || interimTranscript.trim()) {
          // Daha uzun sessizlik bekleme süresi (Kullanıcı durdurana kadar kırmızı kalsın)
          const timeoutDuration = isAndroid ? 6000 : isIOS ? 6000 : 8000;
          
          silenceTimerRef.current = setTimeout(() => {
            if (hasBeenSent) return;
            
            const fullTranscript = (finalTranscript + interimTranscript).trim();
            if (fullTranscript && onTranscriptRef.current) {
              console.log('Sessizlik nedeniyle gönderiliyor:', fullTranscript);
              hasBeenSent = true;
              onTranscriptRef.current(fullTranscript);
              recognition.stop();
            }
          }, timeoutDuration);
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Web Speech hatası:', event.error);
        
        // Aborted hatası normal bir durum (kullanıcı durdurdu)
        if (event.error === 'aborted') {
          console.log('🔄 Web Speech: Kullanıcı tarafından durduruldu');
          setError(null);
        } else if (event.error === 'not-allowed') {
          setError('Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından mikrofon iznini verin.');
        } else if (event.error === 'no-speech') {
          setError('Ses algılanamadı. Lütfen tekrar deneyin.');
        } else if (event.error === 'network') {
          setError('Ağ hatası. İnternet bağlantınızı kontrol edin.');
        } else {
          setError('Ses tanıma hatası: ' + event.error);
        }
        
        setIsRecording(false);
        setIsProcessing(false);
        
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognition.onend = () => {
        console.log('⏹️ Web Speech: Kayıt bitti');
        setIsRecording(false);
        setIsProcessing(false);
        
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = recognition;
      
      // Kullanıcı etkileşimi kontrolü
      if (!document.hasFocus()) {
        console.warn('⚠️ Sayfa odakta değil, ses kaydı başlatılamayabilir');
      }
      
      // Kısa gecikme ile başlat (tarayıcı optimizasyonu)
      setTimeout(() => {
        try {
          recognition.start();
          console.log('🎤 Web Speech: Start komutu gönderildi');
        } catch (startError) {
          console.error('❌ Web Speech start hatası:', startError);
          setError('Ses kaydı başlatılamadı: ' + startError.message);
          setIsRecording(false);
        }
      }, 100);
      
      return true;
    } catch (err) {
      console.error('❌ Web Speech başlatma hatası:', err);
      setError(err.message);
      return false;
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      console.log('⏹️ Web Speech: Durdurma isteği');
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  return {
    isSupported,
    isRecording,
    isProcessing,
    error,
    transcript,
    startRecording,
    stopRecording,
  };
};
