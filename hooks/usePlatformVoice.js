// hooks/usePlatformVoice.js
// Platform bazlı ses tanıma hook'u
import { useMemo } from 'react';
import { useWebSpeechRecognition } from './useWebSpeechRecognition';
import { useIOSVoiceRecorder } from './useIOSVoiceRecorder';
import { useVoiceRecorder } from './useVoiceRecorder';
import { useSafariVoice } from './useSafariVoice';

export const usePlatformVoice = () => {
  // Platform tespiti
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);
  const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isDesktop = !isIOS && !isAndroid;

  // Tüm hook'ları başlat
  const webSpeech = useWebSpeechRecognition();
  const iosVoice = useIOSVoiceRecorder();
  const vadVoice = useVoiceRecorder();
  const safariVoice = useSafariVoice();

  // Platform bazlı sistem seçimi
  const voiceSystem = useMemo(() => {
    // Safari öncelikli kontrol (iOS Safari dahil)
    if (isSafari && safariVoice.isSupported) {
      return {
        type: 'safari',
        platform: 'Safari',
        hook: safariVoice,
        icon: '🦁'
      };
    } else if (isIOS && iosVoice.isSupported) {
      return {
        type: 'ios',
        platform: 'iOS',
        hook: iosVoice,
        icon: '📱'
      };
    } else if (isAndroid && webSpeech.isSupported) {
      return {
        type: 'webspeech',
        platform: 'Android',
        hook: webSpeech,
        icon: '🤖'
      };
    } else if (isDesktop && webSpeech.isSupported) {
      return {
        type: 'webspeech',
        platform: 'Desktop',
        hook: webSpeech,
        icon: '🖥️'
      };
    } else {
      return {
        type: 'vad',
        platform: 'Fallback',
        hook: vadVoice,
        icon: '🔄'
      };
    }
  }, [isIOS, isAndroid, isSafari, isDesktop, webSpeech.isSupported, iosVoice.isSupported, safariVoice.isSupported]);

  // Platform özel işleyiciler
  const handleVoiceButtonClick = async (onTranscript) => {
    const { type, hook, platform, icon } = voiceSystem;
    
    if (hook.isRecording) {
      console.log(`${icon} ${platform}: Kayıt durduruluyor...`);
      
      if (type === 'safari') {
        hook.stopRecording();
      } else if (type === 'webspeech') {
        hook.stopRecording();
      } else if (type === 'ios') {
        hook.stopRecording();
      } else if (type === 'vad') {
        await hook.stopVoiceRecording();
      }
      return;
    }

    console.log(`${icon} ${platform}: Uzun dinleme kayıt başlatılıyor...`);

    if (type === 'safari') {
      // Safari özel ses tanıma
      console.log(`${icon} ${platform}: Safari ses tanıma başlatılıyor...`);
      
      // Doğrudan başlat (kullanıcı etkileşimi kaybolmasın diye)
      hook.startRecording(onTranscript).then(success => {
        if (!success) {
          console.error(`${icon} ${platform}: Safari ses tanıma başlatılamadı`);
        }
      });
    } else if (type === 'webspeech') {
      // Web Speech API (Android/Desktop)
      console.log(`${icon} ${platform}: Web Speech başlatılıyor...`);
      
      // Doğrudan başlat
      const success = hook.startRecording(onTranscript);
      if (!success) {
        console.error(`${icon} ${platform}: Web Speech başlatılamadı`);
      }
    } else if (type === 'ios') {
      // iOS MediaRecorder
      const success = await hook.startRecording(onTranscript);
      if (!success) {
        console.error(`${icon} ${platform}: iOS MediaRecorder başlatılamadı`);
      }
    } else if (type === 'vad') {
      // VAD Fallback
      if (!hook.vadInitialized) {
        console.log(`${icon} ${platform}: VAD başlatılıyor...`);
        
        // Mikrofon stream'i al
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        
        const success = await hook.initializeVAD(stream);
        if (!success) {
          console.error(`${icon} ${platform}: VAD başlatılamadı`);
          return;
        }
      }
      
      const success = await hook.startVoiceRecording(onTranscript);
      if (!success) {
        console.error(`${icon} ${platform}: VAD kayıt başlatılamadı`);
      }
    }
  };

  return {
    // Platform bilgisi
    platform: voiceSystem.platform,
    platformIcon: voiceSystem.icon,
    systemType: voiceSystem.type,
    
    // Durum bilgileri
    isRecording: voiceSystem.hook.isRecording || false,
    isProcessing: voiceSystem.hook.isProcessing || false,
    error: voiceSystem.hook.error || null,
    transcript: voiceSystem.hook.transcript || '',
    
    // İşleyiciler
    handleVoiceButtonClick,
    
    // Cleanup (sadece VAD için gerekli)
    cleanup: voiceSystem.type === 'vad' && voiceSystem.hook.destroyVAD ? voiceSystem.hook.destroyVAD : () => {},
  };
};