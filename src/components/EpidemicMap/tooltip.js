export function getTooltipContent({ object, layer, viewMode, areaTimeseries = {}, currentDate, vulnerablePopulationData = null }) {
  if (!object || !layer) return null;

  // Tooltip pour les arcs de logistique vaccins
  if (layer.id === "vaccine-logistics-arcs") {
    const doses = object.doses?.toLocaleString('fr-FR') || '0';
    const dept = object.dept || 'Département';
    const type = object.type === 'urban' ? 'Urbain' : object.type === 'periurban' ? 'Périurbain' : 'Rural';
    const warehouse = object.warehouse_name || 'Hangar';
    return { 
      text: `${warehouse}\n→ Département ${dept}\n${doses} doses\nType: ${type}` 
    };
  }

  // Tooltip pour les hangars
  if (layer.id === "vaccine-logistics-warehouses") {
    const name = object.name || 'Hangar';
    const location = object.location || '';
    const stock = object.stock_current?.toLocaleString('fr-FR') || '0';
    const capacity = object.capacity?.toLocaleString('fr-FR') || '0';
    const fillRate = ((object.stock_current / object.capacity) * 100).toFixed(0);
    const status = object.status === 'danger' ? '🔴 Critique' : object.status === 'warning' ? '🟠 Attention' : '🟢 Normal';
    return { 
      text: `${name}\n${location}\n\nStock: ${stock} / ${capacity} doses\nTaux: ${fillRate}%\nStatut: ${status}` 
    };
  }

  // Vérifier d'abord les layers pharmacies pour éviter les conflits
  if (layer.id === "pharmacies-hexagon-layer") {
    // HexagonLayer : affichage agrégé
    if (object) {
      const count = object.count || object.colorValue || 1;
      const totalDoses = object.elevationValue || 0;
      
      if (count === 1) {
        return { text: `1 pharmacie\nStock : ${Math.round(totalDoses)} doses` };
      }
      
      return { 
        text: `${count} pharmacies\nStock total : ${Math.round(totalDoses)} doses` 
      };
    }
    return { text: "Pharmacie" };
  }

  // ScatterplotLayer : affichage individuel détaillé
  if (layer.id === "pharmacies-scatter-layer") {
    if (object) {
      const lines = [];
      if (object.name) lines.push(object.name);
      if (object.address) lines.push(object.address);
      if (object.open !== undefined) lines.push(`Ouvert : ${object.open ? "Oui" : "Non"}`);
      const stock = object.stock_doses || object.doses;
      if (stock !== undefined) lines.push(`Stock : ${stock} doses`);
      return { text: lines.length > 0 ? lines.join("\n") : "Pharmacie" };
    }
    return { text: "Pharmacie" };
  }

  if (layer.id === "hospital-saturation") {
    const item = object.object ?? object;
    const label = item?.label ?? item?.name ?? "Hôpital";
    const sat = Number(item?.saturation ?? item?.sat ?? item?.value);
    const satText = Number.isFinite(sat) ? `${sat.toFixed(0)}%` : "–";
    return { text: `${label}\nSaturation : ${satText}` };
  }

  if (layer.id === "heatmap-layer" && typeof object.weight === "number") {
    return { text: `Indice de risque ${(object.weight * 100).toFixed(0)} / 100` };
  }

  if (layer.id === "pharmacies-layer" || layer.id === "pharmacies-cube-layer") {
    // Affiche le nom et éventuellement d'autres infos
    let txt = object.name || "Pharmacie";
    if (object.address) txt += `\n${object.address}`;
    if (object.city) txt += `\n${object.city}`;
    if (object.open || !object.open) txt += `\nOuvert : ${(object.open ? "Oui" : "Non")}`;
    if (object.stock_doses) txt += `\nDoses en stock : ${object.stock_doses}`;
    return { text: txt };
  }

  // Layer population vulnérable 65+
  if (layer.id === "vulnerable-population-layer") {
    const feat = object.object || object;
    const p = (feat && feat.properties) || {};
    const deptName = p.nom || p.name || p.NOM || p.LIBELLE || "Département";
    const code = p.code || p.CODE || p.cod_dep || p.COD_DEP;
    
    // Chercher les données dans vulnerablePopulationData
    let deptData = null;
    if (vulnerablePopulationData && code) {
      deptData = vulnerablePopulationData.departements.find(d => d.code === String(code));
    }
    
    if (!deptData) {
      return { text: deptName };
    }
    
    const lines = [
      `${deptData.nom} (${deptData.code})`,
      `Population 65+ : ${deptData.pourcentage_65_plus.toFixed(1)}%`,
      `${deptData.population_65_plus.toLocaleString('fr-FR')} / ${deptData.population_totale.toLocaleString('fr-FR')} hab.`,
      `Population à risque : ${deptData.population_a_risque.toLocaleString('fr-FR')}`
    ];
    
    return { text: lines.join("\n") };
  }

  // View / administrative boundaries hover: show the region/department name
  if (layer.id && layer.id.startsWith("view-layer")) {
    // Ne pas afficher si l'objet a une propriété `points` (c'est un HexagonLayer)
    if (object && object.points) return null;
    
    const feat = object.object || object;
    const p = (feat && feat.properties) || {};
    const rawName = p.nom || p.name || p.NOM || p.LIBELLE || p.label || p.CODE || p.code || p.dep || p.DEP || "";
    const name = viewMode === "national" ? "Nationale" : (rawName || "–");

    // Récupérer les vraies données depuis les timeseries
    let areaData = null;
    if (currentDate && areaTimeseries[currentDate]) {
      if (viewMode === "departmental" || viewMode === "domtom") {
        // Match par code département
        const code = p.code || p.CODE || p.cod_dep || p.COD_DEP;
        if (code) {
          const codeStr = String(code);
          // Essayer directement le code
          areaData = areaTimeseries[currentDate][codeStr];
          
          // Si pas trouvé, essayer sans les zéros initiaux (pour métropole)
          if (!areaData) {
            const numCode = String(Number(codeStr.replace(/^0+/, "")));
            areaData = areaTimeseries[currentDate][numCode];
          }
        }
      } else if (viewMode === "regional") {
        // Match par nom de région
        const regionName = p.nom || p.name || p.NOM || p.LIBELLE;
        if (regionName) {
          areaData = areaTimeseries[currentDate][regionName];
        }
      } else if (viewMode === "national") {
        // Données nationales
        areaData = areaTimeseries[currentDate];
      }
    }

    // Formatter les valeurs
    const fmtPct = (val) => val != null ? `${val.toFixed(1)}%` : "–";
    const fmtNum = (val) => val != null ? Math.round(val).toString() : "–";

    const vaccText = fmtPct(areaData?.vaccination_rate_pct);
    const casesText = fmtNum(areaData?.cases_per_100k);
    const incText = fmtNum(areaData?.incidence_rate);
    const icuText = fmtPct(areaData?.icu_occupancy_pct);

    // Build a simple text tooltip
    const lines = [
      String(name),
      `Vaccination: ${vaccText}`,
      `Cas /100k: ${casesText}`,
      `Incidence: ${incText}`,
      `Lits réa: ${icuText}`
    ];
    return { text: lines.join("\n") };
  }

  return null;
}
