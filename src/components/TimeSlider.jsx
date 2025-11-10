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

  const marks = dates.map((d, i) => ({
    value: i,
    label: i % Math.ceil(dates.length / 6) === 0 ? d.slice(5) : "",
  }));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        justifyContent: "center",
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
            backgroundColor: "#6E6BF3",
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
    </div>
  );
}
