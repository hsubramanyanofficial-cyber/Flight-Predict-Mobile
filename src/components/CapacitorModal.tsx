import React from 'react';
import { X, Smartphone, ShieldCheck, Terminal, CheckCircle2 } from 'lucide-react';

interface CapacitorModalProps {
  onClose: () => void;
}

export const CapacitorModal: React.FC<CapacitorModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 relative animate-scaleUp my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Capacitor Mobile Packaging</h3>
            <p className="text-xs text-slate-500">Android APK/AAB & iOS App Store Build Guide</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            FPPS is fully configured with a mobile-first responsive React frontend and a robust Node.js backend. Follow these steps to package for Android and iOS using Capacitor:
          </p>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>1. Install Capacitor CLI & Core</span>
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm install @capacitor/core @capacitor/cli<br />
              npx cap init FPPS com.fpps.app --web-dir=dist
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>2. Add Android Platform (APK / AAB)</span>
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm install @capacitor/android<br />
              npx cap add android<br />
              npm run build<br />
              npx cap open android
            </div>
            <p className="text-[11px] text-slate-500">
              Inside Android Studio, build the APK or generate a signed App Bundle (AAB) for Google Play Console.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>3. Add iOS Platform (Xcode & App Store)</span>
            </h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
              npm install @capacitor/ios<br />
              npx cap add ios<br />
              npm run build<br />
              npx cap open ios
            </div>
            <p className="text-[11px] text-slate-500">
              Configure signing team in Xcode, select your target provisioning profile, and archive for TestFlight / App Store submission.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-xs shadow transition"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
