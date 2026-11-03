import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Globe } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';

export const GeminiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Namaste! I am your FPPS AI Travel Assistant powered by Gemini. Ask me about flight fares, airport facilities, or route insights!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const aiClient = apiKey && apiKey !== 'MY_GEMINI_API_KEY' ? new GoogleGenAI({ apiKey }) : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      if (!aiClient) {
        setMessages(prev => [...prev, { role: 'assistant', text: 'AI API Key not configured. Please add GEMINI_API_KEY in secrets.' }]);
        setLoading(false);
        return;
      }

      // Use gemini-3.8-flash with Google Search and Google Maps tools
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userText,
        config: {
          systemInstruction: 'You are an expert Indian aviation and travel assistant for FPPS. Provide accurate flight insights, airport directions using Google Maps grounding, and current fares.',
          tools: [{ googleSearch: {} }, { googleMaps: {} }]
        }
      });

      const reply = response.text || 'I analyzed your request. Please book flights 14 days in advance for best INR rates.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);

      // Persist chat in Firestore if user is logged in
      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'users', auth.currentUser.uid, 'chats'), {
            userId: auth.currentUser.uid,
            role: 'assistant',
            text: reply,
            createdAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn('Firestore chat save error:', dbErr);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an issue connecting to Gemini AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 flex flex-col h-[450px]">
      <div className="p-3.5 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Gemini AI Assistant</h4>
            <p className="text-[10px] text-slate-400">Search & Maps Grounding Active</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">
          <Globe className="w-3 h-3" />
          <span>Grounded</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-xs' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl p-3 text-xs animate-pulse">
              Gemini is searching & thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about flights, airports, or trends..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition shadow"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
