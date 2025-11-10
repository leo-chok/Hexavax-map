import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Divider, Chip, Box } from "@mui/material";

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

const criticalColor = (level) => {
  if (!level) return "default";
  const s = String(level).toLowerCase();
  if (s.includes("élev") || s.includes("ele") || s.includes("haut") || s.includes("fort")) return "error";
  if (s.includes("moy") || s.includes("medium") || s.includes("mod")) return "warning";
  return "success";
};

export default function DepartmentModal({ open, feature, onClose, stats = null }) {
  if (!feature) return null;

  const props = feature.properties || {};
  const displayName = props.nom || props.name || props.NOM || props.LIBELLE || props.label || null;

  const s = stats || props.stats || {
    saturation_pct: props.saturation_pct || props.saturation || null,
    population_65: props.population_65 || props.pop_65 || props.pop65 || null,
    doses_stock: props.doses_stock || props.vaccines_stock || null,
    centres_count: props.centres_count || props.centres || props.number_centres || null,
    year_change_pct: props.year_change_pct || props.change_pct || null,
    critical_state: props.critical_state || props.etat || props.etat_critique || null,
  };

  const chipColor = criticalColor(s.critical_state);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Département — {displayName || props.code || props.COD_DEP || "–"}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Taux de saturation des hôpitaux</Typography>
              <Typography variant="h6">{fmtPct(s.saturation_pct ?? "–")}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Population à risque (+65 ans)</Typography>
              <Typography variant="h6">{fmtNumber(s.population_65)} personnes</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Nombre de doses en stock</Typography>
              <Typography variant="h6">{fmtNumber(s.doses_stock)} unités</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Nombre de centres de soins</Typography>
              <Typography variant="h6">{fmtNumber(s.centres_count)}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <Typography variant="subtitle2" color="text.secondary">Evolution par rapport à l'année précédente</Typography>
            <Typography variant="body1">{fmtPct(s.year_change_pct)}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle2" color="text.secondary">Etat critique</Typography>
            <Chip label={s.critical_state || "–"} color={chipColor} size="small" />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">Données mock — valeurs temporaires pour démonstration.</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
