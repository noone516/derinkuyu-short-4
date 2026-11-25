#!/bin/bash
# Render Derinkuyu short via Remotion Lambda
# Run after lambda-deploy.sh

set -e

echo "☁️  Rendering via Remotion Lambda..."
echo "   Frames: 0-1859 (1860 frames @ 30fps = 62s)"
echo "   Codec:  h264 CRF 16"
echo "   Est. cost: ~$0.20"
echo ""

npx remotion lambda render src/index.tsx DerinkuyuShort out/derinkuyu/final.mp4 \
  --codec h264 \
  --crf 16 \
  --frames=0-1859 \
  --concurrency 50

echo ""
echo "✅ Render complete: out/derinkuyu/final.mp4"
echo ""
echo "Next: Mux with audio"
echo "  ffmpeg -i out/derinkuyu/final.mp4 -i out/derinkuyu/mix.wav \\"
echo "    -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac out/derinkuyu/final_muxed.mp4"