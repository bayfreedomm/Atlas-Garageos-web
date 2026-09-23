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
    envMapIntensity: options.metalness > 0.5 ? 1.2 : 0.45,
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

function treadBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#949494';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#666';
    context.lineWidth = 3;
    for (const y of [24, 49, 79, 104]) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
    context.strokeStyle = '#aeaeae';
    context.lineWidth = 3;
    for (let x = -32; x < canvas.width + 32; x += 24) {
      context.beginPath();
      context.moveTo(x, 16);
      context.lineTo(x + 22, 53);
      context.lineTo(x + 5, 68);
      context.lineTo(x + 28, 112);
      context.stroke();
    }
    context.strokeStyle = '#666';
    context.lineWidth = 2;
    for (let x = -32; x < canvas.width + 32; x += 24) {
      context.beginPath();
      context.moveTo(x + 14, 8);
      context.lineTo(x + 30, 34);
      context.moveTo(x + 2, 92);
      context.lineTo(x + 20, 122);
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = 4;
  return texture;
}

function sidewallBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (context) {
    const image = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const radial = Math.sin(Math.hypot(x - 128, y - 128) * 0.42) * 5;
        const grain = Math.sin(x * 2.7 + y * 1.9) * 2 + Math.sin(x * 0.37 - y * 0.22) * 2;
        const value = Math.max(90, Math.min(170, Math.round(128 + radial + grain)));
        const index = (y * canvas.width + x) * 4;
        image.data[index] = value;
        image.data[index + 1] = value;
        image.data[index + 2] = value;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  texture.anisotropy = 4;
  return texture;
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
  const silver = physicalMaterial(0xb6c0c7, { metalness: 0.92, roughness: 0.29, clearcoat: 0.2, clearcoatRoughness: 0.32, alpha });
  const shadowSilver = physicalMaterial(0x98a7b0, { metalness: 0.9, roughness: 0.34, clearcoat: 0.12, clearcoatRoughness: 0.38, alpha });
  const darkMetal = physicalMaterial(0x27323a, { metalness: 0.82, roughness: 0.36, alpha });
  const machined = physicalMaterial(0xd7dde1, { metalness: 0.96, roughness: 0.22, clearcoat: 0.18, clearcoatRoughness: 0.28, alpha });
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
  rubber.bumpMap = sidewallBumpTexture();
  rubber.bumpScale = product.outerRadius * 0.0018;
  const treadTexture = treadBumpTexture();
  const tread = physicalMaterial(0x0b1013, { metalness: 0, roughness: 0.76, clearcoat: 0.03, clearcoatRoughness: 0.82, alpha });
  tread.bumpMap = treadTexture;
  tread.bumpScale = product.outerRadius * 0.0045;

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
