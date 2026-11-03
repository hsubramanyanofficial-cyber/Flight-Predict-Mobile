import React, { useState, useEffect } from 'react';
import { Search, ArrowRightLeft, Calendar, Users, Sparkles, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { SearchQuery } from '../types';

interface HomeScreenProps {
  onSearch: (query: SearchQuery) => void;
  onOpenPrediction: (route: { origin: string; destination: string; airline: string }) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSearch, onOpenPrediction }) => {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [date, setDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<'Economy' | 'Premium Economy' | 'Business'>('Economy');
  const [aiAdvice, setAiAdvice] = useState<string>('Loading AI travel intelligence...');
  const [airports, setAirports] = useState<{ code: string; city: string }[]>([]);

  useEffect(() => {
    api.getAirports().then(setAirports).catch(() => {});
    api.getAiAdvice({ origin, destination, date }).then(setAiAdvice).catch(() => {
      setAiAdvice('Book 14 days in advance to secure optimal airfares in the Indian domestic market.');
    });
  }, [origin, destination, date]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ origin, destination, departureDate: date, passengers, cabinClass });
  };

  const popularRoutes = [
    { origin: 'DEL', destination: 'BOM', title: 'New Delhi to Mumbai', price: '₹4,899', trend: 'falling' },
    { origin: 'BLR', destination: 'GOI', title: 'Bengaluru to Goa', price: '₹3,400', trend: 'rising' },
    { origin: 'DEL', destination: 'BLR', title: 'New Delhi to Bengaluru', price: '₹6,500', trend: 'stable' },
    { origin: 'BOM', destination: 'CCU', title: 'Mumbai to Kolkata', price: '₹5,200', trend: 'falling' },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Greeting Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <Sparkles className="w-40 h-40" />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">FPPS Intelligence</span>
            <h2 className="text-xl font-bold mt-0.5">Namaste, Traveler 🙏</h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-emerald-300 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ML Engine Active</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Predicting airfare trends across 40+ domestic Indian routes with 91.4% historical accuracy.
        </p>

        {/* AI Travel Tip */}
        <div className="mt-4 bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-3 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-100 leading-snug">{aiAdvice}</p>
        </div>
      </div>

      {/* Flight Search Widget */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-1.5">
          <Search className="w-4 h-4 text-indigo-600" />
          <span>Find & Predict Fares</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Origin & Destination */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex-1">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">From</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer"
              >
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.city}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="mx-2 p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition shadow-sm"
              title="Swap origin & destination"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 text-right">
              <label className="text-[10px] uppercase text-slate-400 font-bold block">To</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer text-right"
              >
                {airports.map(a => (
                  <option key={a.code} value={a.code}>{a.code} - {a.city}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>Departure Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 mt-1 focus:outline-none"
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <label className="text-[10px] uppercase text-slate-400 font-bold flex items-center space-x-1">
                <Users className="w-3 h-3 text-slate-500" />
                <span>Passengers & Class</span>
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as any)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 mt-1 focus:outline-none cursor-pointer"
              >
                <option value="Economy">1 Adult, Economy</option>
                <option value="Premium Economy">1 Adult, Premium</option>
                <option value="Business">1 Adult, Business</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Search & Analyze Fares</span>
          </button>
        </form>
      </div>

      {/* Popular Routes & Price Predictions */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Popular Route Predictions</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">Updated 10m ago</span>
        </div>

        <div className="space-y-2.5">
          {popularRoutes.map((route, i) => (
            <div
              key={i}
              onClick={() => onOpenPrediction({ origin: route.origin, destination: route.destination, airline: 'IndiGo' })}
              className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-800">{route.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[11px] font-semibold text-slate-500">From {route.price}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    route.trend === 'falling' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {route.trend === 'falling' ? '↓ Falling (Book Later)' : '↑ Rising (Book Now)'}
                  </span>
                </div>
              </div>
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
