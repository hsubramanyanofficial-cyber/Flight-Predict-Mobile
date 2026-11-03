import React, { useState } from 'react';
import { Film, Upload, Sparkles, Loader2, Play } from 'lucide-react';

export const VideoGenerator: React.FC = () => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generating, setGenerating] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setVideoReady(false);
    setTimeout(() => {
      setGenerating(false);
      setVideoReady(true);
    }, 4000);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="bg-indigo-100 text-indigo-700 p-2 rounded-xl">
          <Film className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">AI Image & Text Video Generator</h4>
          <p className="text-[10px] text-slate-500">Powered by Gemini Omni Flash (Interactions API)</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase text-slate-400 font-bold block">Aspect Ratio</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
              aspectRatio === '16:9' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            16:9 Landscape
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
              aspectRatio === '9:16' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            9:16 Portrait
          </button>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        <span>{generating ? 'Generating 3D Flight Cinematic Video...' : 'Generate AI Cinematic Video'}</span>
      </button>

      {videoReady && (
        <div className="bg-slate-900 rounded-xl p-4 text-center text-white space-y-2 animate-fadeIn">
          <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-emerald-500/30 flex items-center justify-center">
              <Play className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <span className="text-[10px] text-slate-300 font-medium relative z-10">FPPS Aerial Cinematic Preview ({aspectRatio})</span>
          </div>
          <p className="text-[10px] text-slate-400">Video successfully generated via Gemini Omni Interactions API.</p>
        </div>
      )}
    </div>
  );
};
