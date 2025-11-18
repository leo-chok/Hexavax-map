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

  // Mettre à jour les données du AreaPanel quand la date change (si une zone est sélectionnée)
  useEffect(() => {
    if (!selectedArea || !currentDate) return;

    let updatedData = null;

    if (viewMode === "national") {
      // National view - use national timeseries
      updatedData = nationalTimeseries[currentDate] || null;
    } else if (viewMode === "departmental") {
      // Departmental view - use departments timeseries
      const code = readDepCode(selectedArea);
      if (code && departmentsAreaTimeseries[currentDate]) {
        updatedData = departmentsAreaTimeseries[currentDate][code] || null;
      }
    } else if (viewMode === "regional") {
      // Regional view - use regions timeseries by name
      const p = selectedArea.properties || {};
      const regionName = p.nom || p.name || p.NOM || p.LIBELLE || p.label || null;
      if (regionName && regionsTimeseries[currentDate]) {
        updatedData = regionsTimeseries[currentDate][regionName] || null;
      }
    }

    if (updatedData) {
      setSelectedAreaData(updatedData);
    }
  }, [currentDate, departmentsAreaTimeseries, regionsTimeseries, nationalTimeseries, selectedArea, viewMode]);

  const handleDomTomChange = (domTomData) => {
    setDomTomCoords({
      longitude: domTomData.longitude,
      latitude: domTomData.latitude,
      zoom: domTomData.zoom,
    });
  };

  // Helper: read region code from feature properties
  const readRegionCode = (feature) => {
    if (!feature) return null;
    const p = feature.properties || {};
    // Try common property names for region code
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

  // Area click handler: use regions or departments stats from JSON (avec timeseries si disponible)
  const handleAreaClick = (feature) => {
    if (!feature) return;
    setSelectedArea(feature);

    let areaData = null;

    if (viewMode === "national") {
      // For national view, use timeseries data for current date
      if (currentDate && nationalTimeseries[currentDate]) {
        areaData = nationalTimeseries[currentDate];
      } else {
        // Fallback to static data
        areaData = regionsStatsMap["nationale"] || null;
      }
    } else if (viewMode === "departmental") {
      // For departmental view, use department area stats from timeseries if available
      const code = readDepCode(feature);
      if (code && currentDate && departmentsAreaTimeseries[currentDate]) {
        // Use timeseries data for the current date
        areaData = departmentsAreaTimeseries[currentDate][code] || null;
      }
      // Fallback to static data if timeseries not available
      if (!areaData && code) {
        areaData = departmentsAreaStatsMap[code] || null;
      }
    } else {
      // For regional view, use region stats from timeseries if available
      const p = feature.properties || {};
      const regionName = p.nom || p.name || p.NOM || p.LIBELLE || p.label || null;
      
      if (regionName && currentDate && regionsTimeseries[currentDate]) {
        areaData = regionsTimeseries[currentDate][regionName] || null;
      }
      
      // Fallback to static data
      if (!areaData) {
        const code = readRegionCode(feature);
        if (code) {
          areaData = regionsStatsMap[code] || null;
        }
      }
    }

    setSelectedAreaData(areaData);
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
