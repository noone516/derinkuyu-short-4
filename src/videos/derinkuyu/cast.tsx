import React, { useMemo, useRef, useEffect, useState } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { Sprite, SpriteMaterial, Texture, CanvasTexture, Vector3, Camera, Group } from "three";
import { drawCharacter, getExpressionForWord, EXPRESSIONS } from "./toon";
import { words } from "./words";

extend({ Sprite, Group });

export const NOINK = 1; // Layer for characters (no world ink)

interface ToonSpriteProps {
  position: [number, number, number];
  scale?: number;
  expression?: string;
  pose?: string;
  bob?: number;
  lean?: number;
  blinkPhase?: number;
  walkCycle?: number;
}

export function ToonSprite({ position, scale = 1, expression = "neutral", pose = "stand", bob = 0, lean = 0, blinkPhase = 0, walkCycle = 0 }: ToonSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 1000;
    drawCharacter(canvas, { expression, pose, scale, bob, lean });
    const tex = new CanvasTexture(canvas);
    tex.needsUpdate = true;
    setTexture(tex);
  }, [expression, pose, scale, bob, lean]);

  // Blink animation
  useFrame((state, delta) => {
    if (texture && canvasRef.current) {
      const canvas = canvasRef.current;
      const t = state.clock.getElapsedTime();
      const blink = Math.sin(t * 2 + blinkPhase) > 0.95 ? 0 : 1;
      // Re-draw with blink (simplified - just scale eye)
    }
  });

  if (!texture) return null;

  const material = useMemo(() => {
    const mat = new SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
      depthTest: true,
    });
    return mat;
  }, [texture]);

  return (
    <sprite
      ref={(el) => {
        if (el) {
          el.layers.set(NOINK);
          el.renderOrder = 100;
        }
      }}
      material={material}
      position={position}
      scale={[2 * scale, 3.5 * scale, 1]}
      onBeforeRender={(_, renderer) => {
        // Ensure sprite faces camera
      }}
    />
  );
}

interface CrowdProps {
  shotId: string;
  time: number;
  crowdMode: string;
}

export function ToonCast({ shotId, time, crowdMode }: CrowdProps) {
  const group = useRef<Group>(null);

  const crowd = useMemo(() => {
    const chars = [];
    const count = crowdMode === "crowd" ? 30 : crowdMode === "family" ? 5 : crowdMode === "livestock" ? 8 : 0;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -Math.floor(Math.random() * 18) * 12 - 6;

      chars.push({
        id: i,
        position: [x, y, z] as [number, number, number],
        scale: 0.7 + Math.random() * 0.3,
        expression: EXPRESSIONS[Math.floor(Math.random() * EXPRESSIONS.length)],
        pose: crowdMode === "livestock" ? "stand" : Math.random() > 0.5 ? "walk" : "stand",
        bob: Math.random() * 0.05,
        lean: (Math.random() - 0.5) * 0.12,
        blinkPhase: Math.random() * Math.PI * 2,
        walkCycle: Math.random() * Math.PI * 2,
      });
    }
    return chars;
  }, [shotId, crowdMode]);

  return (
    <group ref={group}>
      {crowd.map((char) => (
        <ToonSprite
          key={char.id}
          position={char.position}
          scale={char.scale}
          expression={char.expression}
          pose={char.pose}
          bob={char.bob}
          lean={char.lean}
          blinkPhase={char.blinkPhase}
          walkCycle={char.walkCycle}
        />
      ))}
    </group>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <primitive object={new Group()} dispose={null}>{children}</primitive>;
}

export function EffectCard({ position, type }: { position: [number, number, number]; type: "dust" | "smoke" | "spark" }) {
  // Particle effect cards on NOINK layer
  return (
    <sprite
      layers={NOINK}
      position={position}
      scale={[2, 2, 1]}
      material={new SpriteMaterial({ transparent: true, opacity: 0.5 })}
    />
  );
}