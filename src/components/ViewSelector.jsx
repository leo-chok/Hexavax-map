import React from "react";
import { Card, CardContent, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";

export default function ViewSelector({ value, onChange }) {
  return (
  <Card sx={{ width: 260, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, marginBottom: 1 }}>Vues</Typography>
        <FormControl fullWidth size="small">
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
      </CardContent>
    </Card>
  );
}
