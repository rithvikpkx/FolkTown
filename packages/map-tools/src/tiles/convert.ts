// pnpm map:tiles:convert : glb tiles (ECEF) -> one glb in the campus frame (x east, y up, z south).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import { Document, NodeIO, type Primitive } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, unpartition } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptDecoder } from 'meshoptimizer';
import { pointInRing } from '../geo.ts';
import type { Campus } from '../types.ts';
import { parseArgs, REPO } from './env.ts';
import { applyPoint, type Bbox, enu, type Mat4, MVP_BBOX, mat4Mul, zoneBbox, type V3 } from './math.ts';

// glTF is Y-up, 3D Tiles are Z-up: (x, y, z) -> (x, -z, y)
const Y2Z: Mat4 = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1];
const translation = (t: V3): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1];

/** Pure: ECEF point -> campus frame. Bell Tower origin (height 0) maps to [0,0,0]. */
export const ecefToLocal = (p: V3): V3 => enu.toLocal(p);

export function rtcCenter(glb: Buffer): V3 | undefined {
  const len = glb.readUInt32LE(12);
  return JSON.parse(glb.subarray(20, 20 + len).toString('utf8')).extensions?.CESIUM_RTC?.center;
}

async function makeIo() {
  return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'meshopt.decoder': MeshoptDecoder,
  });
}

const tris = (p: Primitive) =>
  p.getMode() === 4
    ? (p.getIndices()?.getCount() ?? p.getAttribute('POSITION')?.getCount() ?? 0) / 3
    : 0;

/** Bake every mesh node of `doc` into the campus frame (no shift). Returns triangle list for rasterising. */
export function bakeToLocal(
  doc: Document,
  tile: Mat4,
  rtc: V3 | undefined,
  sink?: Float32Array[],
): number {
  const root = doc.getRoot();
  const buffer = root.listBuffers()[0] ?? doc.createBuffer();
  const scene = root.listScenes()[0] ?? doc.createScene();
  const top = rtc ? mat4Mul(tile, translation(rtc)) : tile;
  let n = 0;
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const C = mat4Mul(mat4Mul(top, Y2Z), node.getWorldMatrix() as number[]);
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const cnt = pos.getCount();
      const out = new Float32Array(cnt * 3);
      const v: V3 = [0, 0, 0];
      for (let i = 0; i < cnt; i++) {
        pos.getElement(i, v);
        const l = ecefToLocal(applyPoint(C, v));
        out.set(l, i * 3);
      }
      prim.setAttribute(
        'POSITION',
        doc.createAccessor().setType('VEC3').setArray(out).setBuffer(buffer),
      );
      const nor = prim.getAttribute('NORMAL');
      if (nor) {
        const o = new Float32Array(nor.getCount() * 3);
        const nv: V3 = [0, 0, 0];
        const { e, n: nn, u } = enu.rot;
        for (let i = 0; i < nor.getCount(); i++) {
          nor.getElement(i, nv);
          const d: V3 = [
            (C[0] as number) * nv[0] + (C[4] as number) * nv[1] + (C[8] as number) * nv[2],
            (C[1] as number) * nv[0] + (C[5] as number) * nv[1] + (C[9] as number) * nv[2],
            (C[2] as number) * nv[0] + (C[6] as number) * nv[1] + (C[10] as number) * nv[2],
          ];
          const dot = (a: V3) => a[0] * d[0] + a[1] * d[1] + a[2] * d[2];
          const q = [dot(e), dot(u), -dot(nn)];
          const m = Math.hypot(q[0] as number, q[1] as number, q[2] as number) || 1;
          o.set([(q[0] as number) / m, (q[1] as number) / m, (q[2] as number) / m], i * 3);
        }
        prim.setAttribute(
          'NORMAL',
          doc.createAccessor().setType('VEC3').setArray(o).setBuffer(buffer),
        );
      }
      n += tris(prim);
      if (sink && prim.getMode() === 4) {
        const idx = prim.getIndices();
        const t = new Float32Array((idx?.getCount() ?? cnt) * 3);
        for (let i = 0; i < t.length / 3; i++) {
          const k = idx ? (idx.getScalar(i) as number) : i;
          t.set(out.subarray(k * 3, k * 3 + 3), i * 3);
        }
        sink.push(t);
      }
    }
    node.getParentNode()?.removeChild(node);
    node.setMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    scene.addChild(node);
  }
  for (const ext of root.listExtensionsUsed())
    if (/draco|meshopt|quantization/i.test(ext.extensionName)) ext.dispose();
  return n;
}

/** Top-down max-height raster at 1 m cells. NaN where empty. */
export function rasterise(
  sink: Float32Array[],
  b: Bbox,
  shiftY: number,
): { w: number; h: number; z: Float32Array } {
  const w = Math.ceil(b.xmax - b.xmin);
  const h = Math.ceil(b.zmax - b.zmin);
  const z = new Float32Array(w * h).fill(Number.NaN);
  const put = (x: number, zz: number, y: number) => {
    const cx = Math.floor(x - b.xmin);
    const cz = Math.floor(zz - b.zmin);
    if (cx < 0 || cz < 0 || cx >= w || cz >= h) return;
    const i = cz * w + cx;
    if (!((z[i] as number) >= y)) z[i] = y;
  };
  for (const t of sink)
    for (let i = 0; i < t.length; i += 9) {
      const [ax, ay, az, bx, by, bz, cx, cy, cz] = Array.from(t.subarray(i, i + 9)) as [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ];
      const x0 = Math.min(ax, bx, cx),
        x1 = Math.max(ax, bx, cx);
      const z0 = Math.min(az, bz, cz),
        z1 = Math.max(az, bz, cz);
      if (x1 < b.xmin || x0 > b.xmax || z1 < b.zmin || z0 > b.zmax) continue;
      put((ax + bx + cx) / 3, (az + bz + cz) / 3, (ay + by + cy) / 3 + shiftY);
      if (x1 - x0 < 1 && z1 - z0 < 1) continue;
      const den = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz);
      if (Math.abs(den) < 1e-9) continue;
      for (let gx = Math.floor(x0) + 0.5; gx <= x1; gx++)
        for (let gz = Math.floor(z0) + 0.5; gz <= z1; gz++) {
          const l1 = ((bz - cz) * (gx - cx) + (cx - bx) * (gz - cz)) / den;
          const l2 = ((cz - az) * (gx - cx) + (ax - cx) * (gz - cz)) / den;
          const l3 = 1 - l1 - l2;
          if (l1 >= 0 && l2 >= 0 && l3 >= 0) put(gx, gz, l1 * ay + l2 * by + l3 * cy + shiftY);
        }
    }
  return { w, h, z };
}

export function footprintMask(campus: Campus, b: Bbox, w: number, h: number): Uint8Array {
  const m = new Uint8Array(w * h);
  for (const bl of campus.buildings) {
    const xs = bl.outer.map((p) => p[0]);
    const zs = bl.outer.map((p) => p[1]);
    if (
      !xs.length ||
      Math.max(...xs) < b.xmin ||
      Math.min(...xs) > b.xmax ||
      Math.max(...zs) < b.zmin ||
      Math.min(...zs) > b.zmax
    )
      continue;
    for (
      let cz = Math.max(0, Math.floor(Math.min(...zs) - b.zmin));
      cz < Math.min(h, Math.ceil(Math.max(...zs) - b.zmin));
      cz++
    )
      for (
        let cx = Math.max(0, Math.floor(Math.min(...xs) - b.xmin));
        cx < Math.min(w, Math.ceil(Math.max(...xs) - b.xmin));
        cx++
      )
        if (
          pointInRing([cx + b.xmin + 0.5, cz + b.zmin + 0.5], bl.outer) &&
          !bl.holes.some((hl) => pointInRing([cx + b.xmin + 0.5, cz + b.zmin + 0.5], hl))
        )
          m[cz * w + cx] = 1;
  }
  return m;
}

/** Best (dx, dz) so that tall Google cells at (x+dx, z+dz) overlap footprints at (x, z). */
export function alignment(tall: Uint8Array, fp: Uint8Array, w: number, h: number, range = 25) {
  const iou = (dx: number, dz: number) => {
    let inter = 0,
      a = 0,
      c = 0;
    for (let z = 0; z < h; z++)
      for (let x = 0; x < w; x++) {
        const f = fp[z * w + x] as number;
        const tx = x + dx,
          tz = z + dz;
        const t = tx >= 0 && tz >= 0 && tx < w && tz < h ? (tall[tz * w + tx] as number) : 0;
        inter += f & t;
        a += f;
        c += t;
      }
    return inter / (a + c - inter || 1);
  };
  let best = { dx: 0, dz: 0, iou: -1 };
  for (let dz = -range; dz <= range; dz++)
    for (let dx = -range; dx <= range; dx++) {
      const s = iou(dx, dz);
      if (s > best.iou) best = { dx, dz, iou: s };
    }
  return { ...best, iouAtZero: iou(0, 0) };
}

function png(w: number, h: number, rgb: Uint8Array): Buffer {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(raw, y * (w * 3 + 1) + 1);
  }
  const chunk = (t: string, d: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(d.length);
    const td = Buffer.concat([Buffer.from(t), d]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export async function runConvert(o: {
  rawDir: string;
  outDir: string;
  campusPath: string;
  ground?: number;
  bbox?: Bbox;
}) {
  const manifest = JSON.parse(readFileSync(join(o.rawDir, 'manifest.json'), 'utf8')) as {
    tiles: { file: string; transform: number[]; bytes: number }[];
    attributions?: string[];
  };
  const io = await makeIo();
  const tileDir = join(o.outDir, 'tiles');
  mkdirSync(tileDir, { recursive: true });
  const sink: Float32Array[] = [];
  const report: { file: string; triangles: number; bytes: number }[] = [];
  for (const t of manifest.tiles) {
    const src = join(o.rawDir, 'tiles', t.file);
    if (!existsSync(src) || !t.bytes) continue;
    const buf = readFileSync(src);
    const doc = await io.readBinary(new Uint8Array(buf));
    const triangles = bakeToLocal(doc, t.transform, rtcCenter(buf), sink);
    const out = await io.writeBinary(doc);
    writeFileSync(join(tileDir, t.file), out);
    report.push({ file: t.file, triangles, bytes: out.length });
  }
  const b = o.bbox ?? MVP_BBOX;
  // Ground = 5th percentile of the top-down surface heights (assumes the Bell Tower base is y = 0).
  const probe = rasterise(sink, b, 0);
  const vals = Array.from(probe.z)
    .filter((x) => !Number.isNaN(x))
    .sort((p, q) => p - q);
  const ground = o.ground ?? (vals.length ? (vals[Math.floor(vals.length * 0.05)] as number) : 0);
  const shift = -ground;

  const io2 = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const merged = new Document();
  const main = merged.createScene('mall-area');
  for (const r of report) {
    const doc = await io2.read(join(tileDir, r.file));
    for (const node of doc.getRoot().listScenes()[0]?.listChildren() ?? []) {
      const p = node.getTranslation();
      node.setTranslation([p[0], p[1] + shift, p[2]]);
    }
    writeFileSync(join(tileDir, r.file), await io2.writeBinary(doc));
    mergeDocuments(merged, doc);
    for (const s of merged.getRoot().listScenes())
      if (s !== main) {
        for (const c of s.listChildren()) main.addChild(c);
        s.dispose();
      }
  }
  await merged.transform(unpartition());
  mkdirSync(o.outDir, { recursive: true });
  const mergedPath = join(o.outDir, 'mall-area.glb');
  const mergedBytes = await io2.writeBinary(merged);
  writeFileSync(mergedPath, mergedBytes);

  // Alignment vs campus.json footprints.
  const grid = rasterise(sink, b, shift);
  const campus = JSON.parse(readFileSync(o.campusPath, 'utf8')) as Campus;
  const fp = footprintMask(campus, b, grid.w, grid.h);
  const tall = new Uint8Array(grid.w * grid.h);
  grid.z.forEach((y, i) => {
    tall[i] = y > 8 ? 1 : 0;
  });
  const al = alignment(tall, fp, grid.w, grid.h);
  const rgb = new Uint8Array(grid.w * grid.h * 3);
  for (let i = 0; i < grid.z.length; i++) {
    const y = grid.z[i] as number;
    const g = Number.isNaN(y) ? 0 : Math.max(0, Math.min(255, 40 + y * 4));
    rgb.set(fp[i] ? [Math.min(255, g + 120), g * 0.5, g * 0.5] : [g, g, g], i * 3);
  }
  writeFileSync(join(o.outDir, 'mall-area-topdown.png'), png(grid.w, grid.h, rgb));

  const summary = {
    tiles: report.length,
    triangles: report.reduce((s, r) => s + r.triangles, 0),
    mergedBytes: mergedBytes.length,
    groundShiftY: shift,
    alignment: {
      note: 'google = campus + (dx, dz) m (x east, z south); subtract to correct. Rough: tall cells (>8 m, includes trees) vs footprints.',
      ...al,
    },
    attributions: manifest.attributions ?? [],
  };
  writeFileSync(join(o.outDir, 'report.json'), JSON.stringify({ summary, tiles: report }, null, 1));
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = parseArgs(process.argv.slice(2));
  runConvert({
    rawDir: typeof a.raw === 'string' ? a.raw : `${REPO}data/raw/tiles`,
    outDir: typeof a.out === 'string' ? a.out : `${REPO}data/google`,
    campusPath: `${REPO}data/campus.json`,
    ground: a.ground ? Number(a.ground) : undefined,
    bbox: zoneBbox(a.zone),
  }).then(
    (s) => console.log(JSON.stringify(s, null, 1)),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
}
