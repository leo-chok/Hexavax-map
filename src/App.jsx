import { useMemo, useState, useEffect } from "react";
import EpidemicMap from "./components/EpidemicMap.jsx";
import TimeSlider from "./components/TimeSlider.jsx";
import Legend from "./components/Legend.jsx";
import SidePanel from "./components/SidePanel.jsx";
import AreaPanel from "./components/AreaPanel.jsx";
import WarehousePanel from "./components/WarehousePanel.jsx";
import BudgetPanel from "./components/BudgetPanel.jsx";
import { DATA_SOURCES, DEFAULT_FILTERS, STORAGE_KEYS } from "./config/constants";

export default function App() {
  const [dataset, setDataset] = useState("france");
  const [rawData, setRawData] = useState([]);
  const [hospitalData, setHospitalData] = useState([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [pharmacies, setPharmacies] = useState([]);
  const [departmentsAreaStatsMap, setDepartmentsAreaStatsMap] = useState({});
  const [departmentsAreaTimeseries, setDepartmentsAreaTimeseries] = useState({});
  const [regionsStatsMap, setRegionsStatsMap] = useState({});
  const [regionsTimeseries, setRegionsTimeseries] = useState({});
  const [nationalTimeseries, setNationalTimeseries] = useState({});
  const [viewMode, setViewMode] = useState("national");
  const [viewGeojson, setViewGeojson] = useState(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [showAdminBoundaries, setShowAdminBoundaries] = useState(true);
  const [domTomCoords, setDomTomCoords] = useState(null);
  const [vulnerablePopulationData, setVulnerablePopulationData] = useState(null);
  const [departmentsGeojson, setDepartmentsGeojson] = useState(null);
  const [vaccineLogisticsData, setVaccineLogisticsData] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [budgetDepartmentsData, setBudgetDepartmentsData] = useState(null);
  const [budgetRegionsData, setBudgetRegionsData] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedBudgetData, setSelectedBudgetData] = useState(null);
  // load persisted filters from localStorage if present (sanitise stored object)
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.filters);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          heatmap: !!parsed.heatmap,
          hospitals: !!parsed.hospitals,
          pharmacies: !!parsed.pharmacies,
          vulnerablePopulation: !!parsed.vulnerablePopulation,
          vaccineLogistics: !!parsed.vaccineLogistics,
        };
      }
    } catch (e) {
      console.warn("Erreur lecture filters depuis localStorage", e);
    }
    return DEFAULT_FILTERS;
  });

  // Charger le dataset sélectionné
  useEffect(() => {
    fetch(DATA_SOURCES.datasets[dataset])
      .then((res) => res.json())
      .then((data) => setRawData(data))
      .catch((err) => console.error("Erreur chargement dataset :", err));
  }, [dataset]);

  // Charger la data hospitalière (fixe)
  useEffect(() => {
    fetch(DATA_SOURCES.hospitals)
      .then((res) => res.json())
      .then((data) => setHospitalData(data))
      .catch((err) => console.error("Erreur chargement hôpitaux :", err));
  }, []);

  // Charger les données des pharmacies (fixe)
  useEffect(() => {
    fetch(DATA_SOURCES.pharmacies)
      .then(res => res.json())
      .then(setPharmacies)
      .catch(err => console.error("Erreur chargement pharmacies :", err));
  }, []);

  // Charger les stats des régions
  useEffect(() => {
    fetch(DATA_SOURCES.regions.stats)
      .then(res => res.json())
      .then(setRegionsStatsMap)
      .catch(err => console.error("Erreur chargement stats régions :", err));
  }, []);

  // Charger les stats area des départements
  useEffect(() => {
    fetch(DATA_SOURCES.departments.area_stats)
      .then(res => res.json())
      .then(setDepartmentsAreaStatsMap)
      .catch(err => console.error("Erreur chargement stats area départements :", err));
  }, []);

  // Charger les données temporelles des départements (timeseries)
  useEffect(() => {
    fetch(DATA_SOURCES.departments.area_timeseries)
      .then(res => res.json())
      .then(setDepartmentsAreaTimeseries)
      .catch(err => console.error("Erreur chargement timeseries départements :", err));
  }, []);

  // Charger les données temporelles des régions
  useEffect(() => {
    fetch(DATA_SOURCES.regions.timeseries)
      .then(res => res.json())
      .then(setRegionsTimeseries)
      .catch(err => console.error("Erreur chargement timeseries régions :", err));
  }, []);

  // Charger les données temporelles nationales
  useEffect(() => {
    fetch(DATA_SOURCES.national.timeseries)
      .then(res => res.json())
      .then(setNationalTimeseries)
      .catch(err => console.error("Erreur chargement timeseries national :", err));
  }, []);

  // Charger les données de population vulnérable
  useEffect(() => {
    fetch("/data/Population_vulnerable.json")
      .then(res => res.json())
      .then(setVulnerablePopulationData)
      .catch(err => console.error("Erreur chargement population vulnérable :", err));
  }, []);

  // Charger le geojson des départements pour le layer population vulnérable
  useEffect(() => {
    fetch("/data/geojson/departements-avec-outre-mer.geojson")
      .then(res => res.json())
      .then(setDepartmentsGeojson)
      .catch(err => console.error("Erreur chargement geojson départements :", err));
  }, []);

  // Charger les données de logistique des vaccins (timeseries)
  useEffect(() => {
    fetch(DATA_SOURCES.vaccineLogistics)
      .then(res => res.json())
      .then(setVaccineLogisticsData)
      .catch(err => console.error("Erreur chargement logistique vaccins :", err));
  }, []);

  // Charger les données du budget départements
  useEffect(() => {
    fetch(DATA_SOURCES.budget.departments)
      .then(res => res.json())
      .then(setBudgetDepartmentsData)
      .catch(err => console.error("Erreur chargement budget départements :", err));
  }, []);

  // Charger les données du budget régions
  useEffect(() => {
    fetch(DATA_SOURCES.budget.regions)
      .then(res => res.json())
      .then(setBudgetRegionsData)
      .catch(err => console.error("Erreur chargement budget régions :", err));
  }, []);

  // Charger la geojson pour la vue active (national / regional / departmental / domtom)
  useEffect(() => {
    const fileForMode = DATA_SOURCES.views[viewMode];

    if (!fileForMode) {
      setViewGeojson(null);
      return;
    }

    let cancelled = false;
    fetch(fileForMode)
      .then((res) => {
        if (!res.ok) throw new Error("view geojson not found");
        return res.json();
      })
      .then((g) => {
        if (!cancelled) setViewGeojson(g);
      })
      .catch((_) => {
        if (!cancelled) setViewGeojson(null);
      });

    return () => { cancelled = true; };
  }, [viewMode]);

  // Réinitialiser domTomCoords quand on quitte le mode DOM-TOM
  useEffect(() => {
    if (viewMode !== "domtom") {
      setDomTomCoords(null);
    }
  }, [viewMode]);

  // Extraire les dates uniques triées
  const dates = useMemo(() => {
    const s = Array.from(new Set(rawData.map((d) => d.date)));
    s.sort((a, b) => new Date(a) - new Date(b));
    return s;
  }, [rawData]);

  // Définir l'index par défaut au 1er décembre lors du chargement initial des dates
  useEffect(() => {
    if (dates.length > 0 && dateIndex === 0) {
      const dec1Index = dates.findIndex(d => d === "2025-12-01");
      if (dec1Index !== -1) {
        setDateIndex(dec1Index);
      }
    }
  }, [dates]);

  const currentDate = dates[dateIndex] || null;

  // 🔥 Points épidémiques (heatmap)
  const dataForDate = useMemo(() => {
    if (!currentDate) return [];
    return rawData
      .filter((d) => d.date === currentDate)
      .map((d) => ({
        position: [d.lon, d.lat],
        weight: d.value,
        label: d.label,
      }));
  }, [currentDate, rawData]);

  // Persist only the relevant filters to localStorage when they change
  useEffect(() => {
    try {
      const toStore = {
        heatmap: !!filters.heatmap,
        hospitals: !!filters.hospitals,
        pharmacies: !!filters.pharmacies,
        vaccineLogistics: !!filters.vaccineLogistics,
      };
      localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(toStore));
    } catch (e) {
      console.warn("Erreur sauvegarde filters dans localStorage", e);
    }
  }, [filters]);

  // 🏥 Points de saturation hospitalière
  const hospitalsForDate = useMemo(() => {
    if (!currentDate) return [];
    return hospitalData
      .filter((d) => d.date === currentDate)
      .map((d) => ({
        lat: d.lat,
        lon: d.lon,
        saturation: d.saturation,
        label: d.label,
      }));
  }, [currentDate, hospitalData]);

  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedAreaData, setSelectedAreaData] = useState(null);

  // Helper: try to read a department code (INSEE) from a geojson feature's properties
  const readDepCode = (feature) => {
    if (!feature) return null;
    const p = feature.properties || {};
    const candidates = [
      p.code,
      p.CODE,
      p.COD_DEP,
      p.cod_dep,
      p.insee,
      p.INSEE,
      p.code_insee,
      p.Code,
      p.dep || p.DEP,
    ];
    for (const c of candidates) {
      if (c == null) continue;
      const asNum = Number(String(c).replace(/^0+/, ""));
      if (!Number.isNaN(asNum)) return String(asNum);
      const s = String(c).trim();
      if (s) return s;
    }
    return null;
  };

  // Helper: read region code from feature properties
  const readRegionCode = (feature) => {
    if (!feature) return null;
    const p = feature.properties || {};
    const candidates = [
      p.code,
      p.CODE,
      p.code_region,
      p.CODE_REG,
      p.reg,
      p.REG,
      p.insee,
      p.INSEE,
    ];
    for (const c of candidates) {
      if (c != null) {
        const s = String(c).trim();
        if (s) return s;
      }
    }
    return null;
  };

  // Helper: read region name from feature properties
  const readRegionName = (feature) => {
    if (!feature) return null;
    const p = feature.properties || {};
    return p.nom || p.name || p.NOM || p.LIBELLE || p.label || null;
  };

  // Helper: normalize department code for comparison
  const normalizeCode = (code) => {
    if (!code) return null;
    return String(code).replace(/^0+/, '') || '0';
  };

  // Helper: filter hospitals by department code (based on label or coordinates)
  const filterHospitalsByDepartment = (depCode) => {
    if (!hospitalData || !currentDate) return [];
    
    // Filter by date first
    const todayHospitals = hospitalData.filter(h => h.date === currentDate);
    
    // Try to match by department in label (e.g., "Hôpital X (Paris)" → 75)
    // This is a simple heuristic - in production, use proper geocoding
    const deptMap = {
      'Paris': '75', 'Lille': '59', 'Lyon': '69', 'Marseille': '13',
      'Toulouse': '31', 'Nice': '06', 'Nantes': '44', 'Strasbourg': '67',
      'Bordeaux': '33', 'Rennes': '35', 'Montpellier': '34'
    };
    
    return todayHospitals.filter(h => {
      const label = h.label || '';
      for (const [city, code] of Object.entries(deptMap)) {
        if (label.includes(city) && normalizeCode(code) === normalizeCode(depCode)) {
          return true;
        }
      }
      return false;
    });
  };

  // Helper: filter hospitals by region (aggregate from departments in region)
  const filterHospitalsByRegion = (regionName) => {
    if (!hospitalData || !currentDate) return [];
    
    // Filter by date first
    const todayHospitals = hospitalData.filter(h => h.date === currentDate);
    
    // Region to major cities mapping (simplified)
    const regionCities = {
      'Île-de-France': ['Paris'],
      'Hauts-de-France': ['Lille'],
      'Auvergne-Rhône-Alpes': ['Lyon'],
      "Provence-Alpes-Côte d'Azur": ['Marseille', 'Nice'],
      'Occitanie': ['Toulouse', 'Montpellier'],
      'Nouvelle-Aquitaine': ['Bordeaux'],
      'Pays de la Loire': ['Nantes'],
      'Grand Est': ['Strasbourg'],
      'Bretagne': ['Rennes'],
    };
    
    const cities = regionCities[regionName] || [];
    return todayHospitals.filter(h => {
      const label = h.label || '';
      return cities.some(city => label.includes(city));
    });
  };

  // Helper: get vaccine logistics for department
  const getVaccineLogisticsForDepartment = (depCode) => {
    if (!vaccineLogisticsData || !currentDate) return null;
    
    const warehouses = vaccineLogisticsData.warehouses || [];
    const dailyLogistics = vaccineLogisticsData.daily_logistics || {};
    
    // Find warehouse covering this department
    const coveringWarehouse = warehouses.find(wh => 
      wh.coverage_departments?.includes(depCode)
    );
    
    if (!coveringWarehouse) return null;
    
    // Get daily data for this warehouse
    const dayData = dailyLogistics[currentDate];
    const warehouseData = dayData?.[coveringWarehouse.id];
    
    return {
      warehouse: coveringWarehouse,
      dailyData: warehouseData || null,
    };
  };

  // Helper: get vaccine logistics for region (aggregate all warehouses in region)
  const getVaccineLogisticsForRegion = (regionName) => {
    if (!vaccineLogisticsData || !currentDate || !departmentsAreaTimeseries[currentDate]) return null;
    
    const warehouses = vaccineLogisticsData.warehouses || [];
    const dailyLogistics = vaccineLogisticsData.daily_logistics || {};
    const dayData = dailyLogistics[currentDate] || {};
    
    // Get all departments in this region
    const depsInRegion = Object.values(departmentsAreaTimeseries[currentDate] || {})
      .filter(d => d.region === regionName)
      .map(d => d.code);
    
    // Find all warehouses covering departments in this region
    const coveringWarehouses = warehouses.filter(wh =>
      wh.coverage_departments?.some(depCode => depsInRegion.includes(depCode))
    );
    
    // Aggregate stocks
    const totalStock = coveringWarehouses.reduce((sum, wh) => {
      const whData = dayData[wh.id];
      return sum + (whData?.stock_current || 0);
    }, 0);
    
    const totalPlanned = coveringWarehouses.reduce((sum, wh) => {
      const whData = dayData[wh.id];
      return sum + (whData?.stock_planned || 0);
    }, 0);
    
    return {
      warehouses: coveringWarehouses,
      totalStock,
      totalPlanned,
    };
  };

  // Helper: get budget data for department
  const getBudgetForDepartment = (depCode) => {
    if (!budgetDepartmentsData || !currentDate) return null;
    
    // Adapt date to budget period (2024)
    let searchDate = currentDate;
    if (currentDate.startsWith("2025-")) {
      searchDate = currentDate.replace("2025-", "2024-");
    }
    
    const dayData = budgetDepartmentsData.donnees?.find(d => d.date === searchDate);
    const deptData = dayData?.departements?.find(d => 
      d.code_insee === depCode || normalizeCode(d.code_insee) === normalizeCode(depCode)
    );
    
    if (!deptData) return null;
    
    // Map field names from file to expected format
    return {
      budget_journalier: deptData.montant_quotidien,
      budget_cumule: deptData.montant_cumule,
      budget_utilise_pct: deptData.budget_utilise_pct || null,
      sources_financement: deptData.sources_financement,
      depenses_categories: deptData.depenses_categories || null,
    };
  };

  // Helper: get budget data for region
  const getBudgetForRegion = (regionName) => {
    if (!budgetRegionsData || !currentDate) return null;
    
    // Adapt date to budget period (2024)
    let searchDate = currentDate;
    if (currentDate.startsWith("2025-")) {
      searchDate = currentDate.replace("2025-", "2024-");
    }
    
    const dayData = budgetRegionsData.donnees?.find(d => d.date === searchDate);
    const regionData = dayData?.regions?.find(r => r.nom === regionName);
    
    if (!regionData) return null;
    
    // Map field names from file to expected format
    return {
      budget_journalier: regionData.montant_quotidien,
      budget_cumule: regionData.montant_cumule,
      budget_utilise_pct: regionData.budget_utilise_pct || null,
      sources_financement: regionData.sources_financement,
      depenses_categories: regionData.depenses_categories || null,
    };
  };

  // Mapping département → région (codes INSEE)
  const DEPT_TO_REGION = {
    // Île-de-France
    "75": "Île-de-France", "77": "Île-de-France", "78": "Île-de-France", "91": "Île-de-France",
    "92": "Île-de-France", "93": "Île-de-France", "94": "Île-de-France", "95": "Île-de-France",
    // Auvergne-Rhône-Alpes
    "01": "Auvergne-Rhône-Alpes", "03": "Auvergne-Rhône-Alpes", "07": "Auvergne-Rhône-Alpes",
    "15": "Auvergne-Rhône-Alpes", "26": "Auvergne-Rhône-Alpes", "38": "Auvergne-Rhône-Alpes",
    "42": "Auvergne-Rhône-Alpes", "43": "Auvergne-Rhône-Alpes", "63": "Auvergne-Rhône-Alpes",
    "69": "Auvergne-Rhône-Alpes", "73": "Auvergne-Rhône-Alpes", "74": "Auvergne-Rhône-Alpes",
    // Nouvelle-Aquitaine
    "16": "Nouvelle-Aquitaine", "17": "Nouvelle-Aquitaine", "19": "Nouvelle-Aquitaine",
    "23": "Nouvelle-Aquitaine", "24": "Nouvelle-Aquitaine", "33": "Nouvelle-Aquitaine",
    "40": "Nouvelle-Aquitaine", "47": "Nouvelle-Aquitaine", "64": "Nouvelle-Aquitaine",
    "79": "Nouvelle-Aquitaine", "86": "Nouvelle-Aquitaine", "87": "Nouvelle-Aquitaine",
    // Occitanie
    "09": "Occitanie", "11": "Occitanie", "12": "Occitanie", "30": "Occitanie",
    "31": "Occitanie", "32": "Occitanie", "34": "Occitanie", "46": "Occitanie",
    "48": "Occitanie", "65": "Occitanie", "66": "Occitanie", "81": "Occitanie", "82": "Occitanie",
    // Hauts-de-France
    "02": "Hauts-de-France", "59": "Hauts-de-France", "60": "Hauts-de-France",
    "62": "Hauts-de-France", "80": "Hauts-de-France",
    // Provence-Alpes-Côte d'Azur
    "04": "Provence-Alpes-Côte d'Azur", "05": "Provence-Alpes-Côte d'Azur",
    "06": "Provence-Alpes-Côte d'Azur", "13": "Provence-Alpes-Côte d'Azur",
    "83": "Provence-Alpes-Côte d'Azur", "84": "Provence-Alpes-Côte d'Azur",
    // Grand Est
    "08": "Grand Est", "10": "Grand Est", "51": "Grand Est", "52": "Grand Est",
    "54": "Grand Est", "55": "Grand Est", "57": "Grand Est", "67": "Grand Est",
    "68": "Grand Est", "88": "Grand Est",
    // Pays de la Loire
    "44": "Pays de la Loire", "49": "Pays de la Loire", "53": "Pays de la Loire",
    "72": "Pays de la Loire", "85": "Pays de la Loire",
    // Bretagne
    "22": "Bretagne", "29": "Bretagne", "35": "Bretagne", "56": "Bretagne",
    // Normandie
    "14": "Normandie", "27": "Normandie", "50": "Normandie", "61": "Normandie", "76": "Normandie",
    // Bourgogne-Franche-Comté
    "21": "Bourgogne-Franche-Comté", "25": "Bourgogne-Franche-Comté", "39": "Bourgogne-Franche-Comté",
    "58": "Bourgogne-Franche-Comté", "70": "Bourgogne-Franche-Comté", "71": "Bourgogne-Franche-Comté",
    "89": "Bourgogne-Franche-Comté", "90": "Bourgogne-Franche-Comté",
    // Centre-Val de Loire
    "18": "Centre-Val de Loire", "28": "Centre-Val de Loire", "36": "Centre-Val de Loire",
    "37": "Centre-Val de Loire", "41": "Centre-Val de Loire", "45": "Centre-Val de Loire",
    // Corse
    "2A": "Corse", "2B": "Corse",
    // DOM
    "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte",
  };

  // Données de référence : Population et surface par région (source: INSEE 2023)
  const REGIONS_DATA = {
    "Île-de-France": { population: 12374616, surface_km2: 12011 },
    "Auvergne-Rhône-Alpes": { population: 8078652, surface_km2: 69711 },
    "Nouvelle-Aquitaine": { population: 6033952, surface_km2: 84036 },
    "Occitanie": { population: 5924858, surface_km2: 72724 },
    "Hauts-de-France": { population: 5997734, surface_km2: 31813 },
    "Provence-Alpes-Côte d'Azur": { population: 5081101, surface_km2: 31400 },
    "Grand Est": { population: 5562651, surface_km2: 57433 },
    "Pays de la Loire": { population: 3832120, surface_km2: 32082 },
    "Bretagne": { population: 3373835, surface_km2: 27208 },
    "Normandie": { population: 3325032, surface_km2: 29906 },
    "Bourgogne-Franche-Comté": { population: 2783039, surface_km2: 47784 },
    "Centre-Val de Loire": { population: 2559073, surface_km2: 39151 },
    "Corse": { population: 343701, surface_km2: 8680 },
    "Guadeloupe": { population: 384239, surface_km2: 1628 },
    "Martinique": { population: 361225, surface_km2: 1128 },
    "Guyane": { population: 290691, surface_km2: 83534 },
    "La Réunion": { population: 859959, surface_km2: 2504 },
    "Mayotte": { population: 310022, surface_km2: 374 },
  };

  // Données de référence : Population et surface France métropolitaine + DOM
  const NATIONAL_DATA = {
    population: 67842582, // France entière (métropole + DOM)
    surface_km2: 643801, // France entière
  };

  /**
   * Aggregate all layer data for the selected area
   * Returns comprehensive data object combining epidemiology, health system, vaccination, budget, etc.
   */
  const aggregateAreaData = (feature, mode, date) => {
    if (!feature || !date) return null;
    
    const result = {
      overview: {},
      epidemiology: {},
      healthSystem: {},
      vaccination: {},
      vulnerablePopulation: {},
      budget: {},
    };
    
    // Get base epidemiological data
    let baseData = null;
    let areaCode = null;
    let areaName = null;
    
    if (mode === "national") {
      baseData = nationalTimeseries[date] || null;
      areaName = "France";
      areaCode = "FRA";
    } else if (mode === "departmental") {
      areaCode = readDepCode(feature);
      const p = feature.properties || {};
      areaName = p.nom || p.name || p.NOM || p.LIBELLE || areaCode;
      
      if (areaCode && departmentsAreaTimeseries[date]) {
        baseData = departmentsAreaTimeseries[date][areaCode] || null;
      }
    } else if (mode === "regional") {
      areaName = readRegionName(feature);
      areaCode = readRegionCode(feature);
      
      if (areaName && regionsTimeseries[date]) {
        baseData = regionsTimeseries[date][areaName] || null;
      }
    }
    
    // SECTION 1: Overview
    // Get population and surface from vulnerable population data or reference data
    let population = null;
    let surface_km2 = null;
    
    if (mode === "national") {
      population = NATIONAL_DATA.population;
      surface_km2 = NATIONAL_DATA.surface_km2;
    } else if (mode === "departmental" && areaCode) {
      // Get from Population_vulnerable.json
      const vulnData = vulnerablePopulationData?.departements?.find(d => 
        normalizeCode(d.code) === normalizeCode(areaCode)
      );
      if (vulnData) {
        population = vulnData.population_totale;
        // Surface will be calculated from density if not available in base data
        surface_km2 = baseData?.surface_km2 || null;
      }
    } else if (mode === "regional" && areaName) {
      // Get from reference data
      const regionData = REGIONS_DATA[areaName];
      if (regionData) {
        population = regionData.population;
        surface_km2 = regionData.surface_km2;
      }
    }
    
    result.overview = {
      code: areaCode,
      name: areaName,
      type: mode,
      date: date,
      population: population,
      surface_km2: surface_km2,
    };
    
    // SECTION 2: Epidemiology (from heatmap + base timeseries)
    result.epidemiology = {
      vaccination_rate_pct: baseData?.vaccination_rate_pct || 0,
      cases_per_100k: baseData?.cases_per_100k || 0,
      incidence_rate: baseData?.incidence_rate || 0,
      positivity_rate: baseData?.positivity_rate || 0,
      icu_occupancy_pct: baseData?.icu_occupancy_pct || 0,
      r_effectif: baseData?.r_effectif || null,
      total_cases: baseData?.total_cases || null,
      total_deaths: baseData?.total_deaths || null,
    };
    
    // SECTION 3: Health System (hospitals + sanitary alerts)
    let hospitals = [];
    if (mode === "departmental" && areaCode) {
      hospitals = filterHospitalsByDepartment(areaCode);
    } else if (mode === "regional" && areaName) {
      hospitals = filterHospitalsByRegion(areaName);
    } else if (mode === "national") {
      hospitals = hospitalData.filter(h => h.date === date);
    }
    
    const avgSaturation = hospitals.length > 0
      ? hospitals.reduce((sum, h) => sum + (h.saturation || 0), 0) / hospitals.length
      : 0;
    
    result.healthSystem = {
      hospitals: hospitals,
      avg_saturation_pct: avgSaturation,
      alert_level: baseData?.alert_level || baseData?.niveau_alerte || 'vert',
      icu_beds_available: baseData?.icu_beds_available || null,
      total_beds: baseData?.total_beds || null,
    };
    
    // SECTION 4: Vaccination (centers + logistics + stocks)
    result.vaccination = {
      pharmacies_partners: baseData?.pharmacies_partners || 0,
      vaccination_centers: baseData?.vaccination_centers || 0,
      total_doses_administered: baseData?.total_doses_administered || null,
      daily_doses: baseData?.daily_doses || null,
    };
    
    // Add logistics data
    if (mode === "departmental" && areaCode) {
      const logistics = getVaccineLogisticsForDepartment(areaCode);
      if (logistics) {
        result.vaccination.warehouse = logistics.warehouse;
        result.vaccination.stock_current = logistics.dailyData?.stock_current || 0;
        result.vaccination.stock_planned = logistics.dailyData?.stock_planned || 0;
        result.vaccination.deliveries = logistics.dailyData?.deliveries || [];
      }
    } else if (mode === "regional" && areaName) {
      const logistics = getVaccineLogisticsForRegion(areaName);
      if (logistics) {
        result.vaccination.warehouses = logistics.warehouses;
        result.vaccination.stock_current = logistics.totalStock;
        result.vaccination.stock_planned = logistics.totalPlanned;
      }
    } else if (mode === "national") {
      // Aggregate all warehouses
      const warehouses = vaccineLogisticsData?.warehouses || [];
      const dayData = vaccineLogisticsData?.daily_logistics?.[date] || {};
      const totalStock = warehouses.reduce((sum, wh) => {
        const whData = dayData[wh.id];
        return sum + (whData?.stock_current || 0);
      }, 0);
      const totalPlanned = warehouses.reduce((sum, wh) => {
        const whData = dayData[wh.id];
        return sum + (whData?.stock_planned || 0);
      }, 0);
      result.vaccination.warehouses = warehouses;
      result.vaccination.stock_current = totalStock;
      result.vaccination.stock_planned = totalPlanned;
    }
    
    // SECTION 5: Vulnerable Population
    // Get data from Population_vulnerable.json
    if (mode === "departmental" && areaCode) {
      const vulnData = vulnerablePopulationData?.departements?.find(d => 
        normalizeCode(d.code) === normalizeCode(areaCode)
      );
      if (vulnData) {
        result.vulnerablePopulation = {
          population_65_plus: vulnData.population_65_plus,
          population_65_plus_pct: vulnData.pourcentage_65_plus,
          population_a_risque: vulnData.population_a_risque,
          population_moins_25: vulnData.population_moins_25,
          pourcentage_moins_25: vulnData.pourcentage_moins_25,
          vaccination_rate_65_plus: baseData?.vaccination_rate_65_plus || null,
        };
      }
    } else if (mode === "regional" && areaName) {
      // Aggregate all departments in this region from Population_vulnerable.json
      if (vulnerablePopulationData?.departements) {
        // Get all department codes that belong to this region
        const depsInRegion = Object.entries(DEPT_TO_REGION)
          .filter(([_, region]) => region === areaName)
          .map(([code, _]) => code);
        
        const regionVulnData = vulnerablePopulationData.departements.filter(d =>
          depsInRegion.some(depCode => normalizeCode(d.code) === normalizeCode(depCode))
        );
        
        if (regionVulnData.length > 0) {
          const total65Plus = regionVulnData.reduce((sum, d) => sum + (d.population_65_plus || 0), 0);
          const totalPopulation = regionVulnData.reduce((sum, d) => sum + (d.population_totale || 0), 0);
          const totalRisque = regionVulnData.reduce((sum, d) => sum + (d.population_a_risque || 0), 0);
          const totalMoins25 = regionVulnData.reduce((sum, d) => sum + (d.population_moins_25 || 0), 0);
          
          result.vulnerablePopulation = {
            population_65_plus: total65Plus,
            population_65_plus_pct: totalPopulation > 0 ? (total65Plus / totalPopulation * 100) : 0,
            population_a_risque: totalRisque,
            population_moins_25: totalMoins25,
            pourcentage_moins_25: totalPopulation > 0 ? (totalMoins25 / totalPopulation * 100) : 0,
            vaccination_rate_65_plus: baseData?.vaccination_rate_65_plus || null,
          };
        }
      }
    } else if (mode === "national") {
      // Aggregate all departments from Population_vulnerable.json
      if (vulnerablePopulationData?.departements) {
        const allDeps = vulnerablePopulationData.departements;
        const total65Plus = allDeps.reduce((sum, d) => sum + (d.population_65_plus || 0), 0);
        const totalPopulation = allDeps.reduce((sum, d) => sum + (d.population_totale || 0), 0);
        const totalRisque = allDeps.reduce((sum, d) => sum + (d.population_a_risque || 0), 0);
        const totalMoins25 = allDeps.reduce((sum, d) => sum + (d.population_moins_25 || 0), 0);
        
        result.vulnerablePopulation = {
          population_65_plus: total65Plus,
          population_65_plus_pct: totalPopulation > 0 ? (total65Plus / totalPopulation * 100) : 0,
          population_a_risque: totalRisque,
          population_moins_25: totalMoins25,
          pourcentage_moins_25: totalPopulation > 0 ? (totalMoins25 / totalPopulation * 100) : 0,
          vaccination_rate_65_plus: baseData?.vaccination_rate_65_plus || null,
        };
      }
    }
    
    // Fallback if no data found
    if (!result.vulnerablePopulation.population_65_plus) {
      result.vulnerablePopulation = {
        population_65_plus: null,
        population_65_plus_pct: null,
        population_a_risque: null,
        vaccination_rate_65_plus: null,
      };
    }
    
    // SECTION 6: Budget & Financing
    let budgetData = null;
    if (mode === "departmental" && areaCode) {
      budgetData = getBudgetForDepartment(areaCode);
    } else if (mode === "regional" && areaName) {
      budgetData = getBudgetForRegion(areaName);
    } else if (mode === "national") {
      // Aggregate national budget (sum all regions for the day)
      let searchDate = date;
      if (date.startsWith("2025-")) {
        searchDate = date.replace("2025-", "2024-");
      }
      const dayData = budgetRegionsData?.donnees?.find(d => d.date === searchDate);
      if (dayData?.regions) {
        const totalDaily = dayData.regions.reduce((sum, r) => sum + (r.montant_quotidien || 0), 0);
        const totalCumul = dayData.regions.reduce((sum, r) => sum + (r.montant_cumule || 0), 0);
        budgetData = {
          budget_journalier: totalDaily,
          budget_cumule: totalCumul,
          sources_financement: dayData.regions[0]?.sources_financement || null,
        };
      }
    }
    
    if (budgetData) {
      result.budget = {
        budget_journalier: budgetData.budget_journalier || 0,
        budget_cumule: budgetData.budget_cumule || 0,
        budget_utilise_pct: budgetData.budget_utilise_pct || null,
        sources_financement: budgetData.sources_financement || null,
        depenses_categories: budgetData.depenses_categories || null,
      };
    }
    
    return result;
  };

  // Mettre à jour les données du AreaPanel quand la date change (si une zone est sélectionnée)
  // Now using aggregateAreaData to combine all layer data
  useEffect(() => {
    if (!selectedArea || !currentDate) return;

    const aggregatedData = aggregateAreaData(selectedArea, viewMode, currentDate);
    
    if (aggregatedData) {
      setSelectedAreaData(aggregatedData);
      console.log("📊 Aggregated Area Data:", aggregatedData); // DEBUG - will remove after testing
    }
  }, [currentDate, selectedArea, viewMode, departmentsAreaTimeseries, regionsTimeseries, nationalTimeseries, hospitalData, vaccineLogisticsData, budgetDepartmentsData, budgetRegionsData]);

  const handleDomTomChange = (domTomData) => {
    setDomTomCoords({
      longitude: domTomData.longitude,
      latitude: domTomData.latitude,
      zoom: domTomData.zoom,
    });
  };

  // Area click handler: use aggregateAreaData to combine all layer data
  const handleAreaClick = (feature) => {
    if (!feature) return;
    setSelectedArea(feature);

    // Use the new aggregation function
    const aggregatedData = aggregateAreaData(feature, viewMode, currentDate);
    setSelectedAreaData(aggregatedData);
  };

  // Handler clic sur un hangar
  const handleWarehouseClick = (info) => {
    if (!info || !info.object) {
      setSelectedWarehouse(null);
      return;
    }

    const warehouse = info.object;
    
    // Enrichir avec les livraisons du jour
    if (vaccineLogisticsData && currentDate) {
      const dayData = vaccineLogisticsData.daily_logistics?.[currentDate];
      const whDayData = dayData?.[warehouse.id];
      
      if (whDayData) {
        setSelectedWarehouse({
          ...warehouse,
          stock_current: whDayData.stock_current,
          stock_planned: whDayData.stock_planned,
          status: whDayData.status,
          deliveries: whDayData.deliveries || [],
        });
      } else {
        setSelectedWarehouse(warehouse);
      }
    } else {
      setSelectedWarehouse(warehouse);
    }
  };

  // Handler clic sur le budget layer
  const handleBudgetClick = (feature) => {
    if (!feature) {
      setSelectedBudget(null);
      setSelectedBudgetData(null);
      return;
    }
    
    setSelectedBudget(feature);
    
    // Extract budget data for the clicked feature
    if (budgetDepartmentsData && currentDate) {
      // Adapter la date à la période du budget (2024)
      let searchDate = currentDate;
      if (currentDate.startsWith("2025-")) {
        searchDate = currentDate.replace("2025-", "2024-");
      }
      
      const code = readDepCode(feature);
      const normalizeCode = (c) => String(c).replace(/^0+/, '') || '0';
      const normalizedCode = normalizeCode(code);
      
      const dayData = budgetDepartmentsData.donnees?.find(d => d.date === searchDate);
      const deptData = dayData?.departements?.find(d => 
        d.code_insee === code || normalizeCode(d.code_insee) === normalizedCode
      );
      
      if (deptData) {
        setSelectedBudgetData(deptData);
      }
    }
  };

  // Auto-update budget data when date changes (if budget feature selected)
  useEffect(() => {
    if (!selectedBudget || !currentDate || !budgetDepartmentsData) return;
    
    // Adapter la date à la période du budget (2024)
    let searchDate = currentDate;
    if (currentDate.startsWith("2025-")) {
      searchDate = currentDate.replace("2025-", "2024-");
    }
    
    const code = readDepCode(selectedBudget);
    if (!code) return;
    
    const normalizeCode = (c) => String(c).replace(/^0+/, '') || '0';
    const normalizedCode = normalizeCode(code);
    
    const dayData = budgetDepartmentsData.donnees?.find(d => d.date === searchDate);
    const deptData = dayData?.departements?.find(d => 
      d.code_insee === code || normalizeCode(d.code_insee) === normalizedCode
    );
    
    if (deptData) {
      setSelectedBudgetData(deptData);
    }
  }, [currentDate, budgetDepartmentsData, selectedBudget]);

  const isPredictive = currentDate >= "2025-12-01";

  return (
    <div className="app">
      {/* --- HEADER --- */}
      <header 
        className="header"
        style={{
          boxShadow: isPredictive 
            ? "0 8px 40px rgba(239, 79, 145, 0.6)" 
            : "0 2px 4px rgba(0, 0, 0, 0.1)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <h3 style={{ color: "#14173D", margin: 0 }}>
          HEXAVAX
        </h3>
      </header>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="content">
  <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <EpidemicMap
            points={dataForDate}
            hospitals={hospitalsForDate}
            pharmacies={pharmacies}
            viewGeojson={showAdminBoundaries ? viewGeojson : null}
            viewMode={viewMode}
            domTomCoords={domTomCoords}
            onAreaClick={handleAreaClick}
            onWarehouseClick={handleWarehouseClick}
            onBudgetClick={handleBudgetClick}
            mapStyle={import.meta.env.VITE_MAPBOX_STYLE}
            showHeatmap={filters.heatmap}
            showHospitals={filters.hospitals}
            showPharmacies={filters.pharmacies}
            showVulnerablePopulation={filters.vulnerablePopulation}
            showVaccineLogistics={filters.vaccineLogistics}
            showBudget={filters.budget}
            vulnerablePopulationData={vulnerablePopulationData}
            vaccineLogisticsData={vaccineLogisticsData}
            budgetDepartmentsData={budgetDepartmentsData}
            departmentsGeojson={departmentsGeojson}
            areaTimeseries={
              viewMode === "departmental" || viewMode === "domtom"
                ? departmentsAreaTimeseries
                : viewMode === "regional"
                ? regionsTimeseries
                : nationalTimeseries
            }
            currentDate={currentDate}
          />

          {/* Panneau latéral gauche */}
          <SidePanel
            isOpen={sidePanelOpen}
            onToggle={() => setSidePanelOpen(!sidePanelOpen)}
            showAdminBoundaries={showAdminBoundaries}
            onAdminBoundariesChange={setShowAdminBoundaries}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filters={filters}
            onFiltersChange={(newFilters) => setFilters(newFilters)}
            onDomTomChange={handleDomTomChange}
          />

          <AreaPanel
            open={!!selectedArea}
            feature={selectedArea}
            data={selectedAreaData}
            viewMode={viewMode}
            onClose={() => { setSelectedArea(null); setSelectedAreaData(null); }}
          />

          <WarehousePanel
            warehouse={selectedWarehouse}
            currentDate={currentDate}
            onClose={() => setSelectedWarehouse(null)}
            departmentsAreaStatsMap={departmentsAreaStatsMap}
            vulnerablePopulationData={vulnerablePopulationData}
            vaccineLogisticsData={vaccineLogisticsData}
          />

          <BudgetPanel
            open={!!selectedBudget}
            feature={selectedBudget}
            budgetData={budgetDepartmentsData}
            currentDate={currentDate}
            onClose={() => { setSelectedBudget(null); setSelectedBudgetData(null); }}
          />

          {/* Légende dynamique qui s'affiche si au moins un calque est actif */}
          {(filters.heatmap || filters.hospitals || filters.pharmacies || filters.vulnerablePopulation) && (
            <div 
              className="legend"
              style={{
                transform: (selectedArea || selectedWarehouse || selectedBudget) ? "translateX(-420px)" : "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            >
              <Legend filters={filters} />
            </div>
          )}
        </div>
      </main>

      {/* --- SLIDER & DATE --- */}
      <footer 
        className="footer"
        style={{
          boxShadow: isPredictive 
            ? "0 -8px 40px rgba(239, 79, 145, 0.6)" 
            : "0 -2px 4px rgba(0, 0, 0, 0.1)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div className="panel" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
            <div className="slider-wrap">
              <TimeSlider
                dates={dates}
                value={dateIndex}
                onChange={setDateIndex}
              />
            </div>

            <div
              className="badge"
              style={{
                background: currentDate >= "2025-12-01" ? "#EF4F91" : "#6E6BF3",
                color: "white",
                padding: "6px 16px",
                borderRadius: "12px",
                fontWeight: 600,
                marginLeft: "8px",
                minWidth: "180px",
                textAlign: "center",
                transition: "background 0.3s ease",
              }}
            >
              {currentDate 
                ? new Date(currentDate).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })
                : "Chargement..."}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
