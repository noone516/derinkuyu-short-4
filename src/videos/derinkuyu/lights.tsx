export interface LightConfig {
  ambient?: { color: string; intensity: number };
  directional?: { position: [number, number, number]; color: string; intensity: number };
  hemisphere?: { skyColor: string; groundColor: string; intensity: number };
}

export interface LookPalette {
  fogColor: string;
  fogNear: number;
  fogFar: number;
  skyTop: string;
  skyHorizon: string;
}

export const LIGHTS: Record<"day" | "golden", LightConfig> = {
  day: {
    ambient: { color: "#3e7fd2", intensity: 0.3 },
    directional: {
      position: [Math.sin((75 * Math.PI) / 180) * Math.cos((48 * Math.PI) / 180), Math.sin((48 * Math.PI) / 180), Math.cos((75 * Math.PI) / 180) * Math.cos((48 * Math.PI) / 180)],
      color: "#f5f0e8",
      intensity: 1.58,
    },
    hemisphere: {
      skyColor: "#3e7fd2",
      groundColor: "#302936",
      intensity: 0.5,
    },
  },
  golden: {
    ambient: { color: "#ffb36b", intensity: 0.4 },
    directional: {
      position: [Math.sin((6 * Math.PI) / 180) * Math.cos((7 * Math.PI) / 180), Math.sin((7 * Math.PI) / 180), Math.cos((6 * Math.PI) / 180) * Math.cos((7 * Math.PI) / 180)],
      color: "#ffb36b",
      intensity: 1.5,
    },
    hemisphere: {
      skyColor: "#ffc47c",
      groundColor: "#444380",
      intensity: 0.6,
    },
  },
};

export const LOOK: Record<"day" | "golden", LookPalette> = {
  day: {
    fogColor: "#b8d0ec",
    fogNear: 25,
    fogFar: 300,
    skyTop: "#3e7fd2",
    skyHorizon: "#b8d0ec",
  },
  golden: {
    fogColor: "#ffd08a",
    fogNear: 20,
    fogFar: 360,
    skyTop: "#ffc47c",
    skyHorizon: "#8a6f8a",
  },
};