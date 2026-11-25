const DESIGN_W = 600;
const DESIGN_H = 1000;
const SOLE_Y = 975;

const PLUM_INK = "#241726";
const PLUM_INK_DARK = "#1a0f1c";

interface Pen {
  ctx: CanvasRenderingContext2D;
  w: (width: number) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  curve: (points: [number, number][], tension?: number) => void;
  fill: (color: string) => void;
  circle: (x: number, y: number, r: number) => void;
  ellipse: (x: number, y: number, rx: number, ry: number, rot?: number) => void;
  arc: (x: number, y: number, r: number, a1: number, a2: number) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
}

export function createPen(canvas: HTMLCanvasElement): Pen {
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, DESIGN_W, DESIGN_H);

  return {
    ctx,
    w: (width) => { ctx.lineWidth = width; },
    line: (x1, y1, x2, y2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    curve: (points, tension = 0.5) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i][0] + points[i + 1][0]) / 2;
        const yc = (points[i][1] + points[i + 1][1]) / 2;
        ctx.quadraticCurveTo(points[i][0], points[i][1], xc, yc);
      }
      ctx.quadraticCurveTo(
        points[points.length - 1][0],
        points[points.length - 1][1],
        points[points.length - 1][0],
        points[points.length - 1][1]
      );
      ctx.stroke();
    },
    fill: (color) => { ctx.fillStyle = color; },
    circle: (x, y, r) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    },
    ellipse: (x, y, rx, ry, rot = 0) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    },
    arc: (x, y, r, a1, a2) => {
      ctx.beginPath();
      ctx.arc(x, y, r, a1, a2);
      ctx.stroke();
    },
    rect: (x, y, w, h) => {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    },
  };
}

export function drawBeanHead(pen: Pen, cx: number, cy: number, scale: number = 1, expression: string = "neutral") {
  const h = 200 * scale;
  const w = 212 * scale; // h/w ~ 0.94
  const chinY = cy + h * 0.55;
  const crownY = cy - h * 0.45;

  pen.w(6 * scale);
  pen.ctx.strokeStyle = PLUM_INK;
  pen.ctx.fillStyle = "#f5e8f0"; // pale skin

  // Bean shape
  pen.ctx.beginPath();
  pen.ctx.moveTo(cx, crownY - 10 * scale);
  pen.ctx.bezierCurveTo(
    cx - w * 0.5, crownY - 10 * scale,
    cx - w * 0.5, cy + h * 0.1,
    cx, chinY
  );
  pen.ctx.bezierCurveTo(
    cx + w * 0.5, cy + h * 0.1,
    cx + w * 0.5, crownY - 10 * scale,
    cx, crownY - 10 * scale
  );
  pen.ctx.fill();
  pen.ctx.stroke();

  // Eyes
  const eyeY = cy - h * 0.05;
  const eyeSep = 52 * scale;
  const eyeR = 14 * scale;
  pen.w(4 * scale);

  // Left eye
  drawEye(pen, cx - eyeSep, eyeY, eyeR, expression);
  // Right eye
  drawEye(pen, cx + eyeSep, eyeY, eyeR, expression);

  // Mouth
  drawMouth(pen, cx, cy + h * 0.25, scale, expression);
}

function drawEye(pen: Pen, x: number, y: number, r: number, expression: string) {
  pen.ctx.fillStyle = "#fff";
  pen.ctx.beginPath();
  pen.ctx.arc(x, y, r, 0, Math.PI * 2);
  pen.ctx.fill();

  pen.ctx.fillStyle = "#1a1a2e";
  let pupilX = x;
  let pupilY = y;
  let pupilR = r * 0.45;

  switch (expression) {
    case "surprised":
      pupilR = r * 0.6;
      break;
    case "fear":
      pupilY -= r * 0.15;
      pupilR = r * 0.35;
      break;
    case "determined":
      pupilX += r * 0.1;
      pupilR = r * 0.4;
      break;
    case "sad":
      pupilY += r * 0.1;
      pupilR = r * 0.35;
      break;
    case "curious":
      pupilX -= r * 0.1;
      break;
    case "neutral":
    default:
      break;
  }

  pen.ctx.beginPath();
  pen.ctx.arc(pupilX, pupilY, pupilR, 0, Math.PI * 2);
  pen.ctx.fill();

  // No highlights per style guide
}

function drawMouth(pen: Pen, x: number, y: number, scale: number, expression: string) {
  pen.w(4 * scale);
  pen.ctx.strokeStyle = PLUM_INK;
  pen.ctx.beginPath();

  switch (expression) {
    case "neutral":
      pen.ctx.moveTo(x - 15 * scale, y);
      pen.ctx.lineTo(x + 15 * scale, y);
      break;
    case "surprised":
      pen.ctx.arc(x, y, 10 * scale, 0, Math.PI);
      break;
    case "fear":
      pen.ctx.moveTo(x - 10 * scale, y);
      pen.ctx.lineTo(x, y - 8 * scale);
      pen.ctx.lineTo(x + 10 * scale, y);
      break;
    case "determined":
      pen.ctx.moveTo(x - 18 * scale, y + 3 * scale);
      pen.ctx.lineTo(x + 18 * scale, y + 3 * scale);
      break;
    case "sad":
      pen.ctx.moveTo(x - 12 * scale, y);
      pen.ctx.quadraticCurveTo(x, y + 10 * scale, x + 12 * scale, y);
      break;
    case "curious":
      pen.ctx.moveTo(x - 8 * scale, y);
      pen.ctx.quadraticCurveTo(x, y - 5 * scale, x + 8 * scale, y);
      break;
  }
  pen.ctx.stroke();
}

export function drawBody(pen: Pen, cx: number, cy: number, scale: number = 1, pose: string = "stand") {
  const headH = 200 * scale;
  const bodyH = headH * 2.5; // 3.5 head heights total
  const legH = bodyH * 0.4;
  const limbW = 33 * scale; // ~0.055 of head width

  pen.w(5 * scale);
  pen.ctx.strokeStyle = PLUM_INK;
  pen.ctx.fillStyle = "#f5e8f0";

  const shoulderY = cy + headH * 0.55;
  const hipY = shoulderY + bodyH;
  const kneeY = hipY + legH;
  const soleY = SOLE_Y * scale;

  // Torso
  pen.ctx.beginPath();
  pen.ctx.moveTo(cx - 50 * scale, shoulderY);
  pen.ctx.lineTo(cx - 60 * scale, hipY);
  pen.ctx.lineTo(cx + 60 * scale, hipY);
  pen.ctx.lineTo(cx + 50 * scale, shoulderY);
  pen.ctx.closePath();
  pen.ctx.fill();
  pen.ctx.stroke();

  // Arms
  const armL = 140 * scale;
  if (pose === "walk") {
    // Arm swing
    pen.ctx.beginPath();
    pen.ctx.moveTo(cx - 55 * scale, shoulderY + 20 * scale);
    pen.ctx.lineTo(cx - 90 * scale, shoulderY + armL * 0.6);
    pen.ctx.lineTo(cx - 100 * scale, shoulderY + armL);
    pen.ctx.stroke();

    pen.ctx.beginPath();
    pen.ctx.moveTo(cx + 55 * scale, shoulderY + 20 * scale);
    pen.ctx.lineTo(cx + 90 * scale, shoulderY + armL * 0.6);
    pen.ctx.lineTo(cx + 100 * scale, shoulderY + armL);
    pen.ctx.stroke();
  } else {
    // Resting
    pen.ctx.beginPath();
    pen.ctx.moveTo(cx - 55 * scale, shoulderY + 20 * scale);
    pen.ctx.lineTo(cx - 80 * scale, hipY);
    pen.ctx.stroke();

    pen.ctx.beginPath();
    pen.ctx.moveTo(cx + 55 * scale, shoulderY + 20 * scale);
    pen.ctx.lineTo(cx + 80 * scale, hipY);
    pen.ctx.stroke();
  }

  // Hands (ink dots)
  pen.ctx.fillStyle = PLUM_INK;
  pen.ctx.beginPath();
  pen.ctx.arc(cx - 95 * scale, shoulderY + armL, 8 * scale, 0, Math.PI * 2);
  pen.ctx.fill();
  pen.ctx.beginPath();
  pen.ctx.arc(cx + 95 * scale, shoulderY + armL, 8 * scale, 0, Math.PI * 2);
  pen.ctx.fill();

  // Legs
  if (pose === "walk") {
    // Stride
    const stride = 40 * scale;
    pen.ctx.beginPath();
    pen.ctx.moveTo(cx - 25 * scale, hipY);
    pen.ctx.lineTo(cx - 25 * scale - stride, kneeY);
    pen.ctx.lineTo(cx - 25 * scale - stride, soleY);
    pen.ctx.stroke();

    pen.ctx.beginPath();
    pen.ctx.moveTo(cx + 25 * scale, hipY);
    pen.ctx.lineTo(cx + 25 * scale + stride, kneeY);
    pen.ctx.lineTo(cx + 25 * scale + stride, soleY);
    pen.ctx.stroke();
  } else {
    pen.ctx.beginPath();
    pen.ctx.moveTo(cx - 25 * scale, hipY);
    pen.ctx.lineTo(cx - 25 * scale, kneeY);
    pen.ctx.lineTo(cx - 25 * scale, soleY);
    pen.ctx.stroke();

    pen.ctx.beginPath();
    pen.ctx.moveTo(cx + 25 * scale, hipY);
    pen.ctx.lineTo(cx + 25 * scale, kneeY);
    pen.ctx.lineTo(cx + 25 * scale, soleY);
    pen.ctx.stroke();
  }

  // Feet
  pen.ctx.fillStyle = PLUM_INK;
  pen.ctx.fillRect(cx - 35 * scale, soleY - 5, 20 * scale, 10 * scale);
  pen.ctx.fillRect(cx + 15 * scale, soleY - 5, 20 * scale, 10 * scale);
}

export function drawCharacter(canvas: HTMLCanvasElement, options: {
  expression?: string;
  pose?: string;
  scale?: number;
  bob?: number;
  lean?: number;
} = {}) {
  const pen = createPen(canvas);
  const cx = DESIGN_W / 2;
  const cy = DESIGN_H / 2 - 100;

  drawBeanHead(pen, cx, cy, options.scale || 1, options.expression || "neutral");
  drawBody(pen, cx, cy, options.scale || 1, options.pose || "stand");

  return canvas;
}

export const EXPRESSIONS = [
  "neutral",
  "surprised",
  "fear",
  "determined",
  "sad",
  "curious",
  "stern",
  "weary",
  "hopeful",
  "grim",
  "alert",
  "relieved",
  "puzzled",
  "resolute",
];

export function getExpressionForWord(word: string, index: number): string {
  // Map emotional beats to expressions
  if (word.includes("never") || word.includes("enemy")) return "grim";
  if (word.includes("Luckily")) return "relieved";
  if (word.includes("Unluckily")) return "grim";
  if (word.includes("mountain") || word.includes("remembers")) return "hopeful";
  if (word.includes("waited") || word.includes("besiegers")) return "stern";
  if (word.includes("air") || word.includes("breath")) return "curious";
  if (word.includes("cool") || word.includes("dark")) return "weary";
  return "neutral";
}