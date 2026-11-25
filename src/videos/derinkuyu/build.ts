import { Group, Mesh, BoxGeometry, CylinderGeometry, ConeGeometry, SphereGeometry, MeshStandardMaterial, Vector3, MathUtils } from "three";
import { paintTexture } from "./paint";

const TUNNEL_RADIUS = 2.5;
const TUNNEL_HEIGHT = 3.5;
const LEVEL_SPACING = 12;
const LEVEL_COUNT = 18;
const SHAFT_RADIUS = 0.8;
const SHAFT_COUNT = 52;

interface BuildOptions {
  shotId: string;
  fgProps: any[];
}

export function buildWorld(shotId: string, fgProps: any[]): Group {
  const world = new Group();
  world.name = "DerinkuyuWorld";

  const tuffMaterial = new MeshStandardMaterial({
    map: paintTexture("tuff"),
    roughness: 0.9,
    metalness: 0.0,
    color: "#8b7d6b",
  });

  const basaltMaterial = new MeshStandardMaterial({
    map: paintTexture("basalt"),
    roughness: 0.7,
    metalness: 0.1,
    color: "#3d3530",
  });

  const woodMaterial = new MeshStandardMaterial({
    map: paintTexture("wood"),
    roughness: 0.8,
    metalness: 0.0,
    color: "#8b7355",
  });

  // Build 18 levels
  for (let level = 0; level < LEVEL_COUNT; level++) {
    const y = -level * LEVEL_SPACING - LEVEL_SPACING / 2;
    buildLevel(world, level, y, tuffMaterial, basaltMaterial, woodMaterial);
  }

  // Ventilation shafts
  for (let i = 0; i < SHAFT_COUNT; i++) {
    const angle = (i / SHAFT_COUNT) * Math.PI * 2;
    const radius = 15 + Math.random() * 25;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    buildShaft(world, x, z, basaltMaterial);
  }

  // Foreground props
  fgProps.forEach((prop) => {
    const mesh = createForegroundProp(prop.type, prop.scale, basaltMaterial, woodMaterial);
    mesh.position.set(...prop.pos);
    world.add(mesh);
  });

  // Sight-line culling would go here - simplified for now
  cullOccluders(world);

  return world;
}

function buildLevel(world: Group, level: number, y: number, tuff: any, basalt: any, wood: any) {
  const mainTunnel = new Group();
  mainTunnel.name = `Level${level}_Main`;

  // Main corridor
  const corridorLength = 60;
  const corridor = new Mesh(
    new BoxGeometry(corridorLength, TUNNEL_HEIGHT, TUNNEL_RADIUS * 2),
    tuff
  );
  corridor.position.set(0, y + TUNNEL_HEIGHT / 2, 0);
  corridor.receiveShadow = true;
  mainTunnel.add(corridor);

  // Side rooms (living quarters, storage, etc.)
  const roomCount = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < roomCount; i++) {
    const side = Math.random() > 0.5 ? 1 : -1;
    const offset = (i + 1) * (corridorLength / (roomCount + 1));
    const roomWidth = 4 + Math.random() * 3;
    const roomDepth = 6 + Math.random() * 4;

    const room = new Mesh(
      new BoxGeometry(roomWidth, TUNNEL_HEIGHT, roomDepth),
      tuff
    );
    room.position.set(
      side * (TUNNEL_RADIUS + roomWidth / 2 + 0.5),
      y + TUNNEL_HEIGHT / 2,
      -corridorLength / 2 + offset
    );
    room.receiveShadow = true;
    mainTunnel.add(room);

    // Doorway arch
    const arch = new Mesh(
      new CylinderGeometry(1.2, 1.2, 0.3, 16, 1, true, 0, Math.PI),
      basalt
    );
    arch.position.set(
      side * (TUNNEL_RADIUS + 0.5),
      y + TUNNEL_HEIGHT / 2,
      -corridorLength / 2 + offset
    );
    arch.rotation.x = Math.PI / 2;
    mainTunnel.add(arch);
  }

  // Vertical shaft connection (stairwell)
  const stairwell = new Mesh(
    new CylinderGeometry(2, 2, LEVEL_SPACING, 8),
    tuff
  );
  stairwell.position.set(0, y + LEVEL_SPACING / 2, corridorLength / 2 + 3);
  stairwell.receiveShadow = true;
  mainTunnel.add(stairwell);

  world.add(mainTunnel);

  // Level-specific features
  if (level === 2) addLivestockArea(mainTunnel, y, tuff, wood);
  if (level === 4) addWinePress(mainTunnel, y, tuff, basalt, wood);
  if (level === 7) addChurch(mainTunnel, y, tuff, basalt);
  if (level === 10) addCommunalKitchen(mainTunnel, y, tuff, wood);
  if (level === 14) addSchool(mainTunnel, y, tuff, wood);
}

function buildShaft(world: Group, x: number, z: number, basalt: any) {
  const shaft = new Group();
  shaft.name = `Shaft_${x.toFixed(0)}_${z.toFixed(0)}`;

  // Shaft tube
  const tube = new Mesh(
    new CylinderGeometry(SHAFT_RADIUS, SHAFT_RADIUS * 0.6, LEVEL_COUNT * LEVEL_SPACING + 20, 8),
    basalt
  );
  tube.position.set(x, -LEVEL_COUNT * LEVEL_SPACING / 2, z);
  tube.receiveShadow = true;
  tube.castShadow = true;
  shaft.add(tube);

  // Cap at top
  const cap = new Mesh(
    new ConeGeometry(SHAFT_RADIUS * 1.2, 2, 8),
    basalt
  );
  cap.position.set(x, 10, z);
  shaft.add(cap);

  world.add(shaft);
}

function addLivestockArea(parent: Group, y: number, tuff: any, wood: any) {
  const pens = new Group();
  pens.name = "LivestockPens";

  for (let i = 0; i < 4; i++) {
    const pen = new Mesh(
      new BoxGeometry(5, TUNNEL_HEIGHT, 4),
      tuff
    );
    pen.position.set(-10 + i * 3.5, y + TUNNEL_HEIGHT / 2, -20);
    pen.receiveShadow = true;
    pens.add(pen);

    // Fence
    const fence = new Mesh(
      new BoxGeometry(5, 1.2, 0.1),
      wood
    );
    fence.position.set(-10 + i * 3.5, y + 1.2, -22);
    pens.add(fence);
  }

  parent.add(pens);
}

function addWinePress(parent: Group, y: number, tuff: any, basalt: any, wood: any) {
  const press = new Group();
  press.name = "WinePress";

  // Press bed
  const bed = new Mesh(
    new BoxGeometry(3, 0.5, 2),
    basalt
  );
  bed.position.set(5, y + 0.25, -15);
  press.add(bed);

  // Screw beam
  const beam = new Mesh(
    new CylinderGeometry(0.3, 0.3, 4, 8),
    wood
  );
  beam.position.set(5, y + 2.5, -15);
  press.add(beam);

  // Collection vat
  const vat = new Mesh(
    new CylinderGeometry(1.2, 1, 1.5, 12),
    basalt
  );
  vat.position.set(5, y + 0.75, -12);
  press.add(vat);

  // Stained floor
  const stain = new Mesh(
    new BoxGeometry(4, 0.02, 3),
    new MeshStandardMaterial({ color: "#4a1a1a", roughness: 0.3, metalness: 0 })
  );
  stain.position.set(5, y + 0.01, -15);
  press.add(stain);

  parent.add(press);
}

function addChurch(parent: Group, y: number, tuff: any, basalt: any) {
  const church = new Group();
  church.name = "Church";

  const nave = new Mesh(
    new BoxGeometry(8, 6, 12),
    tuff
  );
  nave.position.set(0, y + 3, -30);
  nave.receiveShadow = true;
  church.add(nave);

  // Apse
  const apse = new Mesh(
    new CylinderGeometry(4, 4, 6, 8, 1, true, -Math.PI / 2, Math.PI),
    tuff
  );
  apse.position.set(0, y + 3, -36);
  apse.rotation.y = Math.PI / 2;
  church.add(apse);

  // Cross
  const cross = new Mesh(
    new BoxGeometry(0.3, 2.5, 0.3),
    basalt
  );
  cross.position.set(0, y + 8, -30);
  church.add(cross);

  const crossArm = new Mesh(
    new BoxGeometry(1.5, 0.3, 0.3),
    basalt
  );
  crossArm.position.set(0, y + 7, -30);
  church.add(crossArm);

  parent.add(church);
}

function addCommunalKitchen(parent: Group, y: number, tuff: any, wood: any) {
  const kitchen = new Group();
  kitchen.name = "CommunalKitchen";

  for (let i = 0; i < 3; i++) {
    const oven = new Mesh(
      new CylinderGeometry(1, 1.2, 1, 12),
      basaltMaterial()
    );
    oven.position.set(-5 + i * 3, y + 0.5, -25);
    kitchen.add(oven);
  }

  parent.add(kitchen);
}

function addSchool(parent: Group, y: number, tuff: any, wood: any) {
  const school = new Group();
  school.name = "School";

  const room = new Mesh(
    new BoxGeometry(6, TUNNEL_HEIGHT, 8),
    tuff
  );
  room.position.set(0, y + TUNNEL_HEIGHT / 2, -20);
  room.receiveShadow = true;
  school.add(room);

  parent.add(school);
}

function basaltMaterial() {
  return new MeshStandardMaterial({
    map: paintTexture("basalt"),
    roughness: 0.7,
    metalness: 0.1,
    color: "#3d3530",
  });
}

function createForegroundProp(type: string, scale: number, basalt: any, wood: any) {
  const group = new Group();
  group.scale.setScalar(scale);

  switch (type) {
    case "rock":
      const rock = new Mesh(
        new SphereGeometry(1, 8, 6),
        basalt
      );
      rock.scale.set(1.2, 0.8, 1.1);
      group.add(rock);
      break;
    case "bush":
      const bush = new Mesh(
        new SphereGeometry(1, 8, 8),
        new MeshStandardMaterial({ color: "#2d4a2d", roughness: 0.9 })
      );
      bush.scale.set(1.5, 1, 1.5);
      group.add(bush);
      break;
    case "ledge":
      const ledge = new Mesh(
        new BoxGeometry(3, 0.3, 2),
        basalt
      );
      group.add(ledge);
      break;
    case "shaft":
      const shaft = new Mesh(
        new CylinderGeometry(0.5, 0.5, 2, 8),
        basalt
      );
      group.add(shaft);
      break;
  }

  return group;
}

function cullOccluders(world: Group) {
  // Simplified - in production would raycast from each camera
  world.traverse((child) => {
    if (child instanceof Mesh) {
      child.frustumCulled = true;
    }
  });
}