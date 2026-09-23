import * as THREE from 'three';
import type { Annotation3D, Material3D, Mesh3D, Scene3D, Vec3, View3D } from './canvas-3d';
import { createTireWheelProduct } from './three-product-geometry';
import { createOffsetProduct, createPcdProduct } from './three-engineering-geometry';
import { createToolStudioProduct } from './three-tool-geometry';

const DEFAULT_VIEW: View3D = { yaw: -0.58, pitch: 0.34, zoom: 1 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function vector(point: Vec3): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

function studioEnvironment(): THREE.DataTexture {
  const width = 64;
  const height = 32;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / (width - 1);
      const vertical = 1 - Math.abs(y / (height - 1) - 0.5) * 1.45;
      const keyPanel = Math.exp(-Math.pow((u - 0.2) / 0.11, 2)) * 150;
      const rimPanel = Math.exp(-Math.pow((u - 0.78) / 0.08, 2)) * 95;
      const base = 24 + Math.max(0, vertical) * 42;
      const index = (y * width + x) * 4;
      data[index] = Math.min(255, base + keyPanel + rimPanel * 0.75);
      data[index + 1] = Math.min(255, base + keyPanel + rimPanel * 0.46);
      data[index + 2] = Math.min(255, base + keyPanel * 1.04 + rimPanel);
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
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
  material.envMapIntensity = metallic > 0.35 ? 1.35 : 0.28;
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
  private readonly environment = studioEnvironment();
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
    this.renderer.toneMappingExposure = 1.28;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
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
    this.world.add(new THREE.AmbientLight(0xffffff, 1.15));
    this.world.add(new THREE.HemisphereLight(0xdceeff, 0x10202a, 1.55));
    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(-3.8, 5.4, 6.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    this.world.add(key);
    const fill = new THREE.DirectionalLight(0x65bfff, 1.9);
    fill.position.set(5, 1.2, 4);
    this.world.add(fill);
    const rim = new THREE.DirectionalLight(0xc6e1f2, 1.75);
    rim.position.set(1.5, 3.2, -5);
    this.world.add(rim);
    const front = new THREE.PointLight(0xeaf6ff, 18, 14, 1.35);
    front.position.set(0, 0.8, 5.5);
    this.world.add(front);
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
      const material = new THREE.MeshBasicMaterial({ color: shadow.color ?? '#000000', transparent: true, opacity: shadow.alpha ?? 0.18, depthWrite: false, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(new THREE.CircleGeometry(1, 64), material);
      plane.position.set(shadow.center.x, shadow.center.y, shadow.center.z);
      plane.rotation.x = -Math.PI / 2;
      plane.scale.set(shadow.radiusX, shadow.radiusZ, 1);
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

  zoomBy(factor: number): void {
    this.view.zoom = clamp(this.view.zoom * factor, 0.68, 1.85);
    this.requestRender();
  }

  private resize(): void {
    const rect = this.stage.getBoundingClientRect();
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
    // of the wheel. At oblique angles they no longer describe a projected span.
    const visible = this.content.visible && (!this.tireScene || (Math.abs(this.view.yaw) < 1.05 && Math.abs(this.view.pitch) < 0.58));
    for (const object of this.annotationObjects) object.visible = visible;
    const occupied: { left: number; right: number; top: number; bottom: number }[] = [];
    const hud = this.stage.querySelector<HTMLElement>('.parametric-3d__hud');
    if (hud) {
      const stageBounds = this.stage.getBoundingClientRect();
      const hudBounds = hud.getBoundingClientRect();
      occupied.push({ left: hudBounds.left - stageBounds.left - 7, right: hudBounds.right - stageBounds.left + 7, top: hudBounds.top - stageBounds.top - 7, bottom: hudBounds.bottom - stageBounds.top + 7 });
    }
    let index = 0;
    for (const annotation of this.annotations) {
      if (!annotation.label) continue;
      const label = this.labels[index++];
      if (!label) continue;
      const midpoint = vector(annotation.start).add(vector(annotation.end)).multiplyScalar(0.5);
      this.content.localToWorld(midpoint);
      midpoint.project(this.camera);
      const onScreen = visible && midpoint.z > -1 && midpoint.z < 1 && Math.abs(midpoint.x) < 1.15 && Math.abs(midpoint.y) < 1.15;
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
  }
}
