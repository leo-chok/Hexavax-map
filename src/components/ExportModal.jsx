import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Modale d'export CSV pour sélectionner les sections à exporter
 */
export default function ExportModal({ open, onClose, onExport, areaData }) {
  const [selectedSections, setSelectedSections] = useState({
    overview: true,
    epidemiology: true,
    healthSystem: true,
    vaccination: true,
    vulnerablePopulation: true,
    budget: true,
  });

  const handleToggleSection = (section) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedSections).every((v) => v);
    const newValue = !allSelected;
    setSelectedSections({
      overview: newValue,
      epidemiology: newValue,
      healthSystem: newValue,
      vaccination: newValue,
      vulnerablePopulation: newValue,
      budget: newValue,
    });
  };

  const handleExport = () => {
    onExport(selectedSections);
    onClose();
  };

  const allSelected = Object.values(selectedSections).every((v) => v);
  const someSelected = Object.values(selectedSections).some((v) => v);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#E9E6F8",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#14173D",
          fontWeight: 700,
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FileDownloadIcon sx={{ color: "#6E6BF3" }} />
          Exporter les données
        </Box>
        <Button
          onClick={onClose}
          sx={{ minWidth: "auto", color: "#14173D", opacity: 0.6 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <Divider sx={{ backgroundColor: "#7DE3F2", opacity: 0.3 }} />

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7, mb: 2 }}>
          Sélectionnez les sections à inclure dans le fichier CSV :
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={handleSelectAll}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                  "&.MuiCheckbox-indeterminate": { color: "#6E6BF3" },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 700, color: "#14173D" }}>
                Tout sélectionner
              </Typography>
            }
          />

          <Divider sx={{ my: 1, backgroundColor: "#14173D", opacity: 0.1 }} />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSections.overview}
                onChange={() => handleToggleSection("overview")}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                }}
              />
            }
            label="Vue d'ensemble"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSections.epidemiology}
                onChange={() => handleToggleSection("epidemiology")}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                }}
              />
            }
            label="Épidémiologie"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSections.healthSystem}
                onChange={() => handleToggleSection("healthSystem")}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                }}
              />
            }
            label="Système de santé"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSections.vaccination}
                onChange={() => handleToggleSection("vaccination")}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                }}
              />
            }
            label="Vaccination"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSections.vulnerablePopulation}
                onChange={() => handleToggleSection("vulnerablePopulation")}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                }}
              />
            }
            label="Population vulnérable"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={selectedSections.budget}
                onChange={() => handleToggleSection("budget")}
                sx={{
                  color: "#6E6BF3",
                  "&.Mui-checked": { color: "#6E6BF3" },
                }}
              />
            }
            label="Budget & financement"
          />
        </FormGroup>

        {areaData && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              backgroundColor: "#F8F9FF",
              borderRadius: 1,
              borderLeft: "3px solid #6E6BF3",
            }}
          >
            <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.6 }}>
              Zone sélectionnée
            </Typography>
            <Typography variant="body2" sx={{ color: "#14173D", fontWeight: 700 }}>
              {areaData.overview?.code || "–"} - {areaData.overview?.type || "–"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.6 }}>
              Date: {areaData.overview?.date || "–"}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ backgroundColor: "#7DE3F2", opacity: 0.3 }} />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#14173D",
            opacity: 0.7,
            "&:hover": { backgroundColor: "#14173D", opacity: 0.1 },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={!someSelected}
          startIcon={<FileDownloadIcon />}
          sx={{
            backgroundColor: "#6E6BF3",
            color: "#FFFFFF",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#5A58D9" },
            "&:disabled": { backgroundColor: "#14173D", opacity: 0.3 },
          }}
        >
          Télécharger CSV
        </Button>
      </DialogActions>
    </Dialog>
  );
}
