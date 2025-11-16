import { PolygonLayer } from "@deck.gl/layers";
import { buildHex } from "../utils/geo";
import { bucketColor } from "../utils/colors";

/**
 * Crée le layer des hôpitaux avec visualisation de la saturation
 * @param {Object} options - Configuration du layer
 * @param {Array} options.hospitals - Données des hôpitaux
 * @param {Object} options.scaling - Paramètres de scaling (radiusMeters, elevationMultiplier)
 * @returns {PolygonLayer|null} Le layer hôpitaux ou null si pas de données
 */
export function createHospitalsLayer({ hospitals = [], scaling = {} }) {
  if (!hospitals || hospitals.length === 0) return null;

  const polys = hospitals.map((h) => ({
    ...h,
    polygon: buildHex(h.lon, h.lat, scaling.radiusMeters || 1500),
  }));

  return new PolygonLayer({
    id: "hospital-saturation",
    data: polys,
    extruded: true,
    pickable: true,
    wireframe: false,
    getPolygon: (d) => d.polygon,
    getElevation: (d) =>
      ((Number(d.saturation) || 0) / 100) * (scaling.elevationMultiplier || 6000),
    getFillColor: (d) => bucketColor(d.saturation),
    getLineColor: [20, 20, 20],
    lineWidthMinPixels: 1,
  });
}
