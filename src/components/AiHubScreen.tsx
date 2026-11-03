import React, { useState } from 'react';
import { Sparkles, Gamepad2, Bot, Mic, Film, Volume2 } from 'lucide-react';
import { FlightAdventureGame } from './FlightAdventureGame.3d';
import { GeminiChatbot } from './GeminiChatbot';
import { VoiceChat } from './VoiceChat';
import { AudioTranscription } from './AudioTranscription';
import { VideoGenerator } from './VideoGenerator';

export const AiHubScreen: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'game' | 'voice' | 'audio' | 'video'>('chat');

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Sub-navigation tabs */}
      <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
            activeSubTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveSubTab('game')}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
            activeSubTab === 'game' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>3D Game</span>
        </button>

        <button
          onClick={() => setActiveSubTab('voice')}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
            activeSubTab === 'voice' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Live</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audio')}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
            activeSubTab === 'audio' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Speech</span>
        </button>

        <button
          onClick={() => setActiveSubTab('video')}
          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1 ${
            activeSubTab === 'video' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Video</span>
        </button>
      </div>

      {activeSubTab === 'chat' && <GeminiChatbot />}
      {activeSubTab === 'game' && <FlightAdventureGame />}
      {activeSubTab === 'voice' && <VoiceChat />}
      {activeSubTab === 'audio' && <AudioTranscription />}
      {activeSubTab === 'video' && <VideoGenerator />}
    </div>
  );
};
