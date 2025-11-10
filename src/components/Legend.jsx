import React from "react";

// Legend component with variants: 'heatmap' (default) or 'hospitals'
export default function Legend({ variants = ["heatmap"], style = {} }) {
  // accept either a single variant string or an array
  const vs = Array.isArray(variants) ? variants : [variants];

  const heatLevels = [
    { color: "#ffffff", label: "Faible (1-25)" },
    { color: "#e3dd9b", label: "Modéré (26-50)" },
    { color: "#c49c4d", label: "Élevé (51-75)" },
    { color: "#b73030", label: "Alerte (76-100)" },
  ];

  const hospitalLevels = [
    { color: "#2ecc71", label: "0 - 30% (Faible)" },
    { color: "#2e96ff", label: "30 - 50% (Modéré)" },
    { color: "#c73fc5", label: "50 - 70% (Élevé)" },
    { color: "#ff0000", label: "70 - 100% (Critique)" },
  ];

  const departmentsLevels = [
    { color: "#DC2D2D", label: "Élevé" },
    { color: "#FAA03C", label: "Moyen" },
    { color: "#46B464", label: "Faible" },
  ];

  const renderSection = (variant, idx) => {
    if (variant === "departments") {
      return (
        <div key={variant} style={{ marginBottom: idx < vs.length - 1 ? 12 : 0 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📊 KPI départements</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            {departmentsLevels.map((lvl, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: lvl.color,
                    borderRadius: 4,
                    border: "1px solid #14173D10",
                  }}
                />
                <span>{lvl.label}</span>
              </div>
            ))}

            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: 6 }}>Extrusion — hauteur proportionnelle au taux de saturation (%)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                <div style={{ width: 24, height: 8, background: "#ddd", border: "1px solid #ccc" }} />
                <div style={{ width: 24, height: 18, background: "#bbb", border: "1px solid #aaa" }} />
                <div style={{ width: 24, height: 34, background: "#999", border: "1px solid #888" }} />
                <div style={{ marginLeft: 8, fontSize: "0.8rem", color: "#444" }}>0% &nbsp;&nbsp;50% &nbsp;&nbsp;100%</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const levels = variant === "hospitals" ? hospitalLevels : heatLevels;
    const title = variant === "hospitals" ? "🏥 Saturation hôpitaux" : "🔥 Niveau de contamination";

    return (
      <div key={variant} style={{ marginBottom: idx < vs.length - 1 ? 12 : 0 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {levels.map((lvl, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  backgroundColor: lvl.color,
                  borderRadius: 4,
                  border: "1px solid #14173D10",
                }}
              />
              <span>{lvl.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid #6E6BF3",
        borderRadius: "16px",
        padding: "14px 18px",
        color: "#14173D",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontFamily: "Roboto, sans-serif",
        fontSize: "0.9rem",
        backdropFilter: "blur(8px)",
        width: "fit-content",
        ...style,
      }}
    >
      {vs.map((v, i) => renderSection(v, i))}

      <div style={{ marginTop: 6, fontSize: "0.8rem", opacity: 0.75 }}>
        {vs.includes("hospitals")
          ? "Couleurs (coupures nettes) — moyenne sur l'hexagone"
          : "Survolez la carte pour voir les zones actives"}
      </div>
    </div>
  );
}
