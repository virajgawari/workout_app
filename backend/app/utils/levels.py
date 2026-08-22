LEVELS = [
    (1, "Beginner", 0, 500),
    (2, "Consistent", 500, 1200),
    (3, "Dedicated", 1200, 2200),
    (4, "Athlete", 2200, 3500),
    (5, "Beast", 3500, 5000),
    (6, "Legend", 5000, 999999),
]


def level_from_xp(total_xp: int) -> dict:
    for level, title, min_xp, next_xp in LEVELS:
        if min_xp <= total_xp < next_xp:
            return {
                "level": level,
                "title": title,
                "current_xp": total_xp,
                "level_floor": min_xp,
                "next_level_xp": next_xp,
                "progress_percent": int(((total_xp - min_xp) / max(next_xp - min_xp, 1)) * 100),
            }
    return {
        "level": LEVELS[-1][0],
        "title": LEVELS[-1][1],
        "current_xp": total_xp,
        "level_floor": LEVELS[-1][2],
        "next_level_xp": LEVELS[-1][3],
        "progress_percent": 100,
    }
