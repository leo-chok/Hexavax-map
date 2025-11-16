import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ViewSelector from "./ViewSelector";
import FilterPanel from "./FilterPanel";
import DomTomNavigator from "./DomTomNavigator";

/**
 * Panneau latéral gauche avec collapse
 * Contient les vues administratives et les filtres de calques
 */
export default function SidePanel({
  // État du panneau
  isOpen = true,
  onToggle,

  // Découpes administratives
  showAdminBoundaries = true,
  onAdminBoundariesChange,

  // Vues
  viewMode,
  onViewModeChange,

  // Filtres
  filters,
  onFiltersChange,

  // Navigation DOM-TOM
  onDomTomChange,
}) {
  return (
    <>
      {/* Panneau latéral */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          top: "60px", // Hauteur du header (30px + padding + border)
          bottom: "50px", // Hauteur du footer (30px + padding + border)
          width: isOpen ? "300px" : 0,
          transition: "width 0.3s ease-in-out",
          zIndex: 1000,
          overflow: "hidden",
          backgroundColor: "#E9E6F8",
          borderRight: "2px solid #6E6BF3",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: "100%",
            width: "300px",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          {/* Header avec bouton collapse */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              p: 2,
            }}
          >
            {/* Bouton hexagonal pour collapse */}
            <Button
              onClick={onToggle}
              sx={{
                minWidth: 0,
                width: 45,
                height: 52,
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                backgroundColor: "#6E6BF3",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                "&:hover": {
                  backgroundColor: "#EF4F91",
                  transform: "scale(1.1)",
                },
              }}
            >
              <ChevronLeftIcon />
            </Button>
          </Box>

          {/* Contenu */}
          <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
            {/* Section Vues */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1.5, color: "#14173D" }}
              >
                Vues
              </Typography>

              {/* Checkbox découpes administratives */}
              <FormGroup sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showAdminBoundaries}
                      onChange={(e) =>
                        onAdminBoundariesChange(e.target.checked)
                      }
                      sx={{
                        color: "#6E6BF3",
                        "&.Mui-checked": { color: "#6E6BF3" },
                      }}
                    />
                  }
                  label="Afficher les découpes administratives"
                />
              </FormGroup>

              {/* Sélecteur de vue (désactivé si checkbox non cochée) */}
              <ViewSelector
                value={viewMode}
                onChange={onViewModeChange}
                disabled={!showAdminBoundaries}
              />

              {/* Navigateur DOM-TOM (visible uniquement en mode domtom) */}
              {viewMode === "domtom" && showAdminBoundaries && (
                <DomTomNavigator onDomTomChange={onDomTomChange} />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Section Calques */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, mb: 1.5, color: "#14173D" }}
              >
                Calques
              </Typography>
              <FilterPanel
                filters={filters}
                onFiltersChange={onFiltersChange}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Bande pour rouvrir le panneau quand il est fermé */}
      {!isOpen && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: "60px", // Hauteur du header (30px + padding + border)
            bottom: "50px", // Hauteur du footer (30px + padding + border)
            width: "60px",
            backgroundColor: "#6E6BF3",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s",
            boxShadow: 3,
            "&:hover": {
              width: "70px",
              backgroundColor: "#EF4F91",
            },
          }}
          onClick={onToggle}
        >
          <Button
            sx={{
              minWidth: 0,
              width: 45,
              height: 52,
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              backgroundColor: "#E9E6F8",
              color: "#6E6BF3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s",
              "&:hover": {
                backgroundColor: "#fff",
                transform: "scale(1.15)",
              },
            }}
          >
            <ChevronRightIcon />
          </Button>
        </Box>
      )}
    </>
  );
}
