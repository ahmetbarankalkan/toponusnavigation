// hooks/useSimpleVoice.js
// Basit ve çalışan ses tanıma hook'u
import { useState, useRef, useCallback } from 'react';

export const useSimpleVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Platform tespiti
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const startRecording = useCallback((onResult) => {
    if (!isSupported) {
      setError('Tarayıcınız ses tanımayı desteklemiyor');
      return false;
    }

    // Önceki kayıt varsa temizle
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Önceki kayıt temizlendi');
      }
      recognitionRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Platform özel ayarlar
      if (isSafari) {
        // Safari için özel ayarlar
        recognition.continuous = true; // Safari'de continuous daha iyi çalışır
        recognition.interimResults = true; // Safari'de interim results gerekli
        recognition.lang = 'tr-TR';
        recognition.maxAlternatives = 1;
        // Safari'de serviceURI ayarı
        if (recognition.serviceURI !== undefined) {
          recognition.serviceURI = null;
        }
      } else {
        // Diğer tarayıcılar için basit ayarlar
        recognition.continuous = false; // Tek seferde dinle
        recognition.interimResults = false; // Sadece final sonuç
        recognition.lang = 'tr-TR';
        recognition.maxAlternatives = 1;
      }

      let hasResult = false;

      recognition.onstart = () => {
        console.log('🎤 Kayıt başladı');
        setIsRecording(true);
        setError(null);
        setTranscript('');
        hasResult = false;

        // 10 saniye timeout
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && !hasResult) {
            console.log('⏰ Timeout - kayıt durduruluyor');
            recognition.stop();
          }
        }, 10000);
      };

      recognition.onresult = (event) => {
        if (isSafari) {
          // Safari için özel result handling
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              console.log('✅ Safari Final sonuç:', transcript);
              
              if (finalTranscript.trim() && !hasResult) {
                hasResult = true;
                const cleanedText = finalTranscript.trim()
                  .replace(/\s+/g, ' ')
                  .replace(/[^\w\sğüşıöçĞÜŞİÖÇ.,!?]/g, '');
                
                setTranscript(cleanedText);
                if (onResult && cleanedText) {
                  onResult(cleanedText);
                }
                recognition.stop();
              }
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Safari'de sessizlik timeout'u
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          if (finalTranscript.trim() || interimTranscript.trim()) {
            timeoutRef.current = setTimeout(() => {
              if (!hasResult) {
                const fullTranscript = (finalTranscript + interimTranscript).trim();
                if (fullTranscript) {
                  console.log('🦁 Safari timeout sonuç:', fullTranscript);
                  hasResult = true;
                  setTranscript(fullTranscript);
                  if (onResult) {
                    onResult(fullTranscript);
                  }
                  recognition.stop();
                }
              }
            }, 3000); // Safari için 3 saniye
          }
        } else {
          // Diğer tarayıcılar için basit handling
          if (event.results.length > 0) {
            const result = event.results[0][0].transcript.trim();
            console.log('✅ Sonuç alındı:', result);
            
            if (result && result.length > 0) {
              hasResult = true;
              setTranscript(result);
              
              if (onResult) {
                onResult(result);
              }
            }
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Ses hatası:', event.error);
        
        if (event.error === 'no-speech') {
          setError('Ses algılanamadı. Lütfen tekrar deneyin.');
        } else if (event.error === 'not-allowed') {
          setError('Mikrofon izni gerekli.');
        } else if (event.error !== 'aborted') {
          setError('Ses tanıma hatası: ' + event.error);
        }
        
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        console.log('⏹️ Kayıt bitti');
        setIsRecording(false);
        setIsProcessing(false);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      
      return true;
    } catch (err) {
      console.error('❌ Başlatma hatası:', err);
      setError('Ses kaydı başlatılamadı');
      setIsRecording(false);
      return false;
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      console.log('🛑 Kayıt manuel olarak durduruluyor');
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isRecording,
    isProcessing,
    error,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    platform: isSafari ? 'Safari' : isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop',
    platformIcon: isSafari ? '🦁' : isIOS ? '📱' : isAndroid ? '🤖' : '🖥️'
  };
};