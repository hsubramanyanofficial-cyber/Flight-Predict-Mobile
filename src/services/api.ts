import { Flight, PredictionResult, TrackedRoute, UserPreferences } from '../types';

export const api = {
  async getAirports(): Promise<{ code: string; city: string; name: string }[]> {
    const res = await fetch('/api/airports');
    if (!res.ok) throw new Error('Failed to fetch airports');
    return res.json();
  },

  async searchFlights(params: {
    origin: string;
    destination: string;
    date: string;
    cabinClass?: string;
  }): Promise<{ query: any; count: number; flights: Flight[] }> {
    const searchParams = new URLSearchParams();
    searchParams.set('origin', params.origin);
    searchParams.set('destination', params.destination);
    searchParams.set('date', params.date);
    if (params.cabinClass) searchParams.set('cabinClass', params.cabinClass);

    const res = await fetch(`/api/flights/search?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to search flights');
    return res.json();
  },

  async getPrediction(params: {
    origin: string;
    destination: string;
    airline: string;
    daysInAdvance: number;
    cabinClass: string;
    stops: number;
  }): Promise<PredictionResult> {
    const res = await fetch('/api/flights/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to get prediction');
    return res.json();
  },

  async getInsights(route: string): Promise<any> {
    const res = await fetch(`/api/insights/${route}`);
    if (!res.ok) throw new Error('Failed to fetch price insights');
    return res.json();
  },

  async getTrackedRoutes(): Promise<TrackedRoute[]> {
    const res = await fetch('/api/tracked');
    if (!res.ok) throw new Error('Failed to fetch tracked routes');
    return res.json();
  },

  async addTrackedRoute(data: {
    origin: string;
    destination: string;
    targetPrice: number;
    cabinClass: string;
  }): Promise<TrackedRoute> {
    const res = await fetch('/api/tracked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add tracked route');
    const json = await res.json();
    return json.route;
  },

  async deleteTrackedRoute(id: string): Promise<void> {
    const res = await fetch(`/api/tracked/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete tracked route');
  },

  async getPreferences(): Promise<UserPreferences> {
    const res = await fetch('/api/profile/preferences');
    if (!res.ok) throw new Error('Failed to fetch preferences');
    return res.json();
  },

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const res = await fetch('/api/profile/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });
    if (!res.ok) throw new Error('Failed to update preferences');
    const json = await res.json();
    return json.preferences;
  },

  async getAiAdvice(params: { origin: string; destination: string; date: string }): Promise<string> {
    const res = await fetch('/api/ai/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) return 'Book 14 days in advance for best airfare rates.';
    const json = await res.json();
    return json.advice;
  }
};
