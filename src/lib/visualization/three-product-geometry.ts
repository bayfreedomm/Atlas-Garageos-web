import * as THREE from 'three';
import type { TireWheelProduct3D } from './canvas-3d';

const TAU = Math.PI * 2;

function physicalMaterial(
  color: THREE.ColorRepresentation,
  options: { metalness: number; roughness: number; alpha: number; clearcoat?: number; clearcoatRoughness?: number },
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: options.metalness,
    roughness: options.roughness,
    clearcoat: options.clearcoat ?? 0,
    clearcoatRoughness: options.clearcoatRoughness ?? 0.5,
    transparent: options.alpha < 0.995,
    opacity: options.alpha,
    depthWrite: options.alpha > 0.7,
    side: THREE.DoubleSide,
    // Calibrated for the HDR softbox environment in three-3d.ts.
    envMapIntensity: options.metalness > 0.5 ? 1.0 : 0.45,
  });
}

function tireProfile(product: TireWheelProduct3D): THREE.Vector2[] {
  const outer = product.outerRadius;
  const rim = product.rimRadius;
  const width = product.width;
  const sidewall = outer - rim;
  const keys = [
    new THREE.Vector3(rim * 1.006, -width * 0.35, 0),
    new THREE.Vector3(rim * 1.035, -width * 0.445, 0),
    new THREE.Vector3(rim + sidewall * 0.28, -width * 0.505, 0),
    new THREE.Vector3(rim + sidewall * 0.68, -width * 0.49, 0),
    new THREE.Vector3(outer * 0.976, -width * 0.395, 0),
    new THREE.Vector3(outer * 0.991, -width * 0.315, 0),
    new THREE.Vector3(outer * 0.991, width * 0.315, 0),
    new THREE.Vector3(outer * 0.976, width * 0.395, 0),
    new THREE.Vector3(rim + sidewall * 0.68, width * 0.49, 0),
    new THREE.Vector3(rim + sidewall * 0.28, width * 0.505, 0),
    new THREE.Vector3(rim * 1.035, width * 0.445, 0),
    new THREE.Vector3(rim * 1.006, width * 0.35, 0),
    new THREE.Vector3(rim * 0.965, width * 0.29, 0),
    new THREE.Vector3(rim * 0.955, 0, 0),
    new THREE.Vector3(rim * 0.965, -width * 0.29, 0),
  ];
  const curve = new THREE.CatmullRomCurve3(keys, true, 'centripetal', 0.38);
  return curve.getPoints(56).map((point) => new THREE.Vector2(Math.max(rim * 0.94, point.x), point.y));
}

function treadHeight(angle: number, across: number, outerRadius: number): number {
  const crown = -outerRadius * 0.009 * Math.pow(Math.abs(across), 2.25);
  let grooves = 0;
  for (const center of [-0.61, -0.205, 0.205, 0.61]) {
    grooves -= outerRadius * 0.014 * Math.exp(-Math.pow((across - center) / 0.052, 4));
  }
  const blockWave = Math.sin(angle * 24 + across * 7.2) * Math.cos(angle * 12 - across * 10.6);
  const blockDetail = outerRadius * 0.0021 * Math.max(-0.45, blockWave);
  const shoulderCut = outerRadius * 0.004 * Math.max(0, (Math.abs(across) - 0.78) / 0.22) * Math.abs(Math.sin(angle * 14));
  return crown + grooves + blockDetail - shoulderCut;
}

function treadGeometry(product: TireWheelProduct3D): THREE.BufferGeometry {
  const around = 144;
  const acrossSegments = 30;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let ring = 0; ring <= around; ring += 1) {
    const u = ring / around;
    const angle = u * TAU;
    for (let strip = 0; strip <= acrossSegments; strip += 1) {
      const v = strip / acrossSegments;
      const across = v * 2 - 1;
      const radius = product.outerRadius * 1.002 + treadHeight(angle, across, product.outerRadius);
      const z = across * product.width * 0.325;
      positions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
      uvs.push(u, v);
    }
  }
  const row = acrossSegments + 1;
  for (let ring = 0; ring < around; ring += 1) {
    for (let strip = 0; strip < acrossSegments; strip += 1) {
      const a = ring * row + strip;
      const b = (ring + 1) * row + strip;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

interface SurfaceMaps {
  readonly normal: THREE.CanvasTexture;
  readonly occlusion: THREE.CanvasTexture;
}

function hash2(x: number, y: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/** Tileable value noise: lattice coordinates wrap at `period` cells. */
function tileNoise(x: number, y: number, period: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const wrap = (value: number) => ((value % period) + period) % period;
  const a = hash2(wrap(x0), wrap(y0));
  const b = hash2(wrap(x0 + 1), wrap(y0));
  const c = hash2(wrap(x0), wrap(y0 + 1));
  const d = hash2(wrap(x0 + 1), wrap(y0 + 1));
  return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
}

/** Reads the red channel of a greyscale canvas as heights in 0..1. */
function readHeights(context: CanvasRenderingContext2D, width: number, height: number): Float32Array {
  const pixels = context.getImageData(0, 0, width, height).data;
  const heights = new Float32Array(width * height);
  for (let index = 0; index < heights.length; index += 1) heights[index] = pixels[index * 4]! / 255;
  return heights;
}

/**
 * Separable box blur. It rounds the hard canvas edges into short bevels so the
 * derived normals describe chamfered block walls instead of 1px aliasing.
 * X always wraps (the maps repeat around the tyre); Y wraps only if asked.
 */
function blurHeights(source: Float32Array, width: number, height: number, radius: number, wrapY: boolean): Float32Array {
  const temp = new Float32Array(source.length);
  const out = new Float32Array(source.length);
  const span = radius * 2 + 1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let k = -radius; k <= radius; k += 1) sum += source[y * width + ((x + k + width) % width)]!;
      temp[y * width + x] = sum / span;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const row = wrapY ? (y + k + height) % height : Math.max(0, Math.min(height - 1, y + k));
        sum += temp[row * width + x]!;
      }
      out[y * width + x] = sum / span;
    }
  }
  return out;
}

/**
 * Height -> tangent-space normal map with a 3x3 Sobel operator.
 *   gx = dh/dx (canvas right = +u), gy = dh/dy (canvas down = -v, CanvasTexture flips Y)
 *   n  = normalize(-gx * strength, +gy * strength, 1), encoded as n * 0.5 + 0.5
 * This is the OpenGL (+Y up) convention three.js expects for normalMap.
 */
function normalMapFromHeights(heights: Float32Array, width: number, height: number, strength: number, wrapY: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) {
    const image = context.createImageData(width, height);
    const sample = (x: number, y: number): number => {
      const column = (x + width) % width;
      const row = wrapY ? (y + height) % height : Math.max(0, Math.min(height - 1, y));
      return heights[row * width + column]!;
    };
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const gx = (sample(x + 1, y - 1) + 2 * sample(x + 1, y) + sample(x + 1, y + 1))
          - (sample(x - 1, y - 1) + 2 * sample(x - 1, y) + sample(x - 1, y + 1));
        const gy = (sample(x - 1, y + 1) + 2 * sample(x, y + 1) + sample(x + 1, y + 1))
          - (sample(x - 1, y - 1) + 2 * sample(x, y - 1) + sample(x + 1, y - 1));
        let nx = -gx * strength;
        let ny = gy * strength;
        let nz = 1;
        const length = Math.hypot(nx, ny, nz);
        nx /= length;
        ny /= length;
        nz /= length;
        const index = (y * width + x) * 4;
        image.data[index] = Math.round((nx * 0.5 + 0.5) * 255);
        image.data[index + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        image.data[index + 2] = Math.round((nz * 0.5 + 0.5) * 255);
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  // Normal data is not colour: keep it linear (NoColorSpace is the default,
  // set explicitly so a future default change cannot gamma-decode it).
  texture.colorSpace = THREE.NoColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Cavity occlusion: groove floors receive less environment light than block tops. */
function occlusionFromHeights(heights: Float32Array, width: number, height: number, floor: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) {
    const image = context.createImageData(width, height);
    for (let index = 0; index < heights.length; index += 1) {
      const value = Math.round((floor + (1 - floor) * Math.pow(heights[index]!, 0.6)) * 255);
      image.data[index * 4] = value;
      image.data[index * 4 + 1] = value;
      image.data[index * 4 + 2] = value;
      image.data[index * 4 + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/** Tread UV: u runs around the circumference, v across the tread (0..1). */
const TREAD_TILE_REPEAT = 8;
const TREAD_PITCHES_PER_TILE = 8;

/**
 * Directional (V / chevron) touring tread height map, 1024 x 256 per tile:
 * four circumferential main grooves aligned with treadHeight()'s geometric
 * grooves, a continuous centre rib with chevron sipes, V-angled lateral
 * grooves splitting the intermediate ribs into blocks, and deep shoulder
 * blocks with transverse slots and wear-bar sipes. White = rubber surface,
 * black = groove floor.
 */
function treadHeightMap(): { heights: Float32Array; width: number; height: number } {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return { heights: new Float32Array(width * height).fill(1), width, height };
  const pitch = width / TREAD_PITCHES_PER_TILE;
  // Groove centres in canvas y (top to bottom), from treadHeight(): across =
  // 0.61, 0.205, -0.205, -0.61. Canvas row 0 is v = 1 after CanvasTexture's flipY.
  const grooveY = [0.61, 0.205, -0.205, -0.61].map((across) => ((1 - across) / 2) * height);
  const grooveHalf = height * 0.028;
  const centre = height / 2;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.lineCap = 'butt';
  context.lineJoin = 'miter';
  // Draw each pitch at x and x +- width so strokes crossing the seam tile cleanly.
  const eachPitch = (draw: (x: number, index: number) => void) => {
    for (let index = -1; index <= TREAD_PITCHES_PER_TILE; index += 1) {
      for (const offset of [-width, 0, width]) draw(index * pitch + offset, index);
    }
  };

  // Shoulder blocks: transverse slots with a slight angle, flared toward the edge.
  context.fillStyle = '#141414';
  eachPitch((x) => {
    for (const side of [-1, 1]) {
      const inner = side < 0 ? grooveY[0]! - grooveHalf : grooveY[3]! + grooveHalf;
      const outer = side < 0 ? -2 : height + 2;
      context.beginPath();
      context.moveTo(x + pitch * 0.46, inner);
      context.lineTo(x + pitch * 0.58, inner);
      context.lineTo(x + pitch * 0.66, outer);
      context.lineTo(x + pitch * 0.4, outer);
      context.closePath();
      context.fill();
    }
  });
  // Shoulder sipes: thin notches that stop short of the main groove.
  context.strokeStyle = '#3a3a3a';
  context.lineWidth = 2.2;
  eachPitch((x) => {
    for (const side of [-1, 1]) {
      const start = side < 0 ? grooveY[0]! - grooveHalf * 3.2 : grooveY[3]! + grooveHalf * 3.2;
      const end = side < 0 ? 6 : height - 6;
      context.beginPath();
      context.moveTo(x + pitch * 0.02, start);
      context.lineTo(x + pitch * 0.12, (start + end) / 2);
      context.lineTo(x + pitch * 0.06, end);
      context.stroke();
    }
  });

  // Intermediate ribs: V-angled lateral grooves (mirrored each side of centre)
  // produce the chevron that reads as a directional performance tread.
  context.strokeStyle = '#161616';
  context.lineWidth = pitch * 0.12;
  eachPitch((x) => {
    // From the inner groove outward on both halves, so the two sides mirror.
    for (const [from, to] of [[grooveY[1]!, grooveY[0]!], [grooveY[2]!, grooveY[3]!]] as const) {
      context.beginPath();
      context.moveTo(x + pitch * 0.1, from);
      context.lineTo(x + pitch * 0.62, to);
      context.stroke();
    }
  });
  // Zig-zag sipes inside each intermediate block.
  context.strokeStyle = '#444';
  context.lineWidth = 2;
  eachPitch((x) => {
    for (const [from, to] of [[grooveY[1]!, grooveY[0]!], [grooveY[2]!, grooveY[3]!]] as const) {
      const steps = 5;
      context.beginPath();
      for (let step = 0; step <= steps; step += 1) {
        const t = 0.12 + (step / steps) * 0.76;
        const yy = from + (to - from) * t;
        const xx = x + pitch * (0.6 + 0.52 * t) + (step % 2 === 0 ? -3 : 3);
        if (step === 0) context.moveTo(xx, yy);
        else context.lineTo(xx, yy);
      }
      context.stroke();
    }
  });

  // Centre rib: continuous for straight-line stability, with chevron sipes.
  context.strokeStyle = '#4a4a4a';
  context.lineWidth = 2.4;
  eachPitch((x) => {
    context.beginPath();
    context.moveTo(x + pitch * 0.25, grooveY[1]! + grooveHalf * 1.6);
    context.lineTo(x + pitch * 0.55, centre);
    context.lineTo(x + pitch * 0.25, grooveY[2]! - grooveHalf * 1.6);
    context.stroke();
  });

  // Main circumferential grooves last so they cut cleanly through everything.
  context.fillStyle = '#000';
  for (const y of grooveY) context.fillRect(0, y - grooveHalf, width, grooveHalf * 2);
  // Tread-wear indicator bars on the groove floor (slightly raised) every other pitch.
  context.fillStyle = '#2c2c2c';
  for (let index = 0; index < TREAD_PITCHES_PER_TILE; index += 2) {
    for (const y of grooveY) context.fillRect(index * pitch + pitch * 0.8, y - grooveHalf, pitch * 0.08, grooveHalf * 2);
  }

  const raw = readHeights(context, width, height);
  // Micro texture on the contact surface (fine moulding grain, wraps in x).
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const surface = raw[index]!;
      const grain = (tileNoise(x / 8, y / 8, width / 8) - 0.5) * 0.035;
      raw[index] = surface + grain * surface;
    }
  }
  return { heights: blurHeights(raw, width, height, 1, false), width, height };
}

function treadSurfaceMaps(): SurfaceMaps {
  const { heights, width, height } = treadHeightMap();
  const normal = normalMapFromHeights(heights, width, height, 1.8, false);
  const occlusion = occlusionFromHeights(heights, width, height, 0.32);
  for (const texture of [normal, occlusion]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(TREAD_TILE_REPEAT, 1);
  }
  return { normal, occlusion };
}

/**
 * Sidewall height map, 512 x 512, tiling in both directions. In lathe UVs u
 * runs around the tyre and v along the profile, so rows are concentric rings:
 * fine moulded micro-ribs, a knurled serration band, low-frequency moulding
 * undulation and grain noise.
 */
function sidewallSurfaceMaps(): SurfaceMaps {
  const size = 512;
  const heights = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    // 24 micro-ribs per tile with a rounded (not sinusoidal-thin) profile.
    const rib = Math.pow(Math.abs(Math.sin(v * Math.PI * 24)), 0.6);
    // A knurled band in the lower third of the tile.
    const band = smoothBand(v, 0.66, 0.78);
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const serration = Math.abs(Math.sin(u * Math.PI * 96 + v * 18));
      const grain = tileNoise(x / 4, y / 4, size / 4) * 0.55 + tileNoise(x / 16, y / 16, size / 16) * 0.45;
      const undulation = tileNoise(x / 64, y / 64, size / 64);
      const value = 0.5
        + (1 - band) * rib * 0.16
        + band * serration * 0.32
        + (grain - 0.5) * 0.12
        + (undulation - 0.5) * 0.1;
      heights[y * size + x] = value;
    }
  }
  const smoothed = blurHeights(heights, size, size, 1, true);
  const normal = normalMapFromHeights(smoothed, size, size, 1.6, true);
  const occlusion = occlusionFromHeights(smoothed, size, size, 0.72);
  for (const texture of [normal, occlusion]) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // Integer repeat around u avoids a visible seam where the lathe closes.
    texture.repeat.set(10, 2);
  }
  return { normal, occlusion };
}

function smoothBand(value: number, start: number, end: number): number {
  const edge = 0.012;
  const rise = Math.max(0, Math.min(1, (value - start + edge) / (edge * 2)));
  const fall = Math.max(0, Math.min(1, (end + edge - value) / (edge * 2)));
  return Math.min(rise, fall);
}

function cylinder(radius: number, depth: number, material: THREE.Material, z: number, segments = 96): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false);
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = z;
  return mesh;
}

export function curvedSpokeGeometry(innerRadius: number, outerRadius: number, depth: number, sweep: number): THREE.ExtrudeGeometry {
  const innerHalf = innerRadius * 0.17;
  const outerHalf = innerRadius * 0.075;
  const tipShift = sweep * outerHalf * 1.7;
  const shape = new THREE.Shape();
  shape.moveTo(innerRadius, -innerHalf);
  shape.bezierCurveTo(innerRadius * 1.62, -innerHalf + tipShift * 0.18, outerRadius * 0.73, -outerHalf + tipShift * 0.7, outerRadius, -outerHalf + tipShift);
  shape.quadraticCurveTo(outerRadius * 1.018, tipShift, outerRadius, outerHalf + tipShift);
  shape.bezierCurveTo(outerRadius * 0.72, outerHalf + tipShift * 0.78, innerRadius * 1.5, innerHalf + tipShift * 0.16, innerRadius, innerHalf);
  shape.quadraticCurveTo(innerRadius * 0.91, 0, innerRadius, -innerHalf);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: depth * 0.2,
    bevelThickness: depth * 0.16,
    curveSegments: 10,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function wheelAssembly(product: TireWheelProduct3D): THREE.Group {
  const group = new THREE.Group();
  const alpha = product.alpha ?? 1;
  const rim = product.rimRadius;
  const width = product.width;
  const frontZ = width * 0.285;
  const silver = physicalMaterial(0xb6c0c7, { metalness: 0.92, roughness: 0.24, clearcoat: 0.2, clearcoatRoughness: 0.32, alpha });
  const shadowSilver = physicalMaterial(0x98a7b0, { metalness: 0.9, roughness: 0.34, clearcoat: 0.12, clearcoatRoughness: 0.38, alpha });
  const darkMetal = physicalMaterial(0x27323a, { metalness: 0.82, roughness: 0.36, alpha });
  const machined = physicalMaterial(0xd7dde1, { metalness: 0.96, roughness: 0.16, clearcoat: 0.18, clearcoatRoughness: 0.28, alpha });
  const recess = physicalMaterial(0x0d1419, { metalness: 0.35, roughness: 0.56, alpha });
  const accent = physicalMaterial(product.role === 'current' ? 0x2f9eff : 0xff8b38, { metalness: 0.52, roughness: 0.34, alpha: Math.min(1, alpha * 0.92) });

  const barrelGeometry = new THREE.CylinderGeometry(rim * 0.965, rim * 0.965, width * 0.69, 112, 1, true);
  barrelGeometry.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(barrelGeometry, darkMetal));

  for (const z of [-width * 0.345, width * 0.345]) {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.962, rim * 0.029, 10, 112), machined);
    lip.position.z = z;
    group.add(lip);
  }
  const faceRing = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.82, rim * 0.035, 10, 112), silver);
  faceRing.position.z = frontZ;
  group.add(faceRing);
  const pocketRing = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.705, rim * 0.022, 8, 96), darkMetal);
  pocketRing.position.z = frontZ - width * 0.025;
  group.add(pocketRing);

  const rotor = cylinder(rim * 0.61, width * 0.026, darkMetal, frontZ - width * 0.085);
  group.add(rotor);
  // A recessed, vented brake disc gives the open ten-spoke wheel a credible
  // second layer. It is illustrative hardware, not a vehicle-specific spec.
  const rotorTrack = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.51, rim * 0.078, 12, 112), shadowSilver);
  rotorTrack.position.z = frontZ - width * 0.063;
  group.add(rotorTrack);
  const ventGeometry = new THREE.CylinderGeometry(rim * 0.014, rim * 0.014, width * 0.004, 10);
  ventGeometry.rotateX(Math.PI / 2);
  const vents = new THREE.InstancedMesh(ventGeometry, recess, 30);
  const ventMatrix = new THREE.Matrix4();
  for (let index = 0; index < 30; index += 1) {
    const angle = (index / 30) * TAU;
    ventMatrix.makeTranslation(Math.cos(angle) * rim * 0.52, Math.sin(angle) * rim * 0.52, frontZ - width * 0.052);
    vents.setMatrixAt(index, ventMatrix);
  }
  vents.instanceMatrix.needsUpdate = true;
  group.add(vents);
  const caliper = new THREE.Mesh(new THREE.BoxGeometry(rim * 0.17, rim * 0.32, width * 0.11), darkMetal);
  caliper.position.set(rim * 0.53, rim * 0.1, frontZ - width * 0.064);
  caliper.rotation.z = -0.18;
  group.add(caliper);
  const caliperEdge = new THREE.Mesh(new THREE.BoxGeometry(rim * 0.025, rim * 0.25, width * 0.115), silver);
  caliperEdge.position.set(rim * 0.62, rim * 0.1, frontZ - width * 0.062);
  caliperEdge.rotation.z = -0.18;
  group.add(caliperEdge);
  const rotorHat = cylinder(rim * 0.28, width * 0.055, machined, frontZ - width * 0.06);
  group.add(rotorHat);

  // Ten clearly separated blades alternate in reach, tone and a very light
  // sweep. The silhouette stays timeless; the rhythm is the Atlas signature.
  const primarySpoke = curvedSpokeGeometry(rim * 0.2, rim * 0.79, width * 0.058, 0.62);
  const secondarySpoke = curvedSpokeGeometry(rim * 0.245, rim * 0.775, width * 0.052, -0.28);
  for (let index = 0; index < 10; index += 1) {
    const primary = index % 2 === 0;
    const spoke = new THREE.Mesh(primary ? primarySpoke : secondarySpoke, primary ? silver : shadowSilver);
    spoke.rotation.z = (index / 10) * TAU + 0.035;
    spoke.position.z = frontZ - (primary ? 0 : width * 0.004);
    group.add(spoke);
  }

  group.add(cylinder(rim * 0.225, width * 0.105, silver, frontZ + width * 0.008));
  const hubBridge = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.245, rim * 0.022, 8, 72), shadowSilver);
  hubBridge.position.z = frontZ + width * 0.045;
  group.add(hubBridge);
  group.add(cylinder(rim * 0.105, width * 0.125, machined, frontZ + width * 0.035, 5));
  const accentRing = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.112, rim * 0.009, 8, 72), accent);
  accentRing.position.z = frontZ + width * 0.102;
  group.add(accentRing);

  const lugRadius = rim * 0.155;
  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * TAU - Math.PI / 2;
    const lug = cylinder(rim * 0.034, width * 0.055, recess, frontZ + width * 0.072, 28);
    lug.position.x = Math.cos(angle) * lugRadius;
    lug.position.y = Math.sin(angle) * lugRadius;
    group.add(lug);
    const seat = new THREE.Mesh(new THREE.TorusGeometry(rim * 0.038, rim * 0.009, 7, 24), machined);
    seat.position.set(lug.position.x, lug.position.y, frontZ + width * 0.104);
    group.add(seat);
  }
  return group;
}

export function createTireWheelProduct(product: TireWheelProduct3D): THREE.Group {
  const group = new THREE.Group();
  const alpha = product.alpha ?? 1;
  const rubber = physicalMaterial(0x11171b, { metalness: 0.01, roughness: 0.7, clearcoat: 0.06, clearcoatRoughness: 0.72, alpha });
  const sidewallMaps = sidewallSurfaceMaps();
  rubber.normalMap = sidewallMaps.normal;
  rubber.normalScale.set(0.55, 0.55);
  rubber.aoMap = sidewallMaps.occlusion;
  rubber.aoMapIntensity = 0.6;
  // Rubber has a soft, dusty grazing-angle sheen rather than a sharp coat.
  rubber.sheen = 0.35;
  rubber.sheenRoughness = 0.78;
  rubber.sheenColor = new THREE.Color(0x2b3237);
  const treadMaps = treadSurfaceMaps();
  const tread = physicalMaterial(0x0b1013, { metalness: 0, roughness: 0.76, clearcoat: 0.03, clearcoatRoughness: 0.82, alpha });
  tread.normalMap = treadMaps.normal;
  tread.normalScale.set(1, 1);
  tread.aoMap = treadMaps.occlusion;
  tread.aoMapIntensity = 0.9;
  tread.sheen = 0.25;
  tread.sheenRoughness = 0.85;
  tread.sheenColor = new THREE.Color(0x262c30);

  const bodyGeometry = new THREE.LatheGeometry(tireProfile(product), 128, 0, TAU);
  bodyGeometry.rotateX(Math.PI / 2);
  bodyGeometry.computeVertexNormals();
  group.add(new THREE.Mesh(bodyGeometry, rubber));
  group.add(new THREE.Mesh(treadGeometry(product), tread));

  const sidewallMaterial = physicalMaterial(0x1a2227, { metalness: 0.01, roughness: 0.76, alpha });
  for (const z of [-product.width * 0.452, product.width * 0.452]) {
    const bead = new THREE.Mesh(new THREE.TorusGeometry(product.rimRadius * 1.028, product.rimRadius * 0.012, 8, 112), sidewallMaterial);
    bead.position.z = z;
    group.add(bead);
    for (const [radius, thickness] of [[0.765, 0.003], [0.815, 0.005], [0.858, 0.0025]] as const) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(product.outerRadius * radius, product.outerRadius * thickness, 6, 112), sidewallMaterial);
      rib.position.z = z * 1.02;
      group.add(rib);
    }
  }

  group.add(wheelAssembly(product));
  group.position.set(product.center.x, product.center.y, product.center.z);
  group.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });
  return group;
}
