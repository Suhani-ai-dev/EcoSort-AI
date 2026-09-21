"""
EcoSort AI — Points & Badge Service

Points logic:
  - Base: +10 per scan
  - E-Waste bonus: +15
  - Hazardous bonus: +20

Badge thresholds (seeded in 001_initial_schema.sql):
  - Eco Starter:    50 pts
  - Green Guardian: 200 pts
  - Waste Warrior:  500 pts
  - Planet Hero:    1000 pts
"""

POINTS_BASE = 10
POINTS_BONUS: dict[str, int] = {
    "E-Waste": 15,
    "Hazardous": 20,
}

BADGE_THRESHOLDS = [
    {"name": "Eco Starter", "threshold": 50},
    {"name": "Green Guardian", "threshold": 200},
    {"name": "Waste Warrior", "threshold": 500},
    {"name": "Planet Hero", "threshold": 1000},
]


def calculate_points(category: str) -> int:
    """Return points earned for scanning an item of the given category."""
    return POINTS_BASE + POINTS_BONUS.get(category, 0)


def get_newly_earned_badge_names(previous_total: int, new_total: int) -> list[str]:
    """
    Return names of badges whose threshold was crossed in this scan.
    E.g. if previous=45, new=55, returns ["Eco Starter"].
    """
    return [
        b["name"]
        for b in BADGE_THRESHOLDS
        if previous_total < b["threshold"] <= new_total
    ]
