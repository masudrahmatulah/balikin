/**
 * Map configuration and utilities for Crowdsourced Map feature
 */

export interface MapMarker {
  id: string;
  locationName: string;
  locationType: string;
  cityName: string;
  lostItemType: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Indonesia region bounding boxes for initial map view
 */
export const INDONESIA_REGIONS: Record<string, { center: [number, number]; zoom: number }> = {
  jakarta: { center: [-6.2088, 106.8456], zoom: 10 },
  bandung: { center: [-6.9175, 107.6191], zoom: 11 },
  surabaya: { center: [-7.2575, 112.7521], zoom: 11 },
  yogyakarta: { center: [-7.7956, 110.3695], zoom: 11 },
  semarang: { center: [-6.9667, 110.4167], zoom: 11 },
  medan: { center: [3.5952, 98.6722], zoom: 11 },
  makassar: { center: [-5.1477, 119.4328], zoom: 11 },
  denpasar: { center: [-8.6705, 115.2126], zoom: 11 },
  default: { center: [-2.5489, 118.0149], zoom: 5 }, // Indonesia center
};

/**
 * Get map configuration for a region
 */
export function getMapConfig(regionId?: string) {
  const key = regionId?.toLowerCase() || 'default';
  return INDONESIA_REGIONS[key in INDONESIA_REGIONS ? key : 'default'];
}

/**
 * Location types with colors for markers
 */
export const LOCATION_TYPE_COLORS: Record<string, string> = {
  parkiran: '#ef4444',
  kafe: '#f59e0b',
  stasiun: '#10b981',
  terminal: '#3b82f6',
  pasar: '#8b5cf6',
  mall: '#ec4899',
  lainnya: '#6b7280',
};

/**
 * Get color for a location type
 */
export function getLocationTypeColor(locationType: string): string {
  const key = locationType.toLowerCase();
  return LOCATION_TYPE_COLORS[key in LOCATION_TYPE_COLORS ? key : 'lainnya'];
}
