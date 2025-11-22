import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import ElderlyIcon from "@mui/icons-material/Elderly";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ExportModal from "./ExportModal";

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

/**
 * Panneau latéral droit pour afficher les détails complets d'une zone
 * Agrège toutes les données des layers : épidémio, santé, vaccination, budget, etc.
 */
export default function AreaPanel({ open, feature, data = null, onClose, viewMode = null }) {
  const [exportModalOpen, setExportModalOpen] = useState(false);

  if (!open || !feature) return null;

  const props = feature.properties || {};
  const rawName = props.nom || props.name || props.NOM || props.LIBELLE || props.label || props.CODE || "";
  const name = viewMode === "national" ? "France" : (rawName || "–");

  // Extract aggregated data sections
  const overview = data?.overview || {};
  const epidemiology = data?.epidemiology || {};
  const healthSystem = data?.healthSystem || {};
  const vaccination = data?.vaccination || {};
  const vulnerablePopulation = data?.vulnerablePopulation || {};
  const budget = data?.budget || {};

  /**
   * Fonction d'export CSV
   * Convertit les sections sélectionnées en CSV et lance le téléchargement
   */
  const exportToCSV = (selectedSections) => {
    try {
      const rows = [];
      const headers = ["Section", "Champ", "Valeur"];
      rows.push(headers.join(","));

      // Section Vue d'ensemble
      if (selectedSections.overview) {
        rows.push(`"Vue d'ensemble","Code","${overview.code || "–"}"`);
        rows.push(`"Vue d'ensemble","Type","${overview.type || "–"}"`);
        rows.push(`"Vue d'ensemble","Date","${overview.date || "–"}"`);
        rows.push(`"Vue d'ensemble","Population","${overview.population || "–"}"`);
        rows.push(`"Vue d'ensemble","Surface (km²)","${overview.surface_km2 || "–"}"`);
      }

      // Section Épidémiologie
      if (selectedSections.epidemiology) {
        rows.push(`"Épidémiologie","Taux de vaccination (%)","${epidemiology.vaccination_rate_pct || "–"}"`);
        rows.push(`"Épidémiologie","Cas pour 100k hab","${epidemiology.cases_per_100k || "–"}"`);
        rows.push(`"Épidémiologie","Taux d'incidence","${epidemiology.incidence_rate || "–"}"`);
        rows.push(`"Épidémiologie","Taux de positivité (%)","${epidemiology.positivity_rate || "–"}"`);
        rows.push(`"Épidémiologie","Occupation réa (%)","${epidemiology.icu_occupancy_pct || "–"}"`);
        rows.push(`"Épidémiologie","Total cas","${epidemiology.total_cases || "–"}"`);
        rows.push(`"Épidémiologie","Total décès","${epidemiology.total_deaths || "–"}"`);
        rows.push(`"Épidémiologie","R effectif","${epidemiology.r_effectif || "–"}"`);
      }

      // Section Système de santé
      if (selectedSections.healthSystem) {
        rows.push(`"Système de santé","Nombre d'hôpitaux","${healthSystem.hospitals_count || "–"}"`);
        rows.push(`"Système de santé","Saturation moyenne (%)","${healthSystem.avg_saturation || "–"}"`);
        rows.push(`"Système de santé","Niveau d'alerte","${healthSystem.alert_level || "–"}"`);
        rows.push(`"Système de santé","Lits disponibles","${healthSystem.beds_available || "–"}"`);
        if (healthSystem.hospitals && Array.isArray(healthSystem.hospitals)) {
          healthSystem.hospitals.forEach((h, idx) => {
            rows.push(`"Système de santé","Hôpital ${idx + 1}","${h.nom || "–"} (${h.saturation || "–"}%)"`);
          });
        }
      }

      // Section Vaccination
      if (selectedSections.vaccination) {
        rows.push(`"Vaccination","Centres partenaires","${vaccination.partner_centers_count || "–"}"`);
        rows.push(`"Vaccination","Pharmacies","${vaccination.pharmacies_count || "–"}"`);
        rows.push(`"Vaccination","Doses administrées","${vaccination.doses_administered || "–"}"`);
        rows.push(`"Vaccination","Doses quotidiennes","${vaccination.daily_doses || "–"}"`);
        rows.push(`"Vaccination","Warehouse(s)","${vaccination.warehouse || "–"}"`);
        rows.push(`"Vaccination","Stock actuel","${vaccination.current_stock || "–"}"`);
        rows.push(`"Vaccination","Stock planifié","${vaccination.planned_stock || "–"}"`);
      }

      // Section Population vulnérable
      if (selectedSections.vulnerablePopulation) {
        rows.push(`"Population vulnérable","Population 65+","${vulnerablePopulation.population_65_plus || "–"}"`);
        rows.push(`"Population vulnérable","Pourcentage 65+","${vulnerablePopulation.pct_65_plus || "–"}"`);
        rows.push(`"Population vulnérable","Comorbidités","${vulnerablePopulation.comorbidities || "–"}"`);
        rows.push(`"Population vulnérable","Taux vaccination 65+","${vulnerablePopulation.vaccination_rate_65_plus || "–"}"`);
      }

      // Section Budget
      if (selectedSections.budget) {
        rows.push(`"Budget & financement","Budget journalier","${budget.budget_journalier || "–"}"`);
        rows.push(`"Budget & financement","Budget cumulé","${budget.budget_cumule || "–"}"`);
        rows.push(`"Budget & financement","Budget utilisé (%)","${budget.budget_utilise_pct || "–"}"`);
        rows.push(`"Budget & financement","Sources de financement","${budget.sources_financement || "–"}"`);
        rows.push(`"Budget & financement","Catégories de dépenses","${budget.depenses_categories || "–"}"`);
      }

      // Créer le fichier CSV
      const csvContent = rows.join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      // Nom du fichier: export_[zone]_[date].csv
      const filename = `export_${overview.code || "zone"}_${overview.date || "data"}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Export CSV réussi: ${filename}`);
    } catch (error) {
      console.error("❌ Erreur lors de l'export CSV:", error);
    }
  };

  const handleExportClick = () => {
    setExportModalOpen(true);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: "60px", // Hauteur du header
        bottom: "50px", // Hauteur du footer
        width: open ? "400px" : 0,
        transition: "width 0.3s ease-in-out",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E9E6F8",
          borderLeft: "2px solid #6E6BF3",
          overflow: "auto",
        }}
      >
        {/* Header avec titre, bouton Exporter et bouton fermer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #7DE3F2",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
            {name}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Bouton Exporter */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportClick}
              sx={{
                color: "#6E6BF3",
                borderColor: "#6E6BF3",
                textTransform: "none",
                fontSize: "0.8rem",
                "&:hover": {
                  borderColor: "#6E6BF3",
                  backgroundColor: "#6E6BF310",
                },
              }}
            >
              Exporter
            </Button>

            {/* Bouton fermer */}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "#6E6BF3",
                "&:hover": {
                  backgroundColor: "#EF4F9120",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Contenu scrollable avec 6 sections */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
          
          {/* ========== SECTION 1: VUE D'ENSEMBLE ========== */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <DashboardIcon sx={{ color: "#6E6BF3", fontSize: "1.2rem" }} />
              <Typography
                variant="overline"
                sx={{ color: "#6E6BF3", fontWeight: 700, fontSize: "0.9rem" }}
              >
                Vue d'ensemble
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                Code: <strong>{overview.code || "–"}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                Type: <strong>{overview.type || "–"}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                Date: <strong>{overview.date || "–"}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7, mt: 1 }}>
                Population: <strong>{fmtNumber(overview.population)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                Surface: <strong>{fmtNumber(overview.surface_km2)} km²</strong>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* ========== SECTION 2: ÉPIDÉMIOLOGIE ========== */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CoronavirusIcon sx={{ color: "#6E6BF3", fontSize: "1.2rem" }} />
              <Typography
                variant="overline"
                sx={{ color: "#6E6BF3", fontWeight: 700, fontSize: "0.9rem" }}
              >
                Épidémiologie
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Taux vaccination
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#6E6BF3" }}>
                  {fmtPct(epidemiology.vaccination_rate_pct)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Cas / 100k
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(epidemiology.cases_per_100k)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Incidence
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(epidemiology.incidence_rate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Positivité
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtPct(epidemiology.positivity_rate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Lits réa
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtPct(epidemiology.icu_occupancy_pct)}
                </Typography>
              </Grid>
              {epidemiology.r_effectif && (
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                    R effectif
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#14173D" }}>
                    {epidemiology.r_effectif.toFixed(2)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* ========== SECTION 3: SYSTÈME DE SANTÉ ========== */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <LocalHospitalIcon sx={{ color: "#6E6BF3", fontSize: "1.2rem" }} />
              <Typography
                variant="overline"
                sx={{ color: "#6E6BF3", fontWeight: 700, fontSize: "0.9rem" }}
              >
                Système de santé
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                Saturation moyenne hôpitaux: <strong>{fmtPct(healthSystem.avg_saturation_pct)}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                Niveau d'alerte: <strong>{healthSystem.alert_level || "–"}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7, mt: 1 }}>
                Hôpitaux ({healthSystem.hospitals?.length || 0}):
              </Typography>
              {healthSystem.hospitals?.length > 0 ? (
                <Box sx={{ mt: 1, maxHeight: "150px", overflow: "auto" }}>
                  {healthSystem.hospitals.slice(0, 5).map((h, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: "block", color: "#14173D", opacity: 0.7 }}>
                      • {h.label} — {fmtPct(h.saturation)}
                    </Typography>
                  ))}
                  {healthSystem.hospitals.length > 5 && (
                    <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.5, fontStyle: "italic" }}>
                      ... et {healthSystem.hospitals.length - 5} autres
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.5, fontStyle: "italic" }}>
                  Aucune donnée disponible
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* ========== SECTION 4: VACCINATION ========== */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <VaccinesIcon sx={{ color: "#6E6BF3", fontSize: "1.2rem" }} />
              <Typography
                variant="overline"
                sx={{ color: "#6E6BF3", fontWeight: 700, fontSize: "0.9rem" }}
              >
                Vaccination
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Pharmacies
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(vaccination.pharmacies_partners)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Centres
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                  {fmtNumber(vaccination.vaccination_centers)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Stock actuel: <strong>{fmtNumber(vaccination.stock_current)} doses</strong>
                </Typography>
                <br />
                <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Stock planifié: <strong>{fmtNumber(vaccination.stock_planned)} doses</strong>
                </Typography>
              </Grid>
              {vaccination.warehouse && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                    Entrepôt: <strong>{vaccination.warehouse.name}</strong>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* ========== SECTION 5: POPULATION VULNÉRABLE ========== */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <ElderlyIcon sx={{ color: "#6E6BF3", fontSize: "1.2rem" }} />
              <Typography
                variant="overline"
                sx={{ color: "#6E6BF3", fontWeight: 700, fontSize: "0.9rem" }}
              >
                Population vulnérable
              </Typography>
            </Box>
            {vulnerablePopulation.population_65_plus != null ? (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                      Population 65+
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                      {fmtNumber(vulnerablePopulation.population_65_plus)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                      % 65+
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                      {fmtPct(vulnerablePopulation.population_65_plus_pct)}
                    </Typography>
                  </Grid>
                  {vulnerablePopulation.population_a_risque && (
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                        Population à risque: <strong>{fmtNumber(vulnerablePopulation.population_a_risque)}</strong>
                      </Typography>
                    </Grid>
                  )}
                  {vulnerablePopulation.vaccination_rate_65_plus != null && (
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7 }}>
                        Taux vaccination 65+: <strong>{fmtPct(vulnerablePopulation.vaccination_rate_65_plus)}</strong>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.5, fontStyle: "italic" }}>
                ⚠️ Données non disponibles
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* ========== SECTION 6: BUDGET & FINANCEMENT ========== */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AccountBalanceWalletIcon sx={{ color: "#6E6BF3", fontSize: "1.2rem" }} />
              <Typography
                variant="overline"
                sx={{ color: "#6E6BF3", fontWeight: 700, fontSize: "0.9rem" }}
              >
                Budget & financement
              </Typography>
            </Box>
            {budget.budget_journalier != null ? (
              <Box>
                <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Budget journalier: <strong>{fmtNumber(budget.budget_journalier)} €</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                  Budget cumulé: <strong>{fmtNumber(budget.budget_cumule)} €</strong>
                </Typography>
                {budget.budget_utilise_pct != null && (
                  <Typography variant="body2" sx={{ color: "#14173D", opacity: 0.7 }}>
                    Utilisation: <strong>{fmtPct(budget.budget_utilise_pct)}</strong>
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.5, fontStyle: "italic" }}>
                Aucune donnée budgétaire disponible
              </Typography>
            )}
          </Box>

        </Box>
      </Paper>

      {/* Modale d'export CSV */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={exportToCSV}
        areaData={data}
      />
    </Box>
  );
}
