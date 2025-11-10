import { HeatmapLayer } from "@deck.gl/aggregation-layers";
import { PolygonLayer, ScatterplotLayer, GeoJsonLayer } from "@deck.gl/layers";
import { buildHex } from "./utils/geo";
import { bucketColor } from "./utils/colors";
import { color } from "@deck.gl/core";

export function createLayers({
  points = [],
  hospitals = [],
  pharmacies = [],
  departments = null,
  showHeatmap = false,
  showHospitals = false,
  showPharmacies = false,
  showDepartments = false,
  onDepartmentClick = null,
  scaling = { radiusMeters: 1500, elevationMultiplier: 6000, heatmapRadiusPixels: 100 },
}) {
  const layers = [];
  // If the caller passed a departmentsStatsMap in the options object, use it;
  // we avoid adding it directly to the destructured params to keep compatibility
  // with older parsers. Access via arguments[0].
  const departmentsStatsMapLocal = (arguments[0] && arguments[0].departmentsStatsMap) || {};

  if (showHeatmap && points && points.length) {
    layers.push(
      new HeatmapLayer({
        id: "heatmap-layer",
        data: points,
        getPosition: (d) => d.position,
        getWeight: (d) => Math.max(0, Math.min(1, d.weight / 100)),
        radiusPixels: scaling.heatmapRadiusPixels,
        intensity: 1.5,
        threshold: 0.01,
        pickable: true,
        opacity: 0.6,
      })
    );
  }

  if (showHospitals && hospitals && hospitals.length) {
    const polys = hospitals.map((h) => ({ ...h, polygon: buildHex(h.lon, h.lat, scaling.radiusMeters) }));
    layers.push(
      new PolygonLayer({
        id: "hospital-saturation",
        data: polys,
        extruded: true,
        pickable: true,
        wireframe: false,
        getPolygon: (d) => d.polygon,
        getElevation: (d) => (Number(d.saturation) || 0) / 100 * scaling.elevationMultiplier,
        getFillColor: (d) => bucketColor(d.saturation),
        getLineColor: [20, 20, 20],
        lineWidthMinPixels: 1,
      })
    );
  }

  if (showPharmacies && pharmacies && pharmacies.length) {
    layers.push(
      new ScatterplotLayer({
        id: "pharmacies-layer",
        data: pharmacies,
        getPosition: (d) => [d.lon, d.lat],
        getRadius: 1000,
        getFillColor: [46, 204, 113, 180],
        pickable: true,
        radiusMinPixels: 2,
        radiusMaxPixels: 6,
      })
    );
  }

  // Department KPI layer (GeoJSON)
  if (showDepartments && departments) {
    // Note: expect `departments` GeoJSON coordinates to already be in lon/lat (EPSG:4326).
    // If your source file is in a projected CRS (e.g. Lambert93 / EPSG:2154) please
    // reproject it to EPSG:4326 before using.
    // Use extruded GeoJson layer (blocks) for departments. Elevation is driven by
    // hospital saturation (saturation_pct) and color is driven by a critical_state
    // property. Accessors are robust to a few common property names.

    const readSaturation = (feature) => {
      const p = (feature && feature.properties) || {};
      const candidates = [p.saturation_pct, p.saturation, p.saturationPct, p.sat, p.SATURATION];
      for (const v of candidates) {
        if (v == null) continue;
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }

      // fallback: try to lookup by department code in the provided stats map
      try {
        const codeCandidates = [p.code, p.CODE, p.COD_DEP, p.cod_dep, p.insee, p.INSEE, p.code_insee, p.dep, p.DEP];
        for (const c of codeCandidates) {
          if (c == null) continue;
          const raw = String(c);
          const num = String(Number(raw.replace(/^0+/, "")));
          if (departmentsStatsMapLocal[num]) {
            const v = departmentsStatsMapLocal[num].saturation_pct ?? departmentsStatsMapLocal[num].saturation;
            if (v != null) return Number(v);
          }
          if (departmentsStatsMapLocal[raw]) {
            const v = departmentsStatsMapLocal[raw].saturation_pct ?? departmentsStatsMapLocal[raw].saturation;
            if (v != null) return Number(v);
          }
          if (departmentsStatsMapLocal[raw.toUpperCase()]) {
            const v = departmentsStatsMapLocal[raw.toUpperCase()].saturation_pct ?? departmentsStatsMapLocal[raw.toUpperCase()].saturation;
            if (v != null) return Number(v);
          }
          const padded = String(Number(raw)).padStart(2, "0");
          if (departmentsStatsMapLocal[padded]) {
            const v = departmentsStatsMapLocal[padded].saturation_pct ?? departmentsStatsMapLocal[padded].saturation;
            if (v != null) return Number(v);
          }
        }
      } catch (e) {}

      return null;
    };

    const readCritical = (feature) => {
      const p = (feature && feature.properties) || {};
      const cand = (p.critical_state || p.etat || p.etat_critique || p.critical || p.state || null);
      if (cand) return String(cand);

      // fallback to stats map
      try {
        const codeCandidates = [p.code, p.CODE, p.COD_DEP, p.cod_dep, p.insee, p.INSEE, p.code_insee, p.dep, p.DEP];
        for (const c of codeCandidates) {
          if (c == null) continue;
          const raw = String(c);
          const num = String(Number(raw.replace(/^0+/, "")));
          const s = departmentsStatsMapLocal[num] || departmentsStatsMapLocal[raw] || departmentsStatsMapLocal[raw.toUpperCase()] || departmentsStatsMapLocal[String(Number(raw)).padStart(2, "0")];
          if (s && (s.critical_state || s.etat || s.etat_critique || s.critical)) return String(s.critical_state || s.etat || s.etat_critique || s.critical);
        }
      } catch (e) {}

      return null;
    };

    const colorForCritical = (s) => {
      if (!s) return [150, 200, 255, 160];
      const lower = s.toLowerCase();
      if (lower.includes("élev") || lower.includes("elev") || lower.includes("haut") || lower.includes("fort")) return [220, 45, 45, 220];
      if (lower.includes("moy") || lower.includes("medium") || lower.includes("mod")) return [250, 160, 60, 200];
      if (lower.includes("faibl") || lower.includes("low")) return [70, 180, 100, 180];
      return [150, 200, 255, 160];
    };

    // getElevation: map saturation to three distinct extrusion heights
    // - Faible (sat < 33) -> 200
    // - Moyen (33 <= sat < 66) -> 1500
    // - Élevé (sat >= 66) -> 5000
    // If saturation is missing, return a small default (20)
    const getDeptElevation = (feature) => {
      const sat = readSaturation(feature);
      if (sat == null || Number.isNaN(sat)) return 20;
      const clamped = Math.max(0, Math.min(100, Number(sat)));
      if (clamped < 33) return 200;
      if (clamped < 66) return 3000;
      return 10000;
    };

    const getDeptFillColor = (feature) => {
      const crit = readCritical(feature);
      const base = colorForCritical(crit);
      // try to modulate alpha by saturation to show stronger saturation as more opaque
      const sat = readSaturation(feature);
      let alpha = base[3] != null ? base[3] : 180;
      if (sat != null && !Number.isNaN(Number(sat))) {
        const c = Math.max(0, Math.min(100, Number(sat)));
        // alpha range 80..255
        alpha = Math.round(80 + (c / 100) * (255 - 80));
      }
      return [base[0], base[1], base[2], alpha];
    };

    layers.push(
      new GeoJsonLayer({
        id: "departments-layer",
        data: departments,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        getElevation: (d) => getDeptElevation(d),
        getFillColor: (d) => getDeptFillColor(d),
        getLineColor: [40, 40, 40],
        lineWidthMinPixels: 1,
        getLineWidth: 1,
        onClick: ({ object }) => {
          if (onDepartmentClick && object) onDepartmentClick(object);
        },
        updateTriggers: {
          getElevation: [scaling.elevationMultiplier, departments, departmentsStatsMapLocal],
          getFillColor: [departments, departmentsStatsMapLocal],
        },
      })
    );
  }

  return layers;
}
