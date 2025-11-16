import { GeoJsonLayer } from "@deck.gl/layers";

/**
 * Crée un layer 3D pour visualiser la population vulnérable (65+) par département
 * avec extrusion basée sur le pourcentage de population 65+
 */
export function createVulnerablePopulationLayer({
  geojson,
  populationData,
  visible = true,
}) {
  if (!visible || !geojson || !populationData) return null;

  // Créer un map pour accès rapide aux données par code département
  const dataMap = new Map();
  populationData.departements.forEach((dept) => {
    dataMap.set(dept.code, dept);
  });

  // Fonction pour obtenir la couleur basée sur le pourcentage 65+
  const getColorFromPercentage = (pct) => {
    if (pct >= 27) return [239, 79, 145, 200]; // Rose foncé (très élevé)
    if (pct >= 24) return [255, 107, 129, 180]; // Rose moyen
    if (pct >= 21) return [126, 227, 242, 160]; // Cyan
    if (pct >= 18) return [110, 107, 243, 140]; // Bleu
    return [110, 107, 243, 120]; // Bleu clair (faible)
  };

  return new GeoJsonLayer({
    id: "vulnerable-population-layer",
    data: geojson,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    wireframe: false,
    
    // Style des lignes
    getLineColor: [255, 255, 255, 100],
    getLineWidth: 2,
    lineWidthMinPixels: 1,

    // Couleur basée sur le pourcentage 65+
    getFillColor: (feature) => {
      const code = feature.properties?.code || feature.properties?.CODE || feature.properties?.cod_dep;
      const deptData = dataMap.get(String(code));
      
      if (!deptData) return [200, 200, 200, 100]; // Gris si pas de données
      
      return getColorFromPercentage(deptData.pourcentage_65_plus);
    },

    // Hauteur d'extrusion basée sur le pourcentage 65+
    getElevation: (feature) => {
      const code = feature.properties?.code || feature.properties?.CODE || feature.properties?.cod_dep;
      const deptData = dataMap.get(String(code));
      
      if (!deptData) return 0;
      
      // Extrusion exponentielle pour accentuer les différences
      // Formule: hauteur = (percentage/10)^2.5 * 8000
      // Cela donne des hauteurs plus marquées pour les % élevés
      const percentage = deptData.pourcentage_65_plus || 0;
      return Math.pow(percentage / 10, 5) * 200;
    },

    // Transitions fluides
    transitions: {
      getElevation: {
        duration: 500,
        easing: (t) => t * (2 - t), // easeOutQuad
      },
      getFillColor: {
        duration: 300,
      },
    },

    // Paramètres d'extrusion
    elevationScale: 1,
    material: {
      ambient: 0.35,
      diffuse: 0.6,
      shininess: 32,
      specularColor: [255, 255, 255],
    },

    // Update trigger
    updateTriggers: {
      getFillColor: [populationData],
      getElevation: [populationData],
    },
  });
}
