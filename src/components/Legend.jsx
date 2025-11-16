import React from "react";
import { LAYER_ORDER } from "../config/constants";

/**
 * Légende dynamique qui affiche les informations des calques actifs
 * L'ordre suit celui du SidePanel: heatmap → departments → hospitals → pharmacies
 */
export default function Legend({ filters = {}, style = {} }) {
  // Filtrer uniquement les calques actifs dans l'ordre
  const activeLayers = LAYER_ORDER.filter(layer => filters[layer.key]);

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

  const pharmaciesLevels = [
    { color: "#00ff00", label: "Stock élevé (75-100%)" },
    { color: "#ffff00", label: "Stock moyen (50-75%)" },
    { color: "#ffa500", label: "Stock faible (25-50%)" },
    { color: "#ff0000", label: "Stock critique (0-25%)" },
  ];

  const vulnerablePopulationLevels = [
    { color: "rgba(239, 79, 145, 0.8)", label: "≥ 27% (Très élevé)" },
    { color: "rgba(255, 107, 129, 0.7)", label: "24-27% (Élevé)" },
    { color: "rgba(126, 227, 242, 0.6)", label: "21-24% (Moyen)" },
    { color: "rgba(110, 107, 243, 0.5)", label: "< 21% (Faible)" },
  ];

  const renderSection = (layer, idx) => {
    const { key, label } = layer;

    if (key === "departments") {
      return (
        <>
          <div key={key}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>📊 {label}</div>
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
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                  <div style={{ width: 24, height: 8, background: "#ddd", border: "1px solid #ccc" }} />
                  <div style={{ width: 24, height: 18, background: "#bbb", border: "1px solid #aaa" }} />
                  <div style={{ width: 24, height: 34, background: "#999", border: "1px solid #888" }} />
                  <div style={{ marginLeft: 8, fontSize: "0.8rem", color: "#444" }}>0% &nbsp;&nbsp;50% &nbsp;&nbsp;100%</div>
                </div>
              </div>
            </div>
          </div>
          {idx < activeLayers.length - 1 && (
            <div style={{ height: 1, backgroundColor: "#ddd", margin: "12px 0" }} />
          )}
        </>
      );
    }

    if (key === "pharmacies") {
      return (
        <>
          <div key={key}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>💉 {label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {pharmaciesLevels.map((lvl, i) => (
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
          {idx < activeLayers.length - 1 && (
            <div style={{ height: 1, backgroundColor: "#ddd", margin: "12px 0" }} />
          )}
        </>
      );
    }

    if (key === "vulnerablePopulation") {
      return (
        <>
          <div key={key}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>👴 {label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {vulnerablePopulationLevels.map((lvl, i) => (
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
          {idx < activeLayers.length - 1 && (
            <div style={{ height: 1, backgroundColor: "#ddd", margin: "12px 0" }} />
          )}
        </>
      );
    }

    const levels = key === "hospitals" ? hospitalLevels : heatLevels;
    const icon = key === "hospitals" ? "🏥" : "🔥";

    return (
      <>
        <div key={key}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{icon} {label}</div>
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
        {idx < activeLayers.length - 1 && (
          <div style={{ height: 1, backgroundColor: "#ddd", margin: "12px 0" }} />
        )}
      </>
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
      {activeLayers.length === 0 ? (
        <div style={{ fontStyle: "italic", opacity: 0.7 }}>Aucun calque actif</div>
      ) : (
        activeLayers.map((layer, i) => renderSection(layer, i))
      )}
    </div>
  );
}
