import React from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Helper formatters
const fmtNumber = (n) => {
  if (n == null || n === "") return "–";
  try {
    return new Intl.NumberFormat("fr-FR").format(Number(n));
  } catch {
    return String(n);
  }
};

const fmtPct = (n) => {
  if (n == null || n === "") return "–";
  try {
    return `${Number(n).toFixed(1)} %`;
  } catch {
    return String(n);
  }
};

/**
 * Panneau latéral droit pour afficher les détails d'une zone (national/régional)
 * S'affiche quand on clique sur une région ou la vue nationale
 */
export default function AreaPanel({ open, feature, data = null, onClose, viewMode = null }) {
  if (!open || !feature) return null;

  const props = feature.properties || {};
  const rawName = props.nom || props.name || props.NOM || props.LIBELLE || props.label || props.CODE || "";
  // Use viewMode to decide the title: if national view is active show 'Nationale'
  const name = viewMode === "national" ? "Nationale" : (rawName || "–");

  // Data is provided as prop (for now we accept hard-coded values)
  const d = data || {
    vaccination_rate_pct: 68.4,
    cases_per_100k: 312,
    incidence_rate: 145.2,
    positivity_rate: 6.8,
    icu_occupancy_pct: 72.3,
    pharmacies_partners: 27,
    vaccination_centers: 12,
    last_update: new Date().toISOString().slice(0, 10),
  };

  // Always use current date for last_update
  const displayData = {
    ...d,
    last_update: new Date().toISOString().slice(0, 10),
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: "60px", // Hauteur du header
        bottom: "50px", // Hauteur du footer
        width: open ? "400px" : 0,
        transition: "width 0.3s ease-in-out",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E9E6F8",
          borderLeft: "2px solid #6E6BF3",
          overflow: "auto",
        }}
      >
        {/* Header avec bouton fermer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #7DE3F2",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
            Zone — {name}
          </Typography>

          {/* Bouton fermer */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6E6BF3",
              "&:hover": {
                backgroundColor: "#EF4F9120",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenu */}
        <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
          {/* Section Indicateurs épidémiologiques */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: "#6E6BF3", fontWeight: 700, mb: 1, display: "block" }}
            >
              Indicateurs épidémiologiques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Taux de vaccination
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#6E6BF3" }}>
                  {fmtPct(displayData.vaccination_rate_pct)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Cas positifs / 100k
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(displayData.cases_per_100k)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Taux d'incidence
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(displayData.incidence_rate)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Taux de positivité
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtPct(displayData.positivity_rate)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  % lits réa occupés
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtPct(displayData.icu_occupancy_pct)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* Section Infrastructure sanitaire */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "#6E6BF3", fontWeight: 700, mb: 1, display: "block" }}
            >
              Infrastructure sanitaire
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Pharmacies partenaires
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(displayData.pharmacies_partners)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Centres de vaccination
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(displayData.vaccination_centers)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}
                >
                  Dernière mise à jour
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {displayData.last_update}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Note */}
          <Box sx={{ mt: 3, p: 1.5, backgroundColor: "#7DE3F220", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.6 }}>
              💡 Données mock — valeurs temporaires pour démonstration.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
