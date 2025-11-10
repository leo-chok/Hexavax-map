# Epidemic Forecast — France (Deck.gl + Mapbox + Vite)

Starter prêt à l'emploi pour visualiser une heatmap épidémique (mock data) sur une carte de la France,
avec un **slider temporel** pour explorer l'évolution.

## 🚀 Lancer le projet

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Créer un fichier d'environnement**
   Copiez `.env.example` vers `.env` et remplacez la valeur du token :
   ```bash
   cp .env.example .env
   ```
   Éditez `.env` et mettez votre clé Mapbox :
   ```env
   VITE_MAPBOX_TOKEN=pk.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

   👉 Créez une clé gratuite sur https://www.mapbox.com/ si besoin.

3. **Démarrer en local**
   ```bash
   npm run dev
   ```

## 🧱 Stack

- React + Vite
- Deck.gl (HeatmapLayer) + react-map-gl (Mapbox basemap)
- Material UI (slider)
- Données mock JSON (facile à remplacer par une API plus tard)

## 📁 Structure

```
src/
 ├─ components/
 │   ├─ EpidemicMap.jsx     # Carte + Heatmap (Deck.gl)
 │   ├─ TimeSlider.jsx      # Slider temporel (MUI)
 │   └─ Legend.jsx          # Légende simplifiée
 ├─ data/
 │   └─ mockData.json       # Données mock (date, lon, lat, value)
 ├─ App.jsx                 # Glue: lit data, filtre par date, passe à la carte
 ├─ main.jsx                # Entrée React
 └─ index.css               # Styles
```

## 🔧 Personnalisation rapide

- **Remplacer les données** : éditez `src/data/mockData.json`.
- **Adapter le rayon/intensité** du heatmap : `src/components/EpidemicMap.jsx` (`radiusPixels`, `intensity`, `threshold`).
- **Palette/couleurs** : la HeatmapLayer utilise une palette interne; vous pouvez passer `colorRange` si besoin.
- **GeoJSON départements** : ajoutez une `GeoJsonLayer` pour styliser les frontières (optionnel).

## 🧭 Idées d'évolutions

- Lire des données **réelles** (data.gouv, SPF) via un backend (`/api/data?date=...`).
- Ajouter un **modèle de prédiction** (FastAPI/Flask) et une couche dédiée aux **prévisions**.
- Empiler des **layers** : départements (GeoJSON), flux, points d'intérêt (vaccination, hôpitaux).
- Animer automatiquement la timeline (lecture/pauses).

Bon dev ! 💙
