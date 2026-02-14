export interface DisasterEvent {
  id: string;
  type: 'flood' | 'fire' | 'earthquake' | 'storm';
  title: string;
  lat: number;
  lng: number;
  severity: number; // 0-1
  description: string;
  timestamp: string;
  affected: number;
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
}

export interface RiskPrediction {
  region: string;
  flood_risk: number;
  quake_risk: number;
  fire_risk: number;
  timestamp: string;
}

export const mockDisasters: DisasterEvent[] = [
  { id: '1', type: 'flood', title: 'Severe Flooding - Mumbai', lat: 19.076, lng: 72.8777, severity: 0.85, description: 'Heavy monsoon flooding across coastal districts', timestamp: '2026-02-14T08:00Z', affected: 45000 },
  { id: '2', type: 'earthquake', title: 'Earthquake - Tokyo Bay', lat: 35.6762, lng: 139.6503, severity: 0.62, description: 'M5.8 earthquake detected near Tokyo Bay', timestamp: '2026-02-14T06:30Z', affected: 12000 },
  { id: '3', type: 'fire', title: 'Wildfire - California', lat: 34.0522, lng: -118.2437, severity: 0.78, description: 'Fast-moving wildfire in Los Angeles county', timestamp: '2026-02-14T03:00Z', affected: 8500 },
  { id: '4', type: 'storm', title: 'Cyclone Alert - Bay of Bengal', lat: 13.0827, lng: 80.2707, severity: 0.91, description: 'Category 4 cyclone approaching eastern coast', timestamp: '2026-02-14T10:00Z', affected: 120000 },
  { id: '5', type: 'flood', title: 'River Overflow - Bangladesh', lat: 23.685, lng: 90.3563, severity: 0.73, description: 'Padma river breached embankments', timestamp: '2026-02-14T05:00Z', affected: 67000 },
  { id: '6', type: 'fire', title: 'Industrial Fire - Istanbul', lat: 41.0082, lng: 28.9784, severity: 0.45, description: 'Chemical plant fire with hazmat risk', timestamp: '2026-02-14T09:00Z', affected: 2000 },
];

export const mockShelters: Shelter[] = [
  { id: 's1', name: 'Mumbai Central Shelter', lat: 19.08, lng: 72.88, capacity: 500, occupancy: 340 },
  { id: 's2', name: 'Tokyo Emergency Center', lat: 35.68, lng: 139.66, capacity: 1200, occupancy: 450 },
  { id: 's3', name: 'LA Convention Center', lat: 34.04, lng: -118.27, capacity: 3000, occupancy: 1200 },
  { id: 's4', name: 'Chennai Relief Camp', lat: 13.09, lng: 80.28, capacity: 800, occupancy: 790 },
];

export const mockRiskPredictions: RiskPrediction[] = [
  { region: 'South Asia', flood_risk: 0.81, quake_risk: 0.12, fire_risk: 0.05, timestamp: '2026-02-15T10:00Z' },
  { region: 'East Asia', flood_risk: 0.35, quake_risk: 0.58, fire_risk: 0.08, timestamp: '2026-02-15T10:00Z' },
  { region: 'North America', flood_risk: 0.15, quake_risk: 0.22, fire_risk: 0.72, timestamp: '2026-02-15T10:00Z' },
  { region: 'Europe', flood_risk: 0.28, quake_risk: 0.08, fire_risk: 0.41, timestamp: '2026-02-15T10:00Z' },
];

export const getDisasterColor = (type: DisasterEvent['type']) => {
  switch (type) {
    case 'flood': return '#3b82f6';
    case 'fire': return '#f97316';
    case 'earthquake': return '#a855f7';
    case 'storm': return '#ef4444';
  }
};
