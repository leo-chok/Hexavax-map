import { HeatmapLayer } from "@deck.gl/aggregation-layers";

/**
 * Crée le layer heatmap pour visualiser les zones à risque
 * @param {Object} options - Configuration du layer
 * @param {Array} options.points - Points de données pour la heatmap
 * @param {Object} options.scaling - Paramètres de scaling (heatmapRadiusPixels)
 * @returns {HeatmapLayer|null} Le layer heatmap ou null si pas de données
 */
export function createHeatmapLayer({ points = [], scaling = {} }) {
  if (!points || points.length === 0) return null;

  return new HeatmapLayer({
    id: "heatmap-layer",
    data: points,
    getPosition: (d) => d.position,
    getWeight: (d) => Math.max(0, Math.min(1, d.weight / 100)),
    radiusPixels: scaling.heatmapRadiusPixels || 100,
    intensity: 1.5,
    threshold: 0.01,
    pickable: false,
    opacity: 0.6,
  });
}
