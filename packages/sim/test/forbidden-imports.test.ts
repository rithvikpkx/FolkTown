import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(import.meta.dirname, '..', 'src');
const FORBIDDEN =
  /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"](?:@folktown\/client|three|node:|[./]*\/?client\b)[^'"]*['"]/;
const GLOBALS = /\b(?:window|document)\./;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

describe('sim isolation', () => {
  it('imports nothing from client, three or node, and touches no window/document', () => {
    const bad: string[] = [];
    for (const f of files(SRC)) {
      const src = readFileSync(f, 'utf8');
      if (FORBIDDEN.test(src) || GLOBALS.test(src)) bad.push(f);
    }
    expect(bad).toEqual([]);
  });
});
