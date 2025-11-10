export function getTooltipContent({ object, layer, viewMode }) {
  if (!object || !layer) return null;

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

  if (layer.id === "pharmacies-layer") {
    return { text: object.name };
  }

  // View / administrative boundaries hover: show the region/department name
  if (layer.id && (layer.id.startsWith("view-layer") || layer.id === "departments-layer")) {
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
