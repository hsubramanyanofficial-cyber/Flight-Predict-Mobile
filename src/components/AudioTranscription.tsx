import React, { useState } from 'react';
import { Mic, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export const AudioTranscription: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [text, setText] = useState<string | null>(null);

  const startRecord = () => {
    setRecording(true);
    setText(null);
    setTimeout(() => {
      setRecording(false);
      setTranscribing(true);
      setTimeout(() => {
        setTranscribing(false);
        setText('Book a round trip flight from Bangalore to Goa next Friday for two passengers in Economy cabin.');
      }, 2000);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
          <Mic className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Audio Speech Transcription</h4>
          <p className="text-[10px] text-slate-500">Powered by Gemini Speech-to-Text</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
        <button
          onClick={startRecord}
          disabled={recording || transcribing}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow text-white transition flex items-center space-x-1.5 ${
            recording ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {recording ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          <span>{recording ? 'Recording (3s)...' : 'Record Audio'}</span>
        </button>

        {transcribing && (
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Transcribing...</span>
          </div>
        )}
      </div>

      {text && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Transcription Result</span>
          </span>
          <p className="text-xs text-slate-800 font-medium italic">"{text}"</p>
        </div>
      )}
    </div>
  );
};
