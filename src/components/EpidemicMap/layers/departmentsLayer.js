import { GeoJsonLayer } from "@deck.gl/layers";

/**
 * Lit la valeur de saturation depuis les propriétés d'un feature GeoJSON
 * @param {Object} feature - Feature GeoJSON
 * @param {Object} statsMap - Map des stats par code département
 * @returns {number|null} Valeur de saturation ou null
 */
function readSaturation(feature, statsMap = {}) {
  const p = (feature && feature.properties) || {};
  
  // Essayer les propriétés directes
  const candidates = [
    p.saturation_pct,
    p.saturation,
    p.saturationPct,
    p.sat,
    p.SATURATION,
  ];
  
  for (const v of candidates) {
    if (v == null) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }

  // Fallback : chercher dans la statsMap par code département
  try {
    const codeCandidates = [
      p.code,
      p.CODE,
      p.COD_DEP,
      p.cod_dep,
      p.insee,
      p.INSEE,
      p.code_insee,
      p.dep,
      p.DEP,
    ];
    
    for (const c of codeCandidates) {
      if (c == null) continue;
      const raw = String(c);
      const num = String(Number(raw.replace(/^0+/, "")));
      
      // Essayer différentes variantes du code
      const variants = [
        num,
        raw,
        raw.toUpperCase(),
        String(Number(raw)).padStart(2, "0"),
      ];
      
      for (const variant of variants) {
        if (statsMap[variant]) {
          const v = statsMap[variant].saturation_pct ?? statsMap[variant].saturation;
          if (v != null) return Number(v);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return null;
}

/**
 * Lit l'état critique depuis les propriétés d'un feature GeoJSON
 * @param {Object} feature - Feature GeoJSON
 * @param {Object} statsMap - Map des stats par code département
 * @returns {string|null} État critique ou null
 */
function readCritical(feature, statsMap = {}) {
  const p = (feature && feature.properties) || {};
  
  const cand =
    p.critical_state ||
    p.etat ||
    p.etat_critique ||
    p.critical ||
    p.state ||
    null;
    
  if (cand) return String(cand);

  // Fallback : chercher dans la statsMap
  try {
    const codeCandidates = [
      p.code,
      p.CODE,
      p.COD_DEP,
      p.cod_dep,
      p.insee,
      p.INSEE,
      p.code_insee,
      p.dep,
      p.DEP,
    ];
    
    for (const c of codeCandidates) {
      if (c == null) continue;
      const raw = String(c);
      const num = String(Number(raw.replace(/^0+/, "")));
      
      const variants = [
        num,
        raw,
        raw.toUpperCase(),
        String(Number(raw)).padStart(2, "0"),
      ];
      
      for (const variant of variants) {
        const s = statsMap[variant];
        if (s && (s.critical_state || s.etat || s.etat_critique || s.critical)) {
          return String(s.critical_state || s.etat || s.etat_critique || s.critical);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return null;
}

/**
 * Calcule la couleur selon l'état critique
 * @param {string} criticalState - État critique
 * @returns {Array} Couleur RGBA
 */
function colorForCritical(criticalState) {
  if (!criticalState) return [150, 200, 255, 160];
  
  const lower = criticalState.toLowerCase();
  
  if (
    lower.includes("élev") ||
    lower.includes("elev") ||
    lower.includes("haut") ||
    lower.includes("fort")
  ) {
    return [220, 45, 45, 220]; // Rouge : critique élevé
  }
  
  if (
    lower.includes("moy") ||
    lower.includes("medium") ||
    lower.includes("mod")
  ) {
    return [250, 160, 60, 200]; // Orange : critique moyen
  }
  
  if (lower.includes("faibl") || lower.includes("low")) {
    return [70, 180, 100, 180]; // Vert : critique faible
  }
  
  return [150, 200, 255, 160]; // Bleu par défaut
}

/**
 * Calcule l'élévation d'un département selon la saturation
 * - Faible (sat < 33) → 200
 * - Moyen (33 <= sat < 66) → 1500
 * - Élevé (sat >= 66) → 5000
 * 
 * @param {Object} feature - Feature GeoJSON
 * @param {Object} statsMap - Map des stats
 * @returns {number} Élévation en unités deck.gl
 */
function getDeptElevation(feature, statsMap) {
  const sat = readSaturation(feature, statsMap);
  if (sat == null || Number.isNaN(sat)) return 20;
  
  const clamped = Math.max(0, Math.min(100, Number(sat)));
  if (clamped < 33) return 200;    // Faible
  if (clamped < 66) return 1500;   // Moyen
  return 5000;                     // Élevé
}

/**
 * Calcule la couleur de remplissage d'un département
 * @param {Object} feature - Feature GeoJSON
 * @param {Object} statsMap - Map des stats
 * @returns {Array} Couleur RGBA
 */
function getDeptFillColor(feature, statsMap) {
  const crit = readCritical(feature, statsMap);
  const base = colorForCritical(crit);
  
  // Moduler l'alpha selon la saturation
  const sat = readSaturation(feature, statsMap);
  let alpha = base[3] != null ? base[3] : 180;
  
  if (sat != null && !Number.isNaN(Number(sat))) {
    const c = Math.max(0, Math.min(100, Number(sat)));
    // Alpha range 80..255
    alpha = Math.round(80 + (c / 100) * (255 - 80));
  }
  
  return [base[0], base[1], base[2], alpha];
}

/**
 * Crée le layer départements (GeoJSON extrudé avec KPIs)
 * @param {Object} options - Configuration du layer
 * @param {Object} options.departments - GeoJSON des départements
 * @param {Object} options.departmentsStatsMap - Map des stats par code département
 * @param {Function} options.onDepartmentClick - Callback au clic sur un département
 * @param {Object} options.scaling - Paramètres de scaling
 * @returns {GeoJsonLayer|null} Le layer départements ou null si pas de données
 */
export function createDepartmentsLayer({
  departments = null,
  departmentsStatsMap = {},
  onDepartmentClick = null,
  scaling = {},
}) {
  if (!departments) return null;

  return new GeoJsonLayer({
    id: "departments-layer",
    data: departments,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    wireframe: true,
    getElevation: (d) => getDeptElevation(d, departmentsStatsMap),
    getFillColor: (d) => getDeptFillColor(d, departmentsStatsMap),
    getLineColor: [40, 40, 40],
    lineWidthMinPixels: 1,
    getLineWidth: 1,
    onClick: ({ object }) => {
      if (onDepartmentClick && object) onDepartmentClick(object);
    },
    updateTriggers: {
      getElevation: [
        scaling.elevationMultiplier,
        departments,
        departmentsStatsMap,
      ],
      getFillColor: [departments, departmentsStatsMap],
    },
  });
}
