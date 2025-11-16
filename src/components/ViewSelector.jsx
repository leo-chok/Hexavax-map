import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

export default function ViewSelector({ value, onChange, disabled = false }) {
  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel id="view-select-label">Vue</InputLabel>
      <Select
        labelId="view-select-label"
        value={value}
        label="Vue"
        onChange={(e) => onChange && onChange(e.target.value)}
      >
        <MenuItem value="national">Nationale</MenuItem>
        <MenuItem value="regional">Régionale</MenuItem>
        <MenuItem value="departmental">Départementale</MenuItem>
        <MenuItem value="domtom">DROM-COM</MenuItem>
      </Select>
    </FormControl>
  );
}
