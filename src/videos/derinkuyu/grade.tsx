import { Vignette, HueSaturation } from "@react-three/postprocessing";

export function gradePass(palette: any) {
  return (
    <>
      <HueSaturation saturation={1.08} />
      <Vignette
        eskil={false}
        offset={0.5}
        darkness={0.15}
      />
    </>
  );
}