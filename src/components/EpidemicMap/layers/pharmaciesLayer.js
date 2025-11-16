import { HexagonLayer } from "@deck.gl/aggregation-layers";
import { ScatterplotLayer } from "@deck.gl/layers";

/**
 * Palette de couleurs pour les pharmacies selon le stock de doses
 * Vert = beaucoup de doses (positif), Rouge = peu de doses (critique)
 */
const PHARMACY_COLOR_RANGE = [
  [220, 45, 45],    // Rouge foncé (très peu de doses)
  [250, 100, 60],   // Orange-rouge
  [250, 160, 60],   // Orange
  [220, 200, 80],   // Jaune-vert
  [120, 200, 80],   // Vert clair
  [46, 204, 113],   // Vert (beaucoup de doses)
];

/**
 * Seuil de zoom pour basculer entre clustering (HexagonLayer) et points individuels (ScatterplotLayer)
 */
const ZOOM_THRESHOLD = 8;

/**
 * Calcule la couleur d'une pharmacie selon son stock
 * @param {number} stock - Stock de doses
 * @returns {Array} Couleur RGBA
 */
function getPharmacyColor(stock) {
  if (stock > 250) return [46, 204, 113, 200];      // Vert
  if (stock > 150) return [120, 200, 80, 200];      // Vert clair
  if (stock > 100) return [220, 200, 80, 200];      // Jaune
  if (stock > 50) return [250, 160, 60, 200];       // Orange
  return [220, 45, 45, 200];                        // Rouge
}

/**
 * Calcule le radius dynamique pour le HexagonLayer selon le zoom
 * @param {number} zoom - Niveau de zoom actuel
 * @returns {number} Radius en mètres
 */
function calculatePharmacyRadius(zoom) {
  return Math.max(8, 500000 / Math.pow(4, zoom / 2));
}

/**
 * Crée le layer HexagonLayer pour pharmacies (mode clustering)
 * @param {Array} pharmacies - Données des pharmacies
 * @param {number} zoom - Niveau de zoom actuel
 * @returns {HexagonLayer} Layer hexagonal avec agrégation
 */
function createPharmacyHexagonLayer(pharmacies, zoom) {
  const radius = calculatePharmacyRadius(zoom);

  return new HexagonLayer({
    id: "pharmacies-hexagon-layer",
    data: pharmacies,
    pickable: true,
    extruded: true,
    radius,
    elevationScale: 60,
    getPosition: (d) => [d.lon, d.lat],
    getElevationWeight: (d) => Number(d.stock_doses || d.doses) || 0,
    elevationAggregation: 'SUM',
    getColorWeight: (d) => Number(d.stock_doses || d.doses) || 0,
    colorAggregation: 'SUM',
    colorRange: PHARMACY_COLOR_RANGE,
    getLineColor: [20, 60, 40, 255],
    lineWidthMinPixels: 1,
    material: true,
  });
}

/**
 * Crée le layer ScatterplotLayer pour pharmacies (mode points individuels)
 * @param {Array} pharmacies - Données des pharmacies
 * @returns {ScatterplotLayer} Layer avec points individuels
 */
function createPharmacyScatterLayer(pharmacies) {
  return new ScatterplotLayer({
    id: "pharmacies-scatter-layer",
    data: pharmacies,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 20,
    radiusMaxPixels: 50,
    lineWidthMinPixels: 1,
    getPosition: (d) => [d.lon, d.lat],
    getRadius: (d) => {
      const stock = Number(d.stock_doses || d.doses) || 0;
      return Math.max(50, Math.min(500, stock));
    },
    getFillColor: (d) => {
      const stock = Number(d.stock_doses || d.doses) || 0;
      return getPharmacyColor(stock);
    },
    getLineColor: [255, 255, 255, 100],
  });
}

/**
 * Crée le layer pharmacies adaptatif selon le zoom
 * - Zoom < 8 : HexagonLayer (clustering pour vue large)
 * - Zoom >= 8 : ScatterplotLayer (points individuels pour vue détaillée)
 * 
 * @param {Object} options - Configuration du layer
 * @param {Array} options.pharmacies - Données des pharmacies
 * @param {number} options.zoom - Niveau de zoom actuel
 * @returns {HexagonLayer|ScatterplotLayer|null} Le layer pharmacies ou null si pas de données
 */
export function createPharmaciesLayer({ pharmacies = [], zoom = 5 }) {
  if (!pharmacies || pharmacies.length === 0) return null;

  // Switch entre clustering et points individuels selon le zoom
  if (zoom < ZOOM_THRESHOLD) {
    return createPharmacyHexagonLayer(pharmacies, zoom);
  } else {
    return createPharmacyScatterLayer(pharmacies);
  }
}
