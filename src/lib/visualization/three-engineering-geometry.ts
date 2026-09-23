import * as THREE from 'three';
import type { OffsetProduct3D, PcdProduct3D } from './canvas-3d';
import { curvedSpokeGeometry } from './three-product-geometry';

const TAU = Math.PI * 2;

function metal(color: number, opacity = 1, roughness = 0.32): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color, metalness: 0.86, roughness, clearcoat: 0.1,
    transparent: opacity < 1, opacity, depthWrite: opacity > 0.7,
    side: THREE.DoubleSide, envMapIntensity: 1.1,
  });
}

function ring(radius: number, tube: number, material: THREE.Material, z: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 112), material);
  mesh.position.z = z;
  return mesh;
}

function axialCylinder(radius: number, depth: number, material: THREE.Material, z: number): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(radius, radius, depth, 96, 1, false);
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = z;
  return mesh;
}

function annularShape(outer: number, inner: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, TAU, false);
  const bore = new THREE.Path();
  bore.absarc(0, 0, inner, 0, TAU, true);
  shape.holes.push(bore);
  return shape;
}

function wheelShell(radius: number, width: number, centerZ: number, proposed: boolean): THREE.Group {
  const group = new THREE.Group();
  const visible = proposed ? metal(0x34414a, 0.93, 0.53) : metal(0x879aa5, 0.1, 0.56);
  const edge = proposed ? metal(0xb9c4ca, 1, 0.32) : metal(0x4ca9e5, 0.68, 0.38);
  const dark = metal(0x25313a, proposed ? 0.97 : 0.13, 0.55);
  const accent = metal(proposed ? 0xd89155 : 0x438ec0, proposed ? 0.78 : 0.55, 0.43);
  const half = width / 2;

  // An open barrel makes both axial edges legible. The center is the canonical
  // -ET position supplied by WheelOffset3DModel, not a display-only shift.
  const barrel = new THREE.CylinderGeometry(radius * 0.965, radius * 0.965, width * 0.985, 112, 1, true);
  barrel.rotateX(Math.PI / 2);
  const shell = new THREE.Mesh(barrel, visible);
  shell.position.z = centerZ;
  group.add(shell);
  for (const side of [-1, 1]) {
    const z = centerZ + side * half;
    group.add(ring(radius * 0.965, radius * 0.022, edge, z));
    group.add(ring(radius * 0.805, radius * 0.01, accent, z + side * width * 0.008));
  }

  const faceZ = centerZ + width * 0.385;
  if (proposed) {
    group.add(ring(radius * 0.8, radius * 0.025, edge, faceZ));
    group.add(axialCylinder(radius * 0.59, width * 0.022, dark, faceZ - width * 0.055));
    const primary = curvedSpokeGeometry(radius * 0.2, radius * 0.79, width * 0.064, 0.62);
    const secondary = curvedSpokeGeometry(radius * 0.245, radius * 0.775, width * 0.058, -0.28);
    for (let index = 0; index < 10; index += 1) {
      const spoke = new THREE.Mesh(index % 2 ? secondary : primary, edge);
      spoke.rotation.z = index * TAU / 10 + 0.035;
      spoke.position.z = faceZ + width * 0.045;
      group.add(spoke);
    }
    group.add(ring(radius * 0.245, radius * 0.025, edge, faceZ + width * 0.085));
    group.add(axialCylinder(radius * 0.15, width * 0.065, dark, faceZ + width * 0.09));
  }
  return group;
}

export function createOffsetProduct(product: OffsetProduct3D): THREE.Group {
  const group = new THREE.Group();
  // This translucent datum is the one fixed hub mounting plane at z = 0.
  const datum = new THREE.Mesh(new THREE.RingGeometry(0.29, product.radius * 1.19, 112),
    new THREE.MeshBasicMaterial({ color: 0x83a6b8, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
  datum.position.z = 0;
  group.add(datum);
  group.add(ring(product.radius * 1.19, 0.009, metal(0x7699ac, 0.55, 0.55), 0));
  group.add(axialCylinder(product.radius * 0.17, 0.19, metal(0x758b99), 0));
  group.add(ring(product.radius * 0.23, product.radius * 0.019, metal(0xc4d0d7), 0.108));
  group.add(wheelShell(product.radius, product.currentWidth, product.currentCenterZ, false));
  group.add(wheelShell(product.radius * 1.008, product.proposedWidth, product.proposedCenterZ, true));
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; }
  });
  return group;
}

export function createPcdProduct(product: PcdProduct3D): THREE.Group {
  const group = new THREE.Group();
  const outer = product.outerRadius;
  const plateShape = annularShape(outer, product.boreRadius);
  for (const point of product.lugPositions) {
    const hole = new THREE.Path();
    hole.absarc(point.x, point.y, product.holeRadius, 0, TAU, true);
    plateShape.holes.push(hole);
  }
  const body = new THREE.ExtrudeGeometry(plateShape, {
    depth: 0.2, bevelEnabled: true, bevelSegments: 3,
    bevelSize: 0.018, bevelThickness: 0.018, curveSegments: 96, steps: 1,
  });
  body.translate(0, 0, -0.1);
  const surface = metal(0x869aa6, 1, 0.38);
  const polished = metal(0xd1dbe0, 1, 0.24);
  const dark = metal(0x344650, 1, 0.45);
  group.add(new THREE.Mesh(body, surface));
  group.add(ring(outer * 0.955, 0.025, polished, 0.122));
  group.add(ring(outer * 0.72, 0.014, dark, 0.125));
  group.add(ring(product.boreRadius * 1.04, 0.026, polished, 0.137));
  // The seats frame real through-holes in the extruded plate. They do not cap them.
  for (const point of product.lugPositions) {
    const seat = ring(product.holeRadius * 1.28, product.holeRadius * 0.16, polished, 0.134);
    seat.position.x = point.x;
    seat.position.y = point.y;
    group.add(seat);
    const recess = ring(product.holeRadius * 0.91, product.holeRadius * 0.11, dark, 0.115);
    recess.position.x = point.x;
    recess.position.y = point.y;
    group.add(recess);
  }
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; }
  });
  return group;
}
