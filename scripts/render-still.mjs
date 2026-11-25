#!/usr/bin/env node
import { renderMedia, selectComposition, getCompositions } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

async function main() {
  console.log("Rendering still frame...");

  const compositions = await getCompositions(
    "http://localhost:3001"
  );
  const composition = selectComposition(compositions, { id: "DerinkuyuShort" });

  if (!composition) {
    console.error("Composition 'DerinkuyuShort' not found");
    process.exit(1);
  }

  await renderMedia({
    composition,
    serveUrl: "http://localhost:3001",
    codec: "png",
    outputLocation: path.join(projectRoot, "out/derinkuyu/programmatic.png"),
    inputProps: {},
    frame: 10,
    onProgress: (progress) => {
      console.log(`Progress: ${Math.round(progress * 100)}%`);
    },
    browserExecutable: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    chromeMode: "headless",
  });

  console.log("Done!");
}

main().catch(console.error);