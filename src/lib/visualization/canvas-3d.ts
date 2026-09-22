export interface Vec3 { readonly x: number; readonly y: number; readonly z: number; }
export interface Face { readonly a: number; readonly b: number; readonly c: number; }
export interface Mesh3D {
  readonly vertices: readonly Vec3[];
  readonly faces: readonly Face[];
  readonly color: string;
  readonly alpha?: number;
  readonly stroke?: string;
  readonly position?: Vec3;
}
export interface Line3D { readonly points: readonly Vec3[]; readonly color: string; readonly width?: number; readonly alpha?: number; readonly closed?: boolean; }
export interface Scene3D { readonly meshes: readonly Mesh3D[]; readonly lines?: readonly Line3D[]; readonly fitRadius?: number; }

const TAU = Math.PI * 2;
const vec = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

export function ellipticalTorus(outerRadius: number, innerRadius: number, width: number, color: string, position: Vec3 = vec(0, 0, 0), alpha = 1): Mesh3D {
  const around = 36;
  const cross = 12;
  const radialTube = Math.max(0.02, (outerRadius - innerRadius) / 2);
  const major = innerRadius + radialTube;
  const axialTube = Math.max(0.03, width / 2);
  const vertices: Vec3[] = [];
  const faces: Face[] = [];
  for (let i = 0; i < around; i += 1) {
    const u = (i / around) * TAU;
    for (let j = 0; j < cross; j += 1) {
      const v = (j / cross) * TAU;
      const radial = major + radialTube * Math.cos(v);
      vertices.push(vec(radial * Math.cos(u), radial * Math.sin(u), axialTube * Math.sin(v)));
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
  return { vertices, faces, color, alpha, position };
}

export function annulusCylinder(outerRadius: number, innerRadius: number, depth: number, color: string, position: Vec3 = vec(0, 0, 0), alpha = 1): Mesh3D {
  const segments = 36;
  const vertices: Vec3[] = [];
  const faces: Face[] = [];
  const half = depth / 2;
  for (const z of [-half, half]) {
    for (let i = 0; i < segments; i += 1) {
      const a = (i / segments) * TAU;
      vertices.push(vec(Math.cos(a) * outerRadius, Math.sin(a) * outerRadius, z));
      vertices.push(vec(Math.cos(a) * innerRadius, Math.sin(a) * innerRadius, z));
    }
  }
  const front = 0;
  const back = segments * 2;
  for (let i = 0; i < segments; i += 1) {
    const n = (i + 1) % segments;
    const fo = front + i * 2, fi = fo + 1, no = front + n * 2, ni = no + 1;
    const bo = back + i * 2, bi = bo + 1, bno = back + n * 2, bni = bno + 1;
    faces.push({ a: fo, b: no, c: ni }, { a: fo, b: ni, c: fi });
    faces.push({ a: bo, b: bi, c: bni }, { a: bo, b: bni, c: bno });
    faces.push({ a: fo, b: bo, c: bno }, { a: fo, b: bno, c: no });
    faces.push({ a: fi, b: ni, c: bni }, { a: fi, b: bni, c: bi });
  }
  return { vertices, faces, color, alpha, position };
}

export function cylinder(radius: number, depth: number, color: string, position: Vec3, alpha = 1): Mesh3D {
  return annulusCylinder(radius, 0.001, depth, color, position, alpha);
}

export function plane(width: number, height: number, color: string, z = 0, alpha = 0.18): Mesh3D {
  const w = width / 2, h = height / 2;
  return {
    vertices: [vec(-w, -h, z), vec(w, -h, z), vec(w, h, z), vec(-w, h, z)],
    faces: [{ a: 0, b: 1, c: 2 }, { a: 0, b: 2, c: 3 }],
    color,
    alpha,
  };
}

export function circleLine(radius: number, color: string, z = 0, segments = 64): Line3D {
  return { points: Array.from({ length: segments }, (_, i) => { const a = (i / segments) * TAU; return vec(Math.cos(a) * radius, Math.sin(a) * radius, z); }), color, closed: true };
}

interface ProjectedVertex { x: number; y: number; z: number; world: Vec3; }
interface DrawFace { points: readonly [ProjectedVertex, ProjectedVertex, ProjectedVertex]; depth: number; color: string; alpha: number; stroke?: string; shade: number; }

function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
function rotatePoint(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const y2 = p.y * cp - z1 * sp;
  const z2 = p.y * sp + z1 * cp;
  return vec(x1, y2, z2);
}
function cross(a: Vec3, b: Vec3): Vec3 { return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
function sub(a: Vec3, b: Vec3): Vec3 { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }
function length(v: Vec3): number { return Math.hypot(v.x, v.y, v.z) || 1; }
function normalize(v: Vec3): Vec3 { const l = length(v); return vec(v.x / l, v.y / l, v.z / l); }
function dot(a: Vec3, b: Vec3): number { return a.x * b.x + a.y * b.y + a.z * b.z; }

function hexToRgb(color: string): [number, number, number] {
  const value = color.trim();
  const match = /^#([\da-f]{6})$/i.exec(value);
  if (!match) return [110, 130, 145];
  const n = Number.parseInt(match[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shaded(color: string, shade: number): string {
  const [r, g, b] = hexToRgb(color);
  const f = clamp(shade, 0.25, 1.2);
  return `rgb(${Math.round(clamp(r * f, 0, 255))} ${Math.round(clamp(g * f, 0, 255))} ${Math.round(clamp(b * f, 0, 255))})`;
}

export class Canvas3DRenderer {
  private readonly context: CanvasRenderingContext2D;
  private scene: Scene3D = { meshes: [] };
  private yaw = -0.58;
  private pitch = 0.34;
  private zoom = 1;
  private readonly defaultYaw = -0.58;
  private readonly defaultPitch = 0.34;
  private readonly defaultZoom = 1;
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

  setTheme(background: string, grid: string): void { this.background = background || '#0a141d'; this.grid = grid || '#2c4150'; this.requestRender(); }
  setScene(scene: Scene3D): void { this.scene = scene; this.requestRender(); }
  setView(yaw: number, pitch: number, zoom = this.zoom): void { this.yaw = yaw; this.pitch = clamp(pitch, -1.15, 1.15); this.zoom = clamp(zoom, .58, 2.3); this.requestRender(); }
  reset(): void { this.yaw = this.defaultYaw; this.pitch = this.defaultPitch; this.zoom = this.defaultZoom; this.requestRender(); }
  zoomBy(factor: number): void { this.zoom = clamp(this.zoom * factor, .58, 2.3); this.requestRender(); }

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
    this.yaw += dx * .008;
    this.pitch = clamp(this.pitch + dy * .007, -1.15, 1.15);
    this.requestRender();
  };
  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.pointerId === event.pointerId) { this.pointerId = null; this.lastPointer = null; }
  };
  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.zoomBy(event.deltaY > 0 ? .92 : 1.08);
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
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); });
  }

  private project(point: Vec3, scale: number): ProjectedVertex | null {
    const rotated = rotatePoint(point, this.yaw, this.pitch);
    const cameraDistance = 5.2;
    const depth = cameraDistance - rotated.z;
    if (depth <= .2) return null;
    const perspective = (3.25 / depth) * scale * this.zoom;
    return { x: this.width / 2 + rotated.x * perspective, y: this.height / 2 - rotated.y * perspective, z: rotated.z, world: rotated };
  }

  private renderGrid(): void {
    const ctx = this.context;
    ctx.save();
    ctx.strokeStyle = this.grid;
    ctx.globalAlpha = .22;
    ctx.lineWidth = this.dpr;
    const step = Math.max(26 * this.dpr, Math.min(this.width, this.height) / 10);
    for (let x = this.width / 2 % step; x < this.width; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke(); }
    for (let y = this.height / 2 % step; y < this.height; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke(); }
    ctx.restore();
  }

  render(): void {
    const ctx = this.context;
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, this.width, this.height);
    this.renderGrid();
    const fitRadius = Math.max(.5, this.scene.fitRadius ?? 1.6);
    const scale = Math.min(this.width, this.height) * .43 / fitRadius;
    const light = normalize(vec(-.35, .7, 1));
    const faces: DrawFace[] = [];

    for (const mesh of this.scene.meshes) {
      const position = mesh.position ?? vec(0, 0, 0);
      const projected = mesh.vertices.map((vertex) => this.project(vec(vertex.x + position.x, vertex.y + position.y, vertex.z + position.z), scale));
      for (const face of mesh.faces) {
        const a = projected[face.a], b = projected[face.b], c = projected[face.c];
        if (!a || !b || !c) continue;
        const normal = normalize(cross(sub(b.world, a.world), sub(c.world, a.world)));
        const shade = .48 + Math.abs(dot(normal, light)) * .58;
        faces.push({ points: [a, b, c], depth: (a.z + b.z + c.z) / 3, color: mesh.color, alpha: mesh.alpha ?? 1, ...(mesh.stroke ? { stroke: mesh.stroke } : {}), shade });
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
      ctx.fillStyle = shaded(face.color, face.shade);
      ctx.fill();
      if (face.stroke) { ctx.strokeStyle = face.stroke; ctx.lineWidth = .65 * this.dpr; ctx.stroke(); }
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
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
