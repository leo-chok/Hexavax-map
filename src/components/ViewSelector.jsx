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
        <MenuItem value="national">Vue Nationale</MenuItem>
        <MenuItem value="regional">Vue Régionale</MenuItem>
        <MenuItem value="departmental">Vue Départementale</MenuItem>
        <MenuItem value="domtom">Vue DOM-TOM</MenuItem>
      </Select>
    </FormControl>
  );
}
