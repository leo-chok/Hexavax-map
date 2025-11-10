export function getTooltipContent({ object, layer }) {
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

  return null;
}
