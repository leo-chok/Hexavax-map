import { GeoJsonLayer } from "@deck.gl/layers";

/**
 * Build GeoJson view overlay layers (national / regional / departmental).
 *
 * @param {Object} opts
 * @param {Object|null} opts.viewGeojson - GeoJSON to draw for the selected view
 * @param {string} opts.viewMode - one of 'national'|'regional'|'departmental'|'domtom'
 * @returns {Array} deck.gl layers
 */
export function createViewLayers({
  viewGeojson = null,
  viewMode = "national",
  onAreaClick = null,
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
      // keep a faint fill so clicks register for the whole polygon
      filled: true,
      // fill color using same hue (#6E6BF3) with low opacity (~10%)
      getFillColor: [110, 107, 243, 1],
      extruded: false,
      // vivid pink/violet stroke
      // stroke color #6E6BF3
      getLineColor: [110, 107, 243],
      lineWidthMinPixels: 2,
      getLineWidth: 1,
      // forward clicks from the view layer
      onClick: ({ object }) => {
        if (onAreaClick && object) onAreaClick(object);
      },
      // ensure the layer updates when the geojson or view mode changes
      updateTriggers: {
        data: [viewGeojson],
      },
    })
  );

  return layers;
}
