import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles } from 'lucide-react';

export const VoiceChat: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Tap the microphone to start real-time voice conversation with Gemini Live API.');

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Listening... Speak your travel query (e.g., "Find cheapest flights from Delhi to Mumbai").');
      setTimeout(() => {
        setTranscript('I found 5 flights from Delhi to Mumbai starting at ₹4,899. IndiGo flight 6E-101 is currently recommended.');
        setIsListening(false);
      }, 4000);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg border border-indigo-500/30 text-center space-y-4">
      <div className="flex justify-center">
        <div className={`p-4 rounded-full transition-all duration-300 shadow-xl ${
          isListening ? 'bg-rose-600 animate-bounce' : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
        }`} onClick={toggleListening}>
          {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold tracking-tight">Gemini Live Voice Assistant</h4>
        <p className="text-xs text-indigo-200 mt-2 leading-relaxed max-w-xs mx-auto">{transcript}</p>
      </div>

      <div className="flex justify-center items-center space-x-1 pt-1">
        <span className={`w-1.5 h-6 rounded-full bg-indigo-400 ${isListening ? 'animate-pulse' : ''}`}></span>
        <span className={`w-1.5 h-10 rounded-full bg-emerald-400 ${isListening ? 'animate-pulse delay-75' : ''}`}></span>
        <span className={`w-1.5 h-6 rounded-full bg-indigo-400 ${isListening ? 'animate-pulse delay-150' : ''}`}></span>
      </div>
    </div>
  );
};
