/**
 * Configuration centralisée pour l'application HEXAVAX
 */

// ============================================
// VUES CARTOGRAPHIQUES
// ============================================

export const VIEW_STATES = {
  national: {
    longitude: 2.5,
    latitude: 46.5,
    zoom: 5,
    pitch: 20,
    bearing: 0,
  },
  regional: {
    longitude: 2.5,
    latitude: 46.5,
    zoom: 5.5,
    pitch: 20,
    bearing: 0,
  },
  departmental: {
    longitude: 2.5,
    latitude: 46.5,
    zoom: 6,
    pitch: 20,
    bearing: 0,
  },
  domtom: {
    longitude: 55.5,
    latitude: -21.1,
    zoom: 9,
    pitch: 20,
    bearing: 0,
  },
};

// ============================================
// DOM-TOM
// ============================================

export const DOM_TOM_LIST = [
  { name: "La Réunion", code: "974", longitude: 55.5, latitude: -21.1, zoom: 9 },
  { name: "Guadeloupe", code: "971", longitude: -61.55, latitude: 16.25, zoom: 9 },
  { name: "Martinique", code: "972", longitude: -61.0, latitude: 14.6, zoom: 9 },
  { name: "Guyane", code: "973", longitude: -53.1, latitude: 3.9, zoom: 7 },
  { name: "Mayotte", code: "976", longitude: 45.16, latitude: -12.8, zoom: 10 },
  { name: "St-Pierre-et-Miquelon", code: "975", longitude: -56.2, latitude: 46.8, zoom: 10 },
  { name: "St-Barthélemy", code: "977", longitude: -62.85, latitude: 17.9, zoom: 11 },
  { name: "St-Martin", code: "978", longitude: -63.05, latitude: 18.08, zoom: 11 },
];

// ============================================
// DATASETS
// ============================================

export const DATA_SOURCES = {
  datasets: {
    france: "./data/mockData_france_propagation_dec2025_realistic.json",
    idf: "./data/mockData_iledefrance_daily.json",
  },
  hospitals: "./data/mockData_saturation_hopitaux_france.json",
  pharmacies: "./data/pharmacies_france_v1.json",
  departments: {
    area_stats: "./data/departments_area_stats.json",
    area_timeseries: "./data/areas_stats/departments_epidemic_timeseries_dec2025.json",
  },
  regions: {
    stats: "./data/regions_stats.json",
    timeseries: "./data/areas_stats/regions_epidemic_timeseries_dec2025.json",
  },
  national: {
    timeseries: "./data/areas_stats/national_epidemic_timeseries_dec2025.json",
  },
  views: {
    national: "./data/geojson/metropole.geojson",
    regional: "./data/geojson/regions-avec-outre-mer.geojson",
    departmental: "./data/geojson/departements-avec-outre-mer.geojson",
    domtom: "./data/geojson/departements-avec-outre-mer.geojson",
  },
};

// ============================================
// FILTRES PAR DÉFAUT
// ============================================

export const DEFAULT_FILTERS = {
  heatmap: false,
  hospitals: false,
  pharmacies: false,
  vulnerablePopulation: false,
};

// ============================================
// LAYERS - ORDRE D'AFFICHAGE
// ============================================

export const LAYER_ORDER = [
  { key: 'heatmap', label: 'Propagation virale' },
  { key: 'departments', label: 'Alertes départementales' },
  { key: 'hospitals', label: 'Saturation hôpitaux' },
  { key: 'pharmacies', label: 'Centres de vaccination' },
  { key: 'vulnerablePopulation', label: 'Population 65+ ans' },
];

// ============================================
// COULEURS - PALETTE OFFICIELLE
// ============================================

export const COLORS = {
  // Palette principale
  background: "#E9E6F8",
  title: "#14173D",
  graph: "#6E6BF3",
  illustrations: "#7DE3F2",
  accent: "#EF4F91",

  // Heatmap - Propagation virale
  heatmap: {
    low: "#ffffff",
    moderate: "#e3dd9b",
    high: "#c49c4d",
    alert: "#b73030",
  },

  // Hospitals - Saturation
  hospitals: {
    low: "#2ecc71",
    moderate: "#2e96ff",
    high: "#c73fc5",
    critical: "#ff0000",
  },

  // Departments - KPI
  departments: {
    high: "#DC2D2D",
    medium: "#FAA03C",
    low: "#46B464",
  },

  // Pharmacies - Stock doses
  pharmacies: {
    high: "#00ff00",
    medium: "#ffff00",
    low: "#ffa500",
    critical: "#ff0000",
  },
};

// ============================================
// LAYOUT - DIMENSIONS
// ============================================

export const LAYOUT = {
  header: {
    height: "30px",
  },
  footer: {
    height: "30px",
  },
  sidePanel: {
    width: "300px",
    topOffset: "60px",
    bottomOffset: "50px",
  },
  legend: {
    position: { top: "20px", right: "20px" },
  },
};

// ============================================
// PHARMACIES - SEUILS ZOOM
// ============================================

export const PHARMACIES_CONFIG = {
  ZOOM_THRESHOLD: 8, // Bascule HexagonLayer <-> ScatterplotLayer
  MIN_RADIUS: 8,
  RADIUS_FORMULA: (zoom) => Math.max(8, 500000 / Math.pow(4, zoom / 2)),
};

// ============================================
// STORAGE
// ============================================

export const STORAGE_KEYS = {
  filters: "hexavax_filters",
};
