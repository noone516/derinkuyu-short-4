#!/usr/bin/env python3
"""
Audio timeline generator for Derinkuyu short.
Creates event table synced to word timings.
"""

import json
from dataclasses import dataclass, asdict
from typing import List

@dataclass
class AudioEvent:
    time: float
    type: str  # sfx, music, voice
    name: str
    params: dict = None

def load_words(json_path: str) -> List[dict]:
    with open(json_path) as f:
        return json.load(f)

def find_word_time(words: List[dict], target: str, after: float = 0) -> float:
    for w in words:
        if w["word"].lower().strip(".,!?") == target.lower() and w["start"] >= after:
            return w["start"]
    return None

def build_timeline(words: List[dict]) -> List[AudioEvent]:
    events = []

    # Helper to find word times
    def at(word: str, after: float = 0) -> float:
        t = find_word_time(words, word, after)
        return t if t is not None else after

    # Hook flash at "sun"
    events.append(AudioEvent(at("sun."), "sfx", "flash", {"gain": 0.3}))

    # Surface wind starts at "Cappadocia"
    events.append(AudioEvent(at("Cappadocia,"), "sfx", "wind", {"gain": 0.4, "fadeIn": 1}))
    events.append(AudioEvent(at("Cappadocia,"), "music", "drone_low", {"gain": 0.2, "fadeIn": 2}))

    # Horn at "horn"
    events.append(AudioEvent(at("horn"), "sfx", "horn", {"pitch": 0.8, "gain": 0.6}))
    events.append(AudioEvent(at("horn") + 0.5, "sfx", "horn_echo", {"pitch": 0.6, "gain": 0.3}))

    # Door at "shut"
    t_shut = at("shut")
    events.append(AudioEvent(t_shut, "sfx", "stone_grind", {"gain": 0.8, "duration": 2}))
    events.append(AudioEvent(t_shut, "sfx", "thud_heavy", {"gain": 0.7}))
    events.append(AudioEvent(t_shut, "sfx", "dust_puff", {"gain": 0.3}))

    # Footsteps at "descend"
    t_descend = at("descend")
    events.append(AudioEvent(t_descend, "sfx", "footsteps_gravel", {"gain": 0.4, "rate": 2}))
    events.append(AudioEvent(t_descend + 1.0, "sfx", "footsteps_gravel", {"gain": 0.4, "rate": 2}))

    # Goat at "bleat"
    t_bleat = at("bleat")
    events.append(AudioEvent(t_bleat, "sfx", "goat_bleat", {"pitch": 1.0, "gain": 0.5}))
    events.append(AudioEvent(t_bleat + 0.6, "sfx", "goat_bleat", {"pitch": 1.2, "gain": 0.4}))

    # Chicken at "cluck"
    t_cluck = at("cluck")
    events.append(AudioEvent(t_cluck, "sfx", "chicken_cluck", {"gain": 0.3}))
    events.append(AudioEvent(t_cluck + 0.4, "sfx", "chicken_cluck", {"gain": 0.3}))

    # Wine press at "presses"
    t_press = at("presses")
    events.append(AudioEvent(t_press, "sfx", "wood_creak", {"gain": 0.4}))
    events.append(AudioEvent(t_press + 0.5, "sfx", "liquid_squish", {"gain": 0.3}))

    # Vent shaft at "Fifty-two"
    t_vent = at("Fifty-two")
    events.append(AudioEvent(t_vent, "sfx", "wind_whistle", {"gain": 0.5, "pitch": 1.5}))
    events.append(AudioEvent(t_vent + 0.5, "sfx", "wind_whistle", {"gain": 0.4, "pitch": 1.3}))

    # Smoke at "hits"
    t_smoke = at("hits")
    events.append(AudioEvent(t_smoke, "sfx", "smoke_hiss", {"gain": 0.3}))
    events.append(AudioEvent(t_smoke + 1.0, "sfx", "air_spread", {"gain": 0.2}))

    # Cross-section at "city"
    t_city = at("city")
    events.append(AudioEvent(t_city, "music", "swell_strings", {"gain": 0.4, "fadeIn": 1}))
    events.append(AudioEvent(t_city + 1.0, "music", "choir_pad", {"gain": 0.3, "fadeIn": 2}))

    # Termite analogy at "termite" (not in script - use "vents")
    t_vents = at("vents")
    events.append(AudioEvent(t_vents, "sfx", "termite_tap", {"gain": 0.4, "rate": 4}))
    events.append(AudioEvent(t_vents + 1.0, "music", "marimba_motif", {"gain": 0.3}))

    # Doors open at "rolled"
    t_rolled = at("rolled")
    events.append(AudioEvent(t_rolled, "sfx", "stone_grind_reverse", {"gain": 0.6, "duration": 1.5}))
    events.append(AudioEvent(t_rolled + 0.5, "sfx", "light_rush", {"gain": 0.4}))
    events.append(AudioEvent(t_rolled + 0.5, "music", "resolve_chord", {"gain": 0.5}))

    # Surface return at "surface"
    t_surface = at("surface", after=30)
    events.append(AudioEvent(t_surface, "sfx", "birds_chirp", {"gain": 0.4}))
    events.append(AudioEvent(t_surface + 0.5, "sfx", "wind_open", {"gain": 0.5}))
    events.append(AudioEvent(t_surface + 0.5, "music", "theme_main", {"gain": 0.6, "fadeIn": 1}))

    # Modern tourist at "tourist"
    t_tourist = at("tourist")
    events.append(AudioEvent(t_tourist, "sfx", "footstep_modern", {"gain": 0.5}))
    events.append(AudioEvent(t_tourist + 0.5, "sfx", "hand_on_stone", {"gain": 0.3}))

    # Final door at "millstone"
    t_millstone = at("millstone", after=35)
    events.append(AudioEvent(t_millstone, "sfx", "stone_touch", {"gain": 0.4}))
    events.append(AudioEvent(t_millstone + 0.5, "sfx", "cool_air_rush", {"gain": 0.3}))

    # Callback at "mountain" (last occurrence)
    t_mountain = at("mountain", after=45)
    events.append(AudioEvent(t_mountain, "music", "callback_motif", {"gain": 0.5}))
    events.append(AudioEvent(t_mountain + 3.5, "music", "final_chord", {"gain": 0.6, "fadeIn": 2}))
    events.append(AudioEvent(t_mountain + 7.0, "sfx", "deep_resonance", {"gain": 0.4, "duration": 4}))
    events.append(AudioEvent(t_mountain + 13.0, "music", "fade_out", {"gain": 0, "fadeOut": 4}))

    return events

if __name__ == "__main__":
    words = load_words("../voice/words.json")
    events = build_timeline(words)

    # Export to JSON
    with open("events.json", "w") as f:
        json.dump([asdict(e) for e in events], f, indent=2)

    # Print summary
    print(f"Generated {len(events)} audio events")
    for e in events:
        print(f"  {e.time:.2f}s: {e.type} - {e.name}")