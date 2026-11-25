#!/usr/bin/env python3
"""
Procedural SFX generator for Derinkuyu short.
Uses numpy/scipy for synthesis.
"""

import numpy as np
from scipy import signal
from scipy.io import wavfile
import json
import os

SAMPLE_RATE = 48000

def envelope(t, attack=0.01, decay=0.1, sustain=0.5, release=0.1, duration=1.0):
    """ADSR envelope."""
    env = np.ones_like(t)
    n = len(t)
    a = int(attack * SAMPLE_RATE)
    d = int(decay * SAMPLE_RATE)
    r = int(release * SAMPLE_RATE)
    s = n - a - d - r

    if a > 0:
        env[:a] = np.linspace(0, 1, a)
    if d > 0 and s > 0:
        env[a:a+d] = np.linspace(1, sustain, d)
    if s > 0:
        env[a+d:a+d+s] = sustain
    if r > 0:
        env[-r:] = np.linspace(sustain, 0, r)
    return env

def render_noise(color="white", duration=1.0, sample_rate=SAMPLE_RATE):
    """Generate colored noise."""
    n = int(duration * sample_rate)
    if color == "white":
        x = np.random.randn(n)
    elif color == "pink":
        # Paul Kellet's pink noise filter
        b = np.array([0.049922035, -0.095993537, 0.050612699, -0.004408786])
        a = np.array([1, -2.494956002, 2.017265875, -0.522189400])
        x = signal.lfilter(b, a, np.random.randn(n))
    elif color == "brown":
        x = np.cumsum(np.random.randn(n))
        x = x / np.max(np.abs(x))
    else:
        x = np.random.randn(n)
    return x

def render_oscillator(wave="sine", freq=440, duration=1.0, sample_rate=SAMPLE_RATE, modulation=None):
    """Generate oscillator tone."""
    t = np.arange(int(duration * sample_rate)) / sample_rate
    phase = 2 * np.pi * freq * t

    if modulation and modulation.get("type") == "fm":
        mod_freq = modulation.get("modulator", 10)
        mod_index = modulation.get("index", 1)
        phase += mod_index * np.sin(2 * np.pi * mod_freq * t)

    if wave == "sine":
        x = np.sin(phase)
    elif wave == "sawtooth":
        x = signal.sawtooth(phase)
    elif wave == "square":
        x = signal.square(phase)
    elif wave == "triangle":
        x = signal.sawtooth(phase, width=0.5)
    else:
        x = np.sin(phase)

    if modulation and modulation.get("type") == "vibrato":
        vib_rate = modulation.get("rate", 5)
        vib_depth = modulation.get("depth", 0.1)
        x *= (1 + vib_depth * np.sin(2 * np.pi * vib_rate * t))

    if modulation and modulation.get("type") == "tremolo":
        trem_rate = modulation.get("rate", 5)
        trem_depth = modulation.get("depth", 0.3)
        x *= (1 + trem_depth * np.sin(2 * np.pi * trem_rate * t))

    return x

def apply_filter(x, filter_type="lowpass", freq=1000, q=1.0, sample_rate=SAMPLE_RATE, **kwargs):
    """Apply biquad filter."""
    # Accept 'type' as alias for filter_type (from JSON presets)
    if "type" in kwargs:
        filter_type = kwargs["type"]
    nyquist = sample_rate / 2
    norm_freq = freq / nyquist
    if filter_type == "lowpass":
        b, a = signal.butter(2, norm_freq, btype="low")
    elif filter_type == "highpass":
        b, a = signal.butter(2, norm_freq, btype="high")
    elif filter_type == "bandpass":
        b, a = signal.butter(2, [freq / nyquist * 0.9, freq / nyquist * 1.1], btype="band")
    else:
        return x
    return signal.lfilter(b, a, x)

def render_sfx(preset: dict, sample_rate=SAMPLE_RATE) -> np.ndarray:
    """Render SFX from preset."""
    duration = preset.get("duration", 1.0)
    t = np.arange(int(duration * sample_rate)) / sample_rate

    if preset.get("type") == "noise":
        x = render_noise(preset.get("color", "white"), duration, sample_rate)
    elif preset.get("type") == "oscillator":
        x = render_oscillator(
            preset.get("wave", "sine"),
            preset.get("freq", 440),
            duration,
            sample_rate,
            preset.get("modulation")
        )
        if preset.get("unison", 1) > 1:
            detune = preset.get("detune", 0.01)
            for i in range(1, preset["unison"]):
                x += render_oscillator(
                    preset.get("wave", "sine"),
                    preset.get("freq", 440) * (1 + detune * (i - (preset["unison"]-1)/2)),
                    duration, sample_rate
                )
            x /= preset["unison"]
    elif preset.get("type") == "chord":
        x = np.zeros_like(t)
        for note in preset.get("notes", [440]):
            x += render_oscillator(
                preset.get("wave", "sine"),
                note,
                duration,
                sample_rate
            )
        x /= len(preset["notes"])
    elif preset.get("type") == "melody":
        x = np.zeros(int(preset.get("duration", 1) * sample_rate))
        notes = preset.get("notes", [440])
        rhythm = preset.get("rhythm", [1])
        wave = preset.get("wave", "sine")
        total_dur = sum(rhythm)
        for i, (note, dur) in enumerate(zip(notes, rhythm)):
            start = int(sum(rhythm[:i]) / total_dur * len(x))
            end = int(sum(rhythm[:i+1]) / total_dur * len(x))
            if end > start:
                note_dur = (end - start) / sample_rate
                note_audio = render_oscillator(wave, note, note_dur, sample_rate)
                note_audio *= envelope(
                    np.arange(len(note_audio)) / sample_rate,
                    **preset.get("envelope", {})
                )
                x[start:end] = note_audio[:end-start]
        return x
    elif preset.get("type") == "sample":
        # Placeholder - would load actual sample
        x = render_noise("pink", duration, sample_rate) * 0.1
    elif preset.get("type") == "silence":
        return np.zeros(int(duration * sample_rate))
    else:
        x = np.zeros(int(duration * sample_rate))

    # Apply envelope
    env_params = preset.get("envelope", {})
    if env_params:
        x *= envelope(t, **env_params)

    # Apply filter
    if "filter" in preset:
        x = apply_filter(x, **preset["filter"])

    # Handle repeat
    if "repeat" in preset:
        repeat = preset["repeat"]
        interval = repeat.get("interval", 0.5)
        count = repeat.get("count", 1)
        single = x.copy()
        total_len = int((duration + interval * (count - 1)) * sample_rate)
        out = np.zeros(total_len)
        for i in range(count):
            start = int(i * interval * sample_rate)
            end = start + len(single)
            if end <= total_len:
                out[start:end] += single
        return out

    return x

def save_wav(path: str, audio: np.ndarray, sample_rate=SAMPLE_RATE):
    """Save audio to WAV file."""
    # Normalize to prevent clipping
    peak = np.max(np.abs(audio))
    if peak > 0:
        audio = audio / peak * 0.95
    # Convert to int16
    audio_int = np.clip(audio * 32767, -32768, 32767).astype(np.int16)
    wavfile.write(path, sample_rate, audio_int)

if __name__ == "__main__":
    # Load presets
    with open("sfx_presets.json") as f:
        presets = json.load(f)

    # Load events
    with open("events.json") as f:
        events = json.load(f)

    # Generate each SFX
    os.makedirs("sfx", exist_ok=True)
    for event in events:
        if event["type"] == "sfx":
            preset = presets.get(event["name"], {})
            if preset:
                audio = render_sfx({**preset, **event.get("params", {})})
                save_wav(f"sfx/{event['name']}_{event['time']:.2f}.wav", audio)
                print(f"Generated: {event['name']} at {event['time']:.2f}s")