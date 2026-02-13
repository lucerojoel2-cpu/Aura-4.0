
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';

const LiveInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'LISTENING' | 'SPEAKING'>('IDLE');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  // Audio helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      // In a real environment, session might not have a close() method exposed via type, 
      // but the API guide suggests it.
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('IDLE');
  }, []);

  const startSession = async () => {
    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            setIsActive(true);
            setIsConnecting(false);
            setStatus('LISTENING');

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('SPEAKING');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('LISTENING');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            stopSession();
          },
          onclose: () => {
            console.log('Live session closed');
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } // Female-sounding professional voice
          },
          systemInstruction: 'Eres Aura, asistente jurídica de IURYNEX. Responde con voz clara, pausada y profesional. Ayuda con leyes de Ecuador.'
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err) {
      console.error('Failed to start live session:', err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-gray-100 max-w-5xl mx-auto w-full p-8 relative overflow-hidden">
      {/* Background Pulsing Decoration */}
      {isActive && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Visualizer / Avatar */}
        <div className={`relative mb-8 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
          <div className={`w-48 h-48 rounded-full overflow-hidden border-8 ${
            status === 'SPEAKING' ? 'border-blue-500 shadow-2xl shadow-blue-200' : 
            status === 'LISTENING' ? 'border-red-500 shadow-2xl shadow-red-200' : 
            'border-gray-100'
          } transition-all duration-300`}>
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400" 
              alt="Aura Live" 
              className={`w-full h-full object-cover grayscale brightness-110 sepia-[.2] hue-rotate-[180deg] ${status === 'SPEAKING' ? 'animate-pulse' : ''}`}
            />
          </div>
          
          {isActive && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-white rounded-full shadow-md border border-gray-100 text-[10px] font-bold tracking-widest uppercase">
              {status === 'SPEAKING' ? 'Aura hablando...' : 'Aura escuchando...'}
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Asistente Virtual en Vivo</h2>
        <p className="text-gray-500 max-w-md mb-12">
          Habla directamente con Aura para una asesoría jurídica inmediata y fluida. 
          Usaremos tu micrófono para escucharte.
        </p>

        {!isActive ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className={`flex items-center space-x-3 px-10 py-5 rounded-full text-white font-bold text-lg shadow-xl transform transition-all active:scale-95 ${
              isConnecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-200 hover:-translate-y-1'
            }`}
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                <span>Iniciar Conversación</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="flex items-center space-x-3 px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-full shadow-xl shadow-red-100 transform transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
            </svg>
            <span>Finalizar Llamada</span>
          </button>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-blue-800 text-sm mb-1">Inmediato</h4>
            <p className="text-blue-600 text-xs opacity-80">Respuestas en tiempo real sin esperas de escritura.</p>
          </div>
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <h4 className="font-bold text-red-800 text-sm mb-1">Natural</h4>
            <p className="text-red-600 text-xs opacity-80">Conversa como lo harías con un asesor en persona.</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <h4 className="font-bold text-indigo-800 text-sm mb-1">Manos Libres</h4>
            <p className="text-indigo-600 text-xs opacity-80">Consulta mientras realizas otras actividades.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterface;
