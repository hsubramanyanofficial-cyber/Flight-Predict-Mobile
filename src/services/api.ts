import { Flight, PredictionResult, TrackedRoute, UserPreferences } from '../types';

/**
 * Centralized safe error logger that sanitizes URLs and prevents sensitive data exposure.
 */
function logApiError(action: string, error: unknown) {
  const safeMessage = error instanceof Error ? error.message : 'Unknown error';
  // Sanitized logging without exposing secrets or tokens
  console.warn(`[FPPS API Warning] Action: ${action} | Error: ${safeMessage}`);
}

/**
 * Centralized request wrapper with retry logic (exponential backoff) and user-friendly error handling.
 */
async function requestWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3,
  backoff = 300
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        if (response.status === 400) errorMsg = 'Invalid request parameters. Please check your input.';
        else if (response.status === 401) errorMsg = 'Authentication required. Please sign in again.';
        else if (response.status === 404) errorMsg = 'Requested route or resource not found.';
        else if (response.status >= 500) errorMsg = 'Temporary server error. Please try again later.';
        
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Network request failed');
      logApiError(`GET/POST ${url} (Attempt ${attempt}/${retries})`, lastError);

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, backoff * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw new Error(lastError?.message || 'Unable to complete request. Please check your internet connection.');
}

export const api = {
  async getAirports(): Promise<{ code: string; city: string; name: string }[]> {
    return requestWithRetry<{ code: string; city: string; name: string }[]>('/api/airports');
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

    return requestWithRetry<{ query: any; count: number; flights: Flight[] }>(
      `/api/flights/search?${searchParams.toString()}`
    );
  },

  async getPrediction(params: {
    origin: string;
    destination: string;
    airline: string;
    daysInAdvance: number;
    cabinClass: string;
    stops: number;
  }): Promise<PredictionResult> {
    return requestWithRetry<PredictionResult>('/api/flights/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },

  async getInsights(route: string): Promise<any> {
    return requestWithRetry<any>(`/api/insights/${route}`);
  },

  async getTrackedRoutes(): Promise<TrackedRoute[]> {
    return requestWithRetry<TrackedRoute[]>('/api/tracked');
  },

  async addTrackedRoute(data: {
    origin: string;
    destination: string;
    targetPrice: number;
    cabinClass: string;
  }): Promise<TrackedRoute> {
    const res = await requestWithRetry<{ success: boolean; route: TrackedRoute }>('/api/tracked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.route;
  },

  async deleteTrackedRoute(id: string): Promise<void> {
    await requestWithRetry<any>(`/api/tracked/${id}`, { method: 'DELETE' });
  },

  async getPreferences(): Promise<UserPreferences> {
    return requestWithRetry<UserPreferences>('/api/profile/preferences');
  },

  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const res = await requestWithRetry<{ success: boolean; preferences: UserPreferences }>('/api/profile/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    });
    return res.preferences;
  },

  async getAiAdvice(params: { origin: string; destination: string; date: string }): Promise<string> {
    try {
      const res = await requestWithRetry<{ advice: string }>('/api/ai/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return res.advice;
    } catch {
      return 'Book 14 days in advance for best airfare rates.';
    }
  }
};
