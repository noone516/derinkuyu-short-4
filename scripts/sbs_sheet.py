#!/usr/bin/env python3
"""
Side-by-side comparison sheet generator.
Usage: python sbs_sheet.py out.jpg --ours a.png b.png --ref r1.png r2.png
"""

import argparse
import cv2
import numpy as np
from pathlib import Path

def make_sheet(output: str, ours: list, ref: list, labels: list = None):
    """Create side-by-side comparison sheet."""
    images = []

    # Load our frames
    for f in ours:
        img = cv2.imread(f)
        if img is None:
            print(f"Warning: Could not load {f}")
            continue
        images.append(("Ours", img))

    # Load reference frames
    for f in ref:
        img = cv2.imread(f)
        if img is None:
            print(f"Warning: Could not load {f}")
            continue
        images.append(("Ref", img))

    if not images:
        print("No valid images!")
        return

    # Resize all to same height
    target_h = 540
    resized = []
    for label, img in images:
        h, w = img.shape[:2]
        new_w = int(w * target_h / h)
        resized.append((label, cv2.resize(img, (new_w, target_h))))

    # Create grid
    n = len(resized)
    cols = min(4, n)
    rows = (n + cols - 1) // cols

    cell_w = max(img.shape[1] for _, img in resized)
    cell_h = target_h + 40  # Extra space for label

    sheet = np.zeros((rows * cell_h, cols * cell_w, 3), dtype=np.uint8)

    for i, (label, img) in enumerate(resized):
        r = i // cols
        c = i % cols
        y = r * cell_h
        x = c * cell_w

        # Paste image
        h, w = img.shape[:2]
        sheet[y:y+h, x:x+w] = img

        # Add label
        cv2.putText(sheet, label, (x + 10, y + h + 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    cv2.imwrite(output, sheet)
    print(f"Saved sheet to {output} ({sheet.shape[1]}x{sheet.shape[0]})")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("output", help="Output sheet path")
    parser.add_argument("--ours", nargs="+", help="Our frames")
    parser.add_argument("--ref", nargs="+", help="Reference frames")
    parser.add_argument("--labels", nargs="+", help="Custom labels")

    args = parser.parse_args()

    make_sheet(args.output, args.ours or [], args.ref or [], args.labels)