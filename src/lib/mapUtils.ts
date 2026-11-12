/**
 * Helper to get the CARTO basemap tile URL with API key support.
 * Supports style: 'dark_all' | 'voyager' | 'light_all'
 */
export const getCartoTileUrl = (style: 'dark_all' | 'voyager' | 'light_all' = 'dark_all'): string => {
  const apiKey = import.meta.env.VITE_CARTO_API_KEY || 'cb1_57of_1_a5d620ac20f4a45274b58a4f';
  const keyParam = apiKey ? `?key=${apiKey}` : '';
  
  if (style === 'voyager') {
    return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${keyParam}`;
  }
  return `https://{s}.basemaps.cartocdn.com/${style}/{z}/{x}/{y}{r}.png${keyParam}`;
};

export const CARTO_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
