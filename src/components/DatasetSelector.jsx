import React from "react";
import { FormControl, Select, MenuItem, InputLabel } from "@mui/material";

export default function DatasetSelector({ value, onChange }) {
  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 200,
        backgroundColor: "#E9E6F8",
        borderRadius: "8px",
        border: "1px solid #6E6BF3",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiSelect-select": {
          color: "#14173D",
          fontFamily: "Roboto, sans-serif",
          fontWeight: 500,
        },
      }}
    >
      <InputLabel
        sx={{
          color: "#6E6BF3",
          fontWeight: 600,
          fontFamily: "Roboto, sans-serif",
        }}
      >
        Jeu de données
      </InputLabel>

      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label="Jeu de données"
        sx={{
          "& .MuiSvgIcon-root": { color: "#6E6BF3" },
        }}
      >
        <MenuItem value="france">France entière (hebdomadaire)</MenuItem>
        <MenuItem value="idf">Île-de-France (quotidien)</MenuItem>
        <MenuItem value="forecast">Prédiction (modèle ML)</MenuItem>
      </Select>
    </FormControl>
  );
}
