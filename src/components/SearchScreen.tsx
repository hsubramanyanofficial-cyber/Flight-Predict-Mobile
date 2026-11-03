import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, ArrowRight, ShieldCheck, Clock, Plane, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Flight, SearchQuery } from '../types';

interface SearchScreenProps {
  initialQuery?: SearchQuery;
  onOpenPrediction: (flight: Flight) => void;
  onTrackRoute: (origin: string, destination: string, price: number) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ initialQuery, onOpenPrediction, onTrackRoute }) => {
  const [origin, setOrigin] = useState(initialQuery?.origin || 'DEL');
  const [destination, setDestination] = useState(initialQuery?.destination || 'BOM');
  const [date, setDate] = useState(initialQuery?.departureDate || new Date().toISOString().split('T')[0]);
  const [cabinClass, setCabinClass] = useState(initialQuery?.cabinClass || 'Economy');

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'prediction'>('price');
  const [maxStops, setMaxStops] = useState<number>(2);
  const [trackedSuccess, setTrackedSuccess] = useState(false);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const data = await api.searchFlights({ origin, destination, date, cabinClass });
      setFlights(data.flights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [origin, destination, date, cabinClass]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  // Filter & Sort
  const filteredFlights = flights.filter(f => f.stops <= maxStops).sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
    if (sortBy === 'prediction') return (b.prediction?.confidence || 0) - (a.prediction?.confidence || 0);
    return 0;
  });

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Compact Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-3 shadow-md border border-slate-100 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 uppercase focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-slate-400 font-bold">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 uppercase focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Filter & Sort Bar */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl shadow-xs border border-slate-100 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 font-semibold text-slate-800 rounded px-2 py-1 focus:outline-none cursor-pointer border border-slate-200"
          >
            <option value="price">Lowest Price</option>
            <option value="duration">Fastest Duration</option>
            <option value="prediction">AI Confidence</option>
          </select>
        </div>

        <button
          onClick={() => {
            onTrackRoute(origin, destination, filteredFlights[0]?.price || 5000);
            setTrackedSuccess(true);
            setTimeout(() => setTrackedSuccess(false), 3000);
          }}
          className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center space-x-1"
        >
          <span>Track Route</span>
        </button>
      </div>

      {trackedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Route {origin} → {destination} successfully added to tracked alerts!</span>
        </div>
      )}

      {/* Flight Results */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500 font-medium">Analyzing real-time airline fares & ML model estimates...</p>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
            <Plane className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No flights found</h4>
            <p className="text-xs text-slate-500 mt-1">Try searching another Indian route or date.</p>
          </div>
        ) : (
          filteredFlights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition space-y-3 relative overflow-hidden"
            >
              {/* Airline & Price */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {flight.airlineCode} • {flight.airline}
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">{flight.flightNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-indigo-600">₹{flight.price.toLocaleString('en-IN')}</div>
                  {flight.originalPrice && flight.originalPrice > flight.price && (
                    <div className="text-[10px] text-slate-400 line-through">₹{flight.originalPrice.toLocaleString('en-IN')}</div>
                  )}
                </div>
              </div>

              {/* Times & Stops */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-800">{flight.departureTime}</div>
                  <div className="text-[10px] text-slate-500">{flight.origin}</div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-medium">{flight.duration}</div>
                  <div className="w-20 h-[1px] bg-slate-300 my-1 relative">
                    <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                  </div>
                  <div className="text-[10px] text-indigo-600 font-semibold">{flight.stopDetails}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{flight.arrivalTime}</div>
                  <div className="text-[10px] text-slate-500">{flight.destination}</div>
                </div>
              </div>

              {/* Prediction Badge */}
              {flight.prediction && (
                <div
                  onClick={() => onOpenPrediction(flight)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    flight.prediction.recommendation === 'Book Now'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/70'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className={`w-4 h-4 shrink-0 ${flight.prediction.recommendation === 'Book Now' ? 'text-amber-600' : 'text-emerald-600'}`} />
                    <div>
                      <div className="text-xs font-bold">
                        {flight.prediction.recommendation} ({flight.prediction.confidence}% confidence)
                      </div>
                      <p className="text-[10px] opacity-80 line-clamp-1">{flight.prediction.reason}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 opacity-60" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
