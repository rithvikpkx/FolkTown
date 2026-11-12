/** Median fps and 1%-low fps (fps at the 99th-percentile frame time) from frame times in ms. */
export function fpsStats(frameMs: number[]) {
  const t = frameMs.filter((x) => x > 0).sort((a, b) => a - b);
  if (!t.length) return { median: 0, low: 0 };
  const median = 1000 / t[Math.floor(t.length / 2)];
  const low = 1000 / t[Math.min(t.length - 1, Math.floor(t.length * 0.99))];
  return { median, low };
}
