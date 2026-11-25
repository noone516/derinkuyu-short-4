import { ShaderMaterial, Vector3, Color, Uniform } from "three";

export function createSkyMaterial(palette: any) {
  return new ShaderMaterial({
    uniforms: {
      uTop: new Uniform(new Color(palette.skyTop)),
      uHorizon: new Uniform(new Color(palette.skyHorizon)),
      uFogColor: new Uniform(new Color(palette.fogColor)),
      uFogNear: new Uniform(palette.fogNear),
      uFogFar: new Uniform(palette.fogFar),
      uSunDir: new Uniform(new Vector3(0.5, 0.8, 0.3)),
      uTime: new Uniform(0),
    },
    vertexShader: `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      void main() {
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uFogColor;
      uniform float uFogNear;
      uniform float uFogFar;
      uniform vec3 uSunDir;
      uniform float uTime;
      varying vec3 vWorldPos;
      varying vec3 vNormal;

      float horizonFade(vec3 dir) {
        return smoothstep(-0.1, 0.3, dir.y);
      }

      void main() {
        vec3 viewDir = normalize(vWorldPos - cameraPosition);
        float h = horizonFade(viewDir);
        vec3 skyColor = mix(uHorizon, uTop, h);

        // Sun disk
        float sun = pow(max(0.0, dot(viewDir, normalize(uSunDir))), 128.0);
        skyColor += vec3(1.0, 0.85, 0.6) * sun * (1.0 - h) * 2.0;

        // Halo
        float halo = pow(max(0.0, dot(viewDir, normalize(uSunDir))), 8.0);
        skyColor += vec3(1.0, 0.7, 0.4) * halo * (1.0 - h) * 0.3;

        // Fog
        float dist = length(vWorldPos - cameraPosition);
        float fogFactor = smoothstep(uFogNear, uFogFar, dist);
        vec3 finalColor = mix(skyColor, uFogColor, fogFactor);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    depthWrite: false,
    side: 2, // DoubleSide
  });
}

export function createFogMaterial(palette: any) {
  return {
    color: new Color(palette.fogColor),
    near: palette.fogNear,
    far: palette.fogFar,
  };
}

export function createRiverMaterial(palette: any) {
  return new ShaderMaterial({
    uniforms: {
      uColor: new Uniform(new Color(palette.fogColor)),
      uTime: new Uniform(0),
      uSunDir: new Uniform(new Vector3(0.5, 0.8, 0.3)),
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform vec3 uSunDir;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv * 20.0;
        float wave = noise(uv + uTime * 0.5) * 0.02;
        vec3 baseColor = uColor * 0.7;

        // Specular highlight
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float spec = pow(max(0.0, dot(viewDir, normalize(uSunDir))), 32.0);
        baseColor += vec3(1.0, 0.9, 0.7) * spec * 0.5;

        gl_FragColor = vec4(baseColor, 0.9);
      }
    `,
    transparent: true,
    side: 2,
  });
}

export function poseCharacters(frame: number, fps: number, shotId: string) {
  // Character posing logic per shot
  // Returns pose overrides for cast.ts
  return {};
}

export function getSunDirection(light: "day" | "golden", shotId: string): Vector3 {
  // Sun frozen per shot, camera-relative
  if (light === "day") {
    return new Vector3(0.6, 0.75, 0.3).normalize();
  } else {
    return new Vector3(0.1, 0.12, 0.99).normalize(); // Low backlit
  }
}