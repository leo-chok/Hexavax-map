import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Helper formatters
const fmtEuros = (n) => {
  if (n == null || n === "") return "–";
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return String(n);
  }
};

const fmtPct = (n) => {
  if (n == null || n === "") return "–";
  try {
    return `${Number(n).toFixed(2)} %`;
  } catch {
    return String(n);
  }
};

/**
 * Panneau latéral droit pour afficher les détails du budget d'un département
 * S'affiche quand on clique sur un département avec le layer Budget activé
 */
export default function BudgetPanel({ open, feature, budgetData, currentDate, onClose }) {
  if (!open || !feature || !budgetData) return null;

  // Adapter la date actuelle à la période du budget (2024-11-15 à 2024-12-12)
  let searchDate = currentDate;
  if (currentDate?.startsWith("2025-")) {
    searchDate = currentDate.replace("2025-", "2024-");
  }

  const props = feature.properties || {};
  const code = props.code || props.CODE || props.insee;
  const displayName = props.nom || props.name || props.NOM || props.LIBELLE || props.label || code;

  // Trouver les données du département pour la date actuelle
  const dayData = budgetData.donnees?.find(d => d.date === searchDate);
  const deptData = dayData?.departements?.find(d => d.code_insee === code || String(d.code_insee).replace(/^0+/, '') === String(code).replace(/^0+/, ''));

  if (!deptData) {
    return (
      <Box sx={{ position: "fixed", right: 0, top: "60px", bottom: "50px", width: open ? "400px" : 0, zIndex: 1000 }}>
        <Paper elevation={3} sx={{ height: "100%", p: 2, backgroundColor: "#E9E6F8" }}>
          <Typography>Aucune donnée disponible pour ce département</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Paper>
      </Box>
    );
  }

  // Préparer les données pour le graphique d'évolution (cumul)
  const chartData = useMemo(() => {
    if (!budgetData.donnees) return [];
    
    // Normaliser le code pour la comparaison
    const normalizeCode = (c) => String(c).replace(/^0+/, '') || '0';
    const normalizedCode = normalizeCode(code);
    
    return budgetData.donnees.map(day => {
      const dept = day.departements.find(d => 
        d.code_insee === code || normalizeCode(d.code_insee) === normalizedCode
      );
      if (!dept) return null;
      
      return {
        date: new Date(day.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
        cumul: dept.montant_cumule,
      };
    }).filter(Boolean);
  }, [budgetData, code]);

  const currentDateFormatted = new Date(currentDate).toLocaleDateString("fr-FR", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        top: "60px",
        bottom: "50px",
        width: open ? "450px" : 0,
        transition: "width 0.3s ease-in-out",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          width: "450px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E9E6F8",
          borderLeft: "2px solid #6E6BF3",
          overflow: "auto",
        }}
      >
        {/* Header */}
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
            💰 Budget — {displayName}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#6E6BF3",
              "&:hover": { backgroundColor: "#EF4F9120" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenu */}
        <Box sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
          {/* Date actuelle */}
          <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.7, display: "block", mb: 2 }}>
            📅 {currentDateFormatted}
          </Typography>

          {/* Montants principaux */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}>
                  Dépense du jour
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#6E6BF3" }}>
                  {fmtEuros(deptData.montant_quotidien)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}>
                  Montant cumulé
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#EF4F91" }}>
                  {fmtEuros(deptData.montant_cumule)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: "#14173D", opacity: 0.7, mb: 0.5 }}>
                  Part du budget national
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#14173D" }}>
                  {fmtPct(deptData.part_budget_national)}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* Sources de financement */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{ color: "#6E6BF3", fontWeight: 700, mb: 1, display: "block" }}
            >
              Sources de financement
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(deptData.sources_financement).map(([source, montant]) => {
                const pct = (montant / deptData.montant_quotidien) * 100;
                return (
                  <Grid item xs={12} key={source}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ color: "#14173D" }}>
                        {source}
                      </Typography>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#14173D" }}>
                          {fmtEuros(montant)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.6 }}>
                          {pct.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Divider sx={{ my: 2, backgroundColor: "#7DE3F2" }} />

          {/* Graphique d'évolution */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{ color: "#6E6BF3", fontWeight: 700, mb: 1, display: "block" }}
            >
              Évolution du budget cumulé
            </Typography>
            <Box sx={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#7DE3F2" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "#14173D", fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fill: "#14173D", fontSize: 10 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#E9E6F8", 
                      border: "1px solid #6E6BF3",
                      borderRadius: 4,
                    }}
                    formatter={(value) => [fmtEuros(value), "Cumulé"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumul" 
                    stroke="#6E6BF3" 
                    strokeWidth={2}
                    dot={{ fill: "#6E6BF3", r: 3 }}
                    activeDot={{ r: 5, fill: "#EF4F91" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* Note */}
          <Box sx={{ mt: 3, p: 1.5, backgroundColor: "#7DE3F220", borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: "#14173D", opacity: 0.6 }}>
              💡 Données de la campagne de vaccination grippe (15 nov - 12 déc 2024)
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
