import { useMemo } from "react";

const INITIAL_ZOOM = 5;

export default function useViewScaling(zoom) {
  return useMemo(() => {
    const baseRadius = 1500;
    const baseExtrusion = 6000;
    const baseHeatmapPixels = 100;
    const scale = Math.pow(1.25, INITIAL_ZOOM - (typeof zoom === "number" ? zoom : INITIAL_ZOOM));


  const baseRadiusMultiplier = 8;
  const baseExtrusionMultiplier = 4;
  const levelsOut = Math.max(0, Math.ceil(INITIAL_ZOOM - (typeof zoom === "number" ? zoom : INITIAL_ZOOM)));
  const radiusZoomMultiplier = Math.min(30, baseRadiusMultiplier * (1 + levelsOut));
  const extrusionZoomMultiplier = Math.min(12, baseExtrusionMultiplier * (1 + levelsOut));

  const radiusMeters = Math.max(600, Math.round(baseRadius * scale * radiusZoomMultiplier));
  const elevationMultiplier = Math.max(50, Math.round(baseExtrusion * scale * extrusionZoomMultiplier));
    const heatmapRadiusPixels = Math.max(8, Math.round(baseHeatmapPixels * scale));

    return { radiusMeters, elevationMultiplier, heatmapRadiusPixels };
  }, [zoom]);
}
