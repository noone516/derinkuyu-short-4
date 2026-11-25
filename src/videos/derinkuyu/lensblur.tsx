import { EffectPass, ShaderPass } from "@react-three/postprocessing";
import { ShaderMaterial, Uniform, Vector2, Vector3 } from "three";
import { dofAt } from "./story";

export function lensBlurPass(shotId: string) {
  const dof = dofAt(shotId);
  const cInf = dof.cInf / 1080; // Normalize to 1080 base
  const focusPoint = new Vector3(...dof.focus);

  return new EffectPass(
    null,
    new ShaderPass(new ShaderMaterial({
      uniforms: {
        tDiffuse: new Uniform(null),
        tDepth: new Uniform(null),
        uResolution: new Uniform(new Vector2(1080, 1920)),
        uFocusPoint: new Uniform(focusPoint),
        uCocScale: new Uniform(cInf),
        uMaxCoc: new Uniform(0.02),
        uBokehShape: new Uniform(0.0), // 0 = circle, 1 = hex
        uApertureSides: new Uniform(6),
        uApertureRotation: new Uniform(0),
        uAnamorphicRatio: new Uniform(1.0),
        uHighlightGain: new Uniform(0.0),
        uHighlightThreshold: new Uniform(1.0),
        uGain: new Uniform(1.0),
        uGamma: new Uniform(1.0),
        uFogColor: new Uniform(null),
        uFogNear: new Uniform(0),
        uFogFar: new Uniform(0),
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
        uniform sampler2D tDepth;
        uniform vec2 uResolution;
        uniform vec3 uFocusPoint;
        uniform float uCocScale;
        uniform float uMaxCoc;
        uniform float uBokehShape;
        uniform float uApertureSides;
        uniform float uApertureRotation;
        uniform float uAnamorphicRatio;
        uniform float uHighlightGain;
        uniform float uHighlightThreshold;
        uniform float uGain;
        uniform float uGamma;
        uniform vec3 uFogColor;
        uniform float uFogNear;
        uniform float uFogFar;
        varying vec2 vUv;

        float linearDepth(float z, float near, float far) {
          return (2.0 * near * far) / (far + near - z * (far - near));
        }

        float coc(float depth, float focusDist, float cocScale) {
          return abs(depth - focusDist) * cocScale;
        }

        vec3 bokeh(vec2 uv, float coc) {
          if (coc < 0.001) return vec3(0.0);
          vec3 sum = vec3(0.0);
          float weight = 0.0;
          int samples = 12;

          for (int i = 0; i < samples; i++) {
            float angle = float(i) / float(samples) * 6.28318 + uApertureRotation;
            float r = coc * (0.5 + 0.5 * float(i) / float(samples));
            vec2 offset = vec2(cos(angle), sin(angle)) * r * uAnamorphicRatio;
            vec3 col = texture2D(tDiffuse, uv + offset / uResolution).rgb;
            sum += col;
            weight += 1.0;
          }
          return sum / max(weight, 1.0);
        }

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float depth = texture2D(tDepth, vUv).r;

          // Convert to linear depth (simplified)
          float linDepth = linearDepth(depth, 0.1, 1000.0);
          float focusDist = length(uFocusPoint - vec3(0.0)); // Simplified

          float cocRadius = coc(linDepth, focusDist, uCocScale);
          cocRadius = min(cocRadius, uMaxCoc);

          if (cocRadius < 0.001) {
            gl_FragColor = vec4(pow(color.rgb, vec3(1.0 / uGamma)), color.a);
            return;
          }

          vec3 blurred = bokeh(vUv, cocRadius);

          // Highlight boost
          float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
          if (luminance > uHighlightThreshold) {
            blurred += (color.rgb - blurred) * uHighlightGain;
          }

          // Fog blend
          if (uFogNear > 0.0 && uFogFar > 0.0) {
            float fogFactor = smoothstep(uFogNear, uFogFar, linDepth);
            blurred = mix(blurred, uFogColor, fogFactor);
          }

          gl_FragColor = vec4(pow(blurred * uGain, vec3(1.0 / uGamma)), color.a);
        }
      `,
    }))
  );
}