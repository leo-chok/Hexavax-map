import React, { useMemo } from "react";
import { Box, Paper, Typography, IconButton, Divider, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PeopleIcon from "@mui/icons-material/People";
import ElderlyIcon from "@mui/icons-material/Elderly";
import InventoryIcon from "@mui/icons-material/Inventory";

/**
 * Panneau latéral droit affichant les détails d'un hangar de stockage vaccinal
 * Affiche : stock, livraisons du jour, démographie couverte, KPI
 */
export default function WarehousePanel({
  warehouse,
  currentDate,
  onClose,
  departmentsAreaStatsMap = {},
  vulnerablePopulationData = null,
  vaccineLogisticsData = null,
}) {
  // Calculer les KPI démographiques
  const demographics = useMemo(() => {
    if (!warehouse?.coverage_departments || !vulnerablePopulationData) {
      return null;
    }

    let totalPopulation = 0;
    let totalVulnerable = 0;
    let totalDeliveriesToday = 0;
    let totalAtRisk = 0;
    const deptsList = [];

    // Utiliser les vraies données de Population_vulnerable.json
    const deptsArray = vulnerablePopulationData.departements || [];
    
    warehouse.coverage_departments.forEach((deptCode) => {
      const deptData = deptsArray.find(d => d.code === deptCode);
      
      if (deptData) {
        totalPopulation += deptData.population_totale || 0;
        totalVulnerable += deptData.population_65_plus || 0;
        totalAtRisk += deptData.population_a_risque || 0;
        deptsList.push({
          code: deptCode,
          name: deptData.nom || `Département ${deptCode}`,
          population: deptData.population_totale || 0,
        });
      }
    });

    // Récupérer les données du jour depuis vaccineLogisticsData
    let warehouseData = warehouse;
    if (vaccineLogisticsData && currentDate) {
      const dayData = vaccineLogisticsData.daily_logistics?.[currentDate];
      const whDayData = dayData?.[warehouse.id];
      
      if (whDayData) {
        warehouseData = {
          ...warehouse,
          stock_current: whDayData.stock_current,
          stock_planned: whDayData.stock_planned,
          status: whDayData.status,
          deliveries: whDayData.deliveries || [],
        };
      }
    }

    // Livraisons du jour
    if (warehouseData.deliveries) {
      totalDeliveriesToday = warehouseData.deliveries.reduce((sum, d) => sum + (d.doses || 0), 0);
    }

    // KPI
    const fillRate = (warehouseData.stock_current / warehouseData.capacity) * 100;
    const stockPerCapita = totalPopulation > 0 ? warehouseData.stock_current / totalPopulation : 0;
    const vulnerableRate = totalPopulation > 0 ? (totalVulnerable / totalPopulation) * 100 : 0;
    const atRiskRate = totalPopulation > 0 ? (totalAtRisk / totalPopulation) * 100 : 0;
    
    // Autonomie en jours (stock actuel / consommation quotidienne moyenne)
    const dailyConsumption = totalDeliveriesToday > 0 ? totalDeliveriesToday : warehouseData.stock_current * 0.03;
    const autonomyDays = dailyConsumption > 0 ? Math.floor(warehouseData.stock_current / dailyConsumption) : 0;

    // Couverture vaccinale potentielle (2 doses par personne)
    const potentialCoverage = totalPopulation > 0 ? (warehouseData.stock_current / (totalPopulation * 2)) * 100 : 0;

    return {
      totalPopulation,
      totalVulnerable,
      totalAtRisk,
      vulnerableRate,
      atRiskRate,
      totalDeliveriesToday,
      fillRate,
      stockPerCapita,
      autonomyDays,
      potentialCoverage,
      deptsList,
      deptsCount: warehouse.coverage_departments.length,
      warehouseData, // Données actualisées
    };
  }, [warehouse, currentDate, vulnerablePopulationData, vaccineLogisticsData]);

  if (!warehouse || !demographics) return null;

  const warehouseData = demographics.warehouseData;

  // Statut visuel
  const statusConfig = {
    normal: { color: "#6E6BF3", label: "🟢 Normal", bg: "#E9E6F8" },
    warning: { color: "#FF9800", label: "🟠 Attention", bg: "#FFF3E0" },
    danger: { color: "#EF4F91", label: "🔴 Critique", bg: "#FCE4EC" },
  };
  const status = statusConfig[warehouseData.status] || statusConfig.normal;

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: "60px",
        bottom: "50px",
        width: "420px",
        zIndex: 1002,
        pointerEvents: "none",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          height: "100%",
          overflow: "auto",
          backgroundColor: "#fff",
          pointerEvents: "auto",
          borderLeft: `4px solid ${status.color}`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: status.bg,
            borderBottom: `2px solid ${status.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarehouseIcon sx={{ color: status.color, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#14173D" }}>
                {warehouseData.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666" }}>
                {warehouseData.location}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenu */}
        <Box sx={{ p: 2 }}>
          {/* Statut */}
          <Box sx={{ mb: 3 }}>
            <Chip
              label={status.label}
              sx={{
                backgroundColor: status.bg,
                color: status.color,
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            />
          </Box>

          {/* Stock actuel */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InventoryIcon sx={{ color: "#6E6BF3" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#14173D" }}>
                Stock de doses
              </Typography>
            </Box>
            <Box sx={{ pl: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: status.color }}>
                {warehouseData.stock_current?.toLocaleString("fr-FR")} doses
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                Capacité : {warehouseData.capacity?.toLocaleString("fr-FR")} doses
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  height: 8,
                  backgroundColor: "#E0E0E0",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${demographics?.fillRate || 0}%`,
                    backgroundColor: status.color,
                    transition: "width 0.3s",
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: "#666" }}>
                Taux de remplissage : {demographics?.fillRate?.toFixed(1)}%
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Livraisons du jour */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <LocalShippingIcon sx={{ color: "#7DE3F2" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#14173D" }}>
                Livraisons du jour
              </Typography>
            </Box>
            <Box sx={{ pl: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#7DE3F2" }}>
                {warehouseData.deliveries?.length || 0} départements
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {demographics?.totalDeliveriesToday?.toLocaleString("fr-FR")} doses distribuées
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* KPI Démographiques */}
          {demographics && (
            <>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <PeopleIcon sx={{ color: "#6E6BF3" }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#14173D" }}>
                    Zone de couverture
                  </Typography>
                </Box>
                <Box sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Population totale */}
                  <Box>
                    <Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
                      Population totale
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#14173D" }}>
                      {demographics.totalPopulation.toLocaleString("fr-FR")} habitants
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      {demographics.deptsCount} départements
                    </Typography>
                  </Box>

                  {/* Population vulnérable */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ElderlyIcon sx={{ color: "#EF4F91", fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#14173D" }}>
                        {demographics.totalVulnerable.toLocaleString("fr-FR")} personnes 65+
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        {demographics.vulnerableRate.toFixed(1)}% de la population
                      </Typography>
                    </Box>
                  </Box>

                  {/* Population à risque */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      backgroundColor: '#FF9800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ⚠️
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#14173D" }}>
                        {demographics.totalAtRisk.toLocaleString("fr-FR")} personnes à risque
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#999" }}>
                        {demographics.atRiskRate.toFixed(1)}% (comorbidités incluses)
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* KPI Avancés */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#14173D", mb: 2 }}>
                  📊 Indicateurs clés
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Autonomie */}
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#E9E6F8",
                      borderRadius: 1,
                      border: "1px solid #6E6BF3",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Autonomie estimée
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#6E6BF3" }}>
                      {demographics.autonomyDays} jours
                    </Typography>
                  </Box>

                  {/* Couverture potentielle */}
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#F0FFFE",
                      borderRadius: 1,
                      border: "1px solid #7DE3F2",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Couverture vaccinale potentielle (2 doses/pers)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#7DE3F2" }}>
                      {demographics.potentialCoverage.toFixed(1)}%
                    </Typography>
                  </Box>

                  {/* Doses par habitant */}
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: "#FFF5F8",
                      borderRadius: 1,
                      border: "1px solid #EF4F91",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Stock par habitant
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#EF4F91" }}>
                      {demographics.stockPerCapita.toFixed(2)} doses
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
