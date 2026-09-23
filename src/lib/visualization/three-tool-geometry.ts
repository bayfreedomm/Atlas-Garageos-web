import * as THREE from 'three';
import type { ToolStudio3D } from './canvas-3d';

/** The WebGL-only product language for the explanatory tools. No car silhouette is implied. */
export function createToolStudioProduct(spec: ToolStudio3D): THREE.Group {
  const group = new THREE.Group();
  const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const p = clamp(spec.primary);
  const q = clamp(spec.secondary ?? 0);
  const dark = material('#19262f', .42, .64);
  const graphite = material('#30414d', .64, .54);
  const titanium = material(spec.metal, .84, .34);
  const bright = material('#c5d0d6', .76, .36);
  const blue = material(new THREE.Color(spec.current).lerp(new THREE.Color('#587588'), .32).getStyle(), .55, .5);
  const orange = material(new THREE.Color(spec.proposed).lerp(new THREE.Color('#947767'), .32).getStyle(), .55, .5);
  const cyan = material(new THREE.Color(spec.accent).lerp(new THREE.Color('#78919e'), .4).getStyle(), .58, .48);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#9ac8df', metalness: 0, roughness: .12, transmission: .68, transparent: true, opacity: .34, thickness: .16, depthWrite: false, side: THREE.DoubleSide });
  const add = (geometry: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Group = group): THREE.Mesh => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const disc = (r: number, depth: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh => {
    const mesh = add(new THREE.CylinderGeometry(r, r, depth, 64), mat, x, y, z);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  const ring = (r: number, tube: number, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh => add(new THREE.TorusGeometry(r, tube, 10, 80), mat, x, y, z);
  const block = (w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0, radius = .07): THREE.Mesh => {
    const shape = roundedRect(w, h, Math.min(radius, w / 2, h / 2));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 2, curveSegments: 5, steps: 1 });
    geometry.translate(-w / 2, -h / 2, -d / 2);
    geometry.computeVertexNormals();
    return add(geometry, mat, x, y, z);
  };
  const beam = (start: THREE.Vector3, end: THREE.Vector3, radius: number, mat: THREE.Material): THREE.Mesh => {
    const direction = end.clone().sub(start);
    const mesh = add(new THREE.CylinderGeometry(radius, radius, direction.length(), 12), mat, ...toTuple(start.clone().add(end).multiplyScalar(.5)));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return mesh;
  };
  const line = (points: readonly THREE.Vector3[], mat: THREE.Material, radius = .012): void => {
    for (let i = 1; i < points.length; i += 1) beam(points[i - 1]!, points[i]!, radius, mat);
  };
  const arc = (radius: number, start: number, end: number, mat: THREE.Material, z = .4, tube = .025): void => {
    const points: THREE.Vector3[] = [];
    const segments = Math.max(8, Math.ceil(Math.abs(end - start) * 20));
    for (let i = 0; i <= segments; i += 1) {
      const a = start + (end - start) * i / segments;
      points.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, z));
    }
    line(points, mat, tube);
  };
  const bolt = (x: number, y: number, z: number, r = .035): void => {
    disc(r * 1.32, .025, graphite, x, y, z);
    disc(r, .03, bright, x, y, z + .018);
    block(r * 1.1, .008, .004, dark, x, y, z + .038, .001);
  };
  const plinth = (width = 2.65): void => {
    block(width, .105, .86, dark, 0, -1.04, -.25, .06);
    block(width - .14, .023, .75, graphite, 0, -.966, -.23, .025);
    block(width - .3, .015, .016, blue, 0, -.94, .15, .006);
    for (const x of [-width / 2 + .18, width / 2 - .18]) bolt(x, -.96, .16, .026);
  };
  const scale = (cx: number, cy: number, r: number, z: number, count: number, active: number, start = Math.PI * 1.2, span = Math.PI * 1.6): void => {
    for (let i = 0; i <= count; i += 1) {
      const a = start - i / count * span;
      const major = i % 5 === 0;
      const outer = r;
      const inner = r - (major ? .115 : .055);
      const m = i / count <= active ? orange : titanium;
      beam(new THREE.Vector3(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner, z), new THREE.Vector3(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer, z), major ? .012 : .007, m);
    }
  };
  const dial = (cx = 0, cy = .02, radius = .86, active = p): void => {
    disc(radius + .09, .24, dark, cx, cy, 0);
    ring(radius + .075, .025, bright, cx, cy, .11);
    ring(radius - .025, .036, titanium, cx, cy, .16);
    disc(radius - .075, .025, graphite, cx, cy, .13);
    ring(radius - .18, .009, blue, cx, cy, .16);
    scale(cx, cy, radius - .15, .2, 35, active);
    const a = Math.PI * 1.2 - active * Math.PI * 1.6;
    beam(new THREE.Vector3(cx, cy, .23), new THREE.Vector3(cx + Math.cos(a) * (radius - .29), cy + Math.sin(a) * (radius - .29), .25), .018, orange);
    disc(.09, .09, bright, cx, cy, .25);
    disc(.055, .035, orange, cx, cy, .307);
    for (const a of [.25, 1.85, 3.45, 5.05]) bolt(cx + Math.cos(a) * (radius + .015), cy + Math.sin(a) * (radius + .015), .19, .027);
  };

  switch (spec.id) {
    case 'psi-bar-converter': {
      plinth();
      block(.9, .35, .35, dark, 0, -.82, -.18);
      dial(0, .08, .83);
      ring(.54, .012, cyan, 0, .08, .195);
      break;
    }
    case 'fuel-cost-calculator': {
      plinth(3);
      block(1.2, 1.45, .46, titanium, -.65, -.08, -.14, .15);
      block(1.08, 1.28, .07, dark, -.65, -.08, .15, .11);
      block(.8, 1.05, .035, glass, -.65, -.08, .23, .06);
      const fillHeight = .85 * p;
      block(.74, fillHeight, .025, blue, -.65, -.53 + fillHeight / 2, .254, .025);
      for (let i = 0; i < 7; i += 1) block(i % 2 ? .09 : .16, .01, .014, bright, -.25 - (i % 2 ? .02 : .05), -.48 + i * .15, .28, .002);
      beam(new THREE.Vector3(-.65, .72, .04), new THREE.Vector3(-.65, .91, .04), .095, titanium);
      beam(new THREE.Vector3(-.65, .91, .04), new THREE.Vector3(.55, .91, .04), .07, titanium);
      beam(new THREE.Vector3(.55, .91, .04), new THREE.Vector3(.55, .4, .04), .07, titanium);
      for (let i = 0; i < 6; i += 1) block(.13, .19, .16, i / 6 < p ? orange : graphite, .26 + (i % 3) * .28, -.48 + Math.floor(i / 3) * .26, .26, .025);
      disc(.3, .16, dark, .7, .18, .17);
      ring(.25, .019, cyan, .7, .18, .27);
      arc(.18, Math.PI * 1.2, Math.PI * (1.2 - p * 1.55), orange, .3, .018);
      for (const x of [-1.1, -.2, .32, 1.03]) bolt(x, -.79, .25);
      break;
    }
    case 'road-trip-cost-calculator':
    case 'mpg-l100km-converter':
    case 'quarter-mile-calculator': {
      const race = spec.id === 'quarter-mile-calculator';
      const conversion = spec.id === 'mpg-l100km-converter';
      plinth(3.1);
      block(2.9, .66, .42, dark, 0, -.15, -.04, .09);
      block(2.72, .5, .018, graphite, 0, -.15, .21, .05);
      for (const side of [-1, 1]) beam(new THREE.Vector3(-1.34, -.15 + side * .27, .27), new THREE.Vector3(1.34, -.15 + side * .27, .27), .014, titanium);
      for (let i = 0; i < 13; i += 1) block(.075, .009, .012, race && i < 4 ? orange : bright, -1.19 + i * .198, -.15, .25, .002);
      const markerX = -1.16 + 2.32 * (conversion ? 1 - p : p);
      block(.2, .17, .13, titanium, markerX, -.15, .38, .025);
      block(.1, .105, .012, orange, markerX, -.15, .459, .012);
      for (const x of [-1.2, 1.2]) {
        beam(new THREE.Vector3(x, .12, .15), new THREE.Vector3(x, .82, .15), .022, titanium);
        block(.29, .09, .09, titanium, x, .83, .15, .02);
        block(.15, .018, .012, x < 0 ? blue : orange, x, .86, .206, .005);
      }
      if (spec.returnTrip) {
        line([new THREE.Vector3(1.16, -.54, .31), new THREE.Vector3(-1.16, -.54, .31)], orange, .017);
        block(.15, .09, .05, orange, -1.16, -.54, .31, .01);
      }
      if (conversion) {
        disc(.3, .22, dark, -.77, .43, .13);
        ring(.23, .027, blue, -.77, .43, .27);
        disc(.2, .18, titanium, .77, .43, .13);
        ring(.15, .02, orange, .77, .43, .27);
        beam(new THREE.Vector3(-.47, .43, .28), new THREE.Vector3(.54, .43, .28), .013, cyan);
      } else if (race) {
        for (const x of [-1.24, 1.24]) {
          beam(new THREE.Vector3(x, -.36, .42), new THREE.Vector3(x, .14, .42), .018, bright);
          block(.16, .08, .07, cyan, x, .13, .42, .01);
        }
      } else {
        for (let i = 0; i < 5; i += 1) block(.17, .12 + .35 * (i / 5 < q ? 1 : .2), .15, i / 5 < q ? orange : graphite, -.46 + i * .23, .47, .23, .012);
      }
      break;
    }
    case 'hp-kw-converter':
    case 'power-to-weight-calculator': {
      plinth(3);
      disc(.86, .3, dark, -.45, .04, -.1);
      ring(.84, .06, titanium, -.45, .04, .13);
      ring(.63, .015, blue, -.45, .04, .18);
      for (let i = 0; i < 11; i += 1) {
        const a = 2 * Math.PI * i / 11;
        const blade = block(.54, .12, .09, i % 2 ? titanium : bright, -.45 + Math.cos(a) * .39, .04 + Math.sin(a) * .39, .24, .045);
        blade.rotation.z = a + .47;
      }
      disc(.22, .28, titanium, -.45, .04, .29);
      ring(.18, .018, orange, -.45, .04, .44);
      block(.87, 1.35, .26, dark, .81, -.02, -.12, .08);
      block(.68, 1.13, .025, graphite, .81, -.02, .05, .03);
      const bars = spec.id === 'power-to-weight-calculator' ? 7 : 9;
      for (let i = 0; i < bars; i += 1) {
        const h = .07 + .62 * (i / bars <= p ? .4 + .6 * i / bars : .08);
        block(.052, h, .025, i / bars <= p ? orange : titanium, .49 + i * (.64 / bars), -.43 + h / 2, .1, .01);
      }
      arc(.4, Math.PI * 1.2, Math.PI * (1.2 - p * 1.6), cyan, .14, .012);
      break;
    }
    case 'nm-lb-ft-converter': {
      plinth(3.05);
      disc(.65, .3, dark, -.75, -.05, -.08);
      ring(.62, .045, titanium, -.75, -.05, .12);
      disc(.17, .32, bright, -.75, -.05, .22);
      const angle = .22 + p * .85;
      const end = new THREE.Vector3(-.75 + Math.cos(angle) * 1.75, -.05 + Math.sin(angle) * 1.75, .31);
      beam(new THREE.Vector3(-.75, -.05, .29), end, .095, titanium);
      block(.34, .25, .24, orange, end.x, end.y, end.z, .045).rotation.z = angle;
      for (let i = 0; i <= 18; i += 1) {
        const a = i / 18 * 1.1;
        const inner = 1.03, outer = i % 3 ? 1.1 : 1.19;
        beam(new THREE.Vector3(-.75 + Math.cos(a) * inner, -.05 + Math.sin(a) * inner, .16), new THREE.Vector3(-.75 + Math.cos(a) * outer, -.05 + Math.sin(a) * outer, .16), .009, i / 18 <= p ? orange : bright);
      }
      for (let i = 0; i < 12; i += 1) {
        const a = i * Math.PI / 6;
        bolt(-.75 + Math.cos(a) * .47, -.05 + Math.sin(a) * .47, .16, .024);
      }
      break;
    }
    case 'towing-capacity-calculator': {
      plinth(3.1);
      for (const y of [-.43, -.1]) {
        beam(new THREE.Vector3(-1.43, y, -.11), new THREE.Vector3(-.28, y, -.11), .064, titanium);
        beam(new THREE.Vector3(.47, y, -.11), new THREE.Vector3(1.42, y, -.11), .055, titanium);
      }
      for (const x of [-1.25, -.53, .71, 1.31]) beam(new THREE.Vector3(x, -.49, -.11), new THREE.Vector3(x, -.04, -.11), .045, graphite);
      const leftLoad = -.42 + q * .78;
      const rightLoad = -.42 + p * .78;
      for (const [x, level, color] of [[-.94, leftLoad, blue], [.99, rightLoad, orange]] as const) {
        block(.49, 1.08, .2, dark, x, .17, .02, .045);
        block(.34, .86, .015, graphite, x, .17, .15, .015);
        block(.26, Math.max(.035, level + .42), .02, color, x, -.24 + Math.max(.035, level + .42) / 2, .17, .012);
        block(.42, .97, .012, glass, x, .17, .19, .025);
        for (let i = 0; i < 5; i += 1) block(.07, .008, .009, bright, x + .1, -.23 + i * .19, .205, .002);
        bolt(x - .18, -.35, .22, .02); bolt(x + .18, .68, .22, .02);
      }
      beam(new THREE.Vector3(-.36, -.27, .1), new THREE.Vector3(.32, -.27, .1), .095, bright);
      block(.34, .21, .24, dark, -.11, -.27, .1, .03);
      disc(.16, .19, titanium, .23, -.24, .14);
      disc(.105, .15, orange, .23, -.09, .15);
      beam(new THREE.Vector3(.46, -.31, .05), new THREE.Vector3(.69, -.43, -.06), .045, titanium);
      beam(new THREE.Vector3(.46, -.31, .05), new THREE.Vector3(.69, -.1, -.06), .045, titanium);
      break;
    }
    case 'compression-ratio-calculator': {
      plinth(2.8);
      const boreRadius = .53 + clamp(((spec.count ?? 86) - 60) / 60) * .24;
      const pistonY = -.19 - p * .47;
      const wall = new THREE.CylinderGeometry(boreRadius, boreRadius, 1.62, 64, 1, true);
      add(wall, glass, 0, .03, 0);
      ring(boreRadius + .02, .044, titanium, 0, -.74, 0).rotation.x = Math.PI / 2;
      ring(boreRadius + .02, .044, titanium, 0, .8, 0).rotation.x = Math.PI / 2;
      for (const x of [-boreRadius + .08, boreRadius - .08]) beam(new THREE.Vector3(x, -.7, .28), new THREE.Vector3(x, .78, .28), .027, titanium);
      add(new THREE.CylinderGeometry(boreRadius - .075, boreRadius - .075, .2, 64), bright, 0, pistonY, .05);
      ring(boreRadius - .12, .018, dark, 0, pistonY + .09, .05).rotation.x = Math.PI / 2;
      beam(new THREE.Vector3(0, pistonY - .1, .16), new THREE.Vector3(0, -.82, .16), .06, titanium);
      disc(.18, .28, dark, 0, -.79, .16);
      disc(.1, .31, blue, 0, -.79, .34);
      block(1.58, .14, .55, titanium, 0, .82, 0, .05);
      const headspace = .045 + q * .31;
      add(new THREE.CylinderGeometry(boreRadius - .105, boreRadius - .105, headspace, 64), new THREE.MeshPhysicalMaterial({ color: spec.proposed, transparent: true, opacity: .48, metalness: .12, roughness: .46, depthWrite: false }), 0, .72 - headspace / 2, .02);
      beam(new THREE.Vector3(0, .83, .14), new THREE.Vector3(0, .98, .14), .04, bright);
      disc(.09, .07, orange, 0, .97, .17);
      break;
    }
    case 'ev-charging-calculator': {
      plinth(3.1);
      block(2.91, 1.25, .39, dark, 0, -.01, -.12, .13);
      block(2.77, 1.1, .035, titanium, 0, -.01, .12, .09);
      block(2.63, .97, .025, graphite, 0, -.01, .16, .04);
      const start = p, end = Math.max(p, q);
      for (let i = 0; i < 16; i += 1) {
        const x = -1.17 + (i % 8) * .335;
        const y = -.24 + Math.floor(i / 8) * .49;
        const frac = (i + .5) / 16;
        block(.258, .37, .075, frac <= start ? blue : frac <= end ? orange : dark, x, y, .22, .045);
        block(.216, .025, .012, bright, x, y + .13, .268, .006);
        bolt(x - .07, y - .13, .274, .012);
      }
      for (let i = 0; i < 7; i += 1) {
        const x = -1.01 + i * .335;
        beam(new THREE.Vector3(x, -.04, .3), new THREE.Vector3(x + .16, -.04, .3), .012, cyan);
      }
      block(.23, .42, .24, titanium, 1.55, -.01, -.04, .045);
      bolt(-1.37, -.56, .24); bolt(1.37, .54, .24);
      break;
    }
    case 'vehicle-fitment-finder': {
      plinth(2.95);
      disc(.9, .2, dark, 0, .03, -.1);
      ring(.84, .045, bright, 0, .03, .1);
      ring(.7, .025, titanium, 0, .03, .16);
      const lugCount = Math.max(0, Math.min(8, Math.round(spec.count ?? 0)));
      const shape = new THREE.Shape();
      shape.absarc(0, 0, .56, 0, Math.PI * 2, false);
      const bore = new THREE.Path(); bore.absarc(0, 0, .15, 0, Math.PI * 2, true); shape.holes.push(bore);
      for (let i = 0; i < lugCount; i += 1) {
        const a = i * 2 * Math.PI / lugCount;
        const x = Math.cos(a) * .39, y = Math.sin(a) * .39;
        const hole = new THREE.Path(); hole.absarc(x, y, .07, 0, Math.PI * 2, true); shape.holes.push(hole);
        ring(.085, .009, bright, x, y + .03, .275);
      }
      const plate = new THREE.ExtrudeGeometry(shape, { depth: .11, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 2, curveSegments: 12 });
      plate.translate(0, .03, .17);
      add(plate, titanium);
      for (let i = 0; i < 18; i += 1) {
        const a = i * Math.PI / 9;
        beam(new THREE.Vector3(Math.cos(a) * .73, .03 + Math.sin(a) * .73, .13), new THREE.Vector3(Math.cos(a) * .78, .03 + Math.sin(a) * .78, .13), .006, blue);
      }
      break;
    }
    default:
      dial();
  }

  return group;
}

function material(color: string, metalness: number, roughness: number): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({ color, metalness, roughness, clearcoat: metalness > .55 ? .08 : 0, clearcoatRoughness: .48, envMapIntensity: .92 });
}

function roundedRect(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(radius, 0);
  shape.lineTo(width - radius, 0);
  shape.quadraticCurveTo(width, 0, width, radius);
  shape.lineTo(width, height - radius);
  shape.quadraticCurveTo(width, height, width - radius, height);
  shape.lineTo(radius, height);
  shape.quadraticCurveTo(0, height, 0, height - radius);
  shape.lineTo(0, radius);
  shape.quadraticCurveTo(0, 0, radius, 0);
  return shape;
}

function toTuple(point: THREE.Vector3): [number, number, number] { return [point.x, point.y, point.z]; }
