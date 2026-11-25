export interface Shot {
  id: string;
  a: number;
  b: number;
  light: "day" | "golden";
  crowd: "empty" | "family" | "crowd" | "livestock";
  tau: number;
}

export const SHOTS: Shot[] = [
  {
    id: "hook",
    a: 0,
    b: 100,
    light: "day",
    crowd: "empty",
    tau: 0,
  },
  {
    id: "surface_wide",
    a: 100,
    b: 200,
    light: "day",
    crowd: "empty",
    tau: 3.5,
  },
  {
    id: "door_close",
    a: 200,
    b: 300,
    light: "day",
    crowd: "empty",
    tau: 5.2,
  },
  {
    id: "descent_1",
    a: 300,
    b: 400,
    light: "day",
    crowd: "family",
    tau: 7.8,
  },
  {
    id: "descent_2",
    a: 400,
    b: 500,
    light: "day",
    crowd: "family",
    tau: 10.5,
  },
  {
    id: "livestock",
    a: 500,
    b: 600,
    light: "day",
    crowd: "livestock",
    tau: 13.2,
  },
  {
    id: "wine_press",
    a: 600,
    b: 700,
    light: "day",
    crowd: "empty",
    tau: 15.8,
  },
  {
    id: "vent_shaft_cu",
    a: 700,
    b: 800,
    light: "day",
    crowd: "empty",
    tau: 18.5,
  },
  {
    id: "vent_smoke",
    a: 800,
    b: 900,
    light: "day",
    crowd: "empty",
    tau: 21.2,
  },
  {
    id: "cross_section",
    a: 900,
    b: 1000,
    light: "day",
    crowd: "crowd",
    tau: 24.0,
  },
  {
    id: "termite_analogy",
    a: 1000,
    b: 1100,
    light: "golden",
    crowd: "empty",
    tau: 27.5,
  },
  {
    id: "doors_open",
    a: 1100,
    b: 1200,
    light: "golden",
    crowd: "crowd",
    tau: 31.0,
  },
  {
    id: "surface_return",
    a: 1200,
    b: 1300,
    light: "golden",
    crowd: "empty",
    tau: 34.5,
  },
  {
    id: "modern_tourist",
    a: 1300,
    b: 1400,
    light: "day",
    crowd: "empty",
    tau: 38.0,
  },
  {
    id: "final_door",
    a: 1400,
    b: 1500,
    light: "day",
    crowd: "empty",
    tau: 41.5,
  },
  {
    id: "callback_air",
    a: 1500,
    b: 1600,
    light: "golden",
    crowd: "empty",
    tau: 45.0,
  },
  {
    id: "mountain_remembers",
    a: 1600,
    b: 1860,
    light: "golden",
    crowd: "empty",
    tau: 48.5,
  },
];

export const XFADE: { t: number; dur: number }[] = [
  { t: 3.5, dur: 0.8 },
  { t: 5.2, dur: 0.5 },
  { t: 7.8, dur: 0.6 },
  { t: 10.5, dur: 0.7 },
  { t: 13.2, dur: 0.5 },
  { t: 15.8, dur: 0.6 },
  { t: 18.5, dur: 0.8 },
  { t: 21.2, dur: 0.5 },
  { t: 24.0, dur: 1.0 },
  { t: 27.5, dur: 1.2 },
  { t: 31.0, dur: 0.8 },
  { t: 34.5, dur: 0.7 },
  { t: 38.0, dur: 0.8 },
  { t: 41.5, dur: 0.6 },
  { t: 45.0, dur: 1.0 },
  { t: 48.5, dur: 1.5 },
];

export const FLASH_AT: number[] = [0.5];

export interface CamKey {
  f: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  roll?: number;
}

export const CAMS: Record<string, { s: (fps: number) => { pos: [number, number, number]; look: [number, number, number]; fov: number; roll: number } }> = {
  hook: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [20, 12, 20], look: [15, 10, 15], fov: 35, roll: 0 },
        { f: 30, pos: [18, 11, 18], look: [15, 10, 15], fov: 30, roll: 0.05 },
        { f: 90, pos: [15, 10, 15], look: [15, 8, 15], fov: 28, roll: -0.03 },
        { f: 105, pos: [15, 9, 13], look: [15, 6, 13], fov: 26, roll: 0 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  surface_wide: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [15, 8, 25], look: [0, 0, 0], fov: 45, roll: 0 },
        { f: 45, pos: [12, 6, 20], look: [0, 0, 0], fov: 42, roll: 0.02 },
        { f: 90, pos: [8, 4, 15], look: [0, 0, 0], fov: 40, roll: 0 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  door_close: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.5, 3], look: [0, 1.5, 0], fov: 25, roll: 0 },
        { f: 30, pos: [-0.3, 1.5, 2.5], look: [0, 1.5, 0], fov: 22, roll: -0.04 },
        { f: 60, pos: [-0.5, 1.4, 2], look: [0, 1.4, 0], fov: 20, roll: 0.03 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  descent_1: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, -2, 5], look: [0, -2, 0], fov: 30, roll: 0 },
        { f: 40, pos: [0, -5, 4], look: [0, -5, 0], fov: 28, roll: 0.02 },
        { f: 80, pos: [0, -8, 3], look: [0, -8, 0], fov: 26, roll: -0.01 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  descent_2: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [1, -12, 4], look: [0, -12, 0], fov: 28, roll: 0 },
        { f: 50, pos: [1.5, -18, 3], look: [0, -18, 0], fov: 26, roll: -0.02 },
        { f: 100, pos: [2, -22, 2.5], look: [0, -22, 0], fov: 24, roll: 0.01 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  livestock: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, -25, 3], look: [0, -25, 0], fov: 25, roll: 0 },
        { f: 40, pos: [-0.5, -25, 2.5], look: [0, -25, 0], fov: 23, roll: 0.03 },
        { f: 80, pos: [0.5, -25, 2], look: [0, -25, 0], fov: 22, roll: -0.02 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  wine_press: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [2, -28, 2], look: [2, -28, 0], fov: 22, roll: 0 },
        { f: 40, pos: [2, -28, 1.5], look: [2, -28, 0], fov: 20, roll: 0.02 },
        { f: 80, pos: [2, -28, 1], look: [2, -28, 0], fov: 18, roll: 0 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  vent_shaft_cu: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, -30, 1], look: [0, -30, 0], fov: 16, roll: 0 },
        { f: 30, pos: [0, -30, 0.5], look: [0, -30, 0], fov: 14, roll: 0.04 },
        { f: 60, pos: [0.1, -30, 0.3], look: [0, -30, 0], fov: 12, roll: -0.03 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  vent_smoke: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, -28, 3], look: [0, -25, 0], fov: 20, roll: 0 },
        { f: 50, pos: [1, -25, 4], look: [0, -20, 0], fov: 22, roll: 0.03 },
        { f: 100, pos: [2, -20, 5], look: [0, -15, 0], fov: 24, roll: -0.02 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  cross_section: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [40, -40, 50], look: [0, -30, -10], fov: 35, roll: 0 },
        { f: 60, pos: [35, -35, 45], look: [0, -25, -10], fov: 33, roll: 0.02 },
        { f: 120, pos: [25, -20, 35], look: [0, -15, -10], fov: 30, roll: -0.01 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  termite_analogy: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.6, 4], look: [0, 1.6, 0], fov: 28, roll: 0 },
        { f: 40, pos: [0.2, 1.6, 3.5], look: [0, 1.6, 0], fov: 26, roll: 0.03 },
        { f: 80, pos: [-0.2, 1.5, 3], look: [0, 1.5, 0], fov: 25, roll: -0.02 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  doors_open: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.5, 4], look: [0, 1.5, 0], fov: 30, roll: 0 },
        { f: 45, pos: [0, 1.5, 6], look: [0, 1.5, 0], fov: 33, roll: 0.02 },
        { f: 90, pos: [0, 1.6, 8], look: [0, 1.6, 0], fov: 35, roll: -0.01 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  surface_return: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [5, 4, 12], look: [0, 2, 0], fov: 40, roll: 0 },
        { f: 50, pos: [8, 6, 18], look: [0, 3, 0], fov: 42, roll: 0.02 },
        { f: 100, pos: [12, 8, 25], look: [0, 4, 0], fov: 45, roll: -0.01 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  modern_tourist: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.6, 3], look: [0, 1.6, 0], fov: 25, roll: 0 },
        { f: 40, pos: [0.1, 1.6, 2.5], look: [0, 1.6, 0], fov: 23, roll: 0.03 },
        { f: 80, pos: [-0.1, 1.5, 2], look: [0, 1.5, 0], fov: 22, roll: -0.02 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  final_door: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.4, 2.5], look: [0, 1.4, 0], fov: 22, roll: 0 },
        { f: 50, pos: [0, 1.3, 2], look: [0, 1.3, 0], fov: 20, roll: 0.02 },
        { f: 100, pos: [0, 1.2, 1.5], look: [0, 1.2, 0], fov: 18, roll: 0 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  callback_air: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.2, 1.5], look: [0, 1.2, 0], fov: 18, roll: 0 },
        { f: 40, pos: [0.1, 1.1, 1.2], look: [0, 1.1, 0], fov: 16, roll: 0.04 },
        { f: 80, pos: [0, 1.0, 1], look: [0, 1.0, 0], fov: 15, roll: -0.03 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
  mountain_remembers: {
    s: (fps) => {
      const frames = [
        { f: 0, pos: [0, 1.0, 1], look: [0, 1.0, 0], fov: 15, roll: 0 },
        { f: 60, pos: [0, 0.8, 0.5], look: [0, 0.8, 0], fov: 14, roll: 0.02 },
        { f: 120, pos: [0, 0.5, 0.2], look: [0, 0.5, 0], fov: 13, roll: 0 },
        { f: 240, pos: [0, 0.2, 0.1], look: [0, 0.2, 0], fov: 12, roll: 0 },
      ];
      return interpolateCamera(frames, fps);
    },
  },
};

function interpolateCamera(frames: CamKey[], fps: number) {
  return (currentFrame: number) => {
    const t = currentFrame / fps;
    let i = 0;
    while (i < frames.length - 1 && frames[i + 1].f <= currentFrame) i++;
    if (i === frames.length - 1) return {
      pos: frames[i].pos,
      look: frames[i].look,
      fov: frames[i].fov,
      roll: frames[i].roll || 0,
    };

    const a = frames[i];
    const b = frames[i + 1];
    const localT = (currentFrame - a.f) / (b.f - a.f);
    const eased = smootherstep(localT);

    return {
      pos: lerp3(a.pos, b.pos, eased),
      look: lerp3(a.look, b.look, eased),
      fov: lerp(a.fov, b.fov, eased),
      roll: lerp(a.roll || 0, b.roll || 0, eased),
    };
  };
}

function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export const KICKS: { t: number; dur: number; strength: number; axis: "x" | "y" | "z" }[] = [
  { t: 5.2, dur: 0.3, strength: 0.15, axis: "z" },
  { t: 7.8, dur: 0.2, strength: 0.08, axis: "y" },
  { t: 13.2, dur: 0.25, strength: 0.1, axis: "y" },
  { t: 24.0, dur: 0.4, strength: 0.2, axis: "z" },
  { t: 31.0, dur: 0.3, strength: 0.12, axis: "z" },
  { t: 41.5, dur: 0.2, strength: 0.08, axis: "y" },
];

export const DOF: Record<string, { cInf: number; focus: [number, number, number] }> = {
  hook: { cInf: 15, focus: [0, 1.6, 0] },
  surface_wide: { cInf: 0, focus: [0, 0, 0] },
  door_close: { cInf: 12, focus: [0, 1.5, 0] },
  descent_1: { cInf: 10, focus: [0, -5, 0] },
  descent_2: { cInf: 10, focus: [0, -15, 0] },
  livestock: { cInf: 12, focus: [0, -25, 0] },
  wine_press: { cInf: 14, focus: [2, -28, 0] },
  vent_shaft_cu: { cInf: 16, focus: [0, -30, 0] },
  vent_smoke: { cInf: 8, focus: [0, -20, 0] },
  cross_section: { cInf: 0, focus: [0, -15, -10] },
  termite_analogy: { cInf: 13, focus: [0, 1.6, 0] },
  doors_open: { cInf: 8, focus: [0, 1.5, 0] },
  surface_return: { cInf: 0, focus: [0, 3, 0] },
  modern_tourist: { cInf: 14, focus: [0, 1.6, 0] },
  final_door: { cInf: 15, focus: [0, 1.2, 0] },
  callback_air: { cInf: 16, focus: [0, 1.0, 0] },
  mountain_remembers: { cInf: 16, focus: [0, 0.5, 0] },
};

export function dofAt(shotId: string) {
  return DOF[shotId] || { cInf: 0, focus: [0, 0, 0] };
}

export const FOREGROUND: Record<string, { type: "rock" | "bush" | "ledge" | "shaft"; pos: [number, number, number]; scale: number }[]> = {
  hook: [{ type: "rock", pos: [-2, 0, 3], scale: 1.2 }],
  surface_wide: [{ type: "bush", pos: [-5, 0, 8], scale: 1.5 }],
  door_close: [{ type: "shaft", pos: [0, 1, 2], scale: 0.8 }],
  descent_1: [{ type: "rock", pos: [-1, -4, 3], scale: 0.8 }],
  descent_2: [{ type: "ledge", pos: [1, -12, 2], scale: 1.0 }],
  livestock: [{ type: "rock", pos: [-0.5, -25, 2], scale: 0.6 }],
  vent_shaft_cu: [{ type: "shaft", pos: [0, -30, 0.5], scale: 0.4 }],
  vent_smoke: [{ type: "shaft", pos: [0, -25, 3], scale: 0.5 }],
  cross_section: [],
  termite_analogy: [],
  doors_open: [{ type: "shaft", pos: [0, 1, 3], scale: 0.8 }],
  modern_tourist: [{ type: "rock", pos: [-1.5, 1, 2], scale: 0.8 }],
  final_door: [{ type: "shaft", pos: [0, 1, 1], scale: 0.6 }],
  callback_air: [{ type: "shaft", pos: [0, 1, 0.5], scale: 0.4 }],
  mountain_remembers: [],
};