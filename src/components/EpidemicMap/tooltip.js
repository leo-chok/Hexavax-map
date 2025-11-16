export function getTooltipContent({ object, layer, viewMode }) {
  if (!object || !layer) return null;

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
    return { text: `${label} : ${satText}` };
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

  // View / administrative boundaries hover: show the region/department name
  // MAIS seulement si ce n'est pas un autre layer plus prioritaire (pharmacies, hôpitaux, etc.)
  if (layer.id && layer.id.startsWith("view-layer")) {
    // Ne pas afficher si l'objet a une propriété `points` (c'est un HexagonLayer)
    if (object && object.points) return null;
    
    const feat = object.object || object;
    const p = (feat && feat.properties) || {};
    const rawName = p.nom || p.name || p.NOM || p.LIBELLE || p.label || p.CODE || p.code || p.dep || p.DEP || "";
    // If the current view is the national view, label it 'Nationale'
    const name = viewMode === "national" ? "Nationale" : (rawName || "–");

    // helpers to read a numeric property from multiple possible keys
    const readNum = (props, keys) => {
      for (const k of keys) {
        const v = props[k];
        if (v == null) continue;
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
      }
      return null;
    };

    // Try common property names for the requested KPIs
    const vacc = readNum(p, ["vaccination_rate_pct", "vaccination_pct", "vacc_rate", "vacc_pct", "vaccination", "vax_pct"]);
    const cases100k = readNum(p, ["cases_per_100k", "cases100k", "cases_100k", "cases", "positives_per_100k"]);
    const incidence = readNum(p, ["incidence_rate", "incidence", "taux_incidence", "incidence_per_100k"]);

    // If values are missing, produce deterministic mock values from the name
    const nameHash = String(name).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
    const mockVacc = Math.round(50 + (nameHash % 40) + (nameHash % 10) * 0.1);
    const mockCases = 100 + (nameHash % 500);
    const mockInc = Math.round(50 + (nameHash % 120));

    const vaccText = vacc != null ? `${vacc.toFixed(1)} %` : `${mockVacc.toFixed(1)} %`;
    const casesText = cases100k != null ? `${cases100k}` : `${mockCases}`;
    const incText = incidence != null ? `${incidence}` : `${mockInc}`;

    // Build a small multiline tooltip
    const lines = [String(name), `Vaccination: ${vaccText}`, `Cas /100k: ${casesText}`, `Incidence: ${incText}`];
    return { text: lines.join("\n") };
  }

  return null;
}
