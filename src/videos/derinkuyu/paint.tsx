import * as THREE from "three";

const cache = new Map<string, THREE.DataTexture>();

function generateTextureData(name: string): { data: Uint8Array; width: number; height: number } {
  const width = 256;
  const height = 256;
  const data = new Uint8Array(width * height * 4);

  // Seeded random for consistency
  let seed = 0;
  for (let i = 0; i < name.length; i++) seed = seed * 31 + name.charCodeAt(i);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };

  switch (name) {
    case "tuff": {
      // Base tuff color - muted beige/ochre
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          data[i] = 139;     // R
          data[i + 1] = 125; // G
          data[i + 2] = 107; // B
          data[i + 3] = 255; // A
        }
      }
      // Layered sedimentary bands
      for (let y = 0; y < height; y += 4 + Math.floor(rand() * 8)) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const alpha = 0.15 + rand() * 0.1;
          data[i] = Math.floor(data[i] * (1 - alpha) + (120 + rand() * 40) * alpha);
          data[i + 1] = Math.floor(data[i + 1] * (1 - alpha) + (110 + rand() * 30) * alpha);
          data[i + 2] = Math.floor(data[i + 2] * (1 - alpha) + (90 + rand() * 30) * alpha);
        }
      }
      // Pockmarks
      for (let i = 0; i < 50; i++) {
        const cx = Math.floor(rand() * width);
        const cy = Math.floor(rand() * height);
        const r = 1 + Math.floor(rand() * 3);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const x = cx + dx;
              const y = cy + dy;
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = 0.2 + rand() * 0.3;
                data[idx] = Math.floor(data[idx] * (1 - alpha) + 60 * alpha);
                data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + 55 * alpha);
                data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + 50 * alpha);
              }
            }
          }
        }
      }
      // Crack network
      for (let i = 0; i < 10; i++) {
        let x = Math.floor(rand() * width);
        let y = Math.floor(rand() * height);
        for (let j = 0; j < 5; j++) {
          const nx = Math.floor(rand() * width);
          const ny = Math.floor(rand() * height);
          drawLine(data, width, height, x, y, nx, ny, [50, 45, 40, 0.15 * 255]);
          x = nx; y = ny;
        }
      }
      // Dark seams
      for (let i = 0; i < 5; i++) {
        const y = Math.floor(rand() * height);
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const alpha = 0.3;
          data[idx] = Math.floor(data[idx] * (1 - alpha) + 30 * alpha);
          data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + 28 * alpha);
          data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + 25 * alpha);
        }
      }
      break;
    }
    case "basalt": {
      // Dark volcanic rock
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          data[i] = 45;
          data[i + 1] = 40;
          data[i + 2] = 37;
          data[i + 3] = 255;
        }
      }
      // Cooling columns
      for (let i = 0; i < 30; i++) {
        const cx = Math.floor(rand() * width);
        const cy = Math.floor(rand() * height);
        const r = 4 + Math.floor(rand() * 10);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r && Math.abs(dx * dx + dy * dy - r * r) < r) {
              const x = cx + dx;
              const y = cy + dy;
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = 0.1 + rand() * 0.2;
                data[idx] = Math.floor(data[idx] * (1 - alpha) + 45 * alpha);
                data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + 40 * alpha);
                data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + 37 * alpha);
              }
            }
          }
        }
      }
      // Vesicles
      for (let i = 0; i < 50; i++) {
        const cx = Math.floor(rand() * width);
        const cy = Math.floor(rand() * height);
        const r = Math.floor(rand() * 2);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const x = cx + dx;
              const y = cy + dy;
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = 0.3 + rand() * 0.4;
                data[idx] = Math.floor(data[idx] * (1 - alpha) + 20 * alpha);
                data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + 18 * alpha);
                data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + 15 * alpha);
              }
            }
          }
        }
      }
      break;
    }
    case "wood": {
      // Aged timber
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          data[i] = 93;
          data[i + 1] = 78;
          data[i + 2] = 61;
          data[i + 3] = 255;
        }
      }
      // Wood grain
      for (let y = 0; y < height; y += 1 + Math.floor(rand() * 2)) {
        const wobble = Math.sin(y * 0.04) * 5;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const alpha = 0.1 + rand() * 0.15;
          data[idx] = Math.floor(data[idx] * (1 - alpha) + (60 + rand() * 40) * alpha);
          data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + (50 + rand() * 30) * alpha);
          data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + (40 + rand() * 20) * alpha);
        }
      }
      // Knots
      for (let i = 0; i < 8; i++) {
        const cx = Math.floor(rand() * width);
        const cy = Math.floor(rand() * height);
        const r = 3 + Math.floor(rand() * 8);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r && Math.abs(dx * dx + dy * dy - r * r) < r) {
              const x = cx + dx;
              const y = cy + dy;
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = 0.3 + rand() * 0.3;
                data[idx] = Math.floor(data[idx] * (1 - alpha) + 30 * alpha);
                data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + 25 * alpha);
                data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + 20 * alpha);
              }
            }
          }
        }
      }
      break;
    }
    case "floor": {
      // Compacted earth floor
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          data[i] = 107;
          data[i + 1] = 93;
          data[i + 2] = 74;
          data[i + 3] = 255;
        }
      }
      // Foot traffic wear
      for (let i = 0; i < 30; i++) {
        const cx = Math.floor(rand() * width);
        const cy = Math.floor(rand() * height);
        const r = 3 + Math.floor(rand() * 10);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const x = cx + dx;
              const y = cy + dy;
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = 0.1 + rand() * 0.15;
                data[idx] = Math.floor(data[idx] * (1 - alpha) + (80 + rand() * 10) * alpha);
                data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + (70 + rand() * 10) * alpha);
                data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + (55 + rand() * 10) * alpha);
              }
            }
          }
        }
      }
      // Post holes
      for (let i = 0; i < 10; i++) {
        const cx = Math.floor(rand() * width);
        const cy = Math.floor(rand() * height);
        const r = 1 + Math.floor(rand() * 2);
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            if (dx * dx + dy * dy <= r * r) {
              const x = cx + dx;
              const y = cy + dy;
              if (x >= 0 && x < width && y >= 0 && y < height) {
                const idx = (y * width + x) * 4;
                const alpha = 0.3 + rand() * 0.3;
                data[idx] = Math.floor(data[idx] * (1 - alpha) + 40 * alpha);
                data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + 35 * alpha);
                data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + 30 * alpha);
              }
            }
          }
        }
      }
      break;
    }
  }

  return { data, width, height };
}

function drawLine(data: Uint8Array, width: number, height: number, x0: number, y0: number, x1: number, y1: number, color: number[]) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
      const idx = (y0 * width + x0) * 4;
      const alpha = color[3] / 255;
      data[idx] = Math.floor(data[idx] * (1 - alpha) + color[0] * alpha);
      data[idx + 1] = Math.floor(data[idx + 1] * (1 - alpha) + color[1] * alpha);
      data[idx + 2] = Math.floor(data[idx + 2] * (1 - alpha) + color[2] * alpha);
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

export function paintTexture(name: string): THREE.DataTexture {
  if (cache.has(name)) return cache.get(name)!;

  const { data, width, height } = generateTextureData(name);
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cache.set(name, texture);
  return texture;
}