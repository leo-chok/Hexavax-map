import React from "react";
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

export default function FilterPanel({ filters, onFiltersChange }) {
  const handleToggle = (key) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!filters.heatmap}
            onChange={() => handleToggle("heatmap")}
            sx={{
              color: "#1976d2",
              "&.Mui-checked": { color: "#1976d2" },
            }}
          />
        }
        label="Propagation virale"
      />

      
      <FormControlLabel
        control={
          <Checkbox
            checked={!!filters.hospitals}
            onChange={() => handleToggle("hospitals")}
            sx={{
              color: "#1976d2",
              "&.Mui-checked": { color: "#1976d2" },
            }}
          />
        }
        label="Saturation hôpitaux"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={!!filters.pharmacies}
            onChange={() => handleToggle("pharmacies")}
            sx={{
              color: "#1976d2",
              "&.Mui-checked": { color: "#1976d2" },
            }}
          />
        }
        label="Centres de vaccination"
      />
    </FormGroup>
  );
}
