#!/usr/bin/env python3
"""
QA script for Derinkuyu short final render.
Checks every frame for black, white, frozen, pop frames, loudness.
"""

import numpy as np
import cv2
from scipy.io import wavfile
import json
import sys
import os

def check_video(video_path: str, shots_json: str = None):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"ERROR: Cannot open {video_path}")
        return False

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Video: {video_path}")
    print(f"  {width}x{height} @ {fps}fps, {frame_count} frames ({frame_count/fps:.2f}s)")

    issues = []
    prev_frame = None
    frozen_count = 0
    black_frames = 0
    white_frames = 0

    for i in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            issues.append(f"Frame {i}: Failed to read")
            break

        # Convert to grayscale for analysis
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        mean_val = np.mean(gray)
        std_val = np.std(gray)

        # Black frame detection
        if mean_val < 5:
            black_frames += 1
            if black_frames == 1:
                issues.append(f"Frame {i}: Black frame (mean={mean_val:.1f})")

        # White frame detection
        if mean_val > 250:
            white_frames += 1
            if white_frames == 1:
                issues.append(f"Frame {i}: White frame (mean={mean_val:.1f})")

        # Frozen frame detection
        if prev_frame is not None:
            diff = np.mean(np.abs(frame.astype(np.float32) - prev_frame.astype(np.float32)))
            if diff < 0.5:
                frozen_count += 1
                if frozen_count >= 12:  # 12 frames at 30fps = 0.4s
                    issues.append(f"Frame {i}: Frozen sequence ({frozen_count} frames)")
            else:
                frozen_count = 0

        # Pop frame detection (sudden brightness change)
        if prev_frame is not None:
            prev_mean = np.mean(cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY))
            if abs(mean_val - prev_mean) > 30:
                issues.append(f"Frame {i}: Pop frame (Δ={abs(mean_val - prev_mean):.1f})")

        prev_frame = frame.copy()

        if i % 1000 == 0:
            print(f"  Progress: {i}/{frame_count}")

    cap.release()

    print(f"\nVideo QA Results:")
    print(f"  Black frames: {black_frames}")
    print(f"  White frames: {white_frames}")
    print(f"  Frozen sequences: {frozen_count}")
    print(f"  Issues found: {len(issues)}")

    for issue in issues[:20]:
        print(f"  - {issue}")
    if len(issues) > 20:
        print(f"  ... and {len(issues) - 20} more")

    return len(issues) == 0

def check_audio(audio_path: str):
    sr, data = wavfile.read(audio_path)
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float32) / 32768.0

    duration = len(data) / sr
    peak = np.max(np.abs(data))
    rms = np.sqrt(np.mean(data**2))
    lufs = 20 * np.log10(rms) + 0.691

    print(f"\nAudio: {audio_path}")
    print(f"  {sr}Hz, {duration:.2f}s")
    print(f"  Peak: {20*np.log10(peak):.1f} dBFS")
    print(f"  RMS: {20*np.log10(rms):.1f} dBFS")
    print(f"  Approx LUFS: {lufs:.1f}")

    issues = []
    if peak > 0.99:
        issues.append("Clipping detected (peak > -0.1 dBFS)")
    if lufs > -12:
        issues.append(f"Too loud: {lufs:.1f} LUFS (target -14)")
    if lufs < -18:
        issues.append(f"Too quiet: {lufs:.1f} LUFS (target -14)")

    # Check for DC offset
    dc = np.mean(data)
    if abs(dc) > 0.001:
        issues.append(f"DC offset: {dc:.4f}")

    print(f"  Issues: {len(issues)}")
    for issue in issues:
        print(f"  - {issue}")

    return len(issues) == 0

def check_sheets(sheets_dir: str):
    # Placeholder for side-by-side comparison
    print(f"\nSheet comparison: {sheets_dir}")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python short_qa.py <video.mp4> <audio.wav> [shots.json]")
        sys.exit(1)

    video_path = sys.argv[1]
    audio_path = sys.argv[2]
    shots_json = sys.argv[3] if len(sys.argv) > 3 else None

    video_ok = check_video(video_path, shots_json)
    audio_ok = check_audio(audio_path)

    if video_ok and audio_ok:
        print("\n✅ All QA checks passed!")
        sys.exit(0)
    else:
        print("\n❌ QA checks failed!")
        sys.exit(1)