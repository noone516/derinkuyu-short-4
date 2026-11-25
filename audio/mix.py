#!/usr/bin/env python3
"""
Final audio mixer for Derinkuyu short.
Combines voice, SFX, and music stems.
"""

import numpy as np
from scipy import signal
from scipy.io import wavfile
import json
import os

SAMPLE_RATE = 48000
TARGET_DURATION = 62.0  # seconds
TARGET_SAMPLES = int(TARGET_DURATION * SAMPLE_RATE)

# Mix levels (dB)
MUSIC_GAIN_DB = -9
SFX_GAIN_DB = -12
VOICE_GAIN_DB = 0

def db_to_linear(db):
    return 10 ** (db / 20)

def load_wav(path: str) -> np.ndarray:
    sr, data = wavfile.read(path)
    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    else:
        data = data.astype(np.float32)
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    if sr != SAMPLE_RATE:
        # Resample
        data = signal.resample(data, int(len(data) * SAMPLE_RATE / sr))
    return data

def save_wav(path: str, audio: np.ndarray):
    peak = np.max(np.abs(audio))
    if peak > 0:
        audio = audio / peak * 0.95
    audio_int = np.clip(audio * 32767, -32767, 32767).astype(np.int16)
    wavfile.write(path, SAMPLE_RATE, audio_int)

def apply_fade(audio: np.ndarray, fade_in: float = 0, fade_out: float = 0) -> np.ndarray:
    n = len(audio)
    if fade_in > 0:
        fi = int(fade_in * SAMPLE_RATE)
        audio[:fi] *= np.linspace(0, 1, fi)
    if fade_out > 0:
        fo = int(fade_out * SAMPLE_RATE)
        audio[-fo:] *= np.linspace(1, 0, fo)
    return audio

def soft_clip(x: np.ndarray, threshold: float = 0.9) -> np.ndarray:
    """Soft clipping to prevent harsh digital clipping."""
    mask = np.abs(x) > threshold
    if np.any(mask):
        sign = np.sign(x[mask])
        x_abs = np.abs(x[mask])
        x[mask] = sign * (threshold + (x_abs - threshold) / (1 + (x_abs - threshold)))
    return x

def mix_audio():
    # Load voice
    voice = load_wav("../voice/voice.wav")
    if len(voice) < TARGET_SAMPLES:
        voice = np.pad(voice, (0, TARGET_SAMPLES - len(voice)))
    else:
        voice = voice[:TARGET_SAMPLES]
    voice *= db_to_linear(VOICE_GAIN_DB)

    # Load events
    with open("events.json") as f:
        events = json.load(f)

    # Initialize mix buffers
    music_mix = np.zeros(TARGET_SAMPLES)
    sfx_mix = np.zeros(TARGET_SAMPLES)

    # Process music events
    music_cache = {}
    for event in events:
        if event["type"] == "music":
            name = event["name"]
            if name not in music_cache:
                path = f"music/{name}.wav"
                if os.path.exists(path):
                    music_cache[name] = load_wav(path)
                else:
                    print(f"Warning: Music stem not found: {path}")
                    continue

            stem = music_cache[name]
            params = event.get("params", {})
            gain = params.get("gain", 1.0)
            fade_in = params.get("fadeIn", 0)
            fade_out = params.get("fadeOut", 0)

            stem = apply_fade(stem.copy(), fade_in, fade_out)
            start = int(event["time"] * SAMPLE_RATE)
            if start >= TARGET_SAMPLES:
                continue
            end = start + len(stem)
            if end <= TARGET_SAMPLES:
                music_mix[start:end] += stem * gain * db_to_linear(MUSIC_GAIN_DB)
            else:
                music_mix[start:] += stem[:TARGET_SAMPLES-start] * gain * db_to_linear(MUSIC_GAIN_DB)

    # Process SFX events
    sfx_cache = {}
    for event in events:
        if event["type"] == "sfx":
            name = event["name"]
            cache_key = f"{name}_{event['time']:.2f}"
            if cache_key not in sfx_cache:
                path = f"sfx/{cache_key}.wav"
                if os.path.exists(path):
                    sfx_cache[cache_key] = load_wav(path)
                else:
                    # Try base name
                    base_path = f"sfx/{name}.wav"
                    if os.path.exists(base_path):
                        sfx_cache[cache_key] = load_wav(base_path)
                    else:
                        print(f"Warning: SFX not found: {path}")
                        continue

            stem = sfx_cache[cache_key]
            params = event.get("params", {})
            gain = params.get("gain", 1.0)

            start = int(event["time"] * SAMPLE_RATE)
            if start >= TARGET_SAMPLES:
                continue
            end = start + len(stem)
            if end <= TARGET_SAMPLES:
                sfx_mix[start:end] += stem * gain * db_to_linear(SFX_GAIN_DB)
            else:
                sfx_mix[start:] += stem[:TARGET_SAMPLES-start] * gain * db_to_linear(SFX_GAIN_DB)

    # Apply soft clipping to individual stems before final mix
    music_mix = soft_clip(music_mix)
    sfx_mix = soft_clip(sfx_mix)

    # Final mix
    final = voice + music_mix + sfx_mix

    # Final soft clip and normalize
    final = soft_clip(final)
    peak = np.max(np.abs(final))
    if peak > 1.0:
        final = final / peak * 0.98

    # Save
    os.makedirs("../out/derinkuyu", exist_ok=True)
    save_wav("../out/derinkuyu/mix.wav", final)
    save_wav("../out/derinkuyu/voice_stem.wav", voice)
    save_wav("../out/derinkuyu/music_stem.wav", music_mix)
    save_wav("../out/derinkuyu/sfx_stem.wav", sfx_mix)

    print(f"Mixed audio saved to ../out/derinkuyu/mix.wav")
    print(f"Duration: {len(final)/SAMPLE_RATE:.2f}s")
    print(f"Peak: {peak:.3f}")

    # Loudness check (simple RMS)
    rms = np.sqrt(np.mean(final**2))
    lufs_approx = 20 * np.log10(rms) + 0.691  # Rough approximation
    print(f"Approx LUFS: {lufs_approx:.1f}")

if __name__ == "__main__":
    mix_audio()