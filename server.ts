import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Google GenAI if key exists
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI:', err);
  }
}

// In-memory data store for backend state
let inMemoryUsers: any[] = [
  { id: 'usr_1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com' }
];

let trackedRoutesStore: any[] = [
  {
    id: 'trk_1',
    origin: 'DEL',
    destination: 'BOM',
    targetPrice: 5200,
    currentPrice: 4899,
    lowestPriceSeen: 4650,
    highestPriceSeen: 7800,
    lastChecked: new Date().toISOString(),
    isPaused: false,
    cabinClass: 'Economy',
    alertsEnabled: true
  },
  {
    id: 'trk_2',
    origin: 'BLR',
    destination: 'GOI',
    targetPrice: 3500,
    currentPrice: 3750,
    lowestPriceSeen: 3400,
    highestPriceSeen: 5900,
    lastChecked: new Date().toISOString(),
    isPaused: false,
    cabinClass: 'Economy',
    alertsEnabled: true
  }
];

let userPreferencesStore: any = {
  homeAirport: 'DEL',
  preferredAirlines: ['IndiGo', 'Air India', 'Vistara'],
  maxStops: 1,
  budgetMax: 15000,
  cabinClass: 'Economy',
  emailAlerts: true,
  pushAlerts: true
};

const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose International Airport' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport' },
  { code: 'GOI', city: 'Goa', name: 'Manohar International Airport / Dabolim' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport' }
];

const AIRLINES = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'Vistara', code: 'UK' },
  { name: 'Akasa Air', code: 'QP' },
  { name: 'SpiceJet', code: 'SG' }
];

// Helper to generate realistic prices for routes in INR
function getBaseRoutePrice(origin: string, destination: string): number {
  const key = `${origin}-${destination}`;
  const reverseKey = `${destination}-${origin}`;
  const matrix: Record<string, number> = {
    'DEL-BOM': 4800,
    'DEL-BLR': 6500,
    'BLR-GOI': 3400,
    'BOM-GOI': 2900,
    'DEL-CCU': 5200,
    'DEL-MAA': 6200,
    'BOM-BLR': 4200,
    'HYD-BLR': 3100,
    'DEL-HYD': 5400,
    'DEL-PNQ': 4500
  };
  return matrix[key] || matrix[reverseKey] || 5500;
}

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Airports list
app.get('/api/airports', (req, res) => {
  res.json(AIRPORTS);
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, name } = req.body;
  const user = { id: 'usr_' + Date.now(), email: email || 'user@example.com', name: name || 'Traveler' };
  res.json({ success: true, user, token: 'fpps_jwt_token_' + Math.random().toString(36).substring(7) });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: inMemoryUsers[0] });
});

// Flight Search API
app.get('/api/flights/search', (req, res) => {
  const { origin = 'DEL', destination = 'BOM', date, cabinClass = 'Economy' } = req.query;
  const basePrice = getBaseRoutePrice(String(origin), String(destination));

  const results = AIRLINES.map((airline, idx) => {
    const variation = (idx * 340) - 500 + Math.floor(Math.random() * 800);
    const price = Math.max(2500, basePrice + variation);
    const stops = idx === 0 ? 0 : (idx % 2 === 0 ? 1 : 0);
    const hours = 2 + Math.floor(Math.random() * 2);
    const mins = Math.floor(Math.random() * 5) * 10;

    // AI Prediction summary attached to flight
    const trend = Math.random() > 0.5 ? 'rising' : 'falling';
    const rec = trend === 'rising' ? 'Book Now' : 'Wait';
    const confidence = 82 + Math.floor(Math.random() * 15);

    return {
      id: `fl_${airline.code}_${idx}_${Date.now()}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: `${airline.code}-${100 + idx * 47}`,
      origin: String(origin),
      destination: String(destination),
      departureTime: `${6 + idx * 3}:00 AM`,
      arrivalTime: `${6 + idx * 3 + hours}:${mins === 0 ? '00' : mins} AM`,
      duration: `${hours}h ${mins}m`,
      stops,
      stopDetails: stops > 0 ? '1 stop via Intermediate' : 'Non-stop',
      price,
      originalPrice: price + (trend === 'rising' ? 850 : 0),
      cabinClass: String(cabinClass),
      bookingUrl: `https://example.com/book/${airline.code}`,
      prediction: {
        estimatedFairPrice: price - 300,
        priceTrend: trend,
        confidence,
        recommendation: rec,
        reason: trend === 'rising' 
          ? 'Historical demand for this route on selected day is high. Prices expected to rise ₹900 in 48h.' 
          : 'Prices are trending downwards over the last 3 days. Waiting may save approx ₹450.'
      }
    };
  });

  res.json({
    query: { origin, destination, date, cabinClass },
    count: results.length,
    flights: results
  });
});

// Machine Learning Airfare Prediction Engine API
app.post('/api/flights/predict', (req, res) => {
  const { origin = 'DEL', destination = 'BOM', airline = 'IndiGo', daysInAdvance = 14, cabinClass = 'Economy', stops = 0 } = req.body;
  const base = getBaseRoutePrice(String(origin), String(destination));

  // ML Feature Weight simulation
  const advanceBonus = Math.max(0, (30 - Number(daysInAdvance)) * 85);
  const stopDiscount = Number(stops) > 0 ? -600 : 0;
  const cabinMultiplier = cabinClass === 'Business' ? 2.8 : (cabinClass === 'Premium Economy' ? 1.5 : 1.0);

  const currentPrice = Math.round((base + advanceBonus + stopDiscount) * cabinMultiplier);
  const predictedPrice = Math.round(currentPrice * (0.92 + (Math.random() * 0.15)));
  const rangeMin = Math.round(predictedPrice * 0.90);
  const rangeMax = Math.round(predictedPrice * 1.12);

  const trend = currentPrice > predictedPrice ? 'falling' : 'rising';
  const recommendation = trend === 'rising' ? 'Book Now' : 'Wait';
  const confidence = 89;

  const factors = [
    {
      name: 'Booking Lead Time',
      impact: Number(daysInAdvance) < 7 ? 'negative' : 'positive',
      description: Number(daysInAdvance) < 7 
        ? 'Booking less than 7 days prior increases fare risk by 28%.' 
        : 'Booking 2+ weeks ahead aligns with optimal historical savings window.'
    },
    {
      name: 'Day of Week Demand',
      impact: 'neutral',
      description: 'Mid-week travel (Tuesday/Wednesday) exhibits lower historical congestion than weekends.'
    },
    {
      name: 'Seasonal Route Index',
      impact: 'positive',
      description: 'Current season shows stable passenger volume with moderate airline capacity.'
    },
    {
      name: 'Historical Volatility',
      impact: 'neutral',
      description: 'Standard price fluctuation variance of ±7% observed over past 90 days.'
    }
  ];

  const result = {
    origin,
    destination,
    currentPrice,
    predictedPrice,
    expectedRangeMin: rangeMin,
    expectedRangeMax: rangeMax,
    priceTrend: trend,
    confidence,
    recommendation,
    factors,
    historicalAverage: Math.round(base * cabinMultiplier),
    bestBookingWindowDays: '14 - 21 days before departure',
    timestamp: new Date().toISOString()
  };

  res.json(result);
});

// Price Insights API
app.get('/api/insights/:route', (req, res) => {
  const route = req.params.route || 'DEL-BOM';
  const [origin, destination] = route.split('-');
  const base = getBaseRoutePrice(origin || 'DEL', destination || 'BOM');

  const insights = {
    route: route.toUpperCase(),
    routeTitle: `${origin || 'DEL'} to ${destination || 'BOM'}`,
    averagePrice: base,
    lowestSeasonPrice: Math.round(base * 0.78),
    highestSeasonPrice: Math.round(base * 1.35),
    bestMonths: ['February', 'August', 'September'],
    historicalMonths: [
      { month: 'Jan', avgPrice: Math.round(base * 1.1) },
      { month: 'Feb', avgPrice: Math.round(base * 0.85) },
      { month: 'Mar', avgPrice: Math.round(base * 0.92) },
      { month: 'Apr', avgPrice: Math.round(base * 1.05) },
      { month: 'May', avgPrice: Math.round(base * 1.25) },
      { month: 'Jun', avgPrice: Math.round(base * 1.20) },
      { month: 'Jul', avgPrice: Math.round(base * 0.95) },
      { month: 'Aug', avgPrice: Math.round(base * 0.82) },
      { month: 'Sep', avgPrice: Math.round(base * 0.80) },
      { month: 'Oct', avgPrice: Math.round(base * 1.02) },
      { month: 'Nov', avgPrice: Math.round(base * 1.15) },
      { month: 'Dec', avgPrice: Math.round(base * 1.35) }
    ],
    leadTimeAnalysis: [
      { daysBefore: 30, avgPrice: Math.round(base * 0.90) },
      { daysBefore: 21, avgPrice: Math.round(base * 0.92) },
      { daysBefore: 14, avgPrice: Math.round(base * 0.98) },
      { daysBefore: 7, avgPrice: Math.round(base * 1.18) },
      { daysBefore: 3, avgPrice: Math.round(base * 1.38) },
      { daysBefore: 1, avgPrice: Math.round(base * 1.55) }
    ]
  };

  res.json(insights);
});

// Tracked Routes APIs
app.get('/api/tracked', (req, res) => {
  res.json(trackedRoutesStore);
});

app.post('/api/tracked', (req, res) => {
  const { origin, destination, targetPrice, cabinClass } = req.body;
  const base = getBaseRoutePrice(origin, destination);
  const newRoute = {
    id: 'trk_' + Date.now(),
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    targetPrice: Number(targetPrice) || base,
    currentPrice: base,
    lowestPriceSeen: Math.round(base * 0.95),
    highestPriceSeen: Math.round(base * 1.2),
    lastChecked: new Date().toISOString(),
    isPaused: false,
    cabinClass: cabinClass || 'Economy',
    alertsEnabled: true
  };
  trackedRoutesStore.push(newRoute);
  res.json({ success: true, route: newRoute });
});

app.delete('/api/tracked/:id', (req, res) => {
  const { id } = req.params;
  trackedRoutesStore = trackedRoutesStore.filter(r => r.id !== id);
  res.json({ success: true });
});

// User Preferences API
app.get('/api/profile/preferences', (req, res) => {
  res.json(userPreferencesStore);
});

app.put('/api/profile/preferences', (req, res) => {
  userPreferencesStore = { ...userPreferencesStore, ...req.body };
  res.json({ success: true, preferences: userPreferencesStore });
});

// Gemini AI Travel Assistant Advice API
app.post('/api/ai/advice', async (req, res) => {
  const { origin, destination, date } = req.body;
  if (!aiClient) {
    return res.json({
      advice: `Based on historical airfare patterns for ${origin} to ${destination}, booking 14 days in advance yields the best pricing stability. Consider traveling on Tuesday or Wednesday for up to 15% lower fares.`
    });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide expert concise airfare booking advice for a flight from ${origin} to ${destination} on ${date}. Give actionable tips on best days to fly, optimal lead time, and price expectations in INR. Keep it under 4 sentences.`
    });
    res.json({ advice: response.text });
  } catch (err) {
    console.error('Gemini error:', err);
    res.json({
      advice: `Book your ${origin} to ${destination} journey at least two weeks ahead. Mid-week departures consistently offer the most competitive fares in the Indian market.`
    });
  }
});

// Vite middleware integration in development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false }
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`FPPS Server running on port ${PORT}`);
});
