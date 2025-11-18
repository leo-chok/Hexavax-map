import { createViewLayers } from "../createViewLayers";
import { createHeatmapLayer } from "./heatmapLayer";
import { createHospitalsLayer } from "./hospitalsLayer";
import { createPharmaciesLayer } from "./pharmaciesLayer";
import { createVulnerablePopulationLayer } from "./vulnerablePopulationLayer";
import { createVaccineLogisticsLayer } from "./vaccineLogisticsLayer";
import { createBudgetLayer } from "./budgetLayer";

/**
 * Point d'entrée principal pour la création de tous les layers deck.gl
 * Orchestre la création des différents layers selon les options fournies
 * 
 * @param {Object} options - Configuration globale des layers
 * @param {Array} options.points - Points pour la heatmap
 * @param {Array} options.hospitals - Données des hôpitaux
 * @param {Array} options.pharmacies - Données des pharmacies
 * @param {boolean} options.showHeatmap - Afficher la heatmap
 * @param {boolean} options.showHospitals - Afficher les hôpitaux
 * @param {boolean} options.showPharmacies - Afficher les pharmacies
 * @param {boolean} options.showVulnerablePopulation - Afficher la population vulnérable
 * @param {boolean} options.showVaccineLogistics - Afficher la logistique vaccins
 * @param {boolean} options.showBudget - Afficher le budget vaccination
 * @param {Object} options.vulnerablePopulationData - Données de population vulnérable
 * @param {Object} options.vaccineLogisticsData - Données de logistique vaccins
 * @param {Object} options.budgetDepartmentsData - Données de budget départements
 * @param {Object} options.departmentsGeojson - GeoJSON des départements pour population vulnérable
 * @param {Object} options.scaling - Paramètres de scaling (radiusMeters, elevationMultiplier, heatmapRadiusPixels)
 * @param {Object} options.viewGeojson - GeoJSON pour les limites administratives
 * @param {string} options.viewMode - Mode de vue (national, regional, departmental)
 * @param {Function} options.onAreaClick - Callback clic sur zone administrative
 * @param {Function} options.onBudgetClick - Callback clic sur budget layer
 * @param {number} options.zoom - Niveau de zoom actuel
 * @param {Object} options.areaTimeseries - Timeseries data for coloring areas by ICU occupancy
 * @param {string} options.currentDate - Current date for timeseries lookup
 * @returns {Array} Liste des layers deck.gl
 */
export function createLayers({
  points = [],
  hospitals = [],
  pharmacies = [],
  showHeatmap = false,
  showHospitals = false,
  showPharmacies = false,
  showVulnerablePopulation = false,
  showVaccineLogistics = false,
  showBudget = false,
  vulnerablePopulationData = null,
  vaccineLogisticsData = null,
  budgetDepartmentsData = null,
  departmentsGeojson = null,
  scaling = {
    radiusMeters: 1500,
    elevationMultiplier: 6000,
    heatmapRadiusPixels: 100,
  },
  viewGeojson = null,
  viewMode = "national",
  onAreaClick = null,
  onWarehouseClick = null,
  onBudgetClick = null,
  zoom = 5,
  areaTimeseries = {},
  currentDate = null,
}) {
  const layers = [];

  // 1. Layers de limites administratives (dessinés en dessous)
  if (viewGeojson) {
    const viewLayers = createViewLayers({
      viewGeojson,
      viewMode,
      onAreaClick,
      areaTimeseries,
      currentDate,
    });
    if (Array.isArray(viewLayers) && viewLayers.length) {
      layers.push(...viewLayers);
    }
  }

  // 2. Layer heatmap (zones à risque)
  if (showHeatmap) {
    const heatmapLayer = createHeatmapLayer({ points, scaling });
    if (heatmapLayer) layers.push(heatmapLayer);
  }

  // 3. Layer hôpitaux (saturation)
  if (showHospitals) {
    const hospitalsLayer = createHospitalsLayer({ hospitals, scaling });
    if (hospitalsLayer) layers.push(hospitalsLayer);
  }

  // 4. Layer pharmacies (adaptatif selon zoom)
  if (showPharmacies) {
    const pharmaciesLayer = createPharmaciesLayer({ pharmacies, zoom });
    if (pharmaciesLayer) layers.push(pharmaciesLayer);
  }

  // 5. Layer population vulnérable 65+ (extrusion 3D par département)
  if (showVulnerablePopulation && vulnerablePopulationData && departmentsGeojson) {
    const vulnerableLayer = createVulnerablePopulationLayer({
      geojson: departmentsGeojson,
      populationData: vulnerablePopulationData,
      visible: showVulnerablePopulation,
    });
    if (vulnerableLayer) layers.push(vulnerableLayer);
  }

  // 6. Layer logistique vaccins (arcs 3D + hangars)
  if (showVaccineLogistics && vaccineLogisticsData && departmentsGeojson && currentDate) {
    const logisticsLayers = createVaccineLogisticsLayer({
      logisticsData: vaccineLogisticsData,
      currentDate,
      departmentsGeojson,
      onWarehouseClick,
    });
    if (Array.isArray(logisticsLayers) && logisticsLayers.length) {
      layers.push(...logisticsLayers);
    }
  }

  // 7. Layer budget vaccination (% par département)
  if (showBudget && budgetDepartmentsData && departmentsGeojson && currentDate) {
    const budgetLayers = createBudgetLayer({
      geojson: departmentsGeojson,
      budgetData: budgetDepartmentsData,
      currentDate,
      onClick: onBudgetClick,
    });
    if (Array.isArray(budgetLayers) && budgetLayers.length) {
      layers.push(...budgetLayers);
    }
  }

  return layers;
}
