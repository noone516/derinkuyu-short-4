#!/bin/bash
# Complete Lambda workflow: deploy + render + mux
# One-shot command for full pipeline

set -e

echo "═══════════════════════════════════════"
echo "  Derinkuyu Short - Lambda Full Pipeline"
echo "═══════════════════════════════════════"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "❌ AWS credentials not configured. Run 'aws configure' first."
  exit 1
fi

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")
echo "🔐 AWS Account: $ACCOUNT | Region: $REGION"
echo ""

# Step 1: Build
echo "📦 Step 1/4: Building bundle..."
npm run build
echo "✅ Build complete"
echo ""

# Step 2: Deploy (skip if already deployed)
echo "🚀 Step 2/4: Deploying to Lambda..."
if aws lambda get-function --function-name derinkuyu-render --region "$REGION" >/dev/null 2>&1; then
  echo "   Function exists, updating..."
  npx remotion lambda deploy \
    --region "$REGION" \
    --function-name derinkuyu-render \
    --timeout 900 \
    --memory 3008 \
    --architecture arm64
else
  echo "   Creating new function..."
  npx remotion lambda deploy \
    --region "$REGION" \
    --function-name derinkuyu-render \
    --timeout 900 \
    --memory 3008 \
    --architecture arm64
fi
echo "✅ Lambda deployed"
echo ""

# Step 3: Render
echo "☁️  Step 3/4: Rendering 1860 frames (62s @ 30fps)..."
npx remotion lambda render src/index.tsx DerinkuyuShort out/derinkuyu/final.mp4 \
  --codec h264 \
  --crf 16 \
  --frames=0-1859 \
  --concurrency 50
echo "✅ Video rendered: out/derinkuyu/final.mp4"
echo ""

# Step 4: Mux with audio
echo "🎵 Step 4/4: Muxing with audio..."
ffmpeg -y -i out/derinkuyu/final.mp4 -i out/derinkuyu/mix.wav \
  -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 192k \
  -shortest out/derinkuyu/final_muxed.mp4
echo "✅ Final output: out/derinkuyu/final_muxed.mp4"
echo ""

echo "═══════════════════════════════════════"
echo "  🎉 Pipeline complete!"
echo "  📹 Video: out/derinkuyu/final_muxed.mp4"
echo "  💰 Est. cost: ~$0.20-0.30"
echo "═══════════════════════════════════════"