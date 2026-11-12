import type { NavNode, ZoneData } from '@folktown/shared';

const BUCKET = 12;

type HeapItem = [f: number, id: number];

function less(a: HeapItem, b: HeapItem): boolean {
  return a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
}

/** Undirected navigation graph with A* and nearest-node lookup. Deterministic: ties break by node id. */
export class NavGraph {
  readonly nodes: readonly NavNode[];
  readonly adj: number[][];
  /** Connected component per node index. */
  readonly component: Int32Array;
  private readonly buckets = new Map<number, number[]>();

  constructor(nav: ZoneData['nav']) {
    this.nodes = nav.nodes;
    const n = nav.nodes.length;
    this.adj = Array.from({ length: n }, () => []);
    for (const [a, b] of nav.edges) {
      this.adj[a]?.push(b);
      this.adj[b]?.push(a);
    }
    nav.nodes.forEach((nd, i) => {
      const k = this.key(Math.floor(nd.x / BUCKET), Math.floor(nd.z / BUCKET));
      const l = this.buckets.get(k);
      if (l) l.push(i);
      else this.buckets.set(k, [i]);
    });
    this.component = new Int32Array(n).fill(-1);
    let c = 0;
    for (let i = 0; i < n; i++) {
      if (this.component[i] !== -1) continue;
      const stack = [i];
      this.component[i] = c;
      while (stack.length) {
        const u = stack.pop() as number;
        for (const v of this.adj[u] as number[]) {
          if (this.component[v] === -1) {
            this.component[v] = c;
            stack.push(v);
          }
        }
      }
      c++;
    }
  }

  private key(i: number, j: number): number {
    return (i + 32768) * 65536 + (j + 32768);
  }

  /** Index of the node nearest (x, z), or -1 for an empty graph. */
  nearest(x: number, z: number): number {
    if (this.nodes.length === 0) return -1;
    const ci = Math.floor(x / BUCKET);
    const cj = Math.floor(z / BUCKET);
    let best = -1;
    let bestD = Number.POSITIVE_INFINITY;
    for (let ring = 0; ring < 400; ring++) {
      if (best >= 0 && (ring - 1) * BUCKET > Math.sqrt(bestD)) break;
      for (let i = ci - ring; i <= ci + ring; i++) {
        for (let j = cj - ring; j <= cj + ring; j++) {
          if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== ring) continue;
          const l = this.buckets.get(this.key(i, j));
          if (!l) continue;
          for (const idx of l) {
            const nd = this.nodes[idx] as NavNode;
            const d = (nd.x - x) ** 2 + (nd.z - z) ** 2;
            if (d < bestD || (d === bestD && idx < best)) {
              bestD = d;
              best = idx;
            }
          }
        }
      }
    }
    return best;
  }

  /** A* from node index `from` to `to`. Node indices including both ends, or null if unreachable. */
  path(from: number, to: number): number[] | null {
    const n = this.nodes.length;
    if (from < 0 || to < 0 || from >= n || to >= n) return null;
    if (from === to) return [from];
    if (this.component[from] !== this.component[to]) return null;
    const g = new Float64Array(n).fill(Number.POSITIVE_INFINITY);
    const prev = new Int32Array(n).fill(-1);
    const closed = new Uint8Array(n);
    const goal = this.nodes[to] as NavNode;
    const h = (i: number) => {
      const nd = this.nodes[i] as NavNode;
      return Math.hypot(nd.x - goal.x, nd.z - goal.z);
    };
    const heap: HeapItem[] = [];
    const push = (e: HeapItem) => {
      heap.push(e);
      let i = heap.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (!less(heap[i] as HeapItem, heap[p] as HeapItem)) break;
        [heap[i], heap[p]] = [heap[p] as HeapItem, heap[i] as HeapItem];
        i = p;
      }
    };
    const pop = (): HeapItem => {
      const top = heap[0] as HeapItem;
      const last = heap.pop() as HeapItem;
      if (heap.length > 0) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;
          if (l < heap.length && less(heap[l] as HeapItem, heap[m] as HeapItem)) m = l;
          if (r < heap.length && less(heap[r] as HeapItem, heap[m] as HeapItem)) m = r;
          if (m === i) break;
          [heap[i], heap[m]] = [heap[m] as HeapItem, heap[i] as HeapItem];
          i = m;
        }
      }
      return top;
    };
    g[from] = 0;
    push([h(from), from]);
    while (heap.length > 0) {
      const [, u] = pop();
      if (closed[u]) continue;
      closed[u] = 1;
      if (u === to) {
        const out: number[] = [];
        for (let c = to; c !== -1; c = prev[c] as number) out.push(c);
        return out.reverse();
      }
      const nu = this.nodes[u] as NavNode;
      for (const v of this.adj[u] as number[]) {
        if (closed[v]) continue;
        const nv = this.nodes[v] as NavNode;
        const ng = (g[u] as number) + Math.hypot(nu.x - nv.x, nu.z - nv.z);
        if (ng < (g[v] as number)) {
          g[v] = ng;
          prev[v] = u;
          push([ng + h(v), v]);
        }
      }
    }
    return null;
  }

  /** Path between two world points as node positions. Null if unreachable or the graph is empty. */
  pathBetween(x0: number, z0: number, x1: number, z1: number): { x: number; z: number }[] | null {
    const p = this.path(this.nearest(x0, z0), this.nearest(x1, z1));
    if (!p) return null;
    return p.map((i) => {
      const nd = this.nodes[i] as NavNode;
      return { x: nd.x, z: nd.z };
    });
  }
}

const cache = new WeakMap<ZoneData, NavGraph>();

/** One graph per zone object. */
export function navGraphFor(zone: ZoneData): NavGraph {
  let g = cache.get(zone);
  if (!g) {
    g = new NavGraph(zone.nav);
    cache.set(zone, g);
  }
  return g;
}
