# 🗺️ HEXAVAX Map - Guide d'Intégration

## 📋 Vue d'ensemble

**HEXAVAX Map** est une application React de visualisation cartographique interactive pour le suivi épidémiologique et logistique de la vaccination en France. Elle utilise **deck.gl**, **Mapbox GL**, **Material-UI** et **Recharts**.

### Fonctionnalités principales
- 🗺️ Carte interactive multi-échelle (National → Régions → Départements)
- 📊 7 couches de données superposables (heatmap, hôpitaux, pharmacies, population vulnérable, logistique vaccinale, budget)
- ⏱️ Timeline temporelle avec slider pour naviguer dans les données quotidiennes
- 📋 Panels latéraux contextuels (AreaPanel, WarehousePanel, BudgetPanel)
- 📥 Export CSV des données agrégées
- 🎨 Design system cohérent avec palette de couleurs définie

---

## 🏗️ Architecture du Projet

```
HEXAVAX - Carte/
├── public/
│   ├── data/                          # Données JSON statiques
│   │   ├── geojson/                   # GeoJSON France, régions, départements
│   │   │   ├── france.geojson
│   │   │   ├── regions.geojson
│   │   │   └── departements.geojson
│   │   ├── areas_stats/               # Stats départements et régions par date
│   │   │   ├── 2025-12-01.json ... 2025-12-31.json
│   │   │   └── national_2025-12-01.json ... national_2025-12-31.json
│   │   ├── mockData_france_propagation_dec2025_realistic.json  # Données épidémio nationales
│   │   ├── mockData_saturation_hopitaux_france.json           # Saturation hôpitaux
│   │   ├── pharmacies_france_v1.json                          # Pharmacies partenaires
│   │   ├── Population_vulnerable.json                          # Population 65+ par département
│   │   ├── vaccine_logistics_timeseries_dec2025.json          # Logistique vaccins (warehouses)
│   │   ├── vaccination_budget_departements.json               # Budget départements
│   │   ├── vaccination_budget_regions.json                    # Budget régions
│   │   ├── departments_area_stats.json                        # Stats area départements
│   │   └── regions_stats.json                                 # Stats régions
│   └── pharmacy.png                                            # Icône pharmacie
│
├── src/
│   ├── components/
│   │   ├── EpidemicMap/
│   │   │   ├── HeatmapLayer.jsx                # Layer heatmap deck.gl
│   │   │   ├── HospitalsLayer.jsx              # Layer hôpitaux
│   │   │   ├── PharmaciesLayer.jsx             # Layer pharmacies
│   │   │   ├── VulnerablePopulationLayer.jsx   # Layer population 65+
│   │   │   └── VaccineLogisticsLayer.jsx       # Layer warehouses + routes
│   │   ├── EpidemicMap.jsx                     # Composant carte principal
│   │   ├── TimeSlider.jsx                      # Slider temporel (Décembre 2025)
│   │   ├── Legend.jsx                          # Légende carte
│   │   ├── SidePanel.jsx                       # Panel gauche (filtres + sélecteurs)
│   │   ├── AreaPanel.jsx                       # Panel droit détails zone (6 sections)
│   │   ├── WarehousePanel.jsx                  # Panel détails warehouse
│   │   ├── BudgetPanel.jsx                     # Panel détails budget
│   │   ├── ExportModal.jsx                     # Modale export CSV
│   │   ├── ViewSelector.jsx                    # Sélecteur National/Régions/Départements
│   │   ├── FilterPanel.jsx                     # Panel filtres layers
│   │   └── DomTomNavigator.jsx                 # Navigateur DOM-TOM
│   │
│   ├── config/
│   │   └── constants.js                        # Constantes (DATA_SOURCES, MAPBOX_TOKEN, etc.)
│   │
│   ├── App.jsx                                 # Composant racine (logique principale)
│   ├── main.jsx                                # Point d'entrée React
│   └── index.css                               # Styles globaux
│
├── package.json                                # Dépendances
├── vite.config.js                              # Config Vite
├── .env.example                                # Exemple variables d'environnement
└── README.md                                   # Documentation projet
```

---

## 📦 Dépendances NPM

### Dependencies principales

```json
{
  "@deck.gl/aggregation-layers": "^9.0.0",
  "@deck.gl/core": "^9.0.0",
  "@deck.gl/react": "^9.0.0",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@fontsource/roboto": "^5.2.8",
  "@mui/icons-material": "^5.14.0",
  "@mui/material": "^5.15.0",
  "mapbox-gl": "^3.16.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-map-gl": "^7.1.7",
  "recharts": "^3.4.1"
}
```

### DevDependencies

```json
{
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.0.0"
}
```

---

## 🔑 Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibGVvLWNob2siLCJhIjoiY200MWFtcW5sMDM3YzJrcjNpeTNyb3M4NiJ9.vQIe1PvAEEoLMa8fRNe8Sw
```

**Note :** Le token Mapbox est nécessaire pour afficher le fond de carte.

---

## 🎨 Palette de Couleurs

```javascript
{
  background: "#E9E6F8",      // Fond général (lavande clair)
  text: "#14173D",            // Texte principal (bleu foncé)
  primary: "#6E6BF3",         // Bleu principal (boutons, accents)
  secondary: "#7DE3F2",       // Cyan (highlights, dividers)
  accent: "#EF4F91",          // Rose (alertes, KPIs critiques)
  white: "#FFFFFF",           // Blanc
  mapBackground: "#1a1a2e"    // Fond carte sombre
}
```

---

## 📊 Structure des Données

### 1. **AreaPanel Data** (données agrégées par zone)

Objet retourné par `aggregateAreaData()` dans `App.jsx` :

```javascript
{
  overview: {
    code: "FRA" | "11" | "75",           // Code zone
    type: "national" | "région" | "département",
    date: "2025-12-01",
    population: 67842582,
    surface_km2: 643801
  },
  
  epidemiology: {
    vaccination_rate_pct: 75.2,
    cases_per_100k: 234.5,
    incidence_rate: 156.3,
    positivity_rate: 8.7,
    icu_occupancy_pct: 65.4,
    total_cases: 125000,
    total_deaths: 3500,
    r_effectif: 1.2
  },
  
  healthSystem: {
    hospitals_count: 45,
    avg_saturation: 78.5,
    alert_level: "orange" | "vert" | "rouge",
    beds_available: 1250,
    hospitals: [
      { nom: "CHU Paris", saturation: 85.2, ... }
    ]
  },
  
  vaccination: {
    partner_centers_count: 120,
    pharmacies_count: 850,
    doses_administered: 1250000,
    daily_doses: 15000,
    warehouse: "Warehouse Lyon",
    current_stock: 50000,
    planned_stock: 75000
  },
  
  vulnerablePopulation: {
    population_65_plus: 12500000,
    pct_65_plus: 18.4,
    comorbidities: 35.2,
    vaccination_rate_65_plus: 82.5
  },
  
  budget: {
    budget_journalier: 250000,
    budget_cumule: 7500000,
    budget_utilise_pct: 68.5,
    sources_financement: "État, Régions",
    depenses_categories: "Vaccins, Logistique, Personnel"
  }
}
```

### 2. **ViewMode States**

```javascript
viewMode: "national" | "regions" | "departments"
```

### 3. **Filters State**

```javascript
{
  heatmap: true,              // HeatmapLayer (épidémio)
  hospitals: true,            // HospitalsLayer
  pharmacies: true,           // PharmaciesLayer
  vulnerablePopulation: true, // VulnerablePopulationLayer
  vaccineLogistics: true      // VaccineLogisticsLayer (warehouses + routes)
}
```

---

## 🔗 Imports Critiques

### Composant racine (App.jsx)

```javascript
import App from "./HEXAVAX/App.jsx";
```

### Props à passer au composant App

**Aucune prop obligatoire** - Le composant est autonome et gère son état interne.

### Style global

Importer le CSS dans votre projet parent :

```javascript
import "./HEXAVAX/index.css";
```

Ou intégrer directement dans votre CSS global :

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
}
```

---

## 🚀 Intégration dans un Projet Existant

### Étape 1 : Copier les fichiers

Copier le dossier complet `HEXAVAX - Carte` dans votre projet :

```
votre-projet/
├── src/
│   ├── components/
│   │   └── HEXAVAX/              # Dossier complet copié ici
│   │       ├── public/
│   │       ├── src/
│   │       ├── package.json
│   │       └── vite.config.js
```

**OU** intégrer directement les sources :

```
votre-projet/
├── public/
│   └── hexavax-data/             # Copier public/data ici
├── src/
│   └── hexavax/
│       ├── components/
│       ├── config/
│       ├── App.jsx
│       └── index.css
```

### Étape 2 : Installer les dépendances

Ajouter au `package.json` de votre projet parent :

```bash
npm install @deck.gl/aggregation-layers @deck.gl/core @deck.gl/react
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install mapbox-gl react-map-gl recharts
npm install @fontsource/roboto
```

### Étape 3 : Configurer les chemins

Dans votre projet, ajuster les chemins d'import dans `src/config/constants.js` :

```javascript
// Avant (projet standalone)
const BASE_PATH = "/data";

// Après (projet intégré)
const BASE_PATH = "/hexavax-data";  // ou chemin relatif selon votre structure
```

### Étape 4 : Ajouter le token Mapbox

Ajouter dans votre `.env` :

```env
VITE_MAPBOX_TOKEN=pk.eyJ1IjoibGVvLWNob2siLCJhIjoiY200MWFtcW5sMDM3YzJrcjNpeTNyb3M4NiJ9.vQIe1PvAEEoLMa8fRNe8Sw
```

### Étape 5 : Importer et afficher

Dans votre composant parent (ex: `Dashboard.jsx`) :

```javascript
import { useState } from "react";
import HexavaxMap from "./hexavax/App.jsx";
import "./hexavax/index.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab("home")}>Accueil</button>
        <button onClick={() => setActiveTab("map")}>Carte Hexavax</button>
      </nav>

      {activeTab === "map" && (
        <div style={{ width: "100vw", height: "100vh" }}>
          <HexavaxMap />
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ Configuration Vite

Si vous utilisez Vite, vérifier la config pour les workers deck.gl :

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  worker: {
    format: "es",
  },
});
```

---

## 🧩 Points d'Extension

### Ajouter une nouvelle couche de données

1. Créer un nouveau layer dans `src/components/EpidemicMap/`
2. Ajouter le filtre dans `DEFAULT_FILTERS` (`src/config/constants.js`)
3. Intégrer le layer dans `EpidemicMap.jsx`
4. Ajouter le toggle dans `FilterPanel.jsx`

### Modifier les couleurs

Éditer les valeurs hexadécimales dans tous les composants :
- `#E9E6F8` → Nouvelle couleur background
- `#6E6BF3` → Nouvelle couleur primary
- etc.

### Ajouter une section dans AreaPanel

1. Éditer `aggregateAreaData()` dans `App.jsx` pour ajouter la nouvelle section
2. Ajouter la section dans `AreaPanel.jsx`
3. Ajouter le checkbox correspondant dans `ExportModal.jsx`
4. Ajouter les lignes CSV dans `exportToCSV()` (`AreaPanel.jsx`)

---

## 📝 Notes Importantes

### Performance
- Les données GeoJSON sont chargées une seule fois au montage
- Les layers deck.gl sont optimisés avec `useMemo`
- Le slider temporel ne recharge que les données du jour sélectionné

### Gestion d'État
- État principal géré dans `App.jsx` (1095 lignes)
- Props drilling vers les composants enfants
- Pas de Redux/Context car architecture simple et performante

### Données Manquantes
- Si un fichier JSON manque, le layer concerné ne s'affiche pas
- Messages d'erreur dans la console
- L'application reste fonctionnelle

### Mapbox Token
- **CRITIQUE** : Sans token valide, la carte ne s'affiche pas
- Token gratuit suffisant pour développement (50k tiles/mois)
- Pour production : créer un token Mapbox payant

---

## 🐛 Debugging

### La carte ne s'affiche pas
1. Vérifier `VITE_MAPBOX_TOKEN` dans `.env`
2. Vérifier la console pour erreurs Mapbox GL
3. Vérifier que `mapbox-gl/dist/mapbox-gl.css` est importé

### Les données ne chargent pas
1. Vérifier les chemins dans `src/config/constants.js`
2. Vérifier que les fichiers JSON sont dans `public/data/`
3. Vérifier les CORS si serveur distant

### Erreurs deck.gl
1. Vérifier compatibilité versions `@deck.gl/*` (toutes en 9.0.0)
2. Vérifier config Vite pour workers
3. Vérifier que WebGL est supporté dans le navigateur

---

## 📞 Support

Pour toute question sur l'intégration, consulter :
- [deck.gl Documentation](https://deck.gl/docs)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Material-UI Documentation](https://mui.com/material-ui/)

---

## ✅ Checklist d'Intégration

- [ ] Dossier HEXAVAX copié dans le projet parent
- [ ] Dépendances NPM installées
- [ ] Token Mapbox ajouté dans `.env`
- [ ] Chemins DATA_SOURCES ajustés dans `constants.js`
- [ ] Fichiers JSON dans `public/`
- [ ] CSS global importé
- [ ] Composant App importé et affiché
- [ ] Test : Carte s'affiche
- [ ] Test : Slider temporel fonctionne
- [ ] Test : Clic sur zone ouvre AreaPanel
- [ ] Test : Export CSV fonctionne
- [ ] Test : Tous les layers s'affichent

---

**Projet développé avec ❤️ par leo-chok**  
**Version finale : Novembre 2025**
