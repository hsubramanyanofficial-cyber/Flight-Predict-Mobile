import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { SearchScreen } from './components/SearchScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { TrackedScreen } from './components/TrackedScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AiHubScreen } from './components/AiHubScreen';
import { PredictionModal } from './components/PredictionModal';
import { CapacitorModal } from './components/CapacitorModal';
import { Flight, SearchQuery } from './types';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<SearchQuery | undefined>(undefined);
  const [selectedPredictionRoute, setSelectedPredictionRoute] = useState<{ origin: string; destination: string; airline?: string } | null>(null);
  const [showCapacitorModal, setShowCapacitorModal] = useState<boolean>(false);

  const handleSearchFromHome = (query: SearchQuery) => {
    setSearchQuery(query);
    setCurrentTab('search');
  };

  const handleTrackRoute = async (origin: string, destination: string, price: number) => {
    try {
      await api.addTrackedRoute({
        origin,
        destination,
        targetPrice: Math.round(price * 0.92),
        cabinClass: 'Economy'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white relative">
      {/* Top Header */}
      <Header onOpenCapacitorGuide={() => setShowCapacitorModal(true)} />

      {/* Main Screen Content */}
      <main className="max-w-md mx-auto">
        {currentTab === 'home' && (
          <HomeScreen
            onSearch={handleSearchFromHome}
            onOpenPrediction={(route) => setSelectedPredictionRoute(route)}
          />
        )}

        {currentTab === 'search' && (
          <SearchScreen
            initialQuery={searchQuery}
            onOpenPrediction={(flight: Flight) => setSelectedPredictionRoute({
              origin: flight.origin,
              destination: flight.destination,
              airline: flight.airline
            })}
            onTrackRoute={handleTrackRoute}
          />
        )}

        {currentTab === 'insights' && <InsightsScreen />}

        {currentTab === 'tracked' && <TrackedScreen />}

        {currentTab === 'ai' && <AiHubScreen />}

        {currentTab === 'profile' && (
          <ProfileScreen onOpenCapacitorGuide={() => setShowCapacitorModal(true)} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Modals */}
      {selectedPredictionRoute && (
        <PredictionModal
          route={selectedPredictionRoute}
          onClose={() => setSelectedPredictionRoute(null)}
          onTrackRoute={handleTrackRoute}
        />
      )}

      {showCapacitorModal && (
        <CapacitorModal onClose={() => setShowCapacitorModal(false)} />
      )}
    </div>
  );
}
