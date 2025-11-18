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
  showBudget = false,
  vulnerablePopulationData = null,
  vaccineLogisticsData = null,
  budgetDepartmentsData = null,
  departmentsGeojson = null,
  viewGeojson = null,
  viewMode = "national",
  domTomCoords = null,
  onAreaClick = null,
  onWarehouseClick = null,
  onBudgetClick = null,
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
      onBudgetClick,
      showHeatmap,
      showHospitals,
      showPharmacies,
      showVulnerablePopulation,
      showVaccineLogistics,
      showBudget,
      vulnerablePopulationData,
      vaccineLogisticsData,
      budgetDepartmentsData,
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
      showBudget,
      vulnerablePopulationData,
      vaccineLogisticsData,
      budgetDepartmentsData,
      departmentsGeojson,
      scaling.radiusMeters,
      scaling.elevationMultiplier,
      scaling.heatmapRadiusPixels,
      viewMode,
      onAreaClick,
      onWarehouseClick,
      onBudgetClick,
      (viewGeojson && viewGeojson.features) ? viewGeojson.features.length : 0,
      zoom,
      areaTimeseries,
      currentDate,
      isMapTransitioning,
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
      onHover={(info) => {
        // Throttle hover updates to max 60fps (every ~16ms)
        const now = Date.now();
        if (now - lastHoverUpdateRef.current < 16) {
          return;
        }
        lastHoverUpdateRef.current = now;

        if (info.object) {
          // Hover sur le budget layer
          if (info.layer?.id === "budget-layer-polygons") {
            const p = info.object.properties || {};
            const featureId = p.code || p.CODE || p.insee || p.INSEE || p.code_insee || p.COD_DEP || p.cod_dep || p.dep || p.DEP;
            setHoveredFeatureId(prev => prev !== featureId ? featureId : prev);
          }
          // Hover sur les view layers (national/regional/departmental)
          else if (info.layer?.id?.startsWith("view-layer-")) {
            const p = info.object.properties || {};
            const featureId = p.code || p.CODE || p.cod_dep || p.COD_DEP || p.insee || p.INSEE || p.nom || p.name || p.NOM || p.LIBELLE;
            setHoveredFeatureId(prev => prev !== featureId ? featureId : prev);
          }
        } else if (!info.object) {
          setHoveredFeatureId(prev => prev !== null ? null : prev);
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
