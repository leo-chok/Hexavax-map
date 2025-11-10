import React, { useMemo, useState, useEffect } from "react";
import EpidemicMap from "./components/EpidemicMap.jsx";
import TimeSlider from "./components/TimeSlider.jsx";
import Legend from "./components/Legend.jsx";
import DatasetSelector from "./components/DatasetSelector.jsx";
import FilterPanel from "./components/FilterPanel.jsx";
import DepartmentModal from "./components/DepartmentModal.jsx";

export default function App() {
  const [dataset, setDataset] = useState("france");
  const [rawData, setRawData] = useState([]);
  const [hospitalData, setHospitalData] = useState([]);
  const [dateIndex, setDateIndex] = useState(0);
  const [pharmacies, setPharmacies] = useState([]);
  const [departmentsGeo, setDepartmentsGeo] = useState(null);
  const [departmentsStatsMap, setDepartmentsStatsMap] = useState({});
  // load persisted filters from localStorage if present (sanitise stored object)
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem("hexavax_filters");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          heatmap: !!parsed.heatmap,
          hospitals: !!parsed.hospitals,
          pharmacies: !!parsed.pharmacies,
        };
      }
    } catch (e) {
      console.warn("Erreur lecture filters depuis localStorage", e);
    }
    return {
      heatmap: false,
      hospitals: false,
      pharmacies: false,
      departments: false,
    };
  });

  // Datasets disponibles
  const dataMap = {
    france: "./data/mockData_france_daily.json",
    idf: "./data/mockData_iledefrance_daily.json",
  };

  const hospitalDataset = "./data/mockData_saturation_hopitaux_france.json";

  // Charger le dataset sélectionné
  useEffect(() => {
    fetch(dataMap[dataset])
      .then((res) => res.json())
      .then((data) => setRawData(data))
      .catch((err) => console.error("Erreur chargement dataset :", err));
  }, [dataset]);

  // Charger la data hospitalière (fixe)
  useEffect(() => {
    fetch(hospitalDataset)
      .then((res) => res.json())
      .then((data) => setHospitalData(data))
      .catch((err) => console.error("Erreur chargement hôpitaux :", err));
  }, []);

  // Charger les données des pharmacies (fixe)
  useEffect(() => {
  fetch("./data/pharmacies_point.json")
    .then(res => res.json())
    .then(setPharmacies)
    .catch(err => console.error("Erreur chargement pharmacies :", err));
}, []);

  // Charger la geojson des départements (fichier fourni par l'utilisateur)
  useEffect(() => {
    fetch("./data/departements.geojson")
      .then((res) => {
        if (!res.ok) throw new Error("departements.geojson not found");
        return res.json();
      })
      .then((g) => {
        setDepartmentsGeo(g);
        try {
          const count = g.features ? g.features.length : 0;
          console.info(`Loaded departments geojson './data/departements.geojson' with ${count} features`);
        } catch (e) {}
      })
      .catch(() => {
        // no departments file available — silently continue with departmentsGeo = null
        setDepartmentsGeo(null);
      });
  }, []);

  // Charger le mock des statistiques départementales (optionnel)
  useEffect(() => {
    fetch("./data/departments_mock.json")
      .then((res) => {
        if (!res.ok) throw new Error("departments_mock.json not found");
        return res.json();
      })
      .then((arr) => {
        if (!Array.isArray(arr)) return;
        const map = {};
        arr.forEach((o) => {
          try {
            const raw = String(o.code || "");
            // numeric key (e.g. "1", "21")
            const num = Number(raw.replace(/^0+/, ""));
            if (!Number.isNaN(num)) map[String(num)] = o;
            // original forms (uppercased and as-is) to match codes like "2A"/"2B" or "01"
            map[raw] = o;
            map[raw.toUpperCase()] = o;
            // two-digit zero-padded ("01")
            if (!Number.isNaN(num)) map[String(num).padStart(2, "0")] = o;
          } catch (e) {}
        });
        setDepartmentsStatsMap(map);
        console.info(`Loaded departments mock, entries=${Object.keys(map).length}`);
      })
      .catch(() => {
        setDepartmentsStatsMap({});
      });
  }, []);

  // Extraire les dates uniques triées
  const dates = useMemo(() => {
    const s = Array.from(new Set(rawData.map((d) => d.date)));
    s.sort((a, b) => new Date(a) - new Date(b));
    return s;
  }, [rawData]);

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
        departments: !!filters.departments,
      };
      localStorage.setItem("hexavax_filters", JSON.stringify(toStore));
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

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDepartmentStats, setSelectedDepartmentStats] = useState(null);

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

  const handleDepartmentClick = (feature) => {
    const code = readDepCode(feature);
    const stats = code ? departmentsStatsMap[String(Number(code))] || null : null;
    setSelectedDepartment(feature);
    setSelectedDepartmentStats(stats);
  };

  return (
    <div className="app">
      {/* --- HEADER --- */}
      <header
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
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
            departments={departmentsGeo}
            departmentsStatsMap={departmentsStatsMap}
            showDepartments={filters.departments}
            onDepartmentClick={handleDepartmentClick}
            mapStyle={import.meta.env.VITE_MAPBOX_STYLE}
            showHeatmap={filters.heatmap}
            showHospitals={filters.hospitals}
            showPharmacies={filters.pharmacies}
          />

          <FilterPanel
            filters={filters}
            onToggle={(key) => setFilters((p) => ({ ...p, [key]: !p[key] }))}
          />

          <DepartmentModal
            open={!!selectedDepartment}
            feature={selectedDepartment}
            stats={selectedDepartmentStats}
            onClose={() => { setSelectedDepartment(null); setSelectedDepartmentStats(null); }}
          />

          {/* single legend card that expands vertically depending on active layers */}
          {(filters.heatmap || filters.hospitals || filters.departments) && (
            <div className="legend">
              <Legend variants={[
                ...(filters.heatmap ? ["heatmap"] : []),
                ...(filters.hospitals ? ["hospitals"] : []),
                ...(filters.departments ? ["departments"] : []),
              ]} />
            </div>
          )}
        </div>
      </main>

      {/* --- SLIDER & DATE --- */}
      <footer className="footer">
        <div className="panel">
          {filters.heatmap ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  background: "#6E6BF3",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  marginLeft: "8px",
                }}
              >
                {currentDate || "Chargement..."}
              </div>

              <div style={{ position: "absolute", right: "24px" }}>
                <DatasetSelector value={dataset} onChange={setDataset} />
              </div>
            </div>
          ) : (
            <div style={{ height: 0 }} />
          )}
        </div>
      </footer>
    </div>
  );
}
