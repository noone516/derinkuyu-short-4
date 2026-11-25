#!/usr/bin/env python3
"""
Music generator for Derinkuyu short.
Procedural score with leitmotifs.
"""

import numpy as np
from scipy import signal
from scipy.io import wavfile
import json
import os

SAMPLE_RATE = 48000

# Leitmotifs
MOTIFS = {
    "mountain": [110, 165, 220, 277],  # A2, E3, A3, C#4
    "breath": [220, 247, 294, 330],    # A3, B3, D4, E4
    "stone": [165, 196, 220, 262],     # E3, G3, A3, C4
    "hope": [330, 415, 494, 554],      # E4, G#4, B4, C#5
}

SCALES = {
    "dorian": [0, 2, 3, 5, 7, 9, 10],
    "phrygian": [0, 1, 3, 5, 7, 8, 10],
    "aeolian": [0, 2, 3, 5, 7, 8, 10],
}

def freq(note: int) -> float:
    """MIDI note to frequency."""
    return 440 * 2 ** ((note - 69) / 12)

def envelope(t, attack=0.1, decay=0.2, sustain=0.7, release=0.5):
    env = np.ones_like(t)
    n = len(t)
    a = int(attack * SAMPLE_RATE)
    d = int(decay * SAMPLE_RATE)
    r = int(release * SAMPLE_RATE)
    s = n - a - d - r
    if a > 0: env[:a] = np.linspace(0, 1, a)
    if d > 0 and s > 0: env[a:a+d] = np.linspace(1, sustain, d)
    if s > 0: env[a+d:a+d+s] = sustain
    if r > 0: env[-r:] = np.linspace(sustain, 0, r)
    return env

def render_note(midi_note: float, duration: float, wave="sine", env=None, detune=0) -> np.ndarray:
    t = np.arange(int(duration * SAMPLE_RATE)) / SAMPLE_RATE
    f = freq(midi_note) * (1 + detune)
    if wave == "sine":
        x = np.sin(2 * np.pi * f * t)
    elif wave == "triangle":
        x = signal.sawtooth(2 * np.pi * f * t, width=0.5)
    else:
        x = np.sin(2 * np.pi * f * t)
    if env is not None:
        x *= env
    return x

def render_chord(notes: list, duration: float, wave="sine", env=None) -> np.ndarray:
    x = np.zeros(int(duration * SAMPLE_RATE))
    for n in notes:
        x += render_note(n, duration, wave, env)
    return x / len(notes)

def render_melody(notes: list, rhythm: list, wave="sine", env_params=None) -> np.ndarray:
    total_beats = sum(rhythm)
    total_dur = 4.0  # 4 seconds base
    x = np.zeros(int(total_dur * SAMPLE_RATE))
    pos = 0
    for n, r in zip(notes, rhythm):
        dur = (r / total_beats) * total_dur
        note_audio = render_note(n, dur, wave, envelope(np.arange(int(dur * SAMPLE_RATE)) / SAMPLE_RATE, **(env_params or {})))
        end = pos + len(note_audio)
        if end <= len(x):
            x[pos:end] += note_audio
        pos = end
    return x[:pos]

def render_drone(root: int, duration: float, intervals: list = [0, 7, 12, 19], wave="sine") -> np.ndarray:
    """Sustained drone chord."""
    notes = [root + i for i in intervals]
    x = np.zeros(int(duration * SAMPLE_RATE))
    t = np.arange(len(x)) / SAMPLE_RATE
    for n in notes:
        f = freq(n)
        x += np.sin(2 * np.pi * f * t) * 0.3
    # Slow modulation
    x *= (1 + 0.1 * np.sin(2 * np.pi * 0.1 * t))
    # Envelope
    x *= envelope(t, attack=5, decay=0, sustain=1, release=5)
    return x

def render_theme(motif_name: str, duration: float, variations: int = 3) -> np.ndarray:
    """Render main theme with variations."""
    motif = MOTIFS.get(motif_name, MOTIFS["mountain"])
    total = np.zeros(int(duration * SAMPLE_RATE))
    seg_dur = duration / variations
    for v in range(variations):
        # Transpose each variation
        transpose = [0, 5, -2, 7][v % 4]
        notes = [n + transpose for n in motif]
        rhythm = [1, 1, 2, 1, 1, 1, 2][:len(notes)]
        seg = render_melody(notes, rhythm, "triangle", {"attack": 0.2, "decay": 0.3, "sustain": 0.5, "release": 0.5})
        start = int(v * seg_dur * SAMPLE_RATE)
        end = start + len(seg)
        if end <= len(total):
            total[start:end] += seg * (0.8 - v * 0.1)
    return total

def save_wav(path: str, audio: np.ndarray):
    peak = np.max(np.abs(audio))
    if peak > 0:
        audio = audio / peak * 0.9
    audio_int = np.clip(audio * 32767, -32768, 32767).astype(np.int16)
    wavfile.write(path, SAMPLE_RATE, audio_int)

if __name__ == "__main__":
    os.makedirs("music", exist_ok=True)

    # Generate musical stems
    stems = {
        "drone_low": render_drone(33, 65),  # A1
        "swell_strings": render_chord([45, 52, 57, 60], 10, "sawtooth", envelope(np.arange(10*SAMPLE_RATE)/SAMPLE_RATE, attack=2, release=2)),
        "choir_pad": render_chord([57, 60, 64, 69], 12, "sine", envelope(np.arange(12*SAMPLE_RATE)/SAMPLE_RATE, attack=3, release=3)),
        "marimba_motif": render_melody([72, 76, 79, 84], [0.5, 0.5, 0.5, 1], "sine", {"attack": 0.01, "decay": 0.3, "release": 0.2}),
        "resolve_chord": render_chord([57, 61, 64, 69], 5, "sine", envelope(np.arange(5*SAMPLE_RATE)/SAMPLE_RATE, attack=0.5, release=2)),
        "theme_main": render_theme("breath", 20),
        "callback_motif": render_melody([69, 65, 57], [1, 1, 2], "sine", {"attack": 0.2, "release": 0.5}),
        "final_chord": render_chord([33, 38, 45, 49, 57], 10, "sine", envelope(np.arange(10*SAMPLE_RATE)/SAMPLE_RATE, attack=2, release=4)),
        "fade_out": render_chord([33, 40, 45, 52], 15, "sine", envelope(np.arange(15*SAMPLE_RATE)/SAMPLE_RATE, attack=1, release=10)),
    }

    for name, audio in stems.items():
        save_wav(f"music/{name}.wav", audio)
        print(f"Generated: {name}.wav ({len(audio)/SAMPLE_RATE:.1f}s)")