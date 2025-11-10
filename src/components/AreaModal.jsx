import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Divider, Box } from "@mui/material";

// Simple formatters
const fmtNumber = (n) => {
  if (n == null || n === "") return "–";
  try { return new Intl.NumberFormat("fr-FR").format(Number(n)); } catch { return String(n); }
};
const fmtPct = (n) => {
  if (n == null || n === "") return "–";
  try { return `${Number(n).toFixed(1)} %`; } catch { return String(n); }
};

export default function AreaModal({ open, feature, data = null, onClose, viewMode = null }) {
  if (!feature) return null;

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
    last_update: "2025-11-10",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Taux de vaccination</Typography>
              <Typography variant="h6">{fmtPct(d.vaccination_rate_pct)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Cas positifs / 100k</Typography>
              <Typography variant="h6">{fmtNumber(d.cases_per_100k)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Taux d'incidence</Typography>
              <Typography variant="h6">{fmtNumber(d.incidence_rate)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Taux de positivité</Typography>
              <Typography variant="h6">{fmtPct(d.positivity_rate)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">% lits réa occupés</Typography>
              <Typography variant="h6">{fmtPct(d.icu_occupancy_pct)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Pharmacies partenaires</Typography>
              <Typography variant="h6">{fmtNumber(d.pharmacies_partners)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Centres de vaccination actifs</Typography>
              <Typography variant="h6">{fmtNumber(d.vaccination_centers)}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Dernière mise à jour</Typography>
              <Typography variant="h6">{d.last_update}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">Données mock — valeurs en dur pour la démonstration.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
