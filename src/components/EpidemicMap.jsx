import React, { useMemo, useState, useRef, useEffect } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import useViewScaling from "./EpidemicMap/hooks/useViewScaling";
import { createLayers } from "./EpidemicMap/layers";
import { getTooltipContent } from "./EpidemicMap/tooltip";
import { VIEW_STATES } from "../config/constants";

// 🔑 Mapbox token (depuis .env)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function EpidemicMap({
  points = [],
  hospitals = [],
  pharmacies = [],
  mapStyle,
  showHeatmap = true,
  showHospitals = true,
  showPharmacies = true,
  viewGeojson = null,
  viewMode = "national",
  domTomCoords = null,
  onAreaClick = null,
  areaTimeseries = {},
  currentDate = null,
}) {
  const lastUpdateRef = useRef(0);

  const [zoom, setZoom] = useState(VIEW_STATES.national.zoom);

  // Forcer le rerender de DeckGL quand viewMode ou domTomCoords changent
  const [viewKey, setViewKey] = useState(0);

  useEffect(() => {
    setViewKey(prev => prev + 1);
    if (domTomCoords) {
      setZoom(domTomCoords.zoom);
    } else {
      setZoom(VIEW_STATES[viewMode]?.zoom || 5);
    }
  }, [viewMode, domTomCoords]);

  // compute scaling based on zoom
  const { radiusMeters, elevationMultiplier, heatmapRadiusPixels } = useViewScaling(zoom);

  const scaling = useMemo(
    () => ({ radiusMeters, elevationMultiplier, heatmapRadiusPixels }),
    [radiusMeters, elevationMultiplier, heatmapRadiusPixels]
  );

  const layers = useMemo(() =>
    createLayers({
      points,
      hospitals,
      pharmacies,
      viewGeojson,
      viewMode,
      onAreaClick,
      showHeatmap,
      showHospitals,
      showPharmacies,
      scaling,
      zoom,
      areaTimeseries,
      currentDate,
    }),
    // depend on counts + flags + scaling values to avoid deep comparisons
    [
      points?.length,
      hospitals?.length,
      pharmacies?.length,
      showHeatmap,
      showHospitals,
      showPharmacies,
      scaling.radiusMeters,
      scaling.elevationMultiplier,
      scaling.heatmapRadiusPixels,
      viewMode,
      onAreaClick,
      (viewGeojson && viewGeojson.features) ? viewGeojson.features.length : 0,
      zoom,
      areaTimeseries,
      currentDate,
    ]
  );

  return (
    <DeckGL
      key={viewKey}
      initialViewState={domTomCoords || VIEW_STATES[viewMode] || VIEW_STATES.national}
      onViewStateChange={({ viewState: newViewState }) => {
        const now = Date.now();
        if (now - lastUpdateRef.current > 120) {
          lastUpdateRef.current = now;
          setZoom(newViewState.zoom);
        }
      }}
      // show pointer cursor when hovering pickable layers (indicates clickable)
      getCursor={({ isHovering }) => (isHovering ? "pointer" : "default")}
      controller={true}
      layers={layers}
      getTooltip={(info) => getTooltipContent({ ...info, viewMode, pharmacies })}
    >
      <Map
        reuseMaps
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle || "mapbox://styles/leostalh/cmhgd1781007n01sd9pqldwnn"}
      />
    </DeckGL>
  );
}
