import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { RequestCap } from './client.ts';
import { bakeToLocal, ecefToLocal, runConvert } from './convert.ts';
import { runFetch } from './fetch-tiles.ts';
import { enu, intersectsBbox, llhToEcef, MVP_BBOX, ORIGIN, unproject } from './math.ts';
import { cameraShots } from './streetview.ts';
import { type TileNode, traverse } from './traverse.ts';

const rad = Math.PI / 180;
const originEcef = llhToEcef(ORIGIN.lat * rad, ORIGIN.lon * rad, 0);
const region = (dLat: number, dLon: number, half = 0.0005) => ({
  region: [
    (ORIGIN.lon + dLon - half) * rad,
    (ORIGIN.lat + dLat - half) * rad,
    (ORIGIN.lon + dLon + half) * rad,
    (ORIGIN.lat + dLat + half) * rad,
    0,
    50,
  ],
});

describe('bounding volume vs bbox', () => {
  it('region', () => {
    expect(intersectsBbox(region(0, 0), MVP_BBOX)).toBe(true);
    expect(intersectsBbox(region(0.1, 0), MVP_BBOX)).toBe(false);
    expect(intersectsBbox(region(0, -0.1), MVP_BBOX)).toBe(false);
  });
  it('sphere in ECEF', () => {
    expect(intersectsBbox({ sphere: [...originEcef, 10] }, MVP_BBOX)).toBe(true);
    const far = llhToEcef(ORIGIN.lat * rad, (ORIGIN.lon + 0.02) * rad, 0); // ~1.7 km east
    expect(intersectsBbox({ sphere: [...far, 100] }, MVP_BBOX)).toBe(false);
    expect(intersectsBbox({ sphere: [...far, 3000] }, MVP_BBOX)).toBe(true);
  });
  it('box in ECEF', () => {
    const { e, n, u } = enu.rot;
    const box = (c: number[], h: number) => ({
      box: [...c, ...e.map((v) => v * h), ...n.map((v) => v * h), ...u.map((v) => v * h)],
    });
    expect(intersectsBbox(box(originEcef, 20), MVP_BBOX)).toBe(true);
    const east = llhToEcef(ORIGIN.lat * rad, (ORIGIN.lon + 0.02) * rad, 0);
    expect(intersectsBbox(box(east, 50), MVP_BBOX)).toBe(false);
  });
});

describe('traverse', () => {
  const leaf = (uri: string, dLon: number, err: number): TileNode => ({
    boundingVolume: region(0, dLon),
    geometricError: err,
    content: { uri },
  });
  const root: TileNode = {
    boundingVolume: region(0, 0, 0.05),
    geometricError: 100,
    children: [
      {
        boundingVolume: region(0, 0),
        geometricError: 10,
        content: { uri: 'a.glb' },
        children: [leaf('a1.glb', 0, 1), leaf('a2.glb', 0.0002, 1)],
      },
      leaf('far.glb', 0.03, 1),
      { boundingVolume: region(0, 0), geometricError: 50, content: { uri: 'nested.json' } },
    ],
  };
  const nested: TileNode = {
    boundingVolume: region(0, 0),
    geometricError: 5,
    content: { uri: 'n.glb' },
  };
  const load = async (u: string) => ({ root: u.includes('nested') ? nested : root });
  it('descends to the error threshold', async () => {
    const fine = await traverse('http://x/root.json', load, MVP_BBOX, 1);
    expect(fine.map((s) => s.uri.split('/').pop()).sort()).toEqual(['a1.glb', 'a2.glb', 'n.glb']);
    const coarse = await traverse('http://x/root.json', load, MVP_BBOX, 10);
    expect(coarse.map((s) => s.uri.split('/').pop()).sort()).toEqual(['a.glb', 'n.glb']);
  });
});

describe('ECEF to local', () => {
  it('Bell Tower is the origin', () => {
    const p = ecefToLocal(originEcef);
    for (const v of p) expect(Math.abs(v)).toBeLessThan(1e-6);
  });
  it('100 m north, 50 m east, 10 m up -> z = -100, x = 50, y = 10', () => {
    const [lat, lon] = unproject(50, -100);
    const [x, y, z] = ecefToLocal(llhToEcef(lat * rad, lon * rad, 10));
    expect(x).toBeCloseTo(50, 0);
    expect(z).toBeCloseTo(-100, 0);
    expect(y).toBeCloseTo(10, 0);
  });
  it('bakes a glb triangle placed in ECEF into the local frame', async () => {
    const doc = new Document();
    const buf = doc.createBuffer();
    const pos = doc
      .createAccessor()
      .setType('VEC3')
      .setBuffer(buf)
      .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]));
    const prim = doc.createPrimitive().setAttribute('POSITION', pos);
    const node = doc.createNode().setMesh(doc.createMesh().addPrimitive(prim));
    doc.createScene().addChild(node);
    // tile transform = translation to the Bell Tower ECEF point
    const t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ...originEcef, 1];
    expect(bakeToLocal(doc, t, undefined)).toBe(1);
    const out = prim.getAttribute('POSITION')?.getArray() as Float32Array;
    expect(out.length).toBe(9);
    for (const v of out.slice(0, 3)) expect(Math.abs(v)).toBeLessThan(1e-4);
  });
});

describe('request cap', () => {
  it('throws once the cap is hit', () => {
    const c = new RequestCap(2);
    c.take();
    c.take();
    expect(() => c.take()).toThrow(/request cap/);
  });
});

describe('streetview shots', () => {
  it('4 positions x 4 headings, outside the footprint', () => {
    const ring: [number, number][] = [
      [-10, -10],
      [10, -10],
      [10, 10],
      [-10, 10],
    ];
    const s = cameraShots('b', ring);
    expect(s).toHaveLength(16);
    expect(s[0]?.z).toBeCloseTo(-22, 5); // north side, 12 m beyond the wall
    expect(s[0]?.heading).toBeCloseTo(180, 5); // looks south at the building
  });
});

describe('fetch against a mock server (dry run and real)', () => {
  let srv: Server;
  let port = 0;
  const hits: string[] = [];
  beforeAll(async () => {
    const doc = new Document();
    doc.getRoot().getAsset().copyright = 'Data SIO; Imagery Mock';
    const glb = Buffer.from(await new NodeIO().writeBinary(doc));
    const tile = (uri: string, err: number, kids: object[] = []) => ({
      boundingVolume: region(0, 0),
      geometricError: err,
      content: { uri },
      children: kids,
    });
    srv = createServer((req, res) => {
      hits.push(req.url as string);
      const u = new URL(req.url as string, 'http://x');
      if (u.searchParams.get('key') !== 'K') {
        res.statusCode = 403;
        return res.end();
      }
      if (u.pathname === '/root.json')
        return res.end(
          JSON.stringify({
            root: {
              boundingVolume: region(0, 0, 0.05),
              geometricError: 100,
              children: [
                tile('/t/a.glb?session=S1', 10, [tile('/t/a1.glb?session=S1', 1)]),
                tile('/t/b.glb?session=S1', 1),
              ],
            },
          }),
        );
      if (!u.searchParams.get('session')) {
        res.statusCode = 400;
        return res.end();
      }
      res.end(glb);
    });
    await new Promise<void>((r) => srv.listen(0, r));
    port = (srv.address() as { port: number }).port;
  });
  afterAll(() => srv.close());
  const base = () => `http://127.0.0.1:${port}/root.json`;

  it('dry run fetches only tileset json', async () => {
    const r = await runFetch({
      key: 'K',
      base: base(),
      outDir: mkdtempSync(join(tmpdir(), 'tiles-')),
      maxError: 1,
      maxRequests: 50,
      dryRun: true,
    });
    expect(r.summary).toMatchObject({
      selectedTiles: 2,
      glbRequestsNeeded: 2,
      tilesetJsonRequests: 1,
    });
    expect(hits.some((h) => h.includes('.glb'))).toBe(false);
  });
  it('downloads, resumes, records attribution, honours the cap', async () => {
    const out = mkdtempSync(join(tmpdir(), 'tiles-'));
    const o = {
      key: 'K',
      base: base(),
      outDir: out,
      maxError: 1,
      maxRequests: 50,
      dryRun: false,
      backoffMs: 1,
    };
    const r = await runFetch(o);
    expect(r.requests).toBe(3);
    expect(readdirSync(join(out, 'tiles'))).toHaveLength(2);
    const m = JSON.parse(readFileSync(join(out, 'manifest.json'), 'utf8'));
    expect(m.attributions).toEqual(['Data SIO', 'Imagery Mock']);
    expect(JSON.stringify(m)).not.toContain('key=');
    expect(hits.filter((h) => h.includes('/t/')).every((h) => h.includes('session=S1'))).toBe(true);
    const again = await runFetch(o);
    expect(again.requests).toBe(1); // only root.json; tiles resumed from disk
    await expect(
      runFetch({ ...o, outDir: mkdtempSync(join(tmpdir(), 'tiles-')), maxRequests: 2 }),
    ).rejects.toThrow(/request cap/);
  });
});

describe('convert end to end (synthetic tile)', () => {
  it('merges, reports and finds the planted alignment offset', async () => {
    const doc = new Document();
    const buf = doc.createBuffer();
    // ground quad at y=0 over the whole bbox, roof quad at y=20 offset (+10, +10) from the footprint
    const quad = (x0: number, z0: number, x1: number, z1: number, y: number) => [
      [x0, y, z0],
      [x1, y, z0],
      [x1, y, z1],
      [x0, y, z1],
    ];
    const verts = [...quad(-300, -400, 400, 200, 0), ...quad(10, 10, 30, 30, 20)].flat();
    const pos = doc
      .createAccessor()
      .setType('VEC3')
      .setBuffer(buf)
      .setArray(new Float32Array(verts));
    const idx = doc
      .createAccessor()
      .setType('SCALAR')
      .setBuffer(buf)
      .setArray(new Uint32Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]));
    const prim = doc.createPrimitive().setAttribute('POSITION', pos).setIndices(idx);
    doc.createScene().addChild(doc.createNode().setMesh(doc.createMesh().addPrimitive(prim)));
    const dir = mkdtempSync(join(tmpdir(), 'conv-'));
    mkdirSync(join(dir, 'raw/tiles'), { recursive: true });
    const glb = await new NodeIO().writeBinary(doc);
    writeFileSync(join(dir, 'raw/tiles/t.glb'), glb);
    const { e, n, u } = enu.rot;
    const transform = [...e, 0, ...n, 0, ...u, 0, ...originEcef, 1];
    writeFileSync(
      join(dir, 'raw/manifest.json'),
      JSON.stringify({ tiles: [{ file: 't.glb', transform, bytes: glb.length }] }),
    );
    writeFileSync(
      join(dir, 'campus.json'),
      JSON.stringify({
        buildings: [
          {
            id: 'b',
            outer: [
              [0, 0],
              [20, 0],
              [20, 20],
              [0, 20],
            ],
            holes: [],
            tags: {},
          },
        ],
      }),
    );
    const s = await runConvert({
      rawDir: join(dir, 'raw'),
      outDir: join(dir, 'out'),
      campusPath: join(dir, 'campus.json'),
    });
    expect(s.triangles).toBe(4);
    expect(s.alignment).toMatchObject({ dx: 10, dz: 10 });
    expect(Math.abs(s.groundShiftY)).toBeLessThan(1e-3);
    expect(existsSync(join(dir, 'out/mall-area.glb'))).toBe(true);
    expect(existsSync(join(dir, 'out/mall-area-topdown.png'))).toBe(true);
  });
});
