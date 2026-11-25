#!/bin/bash
# Deploy Derinkuyu short to Remotion Lambda
# Run once after configuring AWS credentials

set -e

echo "📦 Building Remotion bundle..."
npm run build

echo "🚀 Deploying to AWS Lambda (us-east-1)..."
npx remotion lambda deploy \
  --region us-east-1 \
  --function-name derinkuyu-render \
  --timeout 900 \
  --memory 3008 \
  --architecture arm64

echo "✅ Deployment complete!"
echo ""
echo "To render:"
echo "  npx remotion lambda render src/index.tsx DerinkuyuShort out/derinkuyu/final.mp4 \\"
echo "    --codec h264 --crf 16 --frames=0-1859"