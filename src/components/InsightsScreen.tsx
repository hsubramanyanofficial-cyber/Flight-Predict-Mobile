import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { api } from '../services/api';

export const InsightsScreen: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState('DEL-BOM');
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const routes = [
    { code: 'DEL-BOM', name: 'New Delhi ⇄ Mumbai' },
    { code: 'BLR-GOI', name: 'Bengaluru ⇄ Goa' },
    { code: 'DEL-BLR', name: 'New Delhi ⇄ Bengaluru' },
    { code: 'BOM-CCU', name: 'Mumbai ⇄ Kolkata' },
    { code: 'DEL-MAA', name: 'New Delhi ⇄ Chennai' },
  ];

  useEffect(() => {
    setLoading(true);
    api.getInsights(selectedRoute)
      .then(setInsights)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedRoute]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Airfare Price Intelligence</span>
        </h3>

        <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Select Route</label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
        >
          {routes.map(r => (
            <option key={r.code} value={r.code}>{r.name} ({r.code})</option>
          ))}
        </select>
      </div>

      {loading || !insights ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-500 font-medium">Loading historical price trends & ML seasonal model...</p>
        </div>
      ) : (
        <>
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Average Fare</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1">₹{insights.averagePrice?.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center mt-1">
                <ArrowDownRight className="w-3 h-3 mr-0.5" /> Stable vs last month
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Lowest Season</span>
              <div className="text-lg font-extrabold text-emerald-600 mt-1">₹{insights.lowestSeasonPrice?.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">Best: {insights.bestMonths?.[0]}</span>
            </div>
          </div>

          {/* Historical Monthly Trend Chart */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Historical Monthly Average Fares (INR)</span>
            </h4>

            <div className="space-y-2 pt-2">
              {insights.historicalMonths?.map((m: any, idx: number) => {
                const maxPrice = insights.highestSeasonPrice || 10000;
                const percentage = Math.round((m.avgPrice / maxPrice) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{m.month}</span>
                      <span className="font-bold text-slate-900">₹{m.avgPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.avgPrice <= insights.averagePrice ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Time Analysis Curve */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Advance Booking Lead Time Analysis</span>
            </h4>

            <div className="space-y-2">
              {insights.leadTimeAnalysis?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-xs font-semibold text-slate-700">{item.daysBefore} days before departure</span>
                  <span className="text-xs font-extrabold text-slate-900">₹{item.avgPrice.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-start space-x-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-900 leading-snug">
                ML recommendation: Booking {insights.leadTimeAnalysis?.[0]?.daysBefore} days in advance delivers the lowest price variance for {insights.routeTitle}.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
