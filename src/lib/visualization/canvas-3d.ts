export interface Vec3 { readonly x: number; readonly y: number; readonly z: number; }
export interface Face { readonly a: number; readonly b: number; readonly c: number; }
export interface Material3D {
  readonly ambient?: number;
  readonly diffuse?: number;
  readonly specular?: number;
  readonly shininess?: number;
  readonly metallic?: number;
  readonly rim?: number;
}
export interface Mesh3D {
  readonly vertices: readonly Vec3[];
  readonly faces: readonly Face[];
  readonly color: string;
  readonly alpha?: number;
  readonly stroke?: string;
  readonly position?: Vec3;
  readonly material?: Material3D;
}
export interface Line3D {
  readonly points: readonly Vec3[];
  readonly color: string;
  readonly width?: number;
  readonly alpha?: number;
  readonly closed?: boolean;
  readonly dashed?: boolean;
}
export interface Annotation3D {
  readonly start: Vec3;
  readonly end: Vec3;
  readonly color: string;
  readonly label?: string;
  readonly alpha?: number;
  readonly labelOffsetX?: number;
  readonly labelOffsetY?: number;
  readonly dashed?: boolean;
}
export interface Shadow3D {
  readonly center: Vec3;
  readonly radiusX: number;
  readonly radiusZ: number;
  readonly color?: string;
  readonly alpha?: number;
}
export interface View3D { readonly yaw: number; readonly pitch: number; readonly zoom: number; }
export interface Scene3D {
  readonly meshes: readonly Mesh3D[];
  readonly lines?: readonly Line3D[];
  readonly annotations?: readonly Annotation3D[];
  readonly shadows?: readonly Shadow3D[];
  readonly fitRadius?: number;
}

export interface ProfilePoint { readonly radius: number; readonly z: number; }

const TAU = Math.PI * 2;
const vec = (x: number, y: number, z: number): Vec3 => ({ x, y, z });
const DEFAULT_MATERIAL: Readonly<Required<Material3D>> = Object.freeze({ ambient: 0.34, diffuse: 0.72, specular: 0.18, shininess: 18, metallic: 0, rim: 0.08 });

function mesh3d(base: { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; stroke?: string; position?: Vec3; material?: Material3D }): Mesh3D {
  const mesh: { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; stroke?: string; position?: Vec3; material?: Material3D } = { vertices: base.vertices, faces: base.faces, color: base.color };
  if (base.alpha !== undefined) mesh.alpha = base.alpha;
  if (base.stroke !== undefined) mesh.stroke = base.stroke;
  if (base.position !== undefined) mesh.position = base.position;
  if (base.material !== undefined) mesh.material = base.material;
  return mesh;
}

export function ellipticalTorus(outerRadius: number, innerRadius: number, width: number, color: string, position: Vec3 = vec(0, 0, 0), alpha = 1): Mesh3D {
  const around = 48;
  const cross = 18;
  const radialTube = Math.max(0.02, (outerRadius - innerRadius) / 2);
  const major = innerRadius + radialTube;
  const axialTube = Math.max(0.03, width / 2);
  const vertices: Vec3[] = [];
  const faces: Face[] = [];
  for (let i = 0; i < around; i += 1) {
    const u = (i / around) * TAU;
    for (let j = 0; j < cross; j += 1) {
      const vAngle = (j / cross) * TAU;
      const radial = major + radialTube * Math.cos(vAngle);
      vertices.push(vec(radial * Math.cos(u), radial * Math.sin(u), axialTube * Math.sin(vAngle)));
    }
  }
  for (let i = 0; i < around; i += 1) {
    for (let j = 0; j < cross; j += 1) {
      const nextI = (i + 1) % around;
      const nextJ = (j + 1) % cross;
      const a = i * cross + j;
      const b = nextI * cross + j;
      const c = nextI * cross + nextJ;
      const d = i * cross + nextJ;
      faces.push({ a, b, c }, { a, b: c, c: d });
    }
  }
  return mesh3d({ vertices, faces, color, alpha, position, material: { ambient: 0.28, diffuse: 0.8, specular: 0.12, shininess: 10, metallic: 0.04, rim: 0.12 } });
}

export function revolveProfile(profile: readonly ProfilePoint[], color: string, position: Vec3 = vec(0, 0, 0), alpha = 1, radialSegments = 56, material?: Material3D): Mesh3D {
  const clean = profile.filter((point) => Number.isFinite(point.radius) && Number.isFinite(point.z) && point.radius >= 0);
  const count = clean.length;
  if (count < 3) {
    const mesh = { vertices: [], faces: [], color, alpha, position } as { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; position?: Vec3; material?: Material3D };
    if (material !== undefined) mesh.material = material;
    return mesh3d(mesh);
  }
  const vertices: Vec3[] = [];
  const faces: Face[] = [];
  for (let ring = 0; ring < radialSegments; ring += 1) {
    const angle = (ring / radialSegments) * TAU;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (const point of clean) vertices.push(vec(point.radius * cos, point.radius * sin, point.z));
  }
  for (let ring = 0; ring < radialSegments; ring += 1) {
    const nextRing = (ring + 1) % radialSegments;
    for (let index = 0; index < count; index += 1) {
      const nextIndex = (index + 1) % count;
      const a = ring * count + index;
      const b = nextRing * count + index;
      const c = nextRing * count + nextIndex;
      const d = ring * count + nextIndex;
      faces.push({ a, b, c }, { a, b: c, c: d });
    }
  }
  {
    const mesh = { vertices, faces, color, alpha, position } as { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; position?: Vec3; material?: Material3D };
    if (material !== undefined) mesh.material = material;
    return mesh3d(mesh);
  }
}

export function annulusCylinder(outerRadius: number, innerRadius: number, depth: number, color: string, position: Vec3 = vec(0, 0, 0), alpha = 1, material?: Material3D): Mesh3D {
  const segments = 56;
  const vertices: Vec3[] = [];
  const faces: Face[] = [];
  const half = depth / 2;
  for (const z of [-half, half]) {
    for (let i = 0; i < segments; i += 1) {
      const angle = (i / segments) * TAU;
      vertices.push(vec(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius, z));
      vertices.push(vec(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, z));
    }
  }
  const front = 0;
  const back = segments * 2;
  for (let i = 0; i < segments; i += 1) {
    const next = (i + 1) % segments;
    const fo = front + i * 2, fi = fo + 1, no = front + next * 2, ni = no + 1;
    const bo = back + i * 2, bi = bo + 1, bno = back + next * 2, bni = bno + 1;
    faces.push({ a: fo, b: no, c: ni }, { a: fo, b: ni, c: fi });
    faces.push({ a: bo, b: bi, c: bni }, { a: bo, b: bni, c: bno });
    faces.push({ a: fo, b: bo, c: bno }, { a: fo, b: bno, c: no });
    faces.push({ a: fi, b: ni, c: bni }, { a: fi, b: bni, c: bi });
  }
  {
    const mesh = { vertices, faces, color, alpha, position } as { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; position?: Vec3; material?: Material3D };
    if (material !== undefined) mesh.material = material;
    return mesh3d(mesh);
  }
}

export function cylinder(radius: number, depth: number, color: string, position: Vec3, alpha = 1, material?: Material3D): Mesh3D {
  return annulusCylinder(radius, 0.001, depth, color, position, alpha, material);
}

export function plane(width: number, height: number, color: string, z = 0, alpha = 0.18, material?: Material3D): Mesh3D {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const mesh = {
    vertices: [vec(-halfWidth, -halfHeight, z), vec(halfWidth, -halfHeight, z), vec(halfWidth, halfHeight, z), vec(-halfWidth, halfHeight, z)],
    faces: [{ a: 0, b: 1, c: 2 }, { a: 0, b: 2, c: 3 }],
    color,
    alpha,
  } as { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; material?: Material3D };
  if (material !== undefined) mesh.material = material;
  return mesh3d(mesh);
}

export function box(width: number, height: number, depth: number, color: string, position: Vec3 = vec(0, 0, 0), alpha = 1, rotationZ = 0, material?: Material3D): Mesh3D {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  const cos = Math.cos(rotationZ);
  const sin = Math.sin(rotationZ);
  const rotate = (x: number, y: number): Vec3 => vec(x * cos - y * sin, x * sin + y * cos, 0);
  const corners = [
    rotate(-halfWidth, -halfHeight), rotate(halfWidth, -halfHeight), rotate(halfWidth, halfHeight), rotate(-halfWidth, halfHeight),
  ];
  const vertices: Vec3[] = [
    vec(corners[0]!.x, corners[0]!.y, -halfDepth), vec(corners[1]!.x, corners[1]!.y, -halfDepth), vec(corners[2]!.x, corners[2]!.y, -halfDepth), vec(corners[3]!.x, corners[3]!.y, -halfDepth),
    vec(corners[0]!.x, corners[0]!.y, halfDepth), vec(corners[1]!.x, corners[1]!.y, halfDepth), vec(corners[2]!.x, corners[2]!.y, halfDepth), vec(corners[3]!.x, corners[3]!.y, halfDepth),
  ];
  const faces: Face[] = [
    { a: 0, b: 1, c: 2 }, { a: 0, b: 2, c: 3 },
    { a: 4, b: 6, c: 5 }, { a: 4, b: 7, c: 6 },
    { a: 0, b: 4, c: 5 }, { a: 0, b: 5, c: 1 },
    { a: 1, b: 5, c: 6 }, { a: 1, b: 6, c: 2 },
    { a: 2, b: 6, c: 7 }, { a: 2, b: 7, c: 3 },
    { a: 3, b: 7, c: 4 }, { a: 3, b: 4, c: 0 },
  ];
  {
    const mesh = { vertices, faces, color, alpha, position } as { vertices: readonly Vec3[]; faces: readonly Face[]; color: string; alpha?: number; position?: Vec3; material?: Material3D };
    if (material !== undefined) mesh.material = material;
    return mesh3d(mesh);
  }
}

export function circleLine(radius: number, color: string, z = 0, segments = 72): Line3D {
  return {
    points: Array.from({ length: segments }, (_, index) => {
      const angle = (index / segments) * TAU;
      return vec(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
    }),
    color,
    closed: true,
  };
}

interface ProjectedVertex { readonly x: number; readonly y: number; readonly z: number; readonly world: Vec3; }
interface DrawFace {
  readonly points: readonly [ProjectedVertex, ProjectedVertex, ProjectedVertex];
  readonly depth: number;
  readonly color: string;
  readonly alpha: number;
  readonly stroke?: string;
  readonly material: Required<Material3D>;
  readonly normal: Vec3;
  readonly centroid: Vec3;
}

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
function rotatePoint(point: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = point.x * cy + point.z * sy;
  const z1 = -point.x * sy + point.z * cy;
  const y2 = point.y * cp - z1 * sp;
  const z2 = point.y * sp + z1 * cp;
  return vec(x1, y2, z2);
}
function add(a: Vec3, b: Vec3): Vec3 { return vec(a.x + b.x, a.y + b.y, a.z + b.z); }
function sub(a: Vec3, b: Vec3): Vec3 { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }
function cross(a: Vec3, b: Vec3): Vec3 { return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
function length(v: Vec3): number { return Math.hypot(v.x, v.y, v.z) || 1; }
function normalize(v: Vec3): Vec3 { const l = length(v); return vec(v.x / l, v.y / l, v.z / l); }
function dot(a: Vec3, b: Vec3): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
function average(a: Vec3, b: Vec3, c: Vec3): Vec3 { return vec((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3); }

function hexToRgb(color: string): [number, number, number] {
  const value = color.trim();
  const hex = /^#([\da-f]{6})$/i.exec(value);
  if (hex) {
    const parsed = Number.parseInt(hex[1]!, 16);
    return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
  }
  const rgb = /^rgb\((\d+)\s+(\d+)\s+(\d+)\)$/i.exec(value);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return [110, 130, 145];
}
function mixChannel(a: number, b: number, t: number): number { return Math.round(a + (b - a) * t); }
function rgbToString(r: number, g: number, b: number): string { return `rgb(${Math.round(clamp(r, 0, 255))} ${Math.round(clamp(g, 0, 255))} ${Math.round(clamp(b, 0, 255))})`; }
function lighten(color: string, amount: number): string {
  const [r, g, b] = hexToRgb(color);
  return rgbToString(mixChannel(r, 255, amount), mixChannel(g, 255, amount), mixChannel(b, 255, amount));
}
function darken(color: string, amount: number): string {
  const [r, g, b] = hexToRgb(color);
  return rgbToString(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}
function resolvedMaterial(material?: Material3D): Required<Material3D> {
  return {
    ambient: material?.ambient ?? DEFAULT_MATERIAL.ambient,
    diffuse: material?.diffuse ?? DEFAULT_MATERIAL.diffuse,
    specular: material?.specular ?? DEFAULT_MATERIAL.specular,
    shininess: material?.shininess ?? DEFAULT_MATERIAL.shininess,
    metallic: material?.metallic ?? DEFAULT_MATERIAL.metallic,
    rim: material?.rim ?? DEFAULT_MATERIAL.rim,
  };
}

export class Canvas3DRenderer {
  private readonly context: CanvasRenderingContext2D;
  private scene: Scene3D = { meshes: [] };
  private yaw = -0.58;
  private pitch = 0.34;
  private zoom = 1;
  private defaultYaw = -0.58;
  private defaultPitch = 0.34;
  private defaultZoom = 1;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private resizeObserver: ResizeObserver | null = null;
  private pointerId: number | null = null;
  private lastPointer: { x: number; y: number } | null = null;
  private raf = 0;
  private destroyed = false;
  private background = '#0a141d';
  private grid = '#2c4150';

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas 2D is unavailable.');
    this.context = context;
    this.canvas.style.touchAction = 'none';
    this.bind();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  setTheme(background: string, grid: string): void {
    this.background = background || '#0a141d';
    this.grid = grid || '#2c4150';
    this.requestRender();
  }
  setScene(scene: Scene3D): void {
    this.scene = scene;
    this.requestRender();
  }
  configureView(view: View3D, applyCurrent = false): void {
    this.defaultYaw = view.yaw;
    this.defaultPitch = clamp(view.pitch, -1.15, 1.15);
    this.defaultZoom = clamp(view.zoom, 0.58, 2.3);
    if (applyCurrent) {
      this.yaw = this.defaultYaw;
      this.pitch = this.defaultPitch;
      this.zoom = this.defaultZoom;
      this.requestRender();
    }
  }
  setView(yaw: number, pitch: number, zoom = this.zoom): void {
    this.yaw = yaw;
    this.pitch = clamp(pitch, -1.15, 1.15);
    this.zoom = clamp(zoom, 0.58, 2.3);
    this.requestRender();
  }
  reset(): void {
    this.yaw = this.defaultYaw;
    this.pitch = this.defaultPitch;
    this.zoom = this.defaultZoom;
    this.requestRender();
  }
  zoomBy(factor: number): void {
    this.zoom = clamp(this.zoom * factor, 0.58, 2.3);
    this.requestRender();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.pointerId = event.pointerId;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.canvas.setPointerCapture(event.pointerId);
  };
  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId || !this.lastPointer) return;
    const dx = event.clientX - this.lastPointer.x;
    const dy = event.clientY - this.lastPointer.y;
    this.lastPointer = { x: event.clientX, y: event.clientY };
    this.yaw += dx * 0.008;
    this.pitch = clamp(this.pitch + dy * 0.007, -1.15, 1.15);
    this.requestRender();
  };
  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.pointerId === event.pointerId) {
      this.pointerId = null;
      this.lastPointer = null;
    }
  };
  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.zoomBy(event.deltaY > 0 ? 0.92 : 1.08);
  };

  private bind(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (width === this.canvas.width && height === this.canvas.height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.requestRender();
  }

  private requestRender(): void {
    if (this.destroyed || this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.render();
    });
  }

  private project(point: Vec3, scale: number): ProjectedVertex | null {
    const rotated = rotatePoint(point, this.yaw, this.pitch);
    const cameraDistance = 5.2;
    const depth = cameraDistance - rotated.z;
    if (depth <= 0.2) return null;
    const perspective = (3.25 / depth) * scale * this.zoom;
    return { x: this.width / 2 + rotated.x * perspective, y: this.height / 2 - rotated.y * perspective, z: rotated.z, world: rotated };
  }

  private renderBackdrop(): void {
    const ctx = this.context;
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, lighten(this.background, 0.12));
    gradient.addColorStop(0.48, this.background);
    gradient.addColorStop(1, darken(this.background, 0.12));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const glow = ctx.createRadialGradient(this.width * 0.5, this.height * 0.16, this.width * 0.03, this.width * 0.5, this.height * 0.16, this.width * 0.65);
    glow.addColorStop(0, 'rgb(255 255 255 / 0.13)');
    glow.addColorStop(1, 'rgb(255 255 255 / 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);

    const vignette = ctx.createRadialGradient(this.width * 0.5, this.height * 0.5, this.width * 0.08, this.width * 0.5, this.height * 0.55, this.width * 0.8);
    vignette.addColorStop(0, 'rgb(0 0 0 / 0)');
    vignette.addColorStop(1, 'rgb(0 0 0 / 0.28)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  private renderGrid(): void {
    const ctx = this.context;
    ctx.save();
    ctx.strokeStyle = this.grid;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = this.dpr;
    const horizonY = this.height * 0.63;
    const step = Math.max(28 * this.dpr, Math.min(this.width, this.height) / 11);
    for (let x = this.width / 2 % step; x < this.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.lineTo((x - this.width / 2) * 1.22 + this.width / 2, this.height);
      ctx.stroke();
    }
    for (let line = 0; line < 8; line += 1) {
      const t = line / 7;
      const y = horizonY + (this.height - horizonY) * t * t;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderShadows(scale: number): void {
    const ctx = this.context;
    for (const shadow of this.scene.shadows ?? []) {
      const points: ProjectedVertex[] = [];
      for (let step = 0; step < 40; step += 1) {
        const angle = (step / 40) * TAU;
        const point = this.project(vec(
          shadow.center.x + Math.cos(angle) * shadow.radiusX,
          shadow.center.y,
          shadow.center.z + Math.sin(angle) * shadow.radiusZ,
        ), scale);
        if (point) points.push(point);
      }
      if (points.length < 3) continue;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(points[0]!.x, points[0]!.y);
      for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index]!.x, points[index]!.y);
      ctx.closePath();
      ctx.fillStyle = shadow.color ?? 'rgb(0 0 0 / 1)';
      ctx.filter = `blur(${8 * this.dpr}px)`;
      ctx.globalAlpha = shadow.alpha ?? 0.18;
      ctx.fill();
      ctx.restore();
    }
  }

  private faceColor(face: DrawFace): string {
    const lightKey = normalize(vec(-0.55, 0.92, 1.0));
    const lightFill = normalize(vec(0.8, 0.2, 0.55));
    const lightRim = normalize(vec(0.25, -0.35, -1));
    const viewDir = normalize(vec(-face.centroid.x, -face.centroid.y, 4.8 - face.centroid.z));
    const halfVector = normalize(add(lightKey, viewDir));
    const diffuse = Math.max(0, dot(face.normal, lightKey)) * 0.76 + Math.max(0, dot(face.normal, lightFill)) * 0.18;
    const rim = Math.pow(Math.max(0, 1 - Math.max(0, dot(face.normal, viewDir))), 1.7) * face.material.rim;
    const back = Math.max(0, dot(face.normal, lightRim)) * 0.08;
    const specular = Math.pow(Math.max(0, dot(face.normal, halfVector)), face.material.shininess) * face.material.specular * (1.08 - face.material.metallic * 0.2);
    const shade = clamp(face.material.ambient + diffuse * face.material.diffuse + rim + back + specular, 0.12, 1.45);
    const [r, g, b] = hexToRgb(face.color);
    const metallicLift = face.material.metallic * 28;
    return rgbToString(r * shade + metallicLift, g * shade + metallicLift, b * shade + metallicLift);
  }

  private renderAnnotations(scale: number): void {
    const ctx = this.context;
    for (const annotation of this.scene.annotations ?? []) {
      const start = this.project(annotation.start, scale);
      const end = this.project(annotation.end, scale);
      if (!start || !end) continue;
      ctx.save();
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.globalAlpha = annotation.alpha ?? 0.95;
      ctx.lineWidth = 1.3 * this.dpr;
      if (annotation.dashed) ctx.setLineDash([5 * this.dpr, 4 * this.dpr]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const drawArrow = (from: ProjectedVertex, to: ProjectedVertex): void => {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const size = 6.5 * this.dpr;
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - Math.cos(angle - Math.PI / 6) * size, to.y - Math.sin(angle - Math.PI / 6) * size);
        ctx.lineTo(to.x - Math.cos(angle + Math.PI / 6) * size, to.y - Math.sin(angle + Math.PI / 6) * size);
        ctx.closePath();
        ctx.fill();
      };
      drawArrow(end, start);
      drawArrow(start, end);

      if (annotation.label) {
        const midX = (start.x + end.x) / 2 + (annotation.labelOffsetX ?? 0) * this.dpr;
        const midY = (start.y + end.y) / 2 + (annotation.labelOffsetY ?? -12) * this.dpr;
        ctx.font = `${700 * this.dpr / this.dpr} 12px ui-monospace, SFMono-Regular, Menlo, monospace`;
        const metrics = ctx.measureText(annotation.label);
        const padX = 7 * this.dpr;
        const padY = 5 * this.dpr;
        const width = metrics.width + padX * 2;
        const height = 18 * this.dpr;
        ctx.fillStyle = 'rgb(6 12 18 / 0.76)';
        ctx.globalAlpha = 0.92;
        const x = midX - width / 2;
        const y = midY - height / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 999);
        ctx.fill();
        ctx.strokeStyle = 'rgb(255 255 255 / 0.12)';
        ctx.lineWidth = this.dpr;
        ctx.stroke();
        ctx.fillStyle = annotation.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 1;
        ctx.fillText(annotation.label, midX, midY + 0.5 * this.dpr);
      }
      ctx.restore();
    }
  }

  render(): void {
    const ctx = this.context;
    this.renderBackdrop();
    this.renderGrid();
    const fitRadius = Math.max(0.5, this.scene.fitRadius ?? 1.6);
    const scale = Math.min(this.width, this.height) * 0.43 / fitRadius;
    this.renderShadows(scale);
    const faces: DrawFace[] = [];

    for (const mesh of this.scene.meshes) {
      const position = mesh.position ?? vec(0, 0, 0);
      const projected = mesh.vertices.map((vertex) => this.project(vec(vertex.x + position.x, vertex.y + position.y, vertex.z + position.z), scale));
      for (const face of mesh.faces) {
        const a = projected[face.a], b = projected[face.b], c = projected[face.c];
        if (!a || !b || !c) continue;
        const normal = normalize(cross(sub(b.world, a.world), sub(c.world, a.world)));
        const centroid = average(a.world, b.world, c.world);
        const drawFace: { points: readonly [ProjectedVertex, ProjectedVertex, ProjectedVertex]; depth: number; color: string; alpha: number; stroke?: string; material: Required<Material3D>; normal: Vec3; centroid: Vec3 } = {
          points: [a, b, c],
          depth: (a.z + b.z + c.z) / 3,
          color: mesh.color,
          alpha: mesh.alpha ?? 1,
          material: resolvedMaterial(mesh.material),
          normal,
          centroid,
        };
        if (mesh.stroke !== undefined) drawFace.stroke = mesh.stroke;
        faces.push(drawFace);
      }
    }

    faces.sort((a, b) => a.depth - b.depth);
    for (const face of faces) {
      ctx.beginPath();
      ctx.moveTo(face.points[0].x, face.points[0].y);
      ctx.lineTo(face.points[1].x, face.points[1].y);
      ctx.lineTo(face.points[2].x, face.points[2].y);
      ctx.closePath();
      ctx.globalAlpha = face.alpha;
      ctx.fillStyle = this.faceColor(face);
      ctx.fill();
      ctx.strokeStyle = face.stroke ?? 'rgb(255 255 255 / 0.035)';
      ctx.lineWidth = 0.8 * this.dpr;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const line of this.scene.lines ?? []) {
      const points = line.points.map((point) => this.project(point, scale)).filter((point): point is ProjectedVertex => point !== null);
      if (points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(points[0]!.x, points[0]!.y);
      for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index]!.x, points[index]!.y);
      if (line.closed) ctx.closePath();
      ctx.strokeStyle = line.color;
      ctx.globalAlpha = line.alpha ?? 1;
      ctx.lineWidth = (line.width ?? 1.5) * this.dpr;
      if (line.dashed) ctx.setLineDash([5 * this.dpr, 4 * this.dpr]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
    this.renderAnnotations(scale);
  }
}
