import { GeoJsonLayer } from "@deck.gl/layers";

/**
 * Helper: interpolate color based on ICU occupancy percentage
 * @param {number} occupancy - ICU occupancy percentage (0-100)
 * @returns {Array} RGBA color [r, g, b, a]
 */
function getColorFromOccupancy(occupancy) {
  if (occupancy == null) return [110, 107, 243, 10]; // Default color with low opacity
  
  // Green → Yellow → Orange → Red scale
  if (occupancy < 50) {
    // Green zone (low occupancy)
    return [46, 204, 113, 80]; // #2ecc71
  } else if (occupancy < 70) {
    // Yellow zone (moderate)
    return [241, 196, 15, 100]; // #f1c40f
  } else if (occupancy < 80) {
    // Orange zone (high)
    return [230, 126, 34, 120]; // #e67e22
  } else {
    // Red zone (critical)
    return [231, 76, 60, 150]; // #e74c3c
  }
}

/**
 * Build GeoJson view overlay layers (national / regional / departmental).
 *
 * @param {Object} opts
 * @param {Object|null} opts.viewGeojson - GeoJSON to draw for the selected view
 * @param {string} opts.viewMode - one of 'national'|'regional'|'departmental'|'domtom'
 * @param {Object} opts.areaTimeseries - Timeseries data for areas (departments/regions)
 * @param {string} opts.currentDate - Current date for timeseries lookup
 * @returns {Array} deck.gl layers
 */
export function createViewLayers({
  viewGeojson = null,
  viewMode = "national",
  onAreaClick = null,
  areaTimeseries = {},
  currentDate = null,
} = {}) {
  const layers = [];

  if (!viewGeojson) return layers;

  // Use a slightly different id per mode so updates are tracked cleanly
  const id = `view-layer-${viewMode}`;

  layers.push(
    new GeoJsonLayer({
      id,
      data: viewGeojson,
      pickable: true,
      stroked: true,
      filled: true,
      getFillColor: (feature) => {
        if (!currentDate || !areaTimeseries[currentDate]) {
          return [110, 107, 243, 25]; // Default color
        }

        const props = feature.properties || {};
        let areaData = null;

        if (viewMode === "departmental" || viewMode === "domtom") {
          // Match by department code
          const code = props.code || props.CODE || props.cod_dep || props.COD_DEP;
          if (code) {
            const codeStr = String(code);
            // Essayer directement le code
            areaData = areaTimeseries[currentDate][codeStr];
            
            // Si pas trouvé, essayer sans les zéros initiaux
            if (!areaData) {
              const numCode = String(Number(codeStr.replace(/^0+/, "")));
              areaData = areaTimeseries[currentDate][numCode];
            }
          }
        } else if (viewMode === "regional") {
          // Match by region name
          const regionName = props.nom || props.name || props.NOM || props.LIBELLE;
          if (regionName) {
            areaData = areaTimeseries[currentDate][regionName];
          }
        }

        if (areaData && areaData.icu_occupancy_pct != null) {
          return getColorFromOccupancy(areaData.icu_occupancy_pct);
        }

        return [110, 107, 243, 25]; // Default color
      },
      extruded: false,
      getLineColor: [110, 107, 243],
      lineWidthMinPixels: 2,
      getLineWidth: 1,
      onClick: ({ object }) => {
        if (onAreaClick && object) onAreaClick(object);
      },
      updateTriggers: {
        getFillColor: [currentDate],
      },
    })
  );

  return layers;
}
