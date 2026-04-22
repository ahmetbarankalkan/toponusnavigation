// hooks/useIOSVoiceRecorder.js
// iOS için optimize edilmiş hızlı ses tanıma
import { useState, useRef, useCallback, useEffect } from 'react';

export const useIOSVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const onTranscriptRef = useRef(null);
  const silenceTimerRef = useRef(null);

  // iOS MediaRecorder desteğini kontrol et
  const checkSupport = useCallback(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const supported = isIOS && hasMediaRecorder;
    return supported;
  }, []);

  // Support durumunu bir kez hesapla
  useEffect(() => {
    setIsSupported(checkSupport());
  }, [checkSupport]);

  // Ses dosyasını API'ye gönder - iOS için optimize edilmiş
  const sendAudioToAPI = useCallback(async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');
      formData.append('device_id', `ios_${Date.now()}`);
      formData.append('language', 'tr-TR'); // Türkçe dil desteği
      formData.append('quality', 'ultra'); // Ultra yüksek kalite
      formData.append('platform', 'ios'); // iOS platformu belirt
      formData.append('model', 'whisper-large'); // En iyi model
      formData.append('enhance', 'true'); // Ses geliştirme aktif

      console.log('📱 iOS: Ses API\'ye gönderiliyor... (Optimize edilmiş)');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 saniye - daha da hızlı

      const response = await fetch('https://www.signolog.com/chat-speechToText/', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'X-Platform': 'iOS',
          'X-Quality': 'high'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API hatası: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.text) {
        console.log('✅ iOS: Ses başarıyla çevrildi:', data.text);
        return data.text;
      } else {
        throw new Error(data.error || 'Ses çevrilemedi');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Ses işleme zaman aşımı - iOS hızlı mod');
      }
      throw error;
    }
  }, []);

  const startRecording = useCallback(async (onTranscript) => {
    if (!checkSupport()) {
      setError('iOS MediaRecorder desteklenmiyor');
      return false;
    }

    try {
      console.log('📱 iOS: Hızlı kayıt başlatılıyor...');
      
      onTranscriptRef.current = onTranscript;
      audioChunksRef.current = [];

      // iOS için basit ve uyumlu ses ayarları
      console.log('📱 iOS: Mikrofon izni isteniyor...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      console.log('📱 iOS: Mikrofon izni alındı, stream hazır');

      streamRef.current = stream;

      // MediaRecorder oluştur - iOS için basit ve uyumlu ayarlar
      let mediaRecorderOptions = {};
      
      // iOS'ta en uyumlu formatı seç
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mediaRecorderOptions.mimeType = 'audio/mp4';
        console.log('📱 iOS: MP4 format kullanılıyor');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mediaRecorderOptions.mimeType = 'audio/webm';
        console.log('📱 iOS: WebM format kullanılıyor');
      } else {
        console.log('📱 iOS: Varsayılan format kullanılıyor');
      }

      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('📱 iOS: Kayıt durdu, işleniyor...');
        setIsRecording(false);
        setIsProcessing(true);

        try {
          // Kullanılan format ile blob oluştur
          const mimeType = mediaRecorderOptions.mimeType || 'audio/webm;codecs=opus';
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mimeType 
          });
          
          console.log('📱 iOS: Ses dosyası hazırlandı, boyut:', audioBlob.size, 'bytes');
          
          // iOS için ses kalitesi kontrolü
          if (audioBlob.size < 1000) {
            console.warn('📱 iOS: Ses dosyası çok küçük, kalite düşük olabilir');
          } else if (audioBlob.size > 500000) {
            console.log('📱 iOS: Yüksek kalite ses dosyası tespit edildi');
          }
          
          const transcribedText = await sendAudioToAPI(audioBlob);
          
          if (onTranscriptRef.current && transcribedText) {
            // iOS'ta sonucu temizle ve optimize et
            let cleanedText = transcribedText.trim()
              .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluğa çevir
              .replace(/[^\w\sğüşıöçĞÜŞİÖÇ.,!?]/g, ''); // Türkçe karakterler + noktalama
            
            // Çok kısa veya anlamsız metinleri filtrele
            if (cleanedText.length < 2) {
              console.log('📱 iOS: Metin çok kısa, göz ardı ediliyor:', cleanedText);
              return;
            }
            
            // Sadece noktalama işaretlerini filtrele
            const onlyPunctuation = /^[.,!?]+$/.test(cleanedText);
            if (onlyPunctuation) {
              console.log('📱 iOS: Sadece noktalama, göz ardı ediliyor:', cleanedText);
              return;
            }
            
            console.log('📱 iOS: Temizlenmiş metin:', cleanedText);
            onTranscriptRef.current(cleanedText);
          }
        } catch (error) {
          console.error('📱 iOS: Ses işleme hatası:', error);
          setError(error.message);
        } finally {
          setIsProcessing(false);
          // Stream'i temizle
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('📱 iOS: MediaRecorder hatası:', event.error);
        setError('Kayıt hatası: ' + event.error);
        setIsRecording(false);
        setIsProcessing(false);
      };

      // Kayıt başlat
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);

      // 15 saniye sonra otomatik durdur (iOS için uzun dinleme)
      silenceTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('📱 iOS: 15 saniye doldu, otomatik durduruluyor');
          mediaRecorderRef.current.stop();
        }
      }, 15000);

      console.log('📱 iOS: Kayıt başladı');
      return true;

    } catch (error) {
      console.error('📱 iOS: Kayıt başlatma hatası:', error);
      setError('Mikrofon erişimi reddedildi: ' + error.message);
      return false;
    }
  }, [checkSupport, sendAudioToAPI]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('📱 iOS: Kayıt manuel olarak durduruluyor');
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
  };
};