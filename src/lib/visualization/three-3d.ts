import * as THREE from 'three';
import type { Annotation3D, Material3D, Mesh3D, Scene3D, Vec3, View3D } from './canvas-3d';

const DEFAULT_VIEW: View3D = { yaw: -0.58, pitch: 0.34, zoom: 1 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function vector(point: Vec3): THREE.Vector3 {
  return new THREE.Vector3(point.x, point.y, point.z);
}

function pbrMaterial(mesh: Mesh3D): THREE.MeshStandardMaterial {
  const source: Material3D = mesh.material ?? {};
  const alpha = mesh.alpha ?? 1;
  const metallic = clamp(source.metallic ?? 0.08, 0, 1);
  const shininess = clamp(source.shininess ?? 18, 1, 64);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(mesh.color),
    emissive: new THREE.Color(mesh.color),
    emissiveIntensity: metallic > 0.35 ? 0.3 : 0.1,
    metalness: metallic,
    roughness: clamp(0.94 - shininess / 88 - metallic * 0.12, 0.18, 0.9),
    transparent: alpha < 0.995,
    opacity: alpha,
    depthWrite: alpha >= 0.72,
    side: THREE.DoubleSide,
  });
  material.envMapIntensity = metallic > 0.35 ? 1.05 : 0.42;
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
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Line)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) material.dispose();
  });
}

export class Three3DRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly world = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(31, 1, 0.05, 100);
  private readonly content = new THREE.Group();
  private readonly annotationLayer: HTMLElement;
  private readonly resizeObserver: ResizeObserver;
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private view = { ...DEFAULT_VIEW };
  private defaultView = { ...DEFAULT_VIEW };
  private fitRadius = 1.5;
  private width = 1;
  private height = 1;
  private pointerId: number | null = null;
  private lastPointer: { x: number; y: number } | null = null;
  private annotations: readonly Annotation3D[] = [];
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
    const rim = new THREE.DirectionalLight(0xffb46a, 2.4);
    rim.position.set(1.5, 3.2, -5);
    this.world.add(rim);
    const front = new THREE.PointLight(0xeaf6ff, 18, 14, 1.35);
    front.position.set(0, 0.8, 5.5);
    this.world.add(front);
  }

  private bindControls(): void {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.pointerId = event.pointerId;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.canvas.setPointerCapture(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (event.pointerId !== this.pointerId || !this.lastPointer) return;
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.view.yaw += dx * 0.008;
      this.view.pitch = clamp(this.view.pitch + dy * 0.006, -1.15, 1.15);
      this.requestRender();
    });
    const release = (event: PointerEvent): void => {
      if (event.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.lastPointer = null;
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.zoomBy(event.deltaY < 0 ? 1.08 : 0.92);
    }, { passive: false });
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
    this.annotations = scene.annotations ?? [];

    for (const source of scene.meshes) {
      if (source.vertices.length === 0 || source.faces.length === 0) continue;
      const mesh = new THREE.Mesh(geometryFromMesh(source), pbrMaterial(source));
      const position = source.position ?? { x: 0, y: 0, z: 0 };
      mesh.position.set(position.x, position.y, position.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.content.add(mesh);
    }
    for (const source of scene.lines ?? []) {
      this.content.add(lineObject(source.points, source.color, source.alpha ?? 1, source.closed ?? false, source.dashed ?? false));
    }
    for (const annotation of this.annotations) {
      this.content.add(lineObject([annotation.start, annotation.end], annotation.color, annotation.alpha ?? 1, false, annotation.dashed ?? false));
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
    const visible = this.content.visible;
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
      const x = (midpoint.x * 0.5 + 0.5) * this.width + (annotation.labelOffsetX ?? 0);
      const y = (-midpoint.y * 0.5 + 0.5) * this.height + (annotation.labelOffsetY ?? 0);
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
    const fitWidthDistance = fitHeightDistance / Math.max(0.62, this.camera.aspect);
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
    this.renderer.render(this.world, this.camera);
    this.updateLabels();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    disposeObject(this.content);
    for (const label of this.labels) label.remove();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
