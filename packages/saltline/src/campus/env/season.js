// ?season=autumn|summer|spring|winter (default autumn, matching walc-news-plant-wilmeth-now2LO.jpg). Pure data, read by trees, ground and shrubs.
const q = new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
export const SEASONS = {
  // leaf: fallen-leaf cover on ground; dry: lawn dormancy; cover: fraction of crown foliage left
  autumn: { leaf: 0.85, dry: 0.55, cover: 0.9 },
  summer: { leaf: 0, dry: 0, cover: 1 },
  spring: { leaf: 0.1, dry: 0.1, cover: 0.85 },
  winter: { leaf: 0.5, dry: 0.8, cover: 0 },
};
export const SEASON = SEASONS[q.get('season')] ? q.get('season') : 'autumn';
export const S = SEASONS[SEASON];
