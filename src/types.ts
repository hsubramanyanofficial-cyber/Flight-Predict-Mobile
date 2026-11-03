export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopDetails?: string;
  price: number; // in INR
  originalPrice?: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  bookingUrl?: string;
  prediction?: {
    estimatedFairPrice: number;
    priceTrend: 'rising' | 'falling' | 'stable';
    confidence: number; // percentage e.g. 88
    recommendation: 'Book Now' | 'Wait' | 'Fair Price';
    reason: string;
  };
}

export interface SearchQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
}

export interface PredictionRequest {
  origin: string;
  destination: string;
  airline: string;
  departureDate: string;
  daysInAdvance: number;
  cabinClass: string;
  stops: number;
  flightDurationMinutes: number;
}

export interface PredictionResult {
  origin: string;
  destination: string;
  currentPrice: number;
  predictedPrice: number;
  expectedRangeMin: number;
  expectedRangeMax: number;
  priceTrend: 'rising' | 'falling' | 'stable';
  confidence: number;
  recommendation: 'Book Now' | 'Wait' | 'Fair Price';
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  historicalAverage: number;
  bestBookingWindowDays: string;
  timestamp: string;
}

export interface TrackedRoute {
  id: string;
  origin: string;
  destination: string;
  targetPrice: number;
  currentPrice: number;
  lowestPriceSeen: number;
  highestPriceSeen: number;
  lastChecked: string;
  isPaused: boolean;
  cabinClass: string;
  alertsEnabled: boolean;
}

export interface UserPreferences {
  homeAirport: string;
  preferredAirlines: string[];
  maxStops: number;
  budgetMax: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  emailAlerts: boolean;
  pushAlerts: boolean;
}

export interface PriceInsight {
  route: string;
  routeTitle: string;
  averagePrice: number;
  lowestSeasonPrice: number;
  highestSeasonPrice: number;
  bestMonths: string[];
  historicalMonths: { month: string; avgPrice: number }[];
  leadTimeAnalysis: { daysBefore: number; avgPrice: number }[];
}

export interface UserUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
