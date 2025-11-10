import React, { useMemo, useState, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import useViewScaling from "./EpidemicMap/hooks/useViewScaling";
import { createLayers } from "./EpidemicMap/createLayers";
import { getTooltipContent } from "./EpidemicMap/tooltip";
// 🔑 Mapbox token (depuis .env)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// 🎯 Vue initiale centrée sur la France
const INITIAL_VIEW_STATE = {
  longitude: 2.5,
  latitude: 46.5,
  zoom: 5,
  pitch: 20,
  bearing: 0,
};

export default function EpidemicMap({
  points = [],
  hospitals = [],
  pharmacies = [],
  mapStyle,
  showHeatmap = true,
  showHospitals = true,
  showPharmacies = true,
  departments = null,
  showDepartments = false,
  onDepartmentClick = null,
  departmentsStatsMap = {},
  viewGeojson = null,
  viewMode = "national",
  onAreaClick = null,
}) {
  const lastUpdateRef = useRef(0);

  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);

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
      departments,
      departmentsStatsMap,
      viewGeojson,
      viewMode,
      onAreaClick,
      showHeatmap,
      showHospitals,
      showPharmacies,
      showDepartments,
      onDepartmentClick,
      scaling,
    }),
    // depend on counts + flags + scaling values to avoid deep comparisons
    [
      points?.length,
      hospitals?.length,
      pharmacies?.length,
      (departments && departments.features)?.length,
      Object.keys(departmentsStatsMap || {}).length,
      showHeatmap,
      showHospitals,
      showPharmacies,
      showDepartments,
      onDepartmentClick,
      scaling.radiusMeters,
      scaling.elevationMultiplier,
      scaling.heatmapRadiusPixels,
      viewMode,
      onAreaClick,
      (viewGeojson && viewGeojson.features) ? viewGeojson.features.length : 0,
    ]
  );

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      onViewStateChange={({ viewState }) => {
        const now = Date.now();
        if (now - lastUpdateRef.current > 120) {
          lastUpdateRef.current = now;
          setZoom(viewState.zoom);
        }
      }}
      // show pointer cursor when hovering pickable layers (indicates clickable)
      getCursor={({ isHovering }) => (isHovering ? "pointer" : "default")}
      controller={true}
  layers={layers}
  getTooltip={(info) => getTooltipContent({ ...info, viewMode })}
    >
      <Map
        reuseMaps
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle || "mapbox://styles/leostalh/cmhgd1781007n01sd9pqldwnn"}
      />
    </DeckGL>
  );
}
