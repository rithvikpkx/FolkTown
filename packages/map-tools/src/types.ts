/** Local metres, Three.js convention: x = east, z = south (north is -z). Origin: Purdue Bell Tower. */
export type Pt = [x: number, z: number];

/**
 * Winding, viewed from above on a north-up map (x right, north up, i.e. -z up):
 * outer rings are COUNTER-CLOCKWISE, holes are CLOCKWISE. Rings are open (the closing
 * point is not repeated).
 */
export interface Area {
  id: string; // "way/123", "relation/456" (suffix "#n" if a relation has several outers)
  name?: string;
  outer: Pt[];
  holes: Pt[][];
  tags: Record<string, string>;
}

export type Building = Area & { heightLidar?: number };

export interface Path {
  id: string;
  kind: 'road' | 'footway' | 'path' | 'steps' | 'cycleway' | 'other';
  name?: string;
  points: Pt[];
  tags: Record<string, string>;
}

export interface Tree {
  id: string;
  x: number;
  z: number;
  tags: Record<string, string>;
}

export interface Campus {
  origin: { lat: number; lon: number; name: string };
  buildings: Building[];
  paths: Path[];
  trees: Tree[];
  water: Area[];
  grass: Area[];
  stats: { failedRelations: number; skippedElements: number };
}
