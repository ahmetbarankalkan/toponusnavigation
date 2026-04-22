// types/global.d.ts
// Global window extensions for voice recognition libraries

declare global {
  interface Window {
    // ONNX Runtime
    ort?: {
      env?: {
        wasm?: {
          wasmPaths?: string;
        };
      };
      InferenceSession?: any;
      Tensor?: any;
    };
    
    // VAD (Voice Activity Detection)
    vad?: {
      MicVAD?: {
        new: (options: any) => Promise<any>;
      };
    };
    
    // Web Speech API
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export {};