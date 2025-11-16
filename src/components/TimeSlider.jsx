import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { IconButton } from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Pause from "@mui/icons-material/Pause";

export default function TimeSlider({ dates, value, onChange }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        onChange((prev) => (prev < dates.length - 1 ? prev + 1 : 0));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, dates.length, onChange]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  // Trouver l'index du 1er décembre (début des prédictions)
  const predictionStartIndex = dates.findIndex(d => d === "2025-12-01");
  const predictionPercentage = predictionStartIndex > 0 
    ? (predictionStartIndex / (dates.length - 1)) * 100 
    : 100;

  // Formatter les dates en français
  const formatDateFr = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const marks = dates.map((d, i) => ({
    value: i,
    label: i % Math.ceil(dates.length / 6) === 0 ? formatDateFr(d) : "",
  }));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <IconButton
        onClick={handlePlayPause}
        sx={{
          backgroundColor: "#E9E6F8",
          color: "#14173D",
          border: "1px solid #6E6BF3",
          "&:hover": { backgroundColor: "#EF4F91", color: "white" },
          transition: "all 0.3s ease",
          marginRight: "16px",
        }}
      >
        {isPlaying ? <Pause /> : <PlayArrow />}
      </IconButton>

      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        <Slider
          value={value}
          onChange={(_, v) => onChange(v)}
          step={1}
          min={0}
          max={Math.max(0, dates.length - 1)}
          marks={marks}
          sx={{
            color: "#6E6BF3",
            height: 6,
            "& .MuiSlider-thumb": {
              width: 18,
              height: 18,
              backgroundColor: "#EF4F91",
              border: "2px solid white",
            },
            "& .MuiSlider-track": {
              backgroundColor: value >= predictionStartIndex ? "#EF4F91" : "#6E6BF3",
              transition: "background-color 0.3s ease",
            },
            "& .MuiSlider-rail": {
              opacity: 0.3,
              backgroundColor: "#7DE3F2",
            },
            "& .MuiSlider-markLabel": {
              color: "#14173D",
              fontFamily: "Roboto, sans-serif",
              fontSize: "0.75rem",
            },
          }}
        />
        
        {/* Ligne de séparation prédictive */}
        {predictionStartIndex > 0 && (
          <div
            style={{
              position: "absolute",
              left: `${(predictionStartIndex / (dates.length - 1)) * 100}%`,
              top: "-10px",
              bottom: "-25px",
              width: "2px",
              backgroundColor: "#EF4F91",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "0.65rem",
                color: "#EF4F91",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "2px 6px",
                borderRadius: "3px",
              }}
            >
              PRÉDICTIF
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
