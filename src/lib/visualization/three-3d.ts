import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { Annotation3D, Material3D, Mesh3D, Scene3D, Vec3, View3D } from './canvas-3d';
import { createTireWheelProduct } from './three-product-geometry';
import { createOffsetProduct, createPcdProduct } from './three-engineering-geometry';
import { createToolStudioProduct } from './three-tool-geometry';

const DEFAULT_VIEW: View3D = { yaw: -0.58, pitch: 0.34, zoom: 1 };
/** Contact shadow planes are drawn this much wider than the Shadow3D radii so the penumbra can fade out past the old hard edge. */
const SHADOW_SPREAD = 1.32;
let rectAreaLightsReady = false;
const KEY_SOFTBOX_POSITION: readonly [number, number, number] = [-3.2, 3.6, 4.2];
const FILL_SOFTBOX_POSITION: readonly [number, number, number] = [4.6, 0.9, 3.6];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function vector(point: Vec3): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

interface Softbox {
  /** Direction from the subject toward the panel centre (world space). */
  readonly direction: readonly [number, number, number];
  /** Half extents of the panel on a unit-distance projection plane. */
  readonly halfWidth: number;
  readonly halfHeight: number;
  /** Linear HDR radiance per channel (values above 1 are intentional). */
  readonly radiance: readonly [number, number, number];
  /** Edge transition in projected units: small values give crisp panel borders. */
  readonly feather: number;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Procedural HDR studio: a 512x256 equirectangular half-float map with four
 * hard-edged softboxes (warm key, cool fill, narrow rim strip, overhead
 * scrim), dark walls and a reflective floor that brightens toward a crisp
 * horizon line. Each panel is a real rectangle in 3D, so polished metal shows
 * straight-edged window reflections instead of a blurred glow. No network,
 * no image files: everything is computed here once per renderer.
 */
function studioEnvironment(): THREE.DataTexture {
  const width = 512;
  const height = 256;
  const panels: readonly Softbox[] = [
    // Key: warm (~5000 K) box up-left in front. Same direction and angular size
    // as the key RectAreaLight (4.2 x 3.0 at ~6.4 units), so the reflection in
    // the env map and the analytic highlight coincide as one clean rectangle.
    { direction: KEY_SOFTBOX_POSITION, halfWidth: 0.33, halfHeight: 0.235, radiance: [1.9, 1.76, 1.56], feather: 0.01 },
    // Fill: cool (~7500 K) panel low on the right, matching the fill RectAreaLight.
    { direction: FILL_SOFTBOX_POSITION, halfWidth: 0.27, halfHeight: 0.2, radiance: [0.72, 0.82, 1.0], feather: 0.014 },
    // Rim: tall narrow strip behind the subject for a thin edge highlight.
    { direction: [0.3, 0.46, -0.84], halfWidth: 0.07, halfHeight: 0.62, radiance: [2.1, 2.2, 2.35], feather: 0.008 },
    // Overhead scrim: broad neutral ceiling panel, reads as the long top band on rims.
    { direction: [0, 1, 0.12], halfWidth: 0.62, halfHeight: 0.26, radiance: [1.18, 1.18, 1.2], feather: 0.02 },
  ];
  // Precompute an orthonormal frame per panel (right = up x normal).
  const frames = panels.map((panel) => {
    const normal = new THREE.Vector3(...panel.direction).normalize();
    const worldUp = Math.abs(normal.y) > 0.9 ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(worldUp, normal).normalize();
    const up = new THREE.Vector3().crossVectors(normal, right).normalize();
    return { panel, normal, right, up };
  });
  const data = new Uint16Array(width * height * 4);
  const direction = new THREE.Vector3();
  for (let y = 0; y < height; y += 1) {
    // DataTexture row 0 is v = 0, which three's equirect lookup maps to straight down.
    const elevation = ((y + 0.5) / height - 0.5) * Math.PI;
    const sinElevation = Math.sin(elevation);
    const cosElevation = Math.cos(elevation);
    for (let x = 0; x < width; x += 1) {
      // Inverse of three's equirectUv(): u = atan(z, x) / 2PI + 0.5.
      const azimuth = ((x + 0.5) / width - 0.5) * Math.PI * 2;
      direction.set(Math.cos(azimuth) * cosElevation, sinElevation, Math.sin(azimuth) * cosElevation);
      let r: number;
      let g: number;
      let b: number;
      if (sinElevation >= 0) {
        // Dark studio walls: slightly lighter near the horizon, near-black ceiling.
        const wall = 0.028 + 0.05 * Math.pow(1 - sinElevation, 3);
        r = wall;
        g = wall * 1.03;
        b = wall * 1.08;
      } else {
        // Glossy floor: darkest straight down, brightening toward the horizon
        // like a polished studio floor seen at grazing angles.
        const depth = -sinElevation;
        const floor = 0.012 + 0.2 * Math.pow(1 - depth, 5);
        r = floor * 1.02;
        g = floor;
        b = floor * 0.98;
      }
      // Crisp horizon line where the floor meets the cyclorama.
      const horizon = Math.exp(-Math.pow(elevation / 0.018, 2)) * 0.34;
      r += horizon;
      g += horizon;
      b += horizon * 1.04;
      for (const { panel, normal, right, up } of frames) {
        const facing = direction.dot(normal);
        if (facing <= 0.05) continue;
        // Project the ray onto the panel plane at unit distance: a true rectangle.
        const a = direction.dot(right) / facing;
        const c = direction.dot(up) / facing;
        const edgeX = 1 - smoothstep(panel.halfWidth - panel.feather, panel.halfWidth + panel.feather, Math.abs(a));
        const edgeY = 1 - smoothstep(panel.halfHeight - panel.feather, panel.halfHeight + panel.feather, Math.abs(c));
        const coverage = edgeX * edgeY;
        if (coverage <= 0) continue;
        // Real diffusers are slightly hotter in the middle than at the frame.
        const hotspot = 1 - 0.28 * (Math.pow(a / panel.halfWidth, 2) + Math.pow(c / panel.halfHeight, 2)) * 0.5;
        const strength = coverage * hotspot;
        r += panel.radiance[0] * strength;
        g += panel.radiance[1] * strength;
        b += panel.radiance[2] * strength;
      }
      const index = (y * width + x) * 4;
      data[index] = THREE.DataUtils.toHalfFloat(r);
      data[index + 1] = THREE.DataUtils.toHalfFloat(g);
      data[index + 2] = THREE.DataUtils.toHalfFloat(b);
      data[index + 3] = THREE.DataUtils.toHalfFloat(1);
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.HalfFloatType);
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Soft contact shadow: white RGB with a radial alpha falloff (dense contact
 * core, wide penumbra fading to exactly zero at the edge). The shadow colour
 * and strength come from the material, so one texture serves every Shadow3D.
 */
function contactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const image = context.createImageData(size, size);
    const half = size / 2;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const r = Math.hypot(x + 0.5 - half, y + 0.5 - half) / half;
        const penumbra = 1 - smoothstep(0.42, 1, r);
        const core = Math.exp(-Math.pow(r / 0.3, 2));
        // Ordered dither (+-0.5 LSB) hides 8-bit banding in the faint outer ring.
        const dither = (((x * 7 + y * 13) % 16) / 16 - 0.5) / 255;
        const alpha = clamp(penumbra * 0.8 + core * 0.2 + (r < 1 ? dither : 0), 0, 1);
        const index = (y * size + x) * 4;
        image.data[index] = 255;
        image.data[index + 1] = 255;
        image.data[index + 2] = 255;
        image.data[index + 3] = Math.round(alpha * 255);
      }
    }
    context.putImageData(image, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function pbrMaterial(mesh: Mesh3D): THREE.MeshStandardMaterial {
  const source: Material3D = mesh.material ?? {};
  const alpha = mesh.alpha ?? 1;
  const metallic = clamp(source.metallic ?? 0.08, 0, 1);
  const shininess = clamp(source.shininess ?? 18, 1, 64);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(mesh.color),
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
    metalness: metallic,
    roughness: clamp(0.94 - shininess / 88 - metallic * 0.12, 0.18, 0.9),
    transparent: alpha < 0.995,
    opacity: alpha,
    depthWrite: alpha >= 0.72,
    side: THREE.DoubleSide,
    clearcoat: metallic > 0.35 ? 0.28 : 0.02,
    clearcoatRoughness: metallic > 0.35 ? 0.34 : 0.8,
  });
  // Calibrated for the HDR softbox environment (see studioEnvironment).
  material.envMapIntensity = metallic > 0.35 ? 1.05 : 0.3;
  return material;
}

function geometryFromMesh(mesh: Mesh3D): THREE.BufferGeometry {
  const positions = new Float32Array(mesh.faces.length * 9);
  let cursor = 0;
  for (const face of mesh.faces) {
    for (const index of [face.a, face.b, face.c]) {
      const point = mesh.vertices[index];
      if (!point) continue;
      positions[cursor++] = point.x;
      positions[cursor++] = point.y;
      positions[cursor++] = point.z;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function lineObject(points: readonly Vec3[], color: string, alpha: number, closed: boolean, dashed: boolean): THREE.Line {
  const resolved = closed && points.length > 0 ? [...points, points[0]!] : [...points];
  const geometry = new THREE.BufferGeometry().setFromPoints(resolved.map(vector));
  const material = dashed
    ? new THREE.LineDashedMaterial({ color, transparent: alpha < 1, opacity: alpha, dashSize: 0.075, gapSize: 0.05 })
    : new THREE.LineBasicMaterial({ color, transparent: alpha < 1, opacity: alpha });
  const line = new THREE.Line(geometry, material);
  if (dashed) line.computeLineDistances();
  line.renderOrder = 8;
  return line;
}

function disposeObject(object: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materialsToDispose = new Set<THREE.Material>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Line)) return;
    geometries.add(child.geometry);
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) materialsToDispose.add(material);
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materialsToDispose) {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.map?.dispose();
      material.normalMap?.dispose();
      material.bumpMap?.dispose();
      material.roughnessMap?.dispose();
      material.metalnessMap?.dispose();
      material.aoMap?.dispose();
    }
    material.dispose();
  }
}

export class Three3DRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly world = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(31, 1, 0.05, 100);
  private readonly content = new THREE.Group();
  private readonly annotationLayer: HTMLElement;
  private readonly resizeObserver: ResizeObserver;
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly events = new AbortController();
  private readonly environment: THREE.Texture;
  private readonly shadowTexture: THREE.CanvasTexture;
  private view = { ...DEFAULT_VIEW };
  private defaultView = { ...DEFAULT_VIEW };
  private fitRadius = 1.5;
  private width = 1;
  private height = 1;
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private lastPointer: { x: number; y: number } | null = null;
  private pinchDistance: number | null = null;
  private annotations: readonly Annotation3D[] = [];
  private annotationObjects: THREE.Object3D[] = [];
  private tireScene = false;
  private toolStudioScene = false;
  private labels: HTMLElement[] = [];
  private raf = 0;
  private transitionStarted = 0;
  private destroyed = false;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly stage: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // The softbox rig is less flat than the old ambient-heavy setup; a slightly
    // lower exposure keeps ACES from clipping the key reflection on polished lips.
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    // r186 removed the old PCFSoftShadowMap path; high-resolution PCF with a
    // tuned key light gives the same clean product shadow without a runtime
    // deprecation warning.
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const rawEnvironment = studioEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    this.environment = pmrem.fromEquirectangular(rawEnvironment).texture;
    rawEnvironment.dispose();
    pmrem.dispose();
    this.shadowTexture = contactShadowTexture();
    this.camera.position.set(0, 0, 7);
    this.world.environment = this.environment;
    this.world.add(this.content);
    this.addLights();

    this.annotationLayer = stage.querySelector<HTMLElement>('[data-p3d-annotations]') ?? document.createElement('div');
    this.annotationLayer.classList.add('parametric-3d__annotations');
    this.annotationLayer.setAttribute('aria-hidden', 'true');
    if (!this.annotationLayer.parentElement) stage.append(this.annotationLayer);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(stage);
    this.bindControls();
    this.resize();
  }

  private addLights(): void {
    // Studio rig: two large rectangular softboxes (key + fill) that match the
    // panels baked into the environment map, a low hemisphere bounce instead of
    // flat ambient, a dim rim for edge separation and one shadow caster.
    if (!rectAreaLightsReady) {
      RectAreaLightUniformsLib.init();
      rectAreaLightsReady = true;
    }
    this.world.add(new THREE.HemisphereLight(0xe6f0fa, 0x161b20, 0.5));

    // Key softbox, warm, up-left in front. RectAreaLight intensity is luminance,
    // so irradiance ~= L * area / d^2 = 5.8 * 12.6 / 41 ~= 1.8 on the subject.
    // A big panel at low luminance is what makes the light soft.
    const key = new THREE.RectAreaLight(0xfff1e0, 5.8, 4.2, 3.0);
    key.position.set(...KEY_SOFTBOX_POSITION);
    key.lookAt(0, 0, 0);
    this.world.add(key);

    // Fill softbox, cool, low right; roughly 1:3 fill-to-key ratio.
    const fill = new THREE.RectAreaLight(0xd4e4ff, 3.2, 3.2, 2.4);
    fill.position.set(...FILL_SOFTBOX_POSITION);
    fill.lookAt(0, 0, 0);
    this.world.add(fill);

    // Thin rim from behind: edge highlight only, well below the old 2.35.
    const rim = new THREE.DirectionalLight(0xd6e8f5, 1.2);
    rim.position.set(1.5, 3.2, -5);
    this.world.add(rim);

    // RectAreaLight cannot cast shadows, so a modest directional light sits at
    // the key softbox position purely to keep contact/self shadows (spokes on
    // the rotor, hub on the barrel). A wide PCF radius matches the soft source.
    const keyShadow = new THREE.DirectionalLight(0xfff1e0, 0.85);
    keyShadow.position.set(...KEY_SOFTBOX_POSITION);
    keyShadow.castShadow = true;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    keyShadow.shadow.mapSize.set(lowPower ? 1024 : 1536, lowPower ? 1024 : 1536);
    keyShadow.shadow.camera.near = 0.5;
    keyShadow.shadow.camera.far = 18;
    keyShadow.shadow.camera.left = -4;
    keyShadow.shadow.camera.right = 4;
    keyShadow.shadow.camera.top = 4;
    keyShadow.shadow.camera.bottom = -4;
    keyShadow.shadow.bias = -0.0004;
    keyShadow.shadow.normalBias = 0.018;
    keyShadow.shadow.radius = 3;
    this.world.add(keyShadow);
  }

  private bindControls(): void {
    const signal = this.events.signal;
    this.canvas.addEventListener('pointerdown', (event) => {
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.canvas.setPointerCapture(event.pointerId);
      if (this.pointers.size === 1) this.lastPointer = { x: event.clientX, y: event.clientY };
      if (this.pointers.size === 2) {
        const [first, second] = [...this.pointers.values()];
        if (first && second) this.pinchDistance = Math.hypot(second.x - first.x, second.y - first.y);
        this.lastPointer = null;
      }
    }, { signal });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.pointers.has(event.pointerId)) return;
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this.pointers.size >= 2) {
        const [first, second] = [...this.pointers.values()];
        if (!first || !second) return;
        const distance = Math.hypot(second.x - first.x, second.y - first.y);
        if (this.pinchDistance && this.pinchDistance > 0) this.zoomBy(distance / this.pinchDistance);
        this.pinchDistance = distance;
        return;
      }
      if (!this.lastPointer) this.lastPointer = { x: event.clientX, y: event.clientY };
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.view.yaw += dx * 0.008;
      this.view.pitch = clamp(this.view.pitch + dy * 0.006, -1.15, 1.15);
      this.requestRender();
    }, { signal });
    const release = (event: PointerEvent): void => {
      this.pointers.delete(event.pointerId);
      this.pinchDistance = null;
      const remaining = [...this.pointers.values()][0];
      this.lastPointer = remaining ? { ...remaining } : null;
    };
    this.canvas.addEventListener('pointerup', release, { signal });
    this.canvas.addEventListener('pointercancel', release, { signal });
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.zoomBy(event.deltaY < 0 ? 1.08 : 0.92);
    }, { passive: false, signal });
    this.canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.stage.dispatchEvent(new CustomEvent('p3d:webgl-lost'));
    }, { signal });
  }

  setTheme(background: string, grid: string): void {
    this.renderer.setClearColor(new THREE.Color(background), 1);
    this.world.fog = new THREE.FogExp2(new THREE.Color(background), 0.045);
    this.stage.style.setProperty('--p3d-grid-live', grid);
    this.requestRender();
  }

  setScene(scene: Scene3D): void {
    disposeObject(this.content);
    this.content.clear();
    this.fitRadius = scene.fitRadius ?? 1.5;
    this.annotations = scene.studio ? [] : (scene.annotations ?? []);
    this.annotationObjects = [];
    this.tireScene = scene.products?.some((product) => product.kind === 'tire-wheel') ?? false;
    this.toolStudioScene = Boolean(scene.studio);

    if (scene.studio) {
      this.content.add(createToolStudioProduct(scene.studio));
    } else if (scene.products?.length) {
      for (const product of scene.products) {
        if (product.kind === 'tire-wheel') this.content.add(createTireWheelProduct(product));
        else if (product.kind === 'wheel-offset') this.content.add(createOffsetProduct(product));
        else if (product.kind === 'pcd-plate') this.content.add(createPcdProduct(product));
      }
    }
    if (!scene.studio) {
      for (const source of scene.meshes) {
        if (source.vertices.length === 0 || source.faces.length === 0) continue;
        const mesh = new THREE.Mesh(geometryFromMesh(source), pbrMaterial(source));
        const position = source.position ?? { x: 0, y: 0, z: 0 };
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.content.add(mesh);
      }
    }
    for (const source of scene.studio ? [] : (scene.lines ?? [])) {
      this.content.add(lineObject(source.points, source.color, source.alpha ?? 1, source.closed ?? false, source.dashed ?? false));
    }
    for (const annotation of this.annotations) {
      const guide = lineObject([annotation.start, annotation.end], annotation.color, annotation.alpha ?? 1, false, annotation.dashed ?? false);
      this.content.add(guide);
      this.annotationObjects.push(guide);
      for (const point of [annotation.start, annotation.end]) {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.027, 12, 8),
          new THREE.MeshBasicMaterial({ color: annotation.color, transparent: true, opacity: annotation.alpha ?? 1 }),
        );
        marker.position.copy(vector(point));
        marker.renderOrder = 9;
        this.content.add(marker);
        this.annotationObjects.push(marker);
      }
    }
    for (const shadow of scene.shadows ?? []) {
      // Radial-gradient contact shadow: the plane is wider than the old disc and
      // the texture alpha fades to zero, so the centre reads as dense contact
      // while the edge dissolves (at the old radius it is ~40% of the centre,
      // like the blurred Canvas2D fallback). The centre is slightly denser than
      // the old flat opacity so the object still feels grounded.
      const material = new THREE.MeshBasicMaterial({
        color: shadow.color ?? '#000000',
        map: this.shadowTexture,
        transparent: true,
        opacity: Math.min(1, (shadow.alpha ?? 0.18) * 1.35),
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      plane.position.set(shadow.center.x, shadow.center.y, shadow.center.z);
      plane.rotation.x = -Math.PI / 2;
      plane.scale.set(shadow.radiusX * SHADOW_SPREAD, shadow.radiusZ * SHADOW_SPREAD, 1);
      plane.renderOrder = -1;
      this.content.add(plane);
    }
    this.createLabels();
    this.transitionStarted = this.reducedMotion ? 0 : performance.now();
    this.content.scale.setScalar(this.reducedMotion ? 1 : 0.982);
    this.requestRender();
  }

  private createLabels(): void {
    for (const label of this.labels) label.remove();
    this.labels = [];
    for (const annotation of this.annotations) {
      if (!annotation.label) continue;
      const label = document.createElement('span');
      label.className = 'parametric-3d__callout';
      label.textContent = annotation.label;
      label.style.setProperty('--callout-color', annotation.color);
      this.annotationLayer.append(label);
      this.labels.push(label);
    }
  }

  configureView(view: View3D, applyCurrent = false): void {
    this.defaultView = { ...view };
    if (applyCurrent) this.view = { ...view };
    this.requestRender();
  }

  reset(): void {
    this.view = { ...this.defaultView };
    this.requestRender();
  }

  setView(yaw: number, pitch: number, zoom = this.view.zoom): void {
    this.view = { yaw, pitch: clamp(pitch, -1.15, 1.15), zoom: clamp(zoom, 0.68, 1.85) };
    this.requestRender();
  }

  zoomBy(factor: number): void {
    this.view.zoom = clamp(this.view.zoom * factor, 0.68, 1.85);
    this.requestRender();
  }

  private resize(): void {
    // The measurement rail is in normal flow below the canvas. Camera aspect
    // and drawing buffer must follow the canvas, not the taller stage wrapper.
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  private updateLabels(): void {
    // Diameter/width lines are front-view engineering guides, not physical parts
    // of the wheel. Previously this also hard-hid every label once the user
    // dragged the tire scene past a fixed yaw/pitch threshold, which made the
    // whole measurement HUD vanish — and stay gone — after a completely normal
    // amount of rotating. The per-annotation projected-span/depth checks below
    // already fade a guide out correctly as its line becomes edge-on, so that's
    // the only gate needed; it no longer depends on `this.tireScene`.
    const visible = this.content.visible;
    const occupied: { left: number; right: number; top: number; bottom: number }[] = [];
    const hud = this.stage.querySelector<HTMLElement>('.parametric-3d__hud');
    if (hud) {
      const stageBounds = this.stage.getBoundingClientRect();
      const hudBounds = hud.getBoundingClientRect();
      occupied.push({ left: hudBounds.left - stageBounds.left - 7, right: hudBounds.right - stageBounds.left + 7, top: hudBounds.top - stageBounds.top - 7, bottom: hudBounds.bottom - stageBounds.top + 7 });
    }
    let labelIndex = 0;
    for (let annotationIndex = 0; annotationIndex < this.annotations.length; annotationIndex += 1) {
      const annotation = this.annotations[annotationIndex]!;
      const start = vector(annotation.start);
      const end = vector(annotation.end);
      this.content.localToWorld(start);
      this.content.localToWorld(end);
      start.project(this.camera);
      end.project(this.camera);
      const span = Math.hypot((end.x - start.x) * this.width / 2, (end.y - start.y) * this.height / 2);
      const guideVisible = visible && span >= 24 && start.z > -1 && start.z < 1 && end.z > -1 && end.z < 1;
      for (let part = 0; part < 3; part += 1) {
        const object = this.annotationObjects[annotationIndex * 3 + part];
        if (object) object.visible = guideVisible;
      }
      if (!annotation.label) continue;
      const label = this.labels[labelIndex++];
      if (!label) continue;
      const midpoint = vector(annotation.start).add(vector(annotation.end)).multiplyScalar(0.5);
      this.content.localToWorld(midpoint);
      midpoint.project(this.camera);
      const onScreen = guideVisible && midpoint.z > -1 && midpoint.z < 1 && Math.abs(midpoint.x) < 1.15 && Math.abs(midpoint.y) < 1.15;
      label.hidden = !onScreen;
      if (!onScreen) continue;
      const x = clamp((midpoint.x * 0.5 + 0.5) * this.width + (annotation.labelOffsetX ?? 0), 54, this.width - 54);
      let y = clamp((-midpoint.y * 0.5 + 0.5) * this.height + (annotation.labelOffsetY ?? 0), 22, this.height - 22);
      const halfWidth = Math.max(38, label.offsetWidth / 2);
      const halfHeight = Math.max(12, label.offsetHeight / 2);
      let bounds = { left: x - halfWidth, right: x + halfWidth, top: y - halfHeight, bottom: y + halfHeight };
      for (const prior of occupied) {
        const overlaps = bounds.left < prior.right && bounds.right > prior.left && bounds.top < prior.bottom && bounds.bottom > prior.top;
        if (!overlaps) continue;
        y = clamp(prior.bottom + halfHeight + 8, 22, this.height - 22);
        bounds = { left: x - halfWidth, right: x + halfWidth, top: y - halfHeight, bottom: y + halfHeight };
      }
      occupied.push(bounds);
      label.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    }
  }

  private requestRender(): void {
    if (this.destroyed || this.raf) return;
    this.raf = requestAnimationFrame((time) => this.render(time));
  }

  private render(time: number): void {
    this.raf = 0;
    this.content.rotation.set(this.view.pitch, this.view.yaw, 0);
    const fovRadians = THREE.MathUtils.degToRad(this.camera.fov);
    const fitHeightDistance = this.fitRadius / Math.tan(fovRadians / 2);
    const fitWidthDistance = fitHeightDistance / Math.max(0.62, this.camera.aspect) * (this.toolStudioScene && this.width < 640 ? 1.28 : 1);
    this.camera.position.z = Math.max(fitHeightDistance, fitWidthDistance) / this.view.zoom + 0.9;
    if (this.transitionStarted > 0) {
      const progress = clamp((time - this.transitionStarted) / 190, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.content.scale.setScalar(0.982 + eased * 0.018);
      if (progress < 1) this.requestRender();
      else this.transitionStarted = 0;
    }
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();
    this.content.updateMatrixWorld();
    this.updateLabels();
    this.renderer.render(this.world, this.camera);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.events.abort();
    disposeObject(this.content);
    for (const label of this.labels) label.remove();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.environment.dispose();
    this.shadowTexture.dispose();
  }
}
