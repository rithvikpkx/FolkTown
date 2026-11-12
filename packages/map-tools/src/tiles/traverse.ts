import {
  type Bbox,
  type BoundingVolume,
  IDENTITY,
  intersectsBbox,
  type Mat4,
  mat4Mul,
} from './math.ts';

export interface TileNode {
  boundingVolume: BoundingVolume;
  geometricError: number;
  transform?: number[];
  content?: { uri?: string; url?: string };
  contents?: { uri?: string; url?: string }[];
  children?: TileNode[];
}
export interface Selected {
  uri: string; // absolute URL, no key
  boundingVolume: BoundingVolume;
  geometricError: number;
  transform: Mat4;
}

const uriOf = (c?: { uri?: string; url?: string }) => c?.uri ?? c?.url;

/**
 * Walk a tileset. `loadJson(absUrl)` returns a (nested) tileset. Selects glb nodes that touch
 * the bbox, stopping descent when geometricError <= maxError (or at leaves).
 */
export async function traverse(
  rootUrl: string,
  loadJson: (url: string) => Promise<{ root: TileNode }>,
  bbox: Bbox,
  maxError: number,
): Promise<Selected[]> {
  const out: Selected[] = [];
  const seen = new Set<string>();
  const visit = async (n: TileNode, base: string, parent: Mat4): Promise<void> => {
    const world = n.transform ? mat4Mul(parent, n.transform) : parent;
    if (!intersectsBbox(n.boundingVolume, bbox, world)) return;
    const uris = (n.contents ?? (n.content ? [n.content] : []))
      .map(uriOf)
      .filter(Boolean) as string[];
    let descend = true;
    for (const u of uris) {
      const abs = new URL(u, base).toString();
      const path = abs.split('?')[0] as string;
      if (path.endsWith('.json')) {
        if (seen.has(path)) continue;
        seen.add(path);
        const ts = await loadJson(abs);
        await visit(ts.root, abs, world);
      } else if (n.geometricError <= maxError || !n.children?.length) {
        out.push({
          uri: abs,
          boundingVolume: n.boundingVolume,
          geometricError: n.geometricError,
          transform: world,
        });
        descend = false;
      }
    }
    if (descend) for (const c of n.children ?? []) await visit(c, base, world);
  };
  const ts = await loadJson(rootUrl);
  await visit(ts.root, rootUrl, IDENTITY);
  return out;
}
