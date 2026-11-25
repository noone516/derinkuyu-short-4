# Derinkuyu Short - Cloud Rendering Instructions

## Quick Start (AWS Lambda)

### Prerequisites
```bash
# 1. Install AWS CLI
brew install awscli  # macOS
# or: sudo apt-get install awscli  # Linux

# 2. Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Output (json)

# 3. Verify
aws sts get-caller-identity
```

### One-Command Full Pipeline
```bash
cd /Users/aidan/derinkuyu-short
./scripts/lambda-full.sh
```

This runs:
1. `npm run build` - Bundle the project
2. `remotion lambda deploy` - Deploy to AWS Lambda (one-time, ~2 min)
3. `remotion lambda render` - Render 1860 frames in parallel (~1-2 min, ~$0.20)
4. `ffmpeg` - Mux video + audio → `out/derinkuyu/final_muxed.mp4`

### Step-by-Step (if you want control)

```bash
# 1. Build
npm run build

# 2. Deploy Lambda (run once)
./scripts/lambda-deploy.sh

# 3. Render (run anytime after deploy)
./scripts/lambda-render.sh

# 4. Mux audio
ffmpeg -y -i out/derinkuyu/final.mp4 -i out/derinkuyu/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k \
  -shortest out/derinkuyu/final_muxed.mp4
```

## Cost Estimate

| Component | Cost |
|-----------|------|
| Lambda compute (1860 frames × ~2s) | ~$0.15 |
| Lambda requests (1860 invocations) | ~$0.0004 |
| Data transfer (50MB out) | ~$0.004 |
| **Total** | **~$0.15-0.25** |

## Alternative: GitHub Actions (Free)

Add `.github/workflows/render.yml`:

```yaml
name: Render Derinkuyu Short
on:
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npx remotion render src/index.tsx DerinkuyuShort out/final.mp4 --codec h264 --crf 16
      - uses: actions/upload-artifact@v4
        with:
          name: derinkuyu-video
          path: out/final.mp4
```

Trigger manually from Actions tab. Download artifact when done.

## Alternative: Cloud VM (GPU)

```bash
# On AWS g4dn.xlarge (T4 GPU) / GCP n1-standard-4 + T4
sudo apt-get update && sudo apt-get install -y google-chrome-stable ffmpeg nodejs npm
git clone <your-repo> && cd derinkuyu-short
npm ci && npm run build
npx remotion render src/index.tsx DerinkuyuShort out/final.mp4 --codec h264 --crf 16 --gl=angle
```

## Troubleshooting

**Lambda deploy fails:**
- Check AWS permissions: `lambda:*`, `iam:CreateRole`, `logs:*`
- Ensure region supports ARM64 Lambda (us-east-1, us-west-2, eu-west-1)

**Render times out:**
- Increase timeout: `--timeout 1800` (30 min max)
- Reduce concurrency: `--concurrency 25`

**Out of memory:**
- Increase memory: `--memory 10240` (10GB max)

**Video is black (headless issue):**
- Lambda uses proper Chrome headless with GPU - this fixes the local ANGLE issue
- If still black, check Chrome version in Lambda: `npx remotion lambda logs --function-name derinkuyu-render`

## Output Specs

- **Resolution**: 1440×2560 (2K vertical, 9:16)
- **Frame rate**: 30 fps
- **Duration**: 62 seconds (1860 frames)
- **Codec**: h264 CRF 16 (visually lossless)
- **Audio**: 48kHz stereo AAC 192kbps
- **Target LUFS**: -16 LUFS (streaming compliant)

## Files Ready for Render

```
derinkuyu-short/
├── src/
│   ├── index.tsx                    # Composition registration
│   └── videos/derinkuyu/
│       ├── DerinkuyuShort.tsx       # Main composition (FIXED camera)
│       ├── story.tsx                # 17 shots, cameras, DOF, kicks
│       ├── build.tsx                # 18 levels, tunnels, shafts, rooms
│       ├── paint.tsx                # Procedural textures (DataTexture)
│       ├── toon.tsx                 # Bean heads, 14 expressions
│       ├── cast.tsx                 # Billboard sprites, crowds
│       ├── lights.tsx               # Day/golden presets
│       ├── ink.tsx                  # Ink post-pass
│       ├── lensblur.tsx             # DOF shader
│       ├── grade.tsx                # Color grading
│       └── words.tsx                # 249 word timings
├── audio/
│   ├── timeline.py                  # Word-sync → events.json
│   ├── sfx_gen.py                   # Procedural SFX synthesis
│   ├── music.py                     # Leitmotif music (4 themes)
│   ├── mix.py                       # Final mix (-16.6 LUFS)
│   ├── events.json                  # 38 audio events
│   ├── sfx/                         # Generated SFX stems
│   └── music/                       # Generated music stems
├── voice/
│   ├── voice.wav                    # Coqui TTS (62s)
│   └── words.json                   # Word-level timing
├── out/derinkuyu/
│   ├── mix.wav                      # Final audio mix
│   └── (video output here)
├── scripts/
│   ├── lambda-deploy.sh             # Deploy to Lambda
│   ├── lambda-render.sh             # Render via Lambda
│   ├── lambda-full.sh               # Full pipeline
│   └── short_qa.py                  # Frame/audio QA
└── .remotion/lambda-config.json     # Lambda config
```

## Verification After Render

```bash
# Quick QA
python3 scripts/short_qa.py out/derinkuyu/final_muxed.mp4 out/derinkuyu/mix.wav

# Check specs
ffprobe out/derinkuyu/final_muxed.mp4
```