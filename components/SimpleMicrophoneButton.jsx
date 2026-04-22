'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSimpleVoice } from '@/hooks/useSimpleVoice';
import { useLanguage } from '@/contexts/LanguageContext';

const SimpleMicrophoneButton = ({ onTranscript, disabled = false }) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const {
    isSupported,
    isRecording,
    isProcessing,
    error,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    platform,
    platformIcon,
  } = useSimpleVoice();

  // Modal kontrolü
  useEffect(() => {
    if (isRecording || isProcessing) {
      setShowModal(true);
    } else if (transcript) {
      // Sonuç gelince kısa süre göster, sonra kapat
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } else {
      setShowModal(false);
    }
  }, [isRecording, isProcessing, transcript]);

  // Canvas Animasyonu
  useEffect(() => {
    if (!showModal || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height =
      canvas.offsetHeight * window.devicePixelRatio);
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerY = height / (2 * window.devicePixelRatio);
      const baseAmplitude = isRecording ? 50 : 15;
      const speed = isRecording ? 0.15 : 0.04;

      const numRows = 12;
      const numCols = 60;
      const stepX = width / window.devicePixelRatio / numCols;

      for (let row = 0; row < numRows; row++) {
        const rowOffset = (row - numRows / 2) * 5;

        for (let i = 0; i < numCols; i++) {
          const x = i * stepX;
          const ratio = i / numCols;

          const envelope = Math.sin(ratio * Math.PI);

          const wave =
            Math.sin(x * 0.02 + time + row * 0.1) * baseAmplitude * envelope +
            Math.sin(x * 0.05 - time * 0.5) * (baseAmplitude * 0.5) * envelope;

          const y = centerY + wave + rowOffset;

          let r, g, b, alpha;

          if (ratio < 0.4) {
            r = 0 + ratio * 50;
            g = 210 - ratio * 50;
            b = 255;
          } else if (ratio < 0.6) {
            r = 150;
            g = 100;
            b = 200;
          } else {
            r = 255;
            g = 165;
            b = 50 - (ratio - 0.6) * 50;
          }

          const rowAlpha = 1 - Math.abs(row - numRows / 2) / (numRows / 1.5);
          alpha = 0.6 * envelope * rowAlpha + 0.1;

          ctx.beginPath();
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      time += speed;
      animationRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      canvas.style.width = canvas.offsetWidth + 'px';
      canvas.style.height = canvas.offsetHeight + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showModal, isRecording]);

  // Transkript gelince parent'a gönder - Sadece transcript değiştiğinde
  useEffect(() => {
    if (transcript && onTranscript) {
      console.log("📤 Transkript parent'a gönderiliyor:", transcript);
      onTranscript(transcript);
    }
  }, [transcript]); // onTranscript dependency'sini kaldırdık

  const handleClick = () => {
    if (disabled || !isSupported) return;

    if (isRecording) {
      stopRecording();
    } else {
      // Yeni kayıt başlatmadan önce önceki transcript'i temizle
      clearTranscript();
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-500/20 cursor-not-allowed"
        title={t('voice.notSupported')}
      >
        <MicOff size={22} className="text-gray-400" />
      </button>
    );
  }

  return (
    <>
      {/* Mikrofon Butonu */}
      <button
        onClick={handleClick}
        disabled={disabled}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg relative"
        style={{
          backgroundColor: disabled
            ? 'rgba(27, 51, 73, 0.3)'
            : isRecording
            ? '#dc2626'
            : '#1B3349',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={e => {
          if (!disabled && !isRecording) {
            e.currentTarget.style.backgroundColor = '#152938';
          }
        }}
        onMouseLeave={e => {
          if (!disabled && !isRecording) {
            e.currentTarget.style.backgroundColor = '#1B3349';
          }
        }}
        title={`${platform} ile ses kaydı`}
      >
        {isProcessing ? (
          <div className="animate-spin">
            <Volume2 size={22} className="text-white" />
          </div>
        ) : isRecording ? (
          <MicOff size={22} className="text-white animate-pulse" />
        ) : (
          <Mic size={22} className="text-white" />
        )}
      </button>

      {/* Tam Ekran Modal - Modern toponus Tasarımı */}
      {showModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#00334E',
          }}
        >
          {/* Atmosferik Arka Plan Işıkları */}
          <div
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#004e92] opacity-20 rounded-full blur-[120px] pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#ff7e5f] opacity-10 rounded-full blur-[120px] pointer-events-none"
            style={{ mixBlendMode: 'screen' }}
          ></div>

          <div className="relative text-center px-8 max-w-md w-full flex flex-col items-center justify-center min-h-screen">
            {/* Üst Bilgi */}
            {!error && (
              <div className="mb-8 animate-fade-in">
                <p className="text-blue-200/60 text-xs tracking-[0.2em] font-semibold uppercase"></p>
              </div>
            )}

            {/* Başlık / Transcript */}
            <div className="text-center space-y-2 mb-10 max-w-xs mx-auto">
              {transcript ? (
                <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">
                  {transcript}
                </h1>
              ) : error ? (
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-red-400 leading-tight">
                    {t('voice.error')}
                  </h1>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">
                    {isRecording
                      ? t('voice.listening')
                      : isProcessing
                      ? t('voice.processing')
                      : t('voice.ready')}
                  </h1>
                  {(isRecording || isProcessing) && (
                    <h1 className="text-3xl font-bold text-white/40 leading-tight">
                      {isRecording
                        ? t('voice.speakNow')
                        : t('voice.processingAudio')}
                    </h1>
                  )}
                </>
              )}
            </div>

            {/* Waveform Canvas */}
            <div className="w-full h-48 flex items-center justify-center my-4">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '192px' }}
              />
            </div>

            {/* Alt Kontroller */}
            <div className="mt-auto mb-16 flex flex-col items-center gap-10">
              {/* Renkli Orb (Küre) */}
              <div
                className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-700 ease-out ${
                  isRecording ? 'scale-125 animate-pulse' : 'scale-100'
                }`}
                style={{
                  background:
                    'linear-gradient(135deg, #4A90E2 0%, #9C6FDE 50%, #FF9A56 100%)',
                  boxShadow: '0 0 40px rgba(255, 165, 0, 0.4)',
                }}
              >
                {/* Küre üzerindeki ışık yansıması */}
                <div className="absolute top-2 right-3 w-4 h-4 bg-white/30 rounded-full blur-[2px]"></div>
              </div>

              {/* Mikrofon Butonu */}
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-full border transition-all duration-500 border-[#00334E]/80 bg-[#00334E]/40 text-white shadow-[0_0_30px_rgba(0,51,78,0.6)]"
                >
                  <MicOff className="w-5 h-5" />
                  <span className="font-semibold">
                    {t('voice.stopRecording')}
                  </span>

                  {/* Dış Halka Animasyonu */}
                  <span className="absolute inset-0 rounded-full border border-[#00334E] opacity-0 animate-ping"></span>
                </button>
              ) : error ? (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setTimeout(() => handleClick(), 100);
                  }}
                  className="group relative flex items-center justify-center gap-2 px-8 py-4 rounded-full border transition-all duration-500 border-blue-400/60 bg-blue-500/20 text-white hover:bg-blue-500/30"
                >
                  <span className="font-semibold">
                    🔄 {t('voice.tryAgain')}
                  </span>
                </button>
              ) : (
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-white/20 text-white">
                  {isProcessing ? (
                    <div className="animate-spin">
                      <Volume2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <Mic className="w-6 h-6 opacity-80" />
                  )}
                </div>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.5s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default SimpleMicrophoneButton;
