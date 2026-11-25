#!/usr/bin/env python3
"""
Merge sandbox changes back to main.
Usage: python bridge_merge.py cam world mat char post
"""

import sys
import shutil
import datetime
from pathlib import Path

SANDBOXES = ["cam", "world", "mat", "char", "post"]
FILES = {
    "cam": ["story.ts"],
    "world": ["world.ts", "lights.ts", "shade.ts", "grade.ts"],
    "mat": ["paint.ts", "build.ts"],
    "char": ["toon.ts", "cast.ts", "cardshade.ts"],
    "post": ["ink.ts", "Bridge.tsx", "lensblur.ts"],
}

def main():
    if len(sys.argv) < 2:
        print("Usage: python bridge_merge.py <sandbox1> [sandbox2] ...")
        print(f"Available: {', '.join(SANDBOXES)}")
        sys.exit(1)

    targets = sys.argv[1:]
    for t in targets:
        if t not in SANDBOXES:
            print(f"Unknown sandbox: {t}")
            sys.exit(1)

    base = Path("src/videos/derinkuyu")
    backup_dir = Path(f"backup/derinkuyu_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}")
    backup_dir.mkdir(parents=True, exist_ok=True)

    # Backup main
    for f in base.glob("*.ts"):
        if f.name != "DerinkuyuShort.tsx":
            shutil.copy2(f, backup_dir / f.name)

    print(f"Backed up to {backup_dir}")

    # Merge each sandbox
    for sandbox in targets:
        sandbox_dir = base.parent / f"derinkuyu_{sandbox}"
        if not sandbox_dir.exists():
            print(f"Sandbox not found: {sandbox_dir}")
            continue

        for f in FILES[sandbox]:
            src = sandbox_dir / f
            dst = base / f
            if src.exists():
                shutil.copy2(src, dst)
                print(f"  Merged {sandbox}/{f}")
            else:
                print(f"  Missing: {src}")

    # Re-sync all sandboxes from main
    for sandbox in SANDBOXES:
        sandbox_dir = base.parent / f"derinkuyu_{sandbox}"
        if sandbox_dir.exists():
            for f in FILES[sandbox]:
                src = base / f
                dst = sandbox_dir / f
                if src.exists():
                    shutil.copy2(src, dst)

    print("All sandboxes re-synced from main")

if __name__ == "__main__":
    main()