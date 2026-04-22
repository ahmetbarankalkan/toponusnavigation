// hooks/useSafariVoice.js
// Safari için özel optimize edilmiş ses tanıma hook'u
import { useState, useRef, useCallback, useEffect } from 'react';

export const useSafariVoice = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Safari tespiti ve destek kontrolü
  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Safari için Web Speech API kontrolü
    const SpeechRecognition = (typeof window !== 'undefined') ? 
      (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    
    // MediaRecorder kontrolü (Safari 14.1+)
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    
    // Safari'de Web Speech API genellikle çalışır ama bazen sorunlu olabilir
    const webSpeechSupported = !!SpeechRecognition;
    const mediaRecorderSupported = hasMediaRecorder;
    
    const supported = (isSafari || isIOS) && (webSpeechSupported || mediaRecorderSupported);
    
    setIsSupported(supported);
    
    if (supported) {
      console.log('🦁 Safari Voice: Destekleniyor', {
        webSpeech: webSpeechSupported,
        mediaRecorder: mediaRecorderSupported,
        isSafari,
        isIOS
      });
    } else {
      console.log('❌ Safari Voice: Desteklenmiyor');
    }
  }, []);

  // Safari için API çağrısı
  const sendAudioToAPI = useCallback(async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');
      formData.append('device_id', `safari_${Date.now()}`);
      formData.append('language', 'tr-TR');
      formData.append('quality', 'ultra');
      formData.append('platform', 'safari');
      formData.append('model', 'whisper-large');
      formData.append('enhance', 'true');

      console.log('🦁 Safari: Ses API\'ye gönderiliyor...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 saniye timeout

      const response = await fetch('https://www.signolog.com/chat-speechToText/', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'X-Platform': 'Safari',
          'X-Quality': 'high'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.text) {
        console.log('✅ Safari: Ses başarıyla çevrildi:', data.text);
        return data.text;
      } else {
        throw new Error(data.error || 'Ses çevrilemedi');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Ses işleme zaman aşımı - Safari');
      }
      throw error;
    }
  }, []);

  // Safari Web Speech API ile kayıt
  const startWebSpeechRecording = useCallback(async (onTranscript) => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Safari için özel ayarlar
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'tr-TR';
      recognition.maxAlternatives = 1;
      
      // Safari'de serviceURI ayarı önemli olabilir
      if (recognition.serviceURI !== undefined) {
        recognition.serviceURI = null;
      }

      onTranscriptRef.current = onTranscript;
      let finalTranscript = '';
      let hasBeenSent = false;

      recognition.onstart = () => {
        console.log('🦁 Safari Web Speech: Kayıt başladı');
        setIsRecording(true);
        setError(null);
        finalTranscript = '';
        hasBeenSent = false;
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('✅ Safari Web Speech: Final sonuç:', transcript);
            
            if (hasBeenSent) return;
            
            // Safari'de final sonuç gelince kısa gecikme ile gönder
            setTimeout(() => {
              if (!hasBeenSent && finalTranscript.trim()) {
                const cleanedText = finalTranscript.trim()
                  .replace(/\s+/g, ' ')
                  .replace(/[^\w\sğüşıöçĞÜŞİÖÇ.,!?]/g, '');
                
                if (cleanedText && onTranscriptRef.current) {
                  console.log('🦁 Safari gecikmiş gönderim:', cleanedText);
                  hasBeenSent = true;
                  onTranscriptRef.current(cleanedText);
                  recognition.stop();
                }
              }
            }, 1500); // Safari için biraz daha uzun bekle
            return;
          } else {
            interimTranscript += transcript;
          }
        }

        // Sessizlik kontrolü
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        if (finalTranscript.trim() || interimTranscript.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            if (hasBeenSent) return;
            
            const fullTranscript = (finalTranscript + interimTranscript).trim();
            if (fullTranscript && onTranscriptRef.current) {
              console.log('🦁 Safari sessizlik timeout gönderim:', fullTranscript);
              hasBeenSent = true;
              onTranscriptRef.current(fullTranscript);
              recognition.stop();
            }
          }, 4000); // Safari için 4 saniye
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Safari Web Speech hatası:', event.error);
        
        if (event.error === 'aborted') {
          setError(null);
        } else if (event.error === 'not-allowed') {
          setError('Safari: Mikrofon izni reddedildi. Lütfen Safari ayarlarından mikrofon iznini verin.');
        } else if (event.error === 'no-speech') {
          setError('Safari: Ses algılanamadı. Lütfen tekrar deneyin.');
        } else if (event.error === 'network') {
          setError('Safari: Ağ hatası. İnternet bağlantınızı kontrol edin.');
        } else {
          setError('Safari ses tanıma hatası: ' + event.error);
        }
        
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognition.onend = () => {
        console.log('⏹️ Safari Web Speech: Kayıt bitti');
        setIsRecording(false);
        setIsProcessing(false);
        
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = recognition;
      
      // Safari için doğrudan başlat (kullanıcı etkileşimi için)
      try {
        recognition.start();
        console.log('🦁 Safari Web Speech: Start komutu gönderildi');
      } catch (startError) {
        console.error('❌ Safari Web Speech start hatası:', startError);
        setError('Safari: Ses kaydı başlatılamadı: ' + startError.message);
        setIsRecording(false);
      }
      
      return true;
    } catch (err) {
      console.error('❌ Safari Web Speech başlatma hatası:', err);
      setError('Safari: ' + err.message);
      return false;
    }
  }, []);

  // Safari MediaRecorder ile kayıt (fallback)
  const startMediaRecorderRecording = useCallback(async (onTranscript) => {
    try {
      console.log('🦁 Safari MediaRecorder: Kayıt başlatılıyor...');
      
      onTranscriptRef.current = onTranscript;
      audioChunksRef.current = [];

      // Safari için optimize edilmiş mikrofon ayarları
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // sampleRate: 48000, // iOS Safari için kaldırıldı
          channelCount: 1,
          // volume: 1.0,
          // latency: 0,
          // Safari için özel ayarlar
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true,
        },
      });
      
      streamRef.current = stream;

      // Safari için MediaRecorder ayarları - format öncelik sırası
      let mediaRecorderOptions = {};
      
      // Safari'de en iyi uyumlu formatları sırayla dene
      const safariFormats = [
        'audio/mp4',
        'audio/mp4;codecs=mp4a.40.2',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/wav',
        'audio/ogg;codecs=opus'
      ];
      
      for (const format of safariFormats) {
        if (MediaRecorder.isTypeSupported(format)) {
          mediaRecorderOptions.mimeType = format;
          console.log('🦁 Safari: Kullanılan format:', format);
          break;
        }
      }
      
      // Eğer hiçbir format desteklenmiyorsa varsayılan kullan
      if (!mediaRecorderOptions.mimeType) {
        console.log('🦁 Safari: Varsayılan format kullanılıyor');
      }

      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🦁 Safari MediaRecorder: Kayıt durdu, işleniyor...');
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const mimeType = mediaRecorderOptions.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          
          console.log('🦁 Safari: Ses dosyası hazırlandı, boyut:', audioBlob.size, 'bytes');
          
          // Safari için ses kalitesi kontrolü
          if (audioBlob.size < 500) {
            console.warn('🦁 Safari: Ses dosyası çok küçük, kayıt başarısız olabilir');
            setError('Safari: Ses kaydı çok kısa. Lütfen daha uzun konuşun.');
            return;
          } else if (audioBlob.size > 1000000) {
            console.log('🦁 Safari: Yüksek kalite ses dosyası (>1MB)');
          }
          
          const transcribedText = await sendAudioToAPI(audioBlob);
          
          if (onTranscriptRef.current && transcribedText) {
            const cleanedText = transcribedText.trim()
              .replace(/\s+/g, ' ')
              .replace(/[^\w\sğüşıöçĞÜŞİÖÇ.,!?]/g, '');
            
            if (cleanedText.length >= 2) {
              console.log('🦁 Safari MediaRecorder: Temizlenmiş metin:', cleanedText);
              onTranscriptRef.current(cleanedText);
            }
          }
        } catch (error) {
          console.error('🦁 Safari MediaRecorder: Ses işleme hatası:', error);
          setError('Safari: ' + error.message);
        } finally {
          setIsProcessing(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('🦁 Safari MediaRecorder hatası:', event.error);
        setError('Safari MediaRecorder hatası: ' + event.error);
        setIsRecording(false);
        setIsProcessing(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // 12 saniye sonra otomatik durdur
      silenceTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('🦁 Safari MediaRecorder: 12 saniye doldu, otomatik durduruluyor');
          mediaRecorderRef.current.stop();
        }
      }, 12000);

      console.log('🦁 Safari MediaRecorder: Kayıt başladı');
      return true;

    } catch (error) {
      console.error('🦁 Safari MediaRecorder: Kayıt başlatma hatası:', error);
      setError('Safari: Mikrofon erişimi reddedildi: ' + error.message);
      return false;
    }
  }, [sendAudioToAPI]);

  // Ana kayıt başlatma fonksiyonu
  const startRecording = useCallback(async (onTranscript) => {
    if (!isSupported) {
      setError('Safari\'de ses tanıma desteklenmiyor');
      return false;
    }

    // Doğrudan Web Speech API'yi dene (kullanıcı etkileşimi kaybolmasın diye)
    // İzin kontrolü API tarafından yapılacak
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('🦁 Safari: Web Speech API kullanılıyor');
      return await startWebSpeechRecording(onTranscript);
    } else if (typeof MediaRecorder !== 'undefined') {
      console.log('🦁 Safari: MediaRecorder fallback kullanılıyor');
      return await startMediaRecorderRecording(onTranscript);
    } else {
      setError('Safari: Hiçbir ses tanıma yöntemi desteklenmiyor');
      return false;
    }
  }, [isSupported, startWebSpeechRecording, startMediaRecorderRecording]);

  const stopRecording = useCallback(() => {
    console.log('🦁 Safari: Kayıt durdurma isteği');
    
    if (recognitionRef.current) {
      setIsProcessing(true);
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
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
    startRecording,
    stopRecording,
    platform: 'Safari',
    platformIcon: '🦁'
  };
};