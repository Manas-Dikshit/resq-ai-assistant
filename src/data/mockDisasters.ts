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
  { id: '1', type: 'flood', title: 'Mahanadi River Flooding - Cuttack', lat: 20.4625, lng: 85.8828, severity: 0.88, description: 'Mahanadi river breached embankments near Naraj barrage, low-lying areas submerged', timestamp: '2026-02-14T04:00Z', affected: 75000 },
  { id: '2', type: 'storm', title: 'Cyclone Warning - Puri Coast', lat: 19.8135, lng: 85.8312, severity: 0.92, description: 'Deep depression in Bay of Bengal intensifying, landfall expected near Puri within 48 hrs', timestamp: '2026-02-14T02:00Z', affected: 250000 },
  { id: '3', type: 'flood', title: 'Brahmani River Overflow - Jajpur', lat: 20.8372, lng: 86.3275, severity: 0.71, description: 'Brahmani river above danger level at Akhuapada, 50 villages affected', timestamp: '2026-02-14T06:00Z', affected: 32000 },
  { id: '4', type: 'flood', title: 'Waterlogging - Bhubaneswar', lat: 20.2961, lng: 85.8245, severity: 0.55, description: 'Heavy rainfall causing urban flooding in low-lying areas of Bhubaneswar', timestamp: '2026-02-14T08:00Z', affected: 15000 },
  { id: '5', type: 'storm', title: 'Lightning Alert - Mayurbhanj', lat: 21.9371, lng: 86.7379, severity: 0.48, description: 'Severe thunderstorm with lightning activity across Mayurbhanj district', timestamp: '2026-02-14T07:00Z', affected: 8000 },
  { id: '6', type: 'fire', title: 'Forest Fire - Similipal', lat: 21.8282, lng: 86.3740, severity: 0.63, description: 'Forest fire detected in Similipal National Park, spread over 200 hectares', timestamp: '2026-02-14T05:00Z', affected: 500 },
];

export const mockShelters: Shelter[] = [
  { id: 's1', name: 'Cuttack Indoor Stadium Shelter', lat: 20.4686, lng: 85.8918, capacity: 2000, occupancy: 1450 },
  { id: 's2', name: 'Puri Jagannath Temple Complex', lat: 19.8048, lng: 85.8177, capacity: 5000, occupancy: 2800 },
  { id: 's3', name: 'OSDMA HQ - Bhubaneswar', lat: 20.2756, lng: 85.8214, capacity: 800, occupancy: 200 },
  { id: 's4', name: 'Jajpur Collectorate Relief Camp', lat: 20.8507, lng: 86.3386, capacity: 1500, occupancy: 980 },
];

export const mockRiskPredictions: RiskPrediction[] = [
  { region: 'Coastal Odisha (Puri, Jagatsinghpur, Kendrapara)', flood_risk: 0.89, quake_risk: 0.05, fire_risk: 0.03, timestamp: '2026-02-15T10:00Z' },
  { region: 'Central Odisha (Cuttack, Dhenkanal, Angul)', flood_risk: 0.76, quake_risk: 0.08, fire_risk: 0.12, timestamp: '2026-02-15T10:00Z' },
  { region: 'Western Odisha (Balangir, Bargarh, Sambalpur)', flood_risk: 0.62, quake_risk: 0.10, fire_risk: 0.18, timestamp: '2026-02-15T10:00Z' },
  { region: 'Northern Odisha (Mayurbhanj, Keonjhar)', flood_risk: 0.45, quake_risk: 0.15, fire_risk: 0.55, timestamp: '2026-02-15T10:00Z' },
];

export const getDisasterColor = (type: DisasterEvent['type']) => {
  switch (type) {
    case 'flood': return '#3b82f6';
    case 'fire': return '#f97316';
    case 'earthquake': return '#a855f7';
    case 'storm': return '#ef4444';
  }
};
