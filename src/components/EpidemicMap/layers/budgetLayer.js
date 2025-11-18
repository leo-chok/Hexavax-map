import { GeoJsonLayer, TextLayer } from "@deck.gl/layers";

/**
 * Layer Budget - Affiche les pourcentages du budget national par département
 * Sans coloration, juste le texte au centre
 */
export function createBudgetLayer({
  geojson,
  budgetData,
  currentDate,
  onClick,
}) {
  if (!geojson || !budgetData || !currentDate) return [];

  const layers = [];

  // Adapter la date actuelle à la période du budget (2024-11-15 à 2024-12-12)
  // Si on est en 2025, on transpose à 2024
  let searchDate = currentDate;
  if (currentDate.startsWith("2025-")) {
    searchDate = currentDate.replace("2025-", "2024-");
  }

  // Préparer une map code_dept -> data pour la date actuelle
  const dayData = budgetData.donnees?.find(d => d.date === searchDate);
  if (!dayData) {
    console.warn("⚠️ Budget Layer - No data for date:", searchDate, "(original:", currentDate, ")");
    return [];
  }

  // Helper pour normaliser le code département
  const normalizeCode = (code) => {
    if (!code) return null;
    const str = String(code).trim();
    // Enlever les zéros devant pour "01" -> "1"
    const normalized = str.replace(/^0+/, '') || '0';
    return normalized;
  };

  const budgetMap = {};
  dayData.departements.forEach(dept => {
    const normalized = normalizeCode(dept.code_insee);
    budgetMap[normalized] = dept;
    // Ajouter aussi la version avec zéro devant
    budgetMap[dept.code_insee] = dept;
  });

  // Helper pour extraire le code du feature
  const getFeatureCode = (feature) => {
    const p = feature.properties || {};
    const candidates = [
      p.code,
      p.CODE,
      p.insee,
      p.INSEE,
      p.code_insee,
      p.COD_DEP,
      p.cod_dep,
      p.dep,
      p.DEP,
    ];
    for (const c of candidates) {
      if (c != null) {
        const normalized = normalizeCode(c);
        if (budgetMap[normalized] || budgetMap[String(c)]) {
          return normalized;
        }
      }
    }
    return null;
  };

  // Layer des polygones (colorés selon le budget)
  const polygonLayer = new GeoJsonLayer({
    id: "budget-layer-polygons",
    data: geojson,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    lineWidthMinPixels: 2,
    getFillColor: d => {
      const code = getFeatureCode(d);
      const deptData = budgetMap[code];
      
      if (!deptData) return [110, 107, 243, 20]; // #6E6BF3 très transparent par défaut
      
      // Coloration basée sur la part du budget (0-2% typiquement)
      // Plus la part est élevée, plus c'est foncé
      const intensity = Math.min(deptData.part_budget_national * 50, 150); // Max 150 d'opacité
      return [110, 107, 243, intensity]; // #6E6BF3 avec opacité variable
    },
    getLineColor: [110, 107, 243, 180], // #6E6BF3 fixe
    getLineWidth: 2, // Fixe aussi
    onClick: onClick ? (info) => onClick(info.object) : undefined,
  });

  // Layer des labels (% du budget national)
  const labelData = geojson.features
    .map(feature => {
      const code = getFeatureCode(feature);
      if (!code) return null;
      
      const deptData = budgetMap[code];
      if (!deptData) return null;

      // Calculer le centroid approximatif
      const coords = feature.geometry.coordinates;
      let centroid = [0, 0];
      
      if (feature.geometry.type === "Polygon") {
        const ring = coords[0];
        const sumLng = ring.reduce((sum, pt) => sum + pt[0], 0);
        const sumLat = ring.reduce((sum, pt) => sum + pt[1], 0);
        centroid = [sumLng / ring.length, sumLat / ring.length];
      } else if (feature.geometry.type === "MultiPolygon") {
        const ring = coords[0][0];
        const sumLng = ring.reduce((sum, pt) => sum + pt[0], 0);
        const sumLat = ring.reduce((sum, pt) => sum + pt[1], 0);
        centroid = [sumLng / ring.length, sumLat / ring.length];
      }

      return {
        position: centroid,
        text: `${deptData.part_budget_national.toFixed(2)}%`,
        code: code,
      };
    })
    .filter(Boolean);

  const textLayer = new TextLayer({
    id: "budget-layer-labels",
    data: labelData,
    pickable: false,
    getPosition: d => d.position,
    getText: d => d.text,
    getSize: 18,
    getColor: [110, 107, 243, 255], // #9440a7ff
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
    fontFamily: "Arial, sans-serif",
    fontWeight: 800,
    billboard: false,
    getPixelOffset: [0, -20],
  });

  layers.push(polygonLayer);
  layers.push(textLayer);

  return layers;
}
