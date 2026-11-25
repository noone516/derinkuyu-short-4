#!/usr/bin/env node
/**
 * Render still frames from Remotion composition for look checks.
 * Usage: node scripts/bridge-stills.mjs out/derinkuyu/x_ 100,400 0.5
 */

import { renderMedia, selectComposition, getCompositions } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const [,, outputDir, frameRange, scaleStr] = process.argv;
const scale = parseFloat(scaleStr) || 0.5;

if (!outputDir || !frameRange) {
  console.error("Usage: node bridge-stills.mjs <outputDir> <start,end> <scale>");
  process.exit(1);
}

const [startFrame, endFrame] = frameRange.split(",").map(Number);
const tempDir = process.env.TEMP || "/tmp";
const remotionTemp = path.join(tempDir, "remotion-tmp");

async function main() {
  console.log(`Rendering frames ${startFrame}-${endFrame} at scale ${scale}`);

  // Set temp directory
  process.env.TEMP = remotionTemp;
  process.env.TMP = remotionTemp;

  const compositions = await getCompositions(
    new URL("file://" + path.join(projectRoot, "build") + "/")
  );
  const composition = selectComposition(compositions, { id: "DerinkuyuShort" });

  if (!composition) {
    console.error("Composition 'DerinkuyuShort' not found");
    process.exit(1);
  }

  await renderMedia({
    composition,
    serveUrl: new URL("file://" + path.join(projectRoot, "build") + "/"),
    codec: "png",
    outputLocation: path.join(projectRoot, outputDir),
    inputProps: {},
    frameRange: [startFrame, endFrame],
    scale,
    onProgress: (progress) => {
      console.log(`Progress: ${Math.round(progress * 100)}%`);
    },
  });

  console.log("Done!");
}

main().catch(console.error);