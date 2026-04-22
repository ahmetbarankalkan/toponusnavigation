'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { usePlatformVoice } from '@/hooks/usePlatformVoice';

const VoiceMicrophoneButton = ({ onTranscript, disabled = false }) => {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('idle'); // idle, listening, processing

  const {
    platform,
    platformIcon,
    systemType,
    isRecording,
    isProcessing,
    error,
    handleVoiceButtonClick,
    cleanup,
  } = usePlatformVoice();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Animation phase kontrolü
  useEffect(() => {
    if (isRecording) {
      setAnimationPhase('listening');
    } else if (isProcessing) {
      setAnimationPhase('processing');
    } else {
      setAnimationPhase('idle');
    }
  }, [isRecording, isProcessing]);

  // Full screen modal kontrolü
  useEffect(() => {
    if (isRecording || isProcessing) {
      setShowFullScreen(true);
    } else {
      // Kayıt bitince kısa bir gecikme ile kapat
      const timer = setTimeout(() => {
        setShowFullScreen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, isProcessing]);

  const handleMicClick = async event => {
    if (disabled) return;

    // Kullanıcı etkileşimini garanti altına al
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      console.log('🎤 Mikrofon butonu tıklandı - kullanıcı etkileşimi mevcut');

      await handleVoiceButtonClick(transcript => {
        console.log('🎤 Transkript alındı:', transcript);
        if (onTranscript && transcript) {
          onTranscript(transcript);
        }
      });
    } catch (error) {
      console.error('🎤 Mikrofon hatası:', error);
    }
  };

  const getStatusText = () => {
    if (error) return `❌ Hata: ${error}`;
    if (isProcessing) return '🔄 İşleniyor...';
    if (isRecording) return '🎤 Sizi dinliyorum...';
    return `${platformIcon} ${platform} Hazır`;
  };

  const getStatusColor = () => {
    if (error) return 'text-red-400';
    if (isProcessing) return 'text-yellow-400';
    if (isRecording) return 'text-green-400';
    return 'text-white/80';
  };

  return (
    <>
      {/* Mikrofon Butonu */}
      <button
        onClick={handleMicClick}
        disabled={disabled || isProcessing}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg relative ${
          disabled || isProcessing
            ? 'bg-white/10 cursor-not-allowed'
            : isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
        title={`${platform} ile ses kaydı`}
      >
        {isProcessing ? (
          <div className="animate-spin">
            <Volume2 size={22} className="text-white" />
          </div>
        ) : isRecording ? (
          <MicOff size={22} className="text-white" />
        ) : (
          <Mic size={22} className="text-white" />
        )}

        {/* Platform göstergesi */}
        <div className="absolute -top-1 -right-1 text-xs">{platformIcon}</div>
      </button>

      {/* Full Screen Voice Modal */}
      {showFullScreen && (
        <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center px-8">
            {/* Ana İkon */}
            <div className="relative mb-8">
              {/* Dış Halka - Animasyonlu */}
              <div
                className={`w-48 h-48 rounded-full border-4 mx-auto flex items-center justify-center relative ${
                  animationPhase === 'listening'
                    ? 'border-green-400 animate-pulse bg-green-400/10'
                    : animationPhase === 'processing'
                    ? 'border-yellow-400 animate-spin bg-yellow-400/10'
                    : 'border-white/30 bg-white/5'
                }`}
              >
                {/* İç Halka */}
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center ${
                    animationPhase === 'listening'
                      ? 'bg-green-500'
                      : animationPhase === 'processing'
                      ? 'bg-yellow-500'
                      : 'bg-white/20'
                  }`}
                >
                  {/* İkon */}
                  {animationPhase === 'processing' ? (
                    <div className="animate-spin">
                      <Volume2 size={48} className="text-white" />
                    </div>
                  ) : animationPhase === 'listening' ? (
                    <div className="animate-pulse">
                      <Mic size={48} className="text-white" />
                    </div>
                  ) : (
                    <Mic size={48} className="text-white" />
                  )}
                </div>

                {/* Ses Dalgaları - Sadece dinleme sırasında */}
                {animationPhase === 'listening' && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping"></div>
                    <div
                      className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping"
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-ping"
                      style={{ animationDelay: '1s' }}
                    ></div>
                  </>
                )}
              </div>

              {/* Platform Badge */}
              <div className="absolute -top-2 -right-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white">
                {platformIcon} {platform}
              </div>
            </div>

            {/* Durum Metni */}
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
                {animationPhase === 'listening'
                  ? 'Sizi Dinliyorum...'
                  : animationPhase === 'processing'
                  ? 'İşleniyor...'
                  : 'Hazır'}
              </h2>
              <p className="text-white/60 text-sm">{getStatusText()}</p>
            </div>

            {/* Sistem Bilgisi */}
            <div className="text-xs text-white/40 mb-6">
              Sistem: {systemType.toUpperCase()} • Türkçe Dil Desteği
            </div>

            {/* İptal Butonu - Sadece kayıt sırasında */}
            {isRecording && (
              <button
                onClick={handleMicClick}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-6 py-3 rounded-full transition-all backdrop-blur-sm"
              >
                <MicOff size={18} className="inline mr-2" />
                Kaydı Durdur
              </button>
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* İpuçları */}
            {!isRecording && !isProcessing && !error && (
              <div className="mt-6 text-xs text-white/50 max-w-md mx-auto">
                💡 İpucu: Konuşmaya başladığınızda otomatik olarak algılanır ve
                bittiğinde işlenir
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceMicrophoneButton;
