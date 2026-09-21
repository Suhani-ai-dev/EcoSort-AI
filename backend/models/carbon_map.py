# backend/models/carbon_map.py
"""
Carbon impact estimates for waste categories.
Values represent kg CO2e saved per item when recycled/properly disposed
versus sending to landfill.

Sources:
- WRAP (2020). "Estimates of carbon benefits for various types of waste".
  https://www.wrap.org.uk/
- US EPA WARM Model v16 (2023). Waste Reduction Model.
  https://www.epa.gov/warm
- IPCC AR6 WG3 (2022). Chapter 5: Demand, Services and Social Aspects of Mitigation.
"""

CARBON_MAP: dict[str, dict] = {
    "Paper": {
        "carbon_kg_saved": 0.9,
        "unit": "kg CO2e per kg of paper recycled vs landfill",
        "citation": "US EPA WARM Model v16 (2023): Paper recycling offset = 0.84 MTCO2E/short ton; WRAP (2020) estimates ~0.9 kg CO2e/kg for mixed paper"
    },
    "Plastic": {
        "carbon_kg_saved": 1.5,
        "unit": "kg CO2e per kg of plastic recycled vs landfill",
        "citation": "US EPA WARM Model v16 (2023): HDPE recycling = 1.51 MTCO2E/short ton; PET = 1.43 MTCO2E/short ton. Average rounded to 1.5 kg CO2e/kg"
    },
    "Glass": {
        "carbon_kg_saved": 0.3,
        "unit": "kg CO2e per kg of glass recycled vs landfill",
        "citation": "US EPA WARM Model v16 (2023): Glass recycling = 0.26 MTCO2E/short ton. WRAP (2020) UK glass: ~0.3 kg CO2e/kg"
    },
    "Metal": {
        "carbon_kg_saved": 4.0,
        "unit": "kg CO2e per kg of metal recycled vs landfill",
        "citation": "US EPA WARM Model v16 (2023): Aluminium cans = 9.13 MTCO2E/short ton; Steel cans = 1.79 MTCO2E/short ton. Blended average ~4.0 kg CO2e/kg"
    },
    "Food/Organic": {
        "carbon_kg_saved": 0.5,
        "unit": "kg CO2e per kg of food waste composted vs landfill",
        "citation": "IPCC AR6 WG3 (2022) Ch.5: Anaerobic digestion and composting of food waste avoids ~0.5 kg CO2e/kg vs landfill methane emissions (GWP-100)"
    },
    "E-Waste": {
        "carbon_kg_saved": 20.0,
        "unit": "kg CO2e per device properly recycled vs landfill",
        "citation": "IPCC AR6 WG3 (2022) Ch.5; EPA (2021) Electronics Recycling: recovering metals from e-waste avoids ~20 kg CO2e per device on average (smartphones ~16 kg, laptops ~28 kg)"
    },
    "Medical": {
        "carbon_kg_saved": 0.1,
        "unit": "kg CO2e per kg properly disposed vs unsegregated waste",
        "citation": "WHO Health-care waste guidelines (2014); incineration of segregated medical waste produces ~0.1 kg CO2e/kg less than co-incineration with general waste"
    },
    "Hazardous": {
        "carbon_kg_saved": 2.0,
        "unit": "kg CO2e per kg properly treated vs illegal dumping/landfill",
        "citation": "US EPA WARM Model v16 (2023): Proper hazardous waste treatment avoids landfill leachate and incineration emissions; estimated 2.0 kg CO2e/kg for chemical containers"
    },
    "Textile": {
        "carbon_kg_saved": 3.6,
        "unit": "kg CO2e per kg of textile recycled/reused vs landfill",
        "citation": "WRAP (2020) 'Valuing Our Clothes': extending the life of clothing by 9 months reduces carbon footprint by 20-30%; recycling textile saves ~3.6 kg CO2e/kg vs landfill"
    },
    "General": {
        "carbon_kg_saved": 0.2,
        "unit": "kg CO2e per kg of general waste diverted from landfill",
        "citation": "US EPA WARM Model v16 (2023): Mixed MSW landfill avoidance baseline ~0.2 MTCO2E/short ton"
    },
}

# Sub-category to parent category mapping
SUB_CATEGORY_MAP: dict[str, tuple[str, str]] = {
    # (category, sub_category)
    "newspaper":          ("Paper",        "newspaper"),
    "cardboard":          ("Paper",        "cardboard"),
    "office_paper":       ("Paper",        "office_paper"),
    "tissue":             ("Paper",        "tissue"),
    "pet_bottle":         ("Plastic",      "pet_bottle"),
    "hdpe":               ("Plastic",      "hdpe"),
    "pvc":                ("Plastic",      "pvc"),
    "styrofoam":          ("Plastic",      "styrofoam"),
    "plastic_bag":        ("Plastic",      "plastic_bag"),
    "clear_glass":        ("Glass",        "clear_glass"),
    "colored_glass":      ("Glass",        "colored_glass"),
    "broken_glass":       ("Glass",        "broken_glass"),
    "aluminium_can":      ("Metal",        "aluminium_can"),
    "steel_can":          ("Metal",        "steel_can"),
    "foil":               ("Metal",        "foil"),
    "fruit_peel":         ("Food/Organic", "fruit_peel"),
    "cooked_food":        ("Food/Organic", "cooked_food"),
    "garden_waste":       ("Food/Organic", "garden_waste"),
    "phone":              ("E-Waste",      "phone"),
    "charger":            ("E-Waste",      "charger"),
    "battery":            ("E-Waste",      "battery"),
    "circuit_board":      ("E-Waste",      "circuit_board"),
    "mask":               ("Medical",      "mask"),
    "syringe":            ("Medical",      "syringe"),
    "medicine_packaging": ("Medical",      "medicine_packaging"),
    "paint":              ("Hazardous",    "paint"),
    "solvent":            ("Hazardous",    "solvent"),
    "chemical_container": ("Hazardous",    "chemical_container"),
    "clothing":           ("Textile",      "clothing"),
    "shoes":              ("Textile",      "shoes"),
    "fabric_scraps":      ("Textile",      "fabric_scraps"),
    "mixed":              ("General",      "mixed"),
    "unrecognised":       ("General",      "unrecognised"),
}

CLASS_NAMES = [
    "Paper", "Plastic", "Glass", "Metal", "Food/Organic",
    "E-Waste", "Medical", "Hazardous", "Textile", "General"
]
