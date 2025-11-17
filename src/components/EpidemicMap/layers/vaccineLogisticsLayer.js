import { ArcLayer, ColumnLayer } from "@deck.gl/layers";

/**
 * Crée le layer de logistique des vaccins avec :
 * - Arcs 3D représentant les flux de livraison depuis les hangars vers les départements
 * - Colonnes 3D représentant les hangars de stockage
 * 
 * @param {Object} options
 * @param {Object} options.logisticsData - Données complètes (warehouses + daily_logistics)
 * @param {string} options.currentDate - Date actuelle (format YYYY-MM-DD)
 * @param {Object} options.departmentsGeojson - GeoJSON des départements pour les coordonnées
 * @param {Function} options.onArcHover - Callback survol arc
 * @param {Function} options.onWarehouseClick - Callback clic hangar
 * @returns {Array} Liste des layers (arcs + hangars)
 */
export function createVaccineLogisticsLayer({
  logisticsData = null,
  currentDate = null,
  departmentsGeojson = null,
  onArcHover = null,
  onWarehouseClick = null,
}) {
  if (!logisticsData || !currentDate || !departmentsGeojson) return [];

  const { warehouses = [], daily_logistics = {} } = logisticsData;
  const dayData = daily_logistics[currentDate];

  if (!dayData || !warehouses.length) return [];

  const layers = [];

  // Helper: Trouver le centroïde d'un département
  const getDepartmentCenter = (deptCode) => {
    const feature = departmentsGeojson.features?.find((f) => {
      const props = f.properties || {};
      const code = String(props.code || props.CODE || props.insee || "");
      return code === String(deptCode) || code === String(Number(deptCode));
    });

    if (!feature || !feature.geometry) return null;

    // Calculer centroïde simple (moyenne des coordonnées)
    if (feature.geometry.type === "Polygon") {
      const coords = feature.geometry.coordinates[0];
      const sum = coords.reduce(
        (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
        [0, 0]
      );
      return [sum[0] / coords.length, sum[1] / coords.length];
    }

    if (feature.geometry.type === "MultiPolygon") {
      // Prendre le premier polygone
      const coords = feature.geometry.coordinates[0][0];
      const sum = coords.reduce(
        (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
        [0, 0]
      );
      return [sum[0] / coords.length, sum[1] / coords.length];
    }

    return null;
  };

  // Préparer les données d'arcs (flux de livraison)
  const arcs = [];
  warehouses.forEach((warehouse) => {
    const whData = dayData[warehouse.id];
    if (!whData || !whData.deliveries) return;

    whData.deliveries.forEach((delivery) => {
      const targetCoords = getDepartmentCenter(delivery.dept);
      if (!targetCoords) return;

      arcs.push({
        source: warehouse.coordinates,
        target: targetCoords,
        doses: delivery.doses,
        type: delivery.type,
        dept: delivery.dept,
        warehouse_name: warehouse.name,
        warehouse_id: warehouse.id,
        stock_status: whData.status,
      });
    });
  });

  // Calculer min/max doses pour le scaling
  const dosesValues = arcs.map((a) => a.doses);
  const minDoses = Math.min(...dosesValues);
  const maxDoses = Math.max(...dosesValues);

  // 1. Layer des arcs (flux de livraison)
  const arcsLayer = new ArcLayer({
    id: "vaccine-logistics-arcs",
    data: arcs,
    pickable: true,
    getSourcePosition: (d) => [...d.source, 100], // altitude source
    getTargetPosition: (d) => [...d.target, 50], // altitude cible
    getSourceColor: (d) => {
      // Couleur selon le statut du hangar
      if (d.stock_status === "danger") return [239, 79, 145]; // #EF4F91 (rose accent)
      return [110, 107, 243]; // #6E6BF3 (bleu graph)
    },
    getTargetColor: (d) => {
      // Dégradé vers cyan
      return [125, 227, 242]; // #7DE3F2 (cyan)
    },
    getWidth: (d) => {
      // Épaisseur selon le nombre de doses (3 à 12 pixels)
      const normalized = (d.doses - minDoses) / (maxDoses - minDoses);
      return 3 + normalized * 9;
    },
    getHeight: (d) => {
      // Hauteur de l'arc selon le type de zone
      if (d.type === "urban") return 0.3;
      if (d.type === "periurban") return 0.5;
      return 0.7; // rural - arcs plus hauts
    },
    getTilt: 0,
    opacity: 0.7,
    onHover: (info) => {
      if (onArcHover) onArcHover(info);
    },
    updateTriggers: {
      getSourcePosition: [currentDate],
      getTargetPosition: [currentDate],
      getWidth: [currentDate],
    },
  });

  layers.push(arcsLayer);

  // 2. Layer des hangars (icônes 3D)
  const warehousesData = warehouses.map((wh) => {
    const whDayData = dayData[wh.id];
    return {
      ...wh,
      stock_current: whDayData?.stock_current || 0,
      stock_planned: whDayData?.stock_planned || 0,
      status: whDayData?.status || "normal",
    };
  });

  const warehousesLayer = new ColumnLayer({
    id: "vaccine-logistics-warehouses",
    data: warehousesData,
    diskResolution: 12,
    radius: 15000, // 15km de rayon
    extruded: true,
    pickable: true,
    elevationScale: 100,
    getPosition: (d) => d.coordinates,
    getElevation: (d) => {
      // Hauteur basée sur le stock actuel (0-50 unités)
      const fillRate = d.stock_current / d.capacity;
      return 20 + fillRate * 30; // Entre 20 et 50
    },
    getFillColor: (d) => {
      // Couleur selon le statut du stock
      if (d.status === "danger") return [239, 79, 145, 200]; // #EF4F91 (rose)
      if (d.status === "warning") return [255, 193, 7, 200]; // Orange
      return [110, 107, 243, 200]; // #6E6BF3 (bleu normal)
    },
    getLineColor: [255, 255, 255, 255],
    getLineWidth: 2,
    onClick: (info) => {
      if (onWarehouseClick) onWarehouseClick(info);
    },
    updateTriggers: {
      getElevation: [currentDate],
      getFillColor: [currentDate],
    },
  });

  layers.push(warehousesLayer);

  return layers;
}
