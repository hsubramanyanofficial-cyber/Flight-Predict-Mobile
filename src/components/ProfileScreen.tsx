import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Bell, Sliders, Smartphone, CheckCircle2, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { UserPreferences } from '../types';

interface ProfileScreenProps {
  onOpenCapacitorGuide: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onOpenCapacitorGuide }) => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getPreferences().then(setPreferences).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferences) return;
    setSaving(true);
    try {
      const updated = await api.updatePreferences(preferences);
      setPreferences(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!preferences) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500 font-medium">Loading user profile & preferences...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* User Info Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center space-x-3">
        <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg">
          AS
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Aarav Sharma</h3>
          <p className="text-xs text-slate-500">aarav.sharma@example.com</p>
          <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
            Verified Travel Account
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>User preferences successfully saved!</span>
        </div>
      )}

      {/* Capacitor & Mobile App Packaging Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Cross-Platform Mobile App</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          FPPS is fully prepared for Android (APK/AAB) and iOS packaging via Capacitor. View the native build instructions and dependencies.
        </p>
        <button
          onClick={onOpenCapacitorGuide}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center space-x-1.5"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>View Capacitor Android/iOS Guide</span>
        </button>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Flight Search & Price Preferences</span>
        </h4>

        <div>
          <label className="text-[10px] uppercase text-slate-400 font-bold">Home Airport</label>
          <input
            type="text"
            value={preferences.homeAirport}
            onChange={(e) => setPreferences({ ...preferences, homeAirport: e.target.value.toUpperCase() })}
            maxLength={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 uppercase focus:outline-none mt-1"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase text-slate-400 font-bold">Default Cabin Class</label>
          <select
            value={preferences.cabinClass}
            onChange={(e) => setPreferences({ ...preferences, cabinClass: e.target.value as any })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none mt-1 cursor-pointer"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase text-slate-400 font-bold">Maximum Budget (INR ₹)</label>
          <input
            type="number"
            value={preferences.budgetMax}
            onChange={(e) => setPreferences({ ...preferences, budgetMax: Number(e.target.value) })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none mt-1"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Email Price Drop Alerts</span>
            <input
              type="checkbox"
              checked={preferences.emailAlerts}
              onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-semibold text-slate-700">Push Notifications</span>
            <input
              type="checkbox"
              checked={preferences.pushAlerts}
              onChange={(e) => setPreferences({ ...preferences, pushAlerts: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1.5"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};
