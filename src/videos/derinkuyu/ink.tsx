import { EffectPass, ShaderPass, renderPass } from "@react-three/postprocessing";
import { ShaderMaterial, Uniform, Vector2, Color } from "three";

export function inkPass(palette: any) {
  return new EffectPass(
    null,
    new ShaderPass(new ShaderMaterial({
      uniforms: {
        tDiffuse: new Uniform(null),
        uResolution: new Uniform(new Vector2(1080, 1920)),
        uInkColor: new Uniform(new Color("#030303")),
        uNearDist: new Uniform(6),
        uFarDist: new Uniform(90),
        uNearWidth: new Uniform(5.1),
        uFarWidth: new Uniform(3.3),
        uCreaseAngle: new Uniform(35 * Math.PI / 180),
        uCreaseMul: new Uniform(0.8),
        uDepthJump: new Uniform(0.01),
        uFogTint: new Uniform(0.3),
        uFogColor: new Uniform(new Color(palette.fogColor)),
        uFogNear: new Uniform(palette.fogNear),
        uFogFar: new Uniform(palette.fogFar),
        uCameraNear: new Uniform(0.1),
        uCameraFar: new Uniform(1000),
        uNOINKLayer: new Uniform(1),
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform vec3 uInkColor;
        uniform float uNearDist;
        uniform float uFarDist;
        uniform float uNearWidth;
        uniform float uFarWidth;
        uniform float uCreaseAngle;
        uniform float uCreaseMul;
        uniform float uDepthJump;
        uniform float uFogTint;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        uniform float uCameraNear;
        uniform float uCameraFar;
        uniform int uNOINKLayer;
        varying vec2 vUv;

        float linearDepth(float z) {
          return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
        }

        vec3 decodeNormal(vec2 uv) {
          // Reconstruct normal from depth
          float depth = texture2D(tDiffuse, uv).a; // Assuming depth in alpha
          vec2 texel = 1.0 / uResolution;
          float dx = texture2D(tDiffuse, uv + vec2(texel.x, 0.0)).a - depth;
          float dy = texture2D(tDiffuse, uv + vec2(0.0, texel.y)).a - depth;
          return normalize(vec3(-dx, -dy, 1.0));
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);

          // Skip NOINK layer (characters)
          if (color.a < 0.01) {
            gl_FragColor = color;
            return;
          }

          float depth = linearDepth(color.a);
          float fogFactor = smoothstep(uFogNear, uFogFar, depth);

          // Width by distance
          float width = mix(uNearWidth, uFarWidth, smoothstep(uNearDist, uFarDist, depth));
          width = width * (1.0 / 1080.0) * uResolution.y; // Scale with resolution

          // Normal-based crease detection
          vec3 normal = decodeNormal(vUv);
          float crease = 0.0;

          // Sobel-like edge detection on normal
          vec2 texel = 1.0 / uResolution;
          float n00 = texture2D(tDiffuse, vUv).a;
          float n10 = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).a;
          float n01 = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).a;
          float n11 = texture2D(tDiffuse, vUv + vec2(texel.x, texel.y)).a;

          float edgeX = abs(n10 - n00) + abs(n11 - n01);
          float edgeY = abs(n01 - n00) + abs(n11 - n10);
          float edge = max(edgeX, edgeY);

          // Depth jump detection
          float depthJump = edge > uDepthJump ? 1.0 : 0.0;

          // Crease angle
          float angle = acos(clamp(dot(normal, vec3(0, 0, 1)), -1.0, 1.0));
          float creaseAngle = angle > uCreaseAngle ? 1.0 : 0.0;

          float ink = max(depthJump, creaseAngle * uCreaseMul);

          // Fog tint on far ink
          vec3 inkColor = mix(uInkColor, uFogColor, fogFactor * uFogTint);

          gl_FragColor = vec4(mix(color.rgb, inkColor, ink), color.a);
        }
      `,
    }))
  );
}