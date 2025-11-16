import React, { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { DOM_TOM_LIST } from "../config/constants";

/**
 * Navigateur pour les départements d'outre-mer
 * Permet de naviguer entre les DOM-TOM avec des flèches
 */

export default function DomTomNavigator({ onDomTomChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + DOM_TOM_LIST.length) % DOM_TOM_LIST.length;
    setCurrentIndex(newIndex);
    onDomTomChange(DOM_TOM_LIST[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % DOM_TOM_LIST.length;
    setCurrentIndex(newIndex);
    onDomTomChange(DOM_TOM_LIST[newIndex]);
  };

  const currentDom = DOM_TOM_LIST[currentIndex];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#E9E6F8",
        borderRadius: "8px",
        padding: "8px 4px",
        mt: 2,
        border: "1px solid #7DE3F2",
      }}
    >
      <IconButton
        onClick={handlePrevious}
        size="small"
        sx={{
          color: "#6E6BF3",
          "&:hover": { backgroundColor: "#7DE3F230" },
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>

      <Typography
        sx={{
          fontSize: "0.9rem",
          fontWeight: 600,
          color: "#14173D",
          textAlign: "center",
          flex: 1,
        }}
      >
        {currentDom.name}
      </Typography>

      <IconButton
        onClick={handleNext}
        size="small"
        sx={{
          color: "#6E6BF3",
          "&:hover": { backgroundColor: "#7DE3F230" },
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
