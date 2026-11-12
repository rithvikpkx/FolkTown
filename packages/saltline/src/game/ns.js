export var bT = Object.defineProperty;
export var ar = (n, e) => {
  for (var t in e) bT(n, t, { get: e[t], enumerable: !0 });
};
