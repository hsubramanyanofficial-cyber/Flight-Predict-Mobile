import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { TrackedRoute } from '../types';

export const TrackedScreen: React.FC = () => {
  const [tracked, setTracked] = useState<TrackedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BLR');
  const [targetPrice, setTargetPrice] = useState('5000');
  const [cabinClass, setCabinClass] = useState('Economy');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTracked = async () => {
    setLoading(true);
    try {
      const data = await api.getTrackedRoutes();
      setTracked(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracked();
  }, []);

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addTrackedRoute({ origin, destination, targetPrice: Number(targetPrice), cabinClass });
      setShowAddModal(false);
      setSuccessMsg('Route added to active price surveillance successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTracked();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTrackedRoute(id);
      fetchTracked();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Tracked Fares & Price Alerts</span>
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Automated surveillance for drops below target INR</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-md transition flex items-center space-x-1 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Track</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Tracked Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <h4 className="text-sm font-bold text-slate-900">Track New Flight Route</h4>
            
            <form onSubmit={handleAddRoute} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold">Origin (3-letter)</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                    maxLength={3}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold uppercase text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
                    maxLength={3}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold uppercase text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold">Target Fare (INR ₹)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold">Cabin Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-md transition"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracked List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Loading tracked surveillance records...</p>
        </div>
      ) : tracked.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Routes Tracked</h4>
          <p className="text-xs text-slate-500 mt-1">Add a route to receive alerts when fares drop below your target INR.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracked.map((item) => {
            const isBelowTarget = item.currentPrice <= item.targetPrice;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{item.origin} → {item.destination}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">{item.cabinClass} • Target: ₹{item.targetPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                    title="Remove tracking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Fare</span>
                    <span className="text-base font-extrabold text-indigo-600">₹{item.currentPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lowest Recorded</span>
                    <span className="text-xs font-bold text-emerald-600">₹{item.lowestPriceSeen.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {isBelowTarget && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fare has dropped below your target price! Book now to save.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
