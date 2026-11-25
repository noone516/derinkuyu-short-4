import { ShaderMaterial, Color, Vector3, Uniform } from "three";

export function createCardShadeMaterial(lightColor: string, lightDir: Vector3, isGolden: boolean) {
  const keyColor = isGolden ? "#ffb36b" : "#f5f0e8";
  const shadeColor = isGolden ? "#444380" : "#302936";
  const liftColor = isGolden ? "#1a1520" : "#0a0a12";

  return new ShaderMaterial({
    uniforms: {
      uMap: { value: null },
      uKeyColor: { value: new Color(keyColor) },
      uShadeColor: { value: new Color(shadeColor) },
      uLiftColor: { value: new Color(liftColor) },
      uLightDir: { value: lightDir.clone().normalize() },
      uCameraPos: { value: new Vector3() },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uKeyColor;
      uniform vec3 uShadeColor;
      uniform vec3 uLiftColor;
      uniform vec3 uLightDir;
      uniform vec3 uCameraPos;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.1) discard;

        vec3 viewDir = normalize(uCameraPos - vWorldPos);
        float NdotL = max(0.0, dot(vNormal, uLightDir));
        float NdotV = max(0.0, dot(vNormal, viewDir));

        // Two-tone shading
        vec3 lit = tex.rgb * uKeyColor;
        vec3 shade = tex.rgb * uShadeColor + uLiftColor;
        vec3 color = mix(shade, lit, NdotL);

        // Rim light (golden only, inner only)
        float rim = 0.0;
        if (NdotL < 0.0) {
          rim = pow(1.0 - NdotV, 3.0) * 0.3;
        }

        gl_FragColor = vec4(color + vec3(rim), tex.a);
      }
    `,
    transparent: true,
    alphaTest: 0.1,
    depthWrite: true,
  });
}

export function updateCardShadeUniforms(material: ShaderMaterial, cameraPos: Vector3, time: number) {
  material.uniforms.uCameraPos.value.copy(cameraPos);
  material.uniforms.uTime.value = time;
}