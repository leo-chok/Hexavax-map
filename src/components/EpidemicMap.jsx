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
  showVulnerablePopulation = false,
  showVaccineLogistics = false,
  vulnerablePopulationData = null,
  vaccineLogisticsData = null,
  departmentsGeojson = null,
  viewGeojson = null,
  viewMode = "national",
  domTomCoords = null,
  onAreaClick = null,
  onWarehouseClick = null,
  areaTimeseries = {},
  currentDate = null,
}) {
  const lastUpdateRef = useRef(0);

  const [zoom, setZoom] = useState(VIEW_STATES.national.zoom);
  const [isMapTransitioning, setIsMapTransitioning] = useState(false);

  // Forcer le rerender de DeckGL quand viewMode ou domTomCoords changent
  const [viewKey, setViewKey] = useState(0);

  useEffect(() => {
    // Bloquer le rendu des layers pendant la transition
    setIsMapTransitioning(true);
    setViewKey(prev => prev + 1);
    
    if (domTomCoords) {
      setZoom(domTomCoords.zoom);
    } else {
      setZoom(VIEW_STATES[viewMode]?.zoom || 5);
    }

    // Attendre que la carte soit stable avant de redessiner les layers
    const timer = setTimeout(() => {
      setIsMapTransitioning(false);
    }, 800); // 800ms pour laisser la transition Mapbox se terminer

    return () => clearTimeout(timer);
  }, [viewMode, domTomCoords]);

  // compute scaling based on zoom
  const { radiusMeters, elevationMultiplier, heatmapRadiusPixels } = useViewScaling(zoom);

  const scaling = useMemo(
    () => ({ radiusMeters, elevationMultiplier, heatmapRadiusPixels }),
    [radiusMeters, elevationMultiplier, heatmapRadiusPixels]
  );

  const layers = useMemo(() => {
    // Ne pas créer de layers pendant la transition de la carte
    if (isMapTransitioning) {
      return [];
    }
    
    return createLayers({
      points,
      hospitals,
      pharmacies,
      viewGeojson,
      viewMode,
      onAreaClick,
      onWarehouseClick,
      showHeatmap,
      showHospitals,
      showPharmacies,
      showVulnerablePopulation,
      showVaccineLogistics,
      vulnerablePopulationData,
      vaccineLogisticsData,
      departmentsGeojson,
      scaling,
      zoom,
      areaTimeseries,
      currentDate,
    });
  },
    // depend on counts + flags + scaling values to avoid deep comparisons
    [
      points?.length,
      hospitals?.length,
      pharmacies?.length,
      showHeatmap,
      showHospitals,
      showPharmacies,
      showVulnerablePopulation,
      showVaccineLogistics,
      vulnerablePopulationData,
      vaccineLogisticsData,
      departmentsGeojson,
      scaling.radiusMeters,
      scaling.elevationMultiplier,
      scaling.heatmapRadiusPixels,
      viewMode,
      onAreaClick,
      onWarehouseClick,
      (viewGeojson && viewGeojson.features) ? viewGeojson.features.length : 0,
      zoom,
      areaTimeseries,
      currentDate,
      isMapTransitioning, // Ajouter la dépendance pour recalculer quand la transition se termine
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
      getTooltip={(info) => getTooltipContent({ 
        ...info, 
        viewMode, 
        pharmacies, 
        areaTimeseries, 
        currentDate,
        vulnerablePopulationData
      })}
    >
      <Map
        reuseMaps
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle || "mapbox://styles/leostalh/cmhgd1781007n01sd9pqldwnn"}
      />
    </DeckGL>
  );
}
