import { DisasterEvent, Shelter, RiskPrediction } from "./mockDisasters";

// Odisha districts and key locations
export const ODISHA_CENTER = { lat: 20.9517, lng: 85.0985 };
export const ODISHA_ZOOM = 7;

export const odishaDisasters: DisasterEvent[] = [
  { id: 'od1', type: 'flood', title: 'Mahanadi River Flooding - Cuttack', lat: 20.4625, lng: 85.8828, severity: 0.88, description: 'Mahanadi river breached embankments near Naraj barrage, low-lying areas submerged', timestamp: '2026-02-14T04:00Z', affected: 75000 },
  { id: 'od2', type: 'storm', title: 'Cyclone Warning - Puri Coast', lat: 19.8135, lng: 85.8312, severity: 0.92, description: 'Deep depression in Bay of Bengal intensifying, landfall expected near Puri within 48 hrs', timestamp: '2026-02-14T02:00Z', affected: 250000 },
  { id: 'od3', type: 'flood', title: 'Brahmani River Overflow - Jajpur', lat: 20.8372, lng: 86.3275, severity: 0.71, description: 'Brahmani river above danger level at Akhuapada, 50 villages affected', timestamp: '2026-02-14T06:00Z', affected: 32000 },
  { id: 'od4', type: 'flood', title: 'Waterlogging - Bhubaneswar', lat: 20.2961, lng: 85.8245, severity: 0.55, description: 'Heavy rainfall causing urban flooding in low-lying areas of Bhubaneswar', timestamp: '2026-02-14T08:00Z', affected: 15000 },
  { id: 'od5', type: 'storm', title: 'Lightning Alert - Mayurbhanj', lat: 21.9371, lng: 86.7379, severity: 0.48, description: 'Severe thunderstorm with lightning activity across Mayurbhanj district', timestamp: '2026-02-14T07:00Z', affected: 8000 },
  { id: 'od6', type: 'fire', title: 'Forest Fire - Similipal', lat: 21.8282, lng: 86.3740, severity: 0.63, description: 'Forest fire detected in Similipal National Park, spread over 200 hectares', timestamp: '2026-02-14T05:00Z', affected: 500 },
  { id: 'od7', type: 'earthquake', title: 'Minor Tremor - Boudh', lat: 20.5831, lng: 84.3200, severity: 0.25, description: 'M3.2 earthquake detected near Boudh, no structural damage reported', timestamp: '2026-02-14T09:00Z', affected: 1200 },
  { id: 'od8', type: 'flood', title: 'Tel River Surge - Balangir', lat: 20.7172, lng: 83.4847, severity: 0.67, description: 'Tel river water level rising rapidly due to upstream rainfall', timestamp: '2026-02-14T03:00Z', affected: 22000 },
];

export const odishaShelters: Shelter[] = [
  { id: 'os1', name: 'Cuttack Indoor Stadium Shelter', lat: 20.4686, lng: 85.8918, capacity: 2000, occupancy: 1450 },
  { id: 'os2', name: 'Puri Jagannath Temple Complex', lat: 19.8048, lng: 85.8177, capacity: 5000, occupancy: 2800 },
  { id: 'os3', name: 'OSDMA HQ - Bhubaneswar', lat: 20.2756, lng: 85.8214, capacity: 800, occupancy: 200 },
  { id: 'os4', name: 'Jajpur Collectorate Relief Camp', lat: 20.8507, lng: 86.3386, capacity: 1500, occupancy: 980 },
  { id: 'os5', name: 'Balasore Cyclone Shelter', lat: 21.4934, lng: 86.9389, capacity: 3000, occupancy: 450 },
  { id: 'os6', name: 'Kendrapara Flood Shelter', lat: 20.5020, lng: 86.4223, capacity: 1200, occupancy: 890 },
  { id: 'os7', name: 'Paradip Port Emergency Center', lat: 20.3165, lng: 86.6115, capacity: 2500, occupancy: 600 },
  { id: 'os8', name: 'Sambalpur University Shelter', lat: 21.4726, lng: 83.9744, capacity: 1000, occupancy: 150 },
  { id: 'os9', name: 'Berhampur Town Hall Shelter', lat: 19.3150, lng: 84.7941, capacity: 1800, occupancy: 320 },
  { id: 'os10', name: 'Rourkela Steel City Relief', lat: 22.2604, lng: 84.8536, capacity: 2200, occupancy: 180 },
];

export const odishaRiskPredictions: RiskPrediction[] = [
  { region: 'Coastal Odisha (Puri, Jagatsinghpur, Kendrapara)', flood_risk: 0.89, quake_risk: 0.05, fire_risk: 0.03, timestamp: '2026-02-15T10:00Z' },
  { region: 'Central Odisha (Cuttack, Dhenkanal, Angul)', flood_risk: 0.76, quake_risk: 0.08, fire_risk: 0.12, timestamp: '2026-02-15T10:00Z' },
  { region: 'Western Odisha (Balangir, Bargarh, Sambalpur)', flood_risk: 0.62, quake_risk: 0.10, fire_risk: 0.18, timestamp: '2026-02-15T10:00Z' },
  { region: 'Northern Odisha (Mayurbhanj, Keonjhar)', flood_risk: 0.45, quake_risk: 0.15, fire_risk: 0.55, timestamp: '2026-02-15T10:00Z' },
  { region: 'Southern Odisha (Ganjam, Gajapati, Koraput)', flood_risk: 0.58, quake_risk: 0.12, fire_risk: 0.22, timestamp: '2026-02-15T10:00Z' },
];

// District-wise analytics data for charts
export const districtAnalytics = [
  { district: 'Cuttack', floods: 12, storms: 3, fires: 1, earthquakes: 0, affected: 75000, shelterCapacity: 2000 },
  { district: 'Puri', floods: 8, storms: 7, fires: 0, earthquakes: 0, affected: 250000, shelterCapacity: 5000 },
  { district: 'Jajpur', floods: 15, storms: 2, fires: 0, earthquakes: 1, affected: 32000, shelterCapacity: 1500 },
  { district: 'Bhubaneswar', floods: 6, storms: 4, fires: 2, earthquakes: 0, affected: 15000, shelterCapacity: 800 },
  { district: 'Mayurbhanj', floods: 3, storms: 5, fires: 4, earthquakes: 2, affected: 8000, shelterCapacity: 1200 },
  { district: 'Balangir', floods: 9, storms: 1, fires: 1, earthquakes: 0, affected: 22000, shelterCapacity: 1000 },
  { district: 'Kendrapara', floods: 18, storms: 6, fires: 0, earthquakes: 0, affected: 45000, shelterCapacity: 1200 },
  { district: 'Ganjam', floods: 7, storms: 8, fires: 3, earthquakes: 1, affected: 38000, shelterCapacity: 1800 },
  { district: 'Balasore', floods: 5, storms: 9, fires: 1, earthquakes: 0, affected: 28000, shelterCapacity: 3000 },
  { district: 'Koraput', floods: 4, storms: 2, fires: 6, earthquakes: 3, affected: 12000, shelterCapacity: 900 },
];

// Monthly disaster trend data
export const monthlyTrends = [
  { month: 'Jan', floods: 2, storms: 0, fires: 3, earthquakes: 1, totalAffected: 5000 },
  { month: 'Feb', floods: 1, storms: 0, fires: 4, earthquakes: 0, totalAffected: 3000 },
  { month: 'Mar', floods: 0, storms: 1, fires: 6, earthquakes: 1, totalAffected: 4500 },
  { month: 'Apr', floods: 1, storms: 2, fires: 8, earthquakes: 0, totalAffected: 8000 },
  { month: 'May', floods: 3, storms: 4, fires: 5, earthquakes: 1, totalAffected: 25000 },
  { month: 'Jun', floods: 8, storms: 3, fires: 1, earthquakes: 0, totalAffected: 65000 },
  { month: 'Jul', floods: 15, storms: 5, fires: 0, earthquakes: 1, totalAffected: 180000 },
  { month: 'Aug', floods: 18, storms: 4, fires: 0, earthquakes: 0, totalAffected: 220000 },
  { month: 'Sep', floods: 12, storms: 6, fires: 1, earthquakes: 1, totalAffected: 150000 },
  { month: 'Oct', floods: 6, storms: 8, fires: 2, earthquakes: 0, totalAffected: 95000 },
  { month: 'Nov', floods: 3, storms: 3, fires: 1, earthquakes: 1, totalAffected: 30000 },
  { month: 'Dec', floods: 1, storms: 1, fires: 2, earthquakes: 0, totalAffected: 8000 },
];

// Shelter utilization data
export const shelterUtilization = odishaShelters.map(s => ({
  name: s.name.replace(' Shelter', '').replace(' Relief Camp', '').replace(' Emergency Center', ''),
  capacity: s.capacity,
  occupancy: s.occupancy,
  utilization: Math.round((s.occupancy / s.capacity) * 100),
}));

// Risk prediction history (for trend analysis)
export const riskHistory = [
  { date: 'Feb 8', floodRisk: 0.45, cycloneRisk: 0.20, fireRisk: 0.15 },
  { date: 'Feb 9', floodRisk: 0.52, cycloneRisk: 0.25, fireRisk: 0.12 },
  { date: 'Feb 10', floodRisk: 0.61, cycloneRisk: 0.35, fireRisk: 0.10 },
  { date: 'Feb 11', floodRisk: 0.68, cycloneRisk: 0.55, fireRisk: 0.08 },
  { date: 'Feb 12', floodRisk: 0.75, cycloneRisk: 0.72, fireRisk: 0.06 },
  { date: 'Feb 13', floodRisk: 0.82, cycloneRisk: 0.85, fireRisk: 0.05 },
  { date: 'Feb 14', floodRisk: 0.89, cycloneRisk: 0.92, fireRisk: 0.03 },
];
