import React, { useMemo } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import { useVideoConfig, interpolate, spring } from "remotion";
import {
  SHOTS,
  XFADE,
  FLASH_AT,
  CAMS,
  KICKS,
  DOF,
  dofAt,
  FOREGROUND,
} from "./story";
import { LIGHTS, LOOK } from "./lights";
import { buildWorld } from "./build";
import { ToonCast } from "./cast";
import { inkPass } from "./ink";
import { lensBlurPass } from "./lensblur";
import { gradePass } from "./grade";
import { Bloom, ToneMapping, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

extend({ EffectComposer, Bloom, ToneMapping });

function CameraRig({ position, lookAt, fov, roll, near, far }: {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  roll: number;
  near: number;
  far: number;
}) {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    camera.fov = fov;
    camera.rotation.z = roll;
    camera.updateProjectionMatrix();
  });

  return <group dispose={null} />;
}

export const DerinkuyuShort: React.FC = () => {
  const { width, height, fps, frame } = useVideoConfig();
  const t = frame / fps;

  const shot = useMemo(() => {
    for (let i = SHOTS.length - 1; i >= 0; i--) {
      if (t >= SHOTS[i].tau) return SHOTS[i];
    }
    return SHOTS[0];
  }, [t]);

  const cam = CAMS[shot.id]?.s(fps);
  const isCrossfade = XFADE.some((x) => Math.abs(t - x.t) < 0.5);
  const showFlash = FLASH_AT.some((f) => Math.abs(t - f) < 0.1);

  if (!cam) {
    console.log("Missing cam for shot:", shot.id);
    return <Canvas camera={{ position: [0, 1.6, 4], fov: 28, near: 0.1, far: 1000 }} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["red"]} opacity={0.5} />
    </Canvas>;
  }

  const dofParams = dofAt(shot.id);
  const fgProps = FOREGROUND[shot.id] || [];

  const kick = KICKS.find((k) => Math.abs(t - k.t) < k.dur / fps);
  const kickOffset = kick
    ? { x: Math.sin((t - kick.t) * fps * Math.PI * 2) * kick.strength * Math.exp(-(t - kick.t) * 7), y: 0, z: 0 }
    : { x: 0, y: 0, z: 0 };

  const localFrame = frame - shot.a;
  const camPos = cam(localFrame);
  console.log("camPos:", camPos, "localFrame:", localFrame);
  if (!camPos || !camPos.pos) {
    return <Canvas camera={{ position: [0, 1.6, 4], fov: 28, near: 0.1, far: 1000 }} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={["red"]} opacity={0.5} />
    </Canvas>;
  }
  const pos = [
    camPos.pos[0] + kickOffset.x,
    camPos.pos[1] + kickOffset.y,
    camPos.pos[2] + kickOffset.z,
  ];
  const look = camPos.look;
  const fov = camPos.fov;
  const roll = camPos.roll || 0;

  const lightConfig = LIGHTS[shot.light];
  const lookPalette = LOOK[shot.light];

  const world = useMemo(() => buildWorld(shot.id, fgProps), [shot.id, fgProps]);

  return (
    <Canvas
      camera={{ position: pos, fov, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }}
    >
      <EffectComposer
        multisampling={4}
        renderPriority={0}
        pingPong={false}
      >
        <Bloom
          intensity={0.5}
          threshold={1.0}
          radius={0.6}
          mipmapBlur={true}
          distinguishable={true}
        />
        <ToneMapping mode={ToneMapping.Neutral} exposure={1.0} />
        {gradePass(lookPalette)}
      </EffectComposer>

      <CameraRig position={pos} lookAt={look} fov={fov} roll={roll} near={0.1} far={1000} />

      <scene>
        <fog
          attach="fog"
          args={[lookPalette.fogColor, lookPalette.fogNear, lookPalette.fogFar]}
        />

        <primitive object={world} dispose={null} />

        <ToonCast
          shotId={shot.id}
          time={t}
          crowdMode={shot.crowd}
        />

        {lightConfig.ambient && (
          <ambientLight
            color={lightConfig.ambient.color}
            intensity={lightConfig.ambient.intensity}
          />
        )}
        {lightConfig.directional && (
          <directionalLight
            position={lightConfig.directional.position}
            color={lightConfig.directional.color}
            intensity={lightConfig.directional.intensity}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.1}
            shadow-camera-far={200}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
            shadow-bias={-0.001}
            shadow-normalBias={0.02}
          />
        )}
        {lightConfig.hemisphere && (
          <hemisphereLight
            color={lightConfig.hemisphere.skyColor}
            groundColor={lightConfig.hemisphere.groundColor}
            intensity={lightConfig.hemisphere.intensity}
          />
        )}

        {showFlash && (
          <mesh>
            <planeGeometry args={[1000, 1000]} />
            <meshBasicMaterial transparent opacity={interpolate(t, [FLASH_AT[0], FLASH_AT[0] + 0.1], [1, 0], true)} color="white" depthTest={false} depthWrite={false} />
          </mesh>
        )}
      </scene>
    </Canvas>
  );
};