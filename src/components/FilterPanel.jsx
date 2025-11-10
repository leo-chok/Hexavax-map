import React from "react";
import {
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";

export default function FilterPanel({ filters, onToggle }) {
  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        left: 12,
        top: 80,
        padding: 2,
        borderRadius: 2,
        zIndex: 1200,
        background: "rgba(255,255,255,0.95)",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, marginBottom: 1 }}>
        Calques
      </Typography>

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={!!filters.heatmap}
              onChange={() => onToggle("heatmap")}
              color="primary"
            />
          }
          label="Propagation (heatmap)"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!filters.departments}
              onChange={() => onToggle("departments")}
              color="primary"
            />
          }
          label="KPI départements"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!filters.hospitals}
              onChange={() => onToggle("hospitals")}
              color="primary"
            />
          }
          label="Saturation hôpitaux"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!filters.pharmacies}
              onChange={() => onToggle("pharmacies")}
              color="primary"
            />
          }
          label="Pharmacies"
        />
      </FormGroup>
    </Paper>
  );
}
