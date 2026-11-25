import { Color } from "three";

export const LIT_MULT = new Color(1.58, 1.5, 1.33);
export const SHADE_MULT = new Color(0.3, 0.29, 0.36);
export const LIFT = new Color(0.05, 0.06, 0.11);

export function shadeColor(albedo: Color, lit: boolean): Color {
  const c = albedo.clone();
  if (lit) {
    c.multiply(LIT_MULT);
  } else {
    c.multiply(SHADE_MULT);
    c.add(LIFT);
  }
  return c;
}

export function untone(color: Color): Color {
  const c = color.clone();
  c.sub(LIFT);
  return c;
}

export const GOLDEN_LIT = new Color("#ffb36b").multiplyScalar(1.5);
export const GOLDEN_SHADE = new Color("#444380");
export const GOLDEN_LIFT = new Color("#1a1520");

export function goldenShadeColor(albedo: Color, lit: boolean): Color {
  const c = albedo.clone();
  if (lit) {
    c.multiply(GOLDEN_LIT);
  } else {
    c.multiply(GOLDEN_SHADE);
    c.add(GOLDEN_LIFT);
  }
  return c;
}