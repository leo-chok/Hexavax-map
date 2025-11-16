#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour ajouter les données épidémiologiques des DROM-COM
au fichier departments_epidemic_timeseries_dec2025.json

DROM-COM:
- 971: Guadeloupe
- 972: Martinique
- 973: Guyane
- 974: La Réunion
- 976: Mayotte
"""

import json
import random
from datetime import datetime, timedelta

# Configuration
INPUT_FILE = "public/data/areas_stats/departments_epidemic_timeseries_dec2025.json"
OUTPUT_FILE = "public/data/areas_stats/departments_epidemic_timeseries_dec2025.json"

# Départements DROM-COM avec leurs caractéristiques
DROM_CONFIG = {
    "971": {
        "name": "Guadeloupe",
        "population": 384000,
        "vaccination_base": 65.0,  # Taux de vaccination de base (%)
        "cases_base": 180,  # Cas pour 100k habitants (base)
        "incidence_base": 145,  # Taux d'incidence (base)
        "icu_base": 42.0,  # Occupation lits réa (%)
    },
    "972": {
        "name": "Martinique", 
        "population": 361000,
        "vaccination_base": 68.0,
        "cases_base": 165,
        "incidence_base": 135,
        "icu_base": 38.0,
    },
    "973": {
        "name": "Guyane",
        "population": 290000,
        "vaccination_base": 52.0,  # Plus faible taux
        "cases_base": 220,  # Plus de cas
        "incidence_base": 185,
        "icu_base": 55.0,  # Plus saturé
    },
    "974": {
        "name": "La Réunion",
        "population": 860000,
        "vaccination_base": 72.0,  # Meilleur taux
        "cases_base": 150,
        "incidence_base": 120,
        "icu_base": 35.0,
    },
    "976": {
        "name": "Mayotte",
        "population": 310000,
        "vaccination_base": 48.0,  # Plus faible
        "cases_base": 240,  # Plus de cas
        "incidence_base": 195,
        "icu_base": 62.0,  # Très saturé
    },
}

def generate_timeseries_value(base_value, date_index, total_days, is_percentage=False):
    """
    Génère une valeur de série temporelle avec variation réaliste
    
    Args:
        base_value: Valeur de base
        date_index: Index du jour (0 à total_days-1)
        total_days: Nombre total de jours
        is_percentage: True si la valeur est un pourcentage (limite à 100)
    
    Returns:
        Valeur générée avec variation
    """
    # Variation aléatoire ±5-15%
    random_factor = random.uniform(0.85, 1.15)
    
    # Tendance temporelle (légère augmentation au fil du temps pour les cas)
    time_factor = 1 + (date_index / total_days) * 0.2
    
    # Oscillation hebdomadaire (moins de cas le weekend)
    week_oscillation = 1 - 0.1 * abs(((date_index % 7) - 3) / 3)
    
    value = base_value * random_factor * time_factor * week_oscillation
    
    if is_percentage:
        value = min(value, 100.0)  # Cap à 100%
    
    return round(value, 1)

def add_drom_data():
    """Ajoute les données DROM-COM au fichier JSON"""
    
    print("📊 Chargement du fichier JSON...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Récupérer les dates existantes
    if not data:
        print("❌ Le fichier JSON est vide!")
        return
    
    sample_date = list(data.keys())[0]
    sample_dept = list(data[sample_date].keys())[0]
    print(f"✓ Exemple de date: {sample_date}")
    print(f"✓ Exemple de département: {sample_dept}")
    
    dates = sorted(data.keys())
    total_days = len(dates)
    print(f"✓ {total_days} dates trouvées de {dates[0]} à {dates[-1]}")
    
    # Vérifier les départements existants
    existing_depts = set()
    for date in dates:
        existing_depts.update(data[date].keys())
    
    print(f"\n📍 Départements existants: {len(existing_depts)}")
    drom_to_add = [code for code in DROM_CONFIG.keys() if code not in existing_depts]
    print(f"📍 DROM-COM à ajouter: {drom_to_add}")
    
    if not drom_to_add:
        print("✓ Tous les DROM-COM sont déjà présents!")
        return
    
    # Ajouter les données pour chaque DROM-COM
    print(f"\n🔧 Génération des données pour {len(drom_to_add)} DROM-COM...")
    
    for date_idx, date in enumerate(dates):
        for drom_code in drom_to_add:
            config = DROM_CONFIG[drom_code]
            
            # Générer les données avec variation temporelle
            data[date][drom_code] = {
                "vaccination_rate_pct": generate_timeseries_value(
                    config["vaccination_base"], date_idx, total_days, is_percentage=True
                ),
                "cases_per_100k": int(generate_timeseries_value(
                    config["cases_base"], date_idx, total_days
                )),
                "incidence_rate": int(generate_timeseries_value(
                    config["incidence_base"], date_idx, total_days
                )),
                "icu_occupancy_pct": generate_timeseries_value(
                    config["icu_base"], date_idx, total_days, is_percentage=True
                ),
            }
        
        if (date_idx + 1) % 7 == 0:
            print(f"  ✓ {date_idx + 1}/{total_days} dates traitées...")
    
    print(f"\n💾 Sauvegarde dans {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("\n✅ Terminé!")
    print(f"   • {len(drom_to_add)} DROM-COM ajoutés")
    print(f"   • {total_days} dates par département")
    print(f"   • Total: {len(drom_to_add) * total_days} entrées ajoutées")
    
    # Afficher un exemple
    print(f"\n📋 Exemple de données pour {DROM_CONFIG[drom_to_add[0]]['name']} ({drom_to_add[0]}):")
    example_date = dates[0]
    example_data = data[example_date][drom_to_add[0]]
    for key, value in example_data.items():
        print(f"   • {key}: {value}")

if __name__ == "__main__":
    try:
        add_drom_data()
    except FileNotFoundError:
        print(f"❌ Erreur: Le fichier {INPUT_FILE} n'existe pas!")
        print("   Vérifiez le chemin du fichier.")
    except json.JSONDecodeError as e:
        print(f"❌ Erreur de parsing JSON: {e}")
    except Exception as e:
        print(f"❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc()
