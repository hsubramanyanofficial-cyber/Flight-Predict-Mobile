import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { PredictionResult } from '../types';

interface PredictionModalProps {
  route: { origin: string; destination: string; airline?: string };
  onClose: () => void;
  onTrackRoute: (origin: string, destination: string, price: number) => void;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({ route, onClose, onTrackRoute }) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackedDone, setTrackedDone] = useState(false);

  useEffect(() => {
    api.getPrediction({
      origin: route.origin,
      destination: route.destination,
      airline: route.airline || 'IndiGo',
      daysInAdvance: 14,
      cabinClass: 'Economy',
      stops: 0
    })
      .then(setPrediction)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [route]);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative animate-scaleUp my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">ML Airfare Prediction</h3>
            <p className="text-[10px] text-slate-500">{route.origin} → {route.destination}</p>
          </div>
        </div>

        {loading || !prediction ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500 font-medium">Running Scikit-Learn / XGBoost inference pipeline...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Price Banner */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-inner space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-indigo-300 font-semibold">Predicted Fair Price</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                  {prediction.confidence}% Confidence
                </span>
              </div>
              <div className="text-2xl font-extrabold">₹{prediction.predictedPrice.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-300">
                Expected range: ₹{prediction.expectedRangeMin.toLocaleString('en-IN')} – ₹{prediction.expectedRangeMax.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Recommendation Box */}
            <div className={`p-3 rounded-xl border flex items-center space-x-2.5 ${
              prediction.recommendation === 'Book Now'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <TrendingUp className="w-5 h-5 shrink-0" />
              <div>
                <div className="text-xs font-bold">Recommendation: {prediction.recommendation}</div>
                <p className="text-[10px] opacity-80 mt-0.5">Best booking window: {prediction.bestBookingWindowDays}</p>
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Key Price Factors</h4>
              {prediction.factors?.map((f, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-800">{f.name}</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{f.description}</p>
                </div>
              ))}
            </div>

            {trackedDone && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Route added to tracked price alerts!</span>
              </div>
            )}

            <button
              onClick={() => {
                onTrackRoute(route.origin, route.destination, prediction.predictedPrice);
                setTrackedDone(true);
                setTimeout(() => setTrackedDone(false), 3000);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Track Route & Set Price Alert</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
