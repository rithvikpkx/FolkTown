import { BufferAttribute as nt, Bone as qr, Group as At, SkinnedMesh as Gr, Skeleton as _a, Sphere as an, Vector3 as K, Box3 as B0, Quaternion as St, Matrix4 as Je, SphereGeometry as Gi, AxesHelper as L2, TorusGeometry as jn, Vector2 as We, LatheGeometry as yr, RingGeometry as Vc, ConeGeometry as El, LessDepth as hp, PlaneGeometry as w0, Mesh as ht, NotEqualDepth as gp, LineBasicMaterial as es, RGB_PVRTC_4BPPV1_Format as wp, MeshBasicMaterial as An, DoubleSide as ln, ShaderMaterial as vn, Color as Qe, AdditiveBlending as wr, CylinderGeometry as io, InstancedMesh as Wo, DynamicDrawUsage as Ao } from 'three';
import { ar } from './ns.js';
import { Tr, Ei, th, vt, bn, su } from './common.js';
import { L1 } from './hands.js';
import { l0, gy, vy } from './weapon.js';
import { sw, sP } from './props.js';
import { __late as __late_weapon } from './weapon.js';
// forward references, filled in by the owning later file (see README)
let sL;
export const __late = {
  sL(v) {
    sL = v;
  },
};

export var ib = {};
  ar(ib, { TUNE: () => Bi, create: () => W5, showcase: () => KD });
  export var Oh = class {
    constructor() {
      ((this.bones = []), (this.index = {}), (this.slots = {}), (this.order = []));
    }
    bone(e, t, i = 0, s = 0, o = 0) {
      let r = t ? this.bones[this.index[t]] : null;
      if (t && !r) throw new Error("rig: unknown parent bone " + t);
      let a = {
        name: e,
        parent: r ? r.i : -1,
        local: [i, s, o],
        world: [i + (r ? r.world[0] : 0), s + (r ? r.world[1] : 0), o + (r ? r.world[2] : 0)],
        i: this.bones.length,
      };
      return ((this.index[e] = a.i), this.bones.push(a), a);
    }
    add(e, t, i, s = [1, 1, 1], o = !0) {
      let r = this.bones[this.index[t]];
      if (!r) throw new Error("rig: unknown bone " + t);
      let a = i;
      a.attributes.normal || a.computeVertexNormals();
      for (let p of Object.keys(a.attributes)) p !== "position" && p !== "normal" && p !== "uv" && a.deleteAttribute(p);
      let l = a.attributes.position.count;
      (a.attributes.uv || a.setAttribute("uv", new nt(new Float32Array(l * 2), 2)), a.translate(r.world[0], r.world[1], r.world[2]));
      let c = new Float32Array(l * 3),
        u = new Uint16Array(l * 4),
        f = new Float32Array(l * 4),
        h = a.attributes.normal;
      for (let p = 0; p < l; p++) {
        let d = o ? 0.74 + 0.26 * (h.getY(p) * 0.5 + 0.5) : 1;
        ((c[p * 3] = s[0] * d), (c[p * 3 + 1] = s[1] * d), (c[p * 3 + 2] = s[2] * d), (u[p * 4] = r.i), (f[p * 4] = 1));
      }
      return (
        a.setAttribute("color", new nt(c, 3)),
        a.setAttribute("skinIndex", new nt(u, 4)),
        a.setAttribute("skinWeight", new nt(f, 4)),
        this.slots[e] || ((this.slots[e] = []), this.order.push(e)),
        this.slots[e].push(a),
        this
      );
    }
    build(e) {
      let t = (e || this.order).filter((o) => this.slots[o] && this.slots[o].length),
        i = t.map((o) => {
          let r = this.slots[o],
            l = r.some((u) => !u.index) ? r.map((u) => (u.index ? u.toNonIndexed() : u)) : r,
            c = Tr(l, !1);
          return c.index ? c.toNonIndexed() : c;
        }),
        s = Tr(i, !0);
      return (
        s.computeBoundingSphere(),
        s.computeBoundingBox(),
        { geometry: s, slots: t, bones: this.bones, tris: s.attributes.position.count / 3 }
      );
    }
  };
  export function z5(n, e, { castShadow: t = !0, receiveShadow: i = !0, radius: s = 1.5, center: o = [0, 0.5, 0], extra: r = null } = {}) {
    let a = n.bones.map((p) => {
      let d = new qr();
      return ((d.name = p.name), d.position.set(p.local[0], p.local[1], p.local[2]), d);
    });
    n.bones.forEach((p, d) => {
      p.parent >= 0 && a[p.parent].add(a[d]);
    });
    let l = new At(),
      c = new Gr(
        n.geometry,
        n.slots.map((p) => e[p]),
      );
    ((c.castShadow = t),
      (c.receiveShadow = i),
      l.add(c),
      n.bones.forEach((p, d) => {
        p.parent < 0 && c.add(a[d]);
      }),
      l.updateMatrixWorld(!0));
    let u = new _a(a);
    (c.bind(u),
      (c.boundingSphere = new an(new K(o[0], o[1], o[2]), s)),
      (c.boundingBox = new B0(new K(o[0] - s, o[1] - s, o[2] - s), new K(o[0] + s, o[1] + s, o[2] + s))));
    let f = {};
    a.forEach((p) => {
      f[p.name] = p;
    });
    let h = { group: l, mesh: c, bones: f, skeleton: u, extraMesh: null };
    if (r) {
      let p = new Gr(
        r.def.geometry,
        r.def.slots.map((d) => e[d]),
      );
      ((p.castShadow = !1),
        (p.receiveShadow = !1),
        (p.renderOrder = 5),
        l.add(p),
        p.updateMatrixWorld(!0),
        p.bind(u, c.bindMatrix),
        (p.boundingSphere = new an(new K(o[0], o[1], o[2]), r.radius || s)),
        (p.boundingBox = new B0().setFromCenterAndSize(p.boundingSphere.center, new K(1, 1, 1).multiplyScalar(2 * (r.radius || s)))),
        (h.extraMesh = p));
    }
    return h;
  }
  export function US(n, e, t, i, s, o, r, a) {
    let l = e * e + t * t,
      c = Math.sqrt(Math.max(l - o * o, 1e-6));
    ((n.abd = Math.atan2(t, e) - Math.atan2(-c, s * o)),
      n.abd > Math.PI ? (n.abd -= 2 * Math.PI) : n.abd < -Math.PI && (n.abd += 2 * Math.PI));
    let u = Math.hypot(c, i),
      f = (r + a) * 0.995,
      h = Math.abs(r - a) + 0.03;
    ((n.reach = u / (r + a)), u > f ? (u = f) : u < h && (u = h));
    let p = Math.atan2(i, c),
      d = (r * r + u * u - a * a) / (2 * r * u),
      m = (r * r + a * a - u * u) / (2 * r * a),
      x = Math.acos(d < -1 ? -1 : d > 1 ? 1 : d),
      v = Math.acos(m < -1 ? -1 : m > 1 ? 1 : m);
    return ((n.hip = x - p), (n.knee = -(Math.PI - v)), n);
  }
  export var Bs = [1.15, 1.15, 1.15],
    F5 = [0.95, 0.96, 0.97],
    Hs = [1, 0.34, 0.08],
    oc = [0.1, 0.11, 0.12],
    rl = [0.035, 0.035, 0.038],
    V1 = [1, 0.7, 0.07],
    Os = [1, 1, 1],
    Bn = [2.4, 2.5, 2.6],
    k0 = [0.45, 0.46, 0.48],
    HD = [9, 9, 9.6],
    OD = [5.5, 4, 1.6],
    al = Math.PI / 2,
    Tt = (n, e, t, i = 0.008) => Ei(n, e, t, i),
    Xe = (n, e, t, i, s = 0, o = 0, r = 0, a = 1) => th(n, { p: [e, t, i], r: [s, o, r], s: a }),
    Ms = (n, e, t, i = 12) => vt(n, e, t, i),
    Uo = (n, e, t, i = 12) => th(vt(n, e, t, i), { r: [0, 0, -al] }),
    ki = (n, e, t, i = 12) => th(vt(n, e, t, i), { r: [al, 0, 0] }),
    D5 = new K(),
    L5 = new K(),
    BS = new St(),
    VD = new K(0, 1, 0),
    HS = new Je(),
    WD = new K(1, 1, 1);
  export function Vh(n, e, t, i = t, s = 8) {
    (D5.set(n[0], n[1], n[2]), L5.set(e[0], e[1], e[2]));
    let o = D5.distanceTo(L5),
      r = vt(i, t, o, s);
    return (
      BS.setFromUnitVectors(VD, L5.clone().sub(D5).normalize()),
      HS.compose(D5.clone().add(L5).multiplyScalar(0.5), BS, WD),
      r.applyMatrix4(HS),
      r
    );
  }
  export var ua = (n, e = 14, t = 10, i = 1, s = 1, o = 1) => {
      let r = new Gi(n, e, t);
      return (r.scale(i, s, o), r);
    },
    OS = (n, e, t) => Xe(Uo(0.0075, 0.0075, 0.006, 6), n, e, t),
    jy = (n, e, t) => Xe(Ms(0.0075, 0.0075, 0.006, 6), n, e, t),
    GD = (n, e, t) => Xe(ki(0.0075, 0.0075, 0.006, 6), n, e, t),
    Ky = {
      stand: 0.72,
      L1: 0.4,
      L2: 0.42,
      l0: 0.075,
      hipX: 0.165,
      hipY: -0.01,
      hipZ: 0.4,
      footX: 0.275,
      footZ: [0.37, 0.37, -0.42, -0.42],
      legs: ["FL", "FR", "RL", "RR"],
      side: [1, -1, 1, -1],
      fore: [1, 1, -1, -1],
      muzzle: [0, 0, 0.43],
      eye: [0, 0, 0.14],
      footR: 0.046,
    };
  export function VS() {
    let n = Ky,
      e = new Oh();
    (e.bone("root", null, 0, 0, 0),
      e.bone("body", "root", 0, n.stand, 0),
      e.bone("neck", "body", 0, 0.06, 0.49),
      e.bone("head", "neck", 0, 0.13, 0.12),
      e.bone("turret", "body", 0, 0.152, -0.03),
      e.bone("gun", "turret", 0, 0.095, 0.02),
      e.bone("antenna", "body", -0.105, 0.15, -0.46),
      e.bone("beacon", "body", 0.105, 0.2, -0.455));
    for (let i = 0; i < 4; i++) {
      let s = n.legs[i],
        o = n.side[i];
      (e.bone("abd" + s, "body", o * n.hipX, n.hipY, n.fore[i] * n.hipZ),
        e.bone("thigh" + s, "abd" + s, o * n.l0, 0, 0),
        e.bone("shin" + s, "thigh" + s, 0, -n.L1, 0));
    }
    let t = (i, s, o, r, a) => e.add(i, s, o, r, a);
    (t("metal", "body", Xe(Tt(0.27, 0.2, 0.98, 0.02), 0, -0.01, 0), k0),
      t("shell", "body", Xe(Tt(0.35, 0.05, 0.3, 0.014), 0, 0.125, 0.33), Bs),
      t("shell", "body", Xe(Tt(0.35, 0.05, 0.36, 0.014), 0, 0.125, -0.012), Bs),
      t("shell", "body", Xe(Tt(0.1, 0.052, 0.36, 0.01), 0, 0.126, -0.012 + 0), F5));
    for (let i of [-0.15, 0.15]) for (let s of [0.21, 0.45, -0.17, 0.145]) t("metal", "body", jy(i, 0.152, s), Bn);
    t("metal", "body", Xe(Tt(0.31, 0.03, 0.25, 0.006), 0, 0.112, -0.335), Os);
    for (let i = 0; i < 10; i++) t("metal", "body", Xe(Tt(0.007, 0.062, 0.225, 0.002), -0.126 + i * 0.028, 0.155, -0.335), Bn);
    (t("metal", "body", Xe(Tt(0.3, 0.012, 0.02, 0.003), 0, 0.186, -0.24), k0),
      t("metal", "body", Xe(Tt(0.3, 0.012, 0.02, 0.003), 0, 0.186, -0.43), k0));
    for (let i of [1, -1]) {
      (t("shell", "body", Xe(Tt(0.032, 0.15, 0.31, 0.012), i * 0.15, 0.022, -0.075), Bs),
        t("shell", "body", Xe(Tt(0.032, 0.15, 0.135, 0.012), i * 0.15, 0.022, 0.1625), F5),
        t(
          "metal",
          "body",
          bn(
            [
              [i * 0.168, 0.06, 0.125],
              [i * 0.182, 0.06, 0.135],
              [i * 0.182, 0.06, 0.19],
              [i * 0.168, 0.06, 0.2],
            ],
            0.005,
            5,
          ),
          Bn,
        ),
        t("shell", "body", Xe(Tt(0.034, 0.016, 0.135, 0.004), i * 0.151, -0.035, 0.1625), V1),
        t("shell", "body", Xe(Tt(0.034, 0.042, 0.46, 0.008), i * 0.151, -0.078, 0), Hs),
        t("shell", "body", Xe(Tt(0.028, 0.1, 0.11, 0.008), i * 0.146, 0.01, 0.305), oc));
      for (let s = 0; s < 4; s++) t("metal", "body", Xe(Tt(0.004, 0.012, 0.085, 0.001), i * 0.161, -0.02 + s * 0.022, 0.305), k0);
      for (let s of [-0.035, 0.08]) for (let o of [-0.21, 0.06, 0.115, 0.21]) t("metal", "body", OS(i * 0.167, s, o), Bn);
      t(
        "metal",
        "body",
        bn(
          [
            [i * 0.135, 0.148, -0.19],
            [i * 0.135, 0.205, -0.16],
            [i * 0.135, 0.212, 0],
            [i * 0.135, 0.205, 0.43],
            [i * 0.135, 0.148, 0.465],
          ],
          0.0105,
          6,
        ),
        Bn,
      );
      for (let s of [0, 0.26]) t("metal", "body", Xe(Ms(0.008, 0.008, 0.06, 6), i * 0.135, 0.178, s), Bn);
      (t(
        "shell",
        "body",
        bn(
          [
            [i * 0.118, -0.105, -0.36],
            [i * 0.132, -0.118, -0.2],
            [i * 0.13, -0.112, 0.1],
            [i * 0.118, -0.1, 0.36],
          ],
          0.009,
          5,
        ),
        rl,
      ),
        t("metal", "body", Xe(new jn(0.02, 0.005, 5, 10), i * 0.17, 0.085, -0.335, 0, al, 0), Bn));
    }
    (t("shell", "body", Xe(Tt(0.3, 0.15, 0.075, 0.018), 0, -0.005, 0.505), Hs),
      t("shell", "body", Xe(Tt(0.2, 0.07, 0.02, 0.006), 0, 0.012, 0.545), oc));
    for (let i = 0; i < 6; i++)
      t("shell", "body", Xe(Tt(0.05, 0.034, 0.014, 0.003), -0.125 + i * 0.05, -0.098, 0.538, 0, 0, 0), i % 2 ? oc : V1);
    for (let i of [-0.115, 0.115])
      (t("metal", "body", Xe(ki(0.021, 0.021, 0.014, 10), i, 0.012, 0.547), k0),
        t("glow", "body", Xe(ki(0.015, 0.015, 0.004, 10), i, 0.012, 0.556), [6.5, 4.6, 2.2], !1));
    (t("metal", "body", Xe(Tt(0.24, 0.095, 0.56, 0.02), 0, -0.145, 0), Os),
      t("shell", "body", Xe(Tt(0.246, 0.03, 0.09, 0.006), 0, -0.14, 0.12), Hs),
      t("shell", "body", Xe(Tt(0.246, 0.03, 0.09, 0.006), 0, -0.14, -0.12), Hs),
      t("shell", "body", Xe(Tt(0.29, 0.15, 0.05, 0.014), 0, 0, -0.495), Bs),
      t("shell", "body", Xe(Tt(0.17, 0.05, 0.012, 0.004), 0, 0.03, -0.523), oc),
      t("glow", "body", Xe(Tt(0.13, 0.012, 0.004, 0.001), 0, 0.03, -0.531), [5, 0.3, 0.1], !1),
      t("metal", "body", Xe(ki(0.022, 0.022, 0.02, 10), 0.085, -0.035, -0.525), Bn),
      t("metal", "body", Xe(new jn(0.024, 0.006, 5, 10), -0.07, -0.05, -0.528, al, 0, 0), Bn));
    for (let i of [-0.125, 0.125]) for (let s of [-0.055, 0.055]) t("metal", "body", GD(i, s, -0.523), Bn);
    (t(
      "shell",
      "body",
      bn(
        [
          [0.09, 0.15, -0.2],
          [0.13, 0.2, -0.16],
          [0.12, 0.2, -0.08],
          [0.09, 0.165, -0.05],
        ],
        0.009,
        5,
      ),
      rl,
    ),
      t("metal", "neck", Vh([0, -0.02, -0.02], [0, 0.11, 0.1], 0.045, 0.036, 10), k0));
    for (let i = 0; i < 3; i++) {
      let s = 0.2 + i * 0.28;
      t(
        "shell",
        "neck",
        Vh(
          [0, -0.02 + 0.13 * s - 0.008, -0.02 + 0.12 * s - 0.0075],
          [0, -0.02 + 0.13 * s + 0.008, -0.02 + 0.12 * s + 0.0075],
          0.052,
          0.052,
          10,
        ),
        rl,
      );
    }
    (t("shell", "neck", Xe(Tt(0.13, 0.05, 0.1, 0.012), 0, -0.01, -0.03), Bs),
      t(
        "shell",
        "neck",
        bn(
          [
            [0.05, -0.02, -0.04],
            [0.07, 0.05, 0.02],
            [0.06, 0.11, 0.07],
            [0.045, 0.12, 0.1],
          ],
          0.007,
          5,
        ),
        rl,
      ),
      t("shell", "head", Xe(Tt(0.19, 0.118, 0.25, 0.03), 0, 0, 0), Bs),
      t("shell", "head", Xe(Tt(0.168, 0.074, 0.03, 0.012), 0, -0.004, 0.118), oc),
      t("lens", "head", Xe(Tt(0.128, 0.024, 0.006, 0.002), 0, 0.006, 0.1345), [1, 1, 1], !1));
    for (let i of [-0.056, 0.056])
      (t("metal", "head", Xe(ki(0.015, 0.015, 0.012, 10), i, -0.022, 0.132), k0),
        t("metal", "head", Xe(ki(0.009, 0.009, 0.004, 8), i, -0.022, 0.139), [0.1, 0.12, 0.2]));
    (t("shell", "head", Xe(Tt(0.062, 0.008, 0.2, 0.003), 0, 0.06, -0.005), Hs),
      t("metal", "head", Xe(Uo(0.032, 0.032, 0.214, 12), 0, 0, -0.055), k0));
    for (let i of [1, -1]) t("shell", "head", Xe(Uo(0.022, 0.022, 0.006, 10), i * 0.108, 0, -0.055), Hs);
    (t("metal", "head", Xe(Ms(0.036, 0.036, 0.026, 14), 0, 0.072, -0.05), k0),
      t("metal", "head", Xe(Ms(0.037, 0.037, 0.006, 14), 0, 0.074, -0.05), [0.2, 0.3, 0.5]),
      t("metal", "head", Xe(Tt(0.12, 0.03, 0.13, 0.008), 0, -0.068, 0.02), Os));
    for (let i of [-0.08, 0.08]) for (let s of [-0.09, 0.07]) t("metal", "head", jy(i, 0.061, s), Bn);
    (t("metal", "turret", Xe(Ms(0.105, 0.118, 0.034, 18), 0, 0, 0), k0),
      t("metal", "turret", Xe(Tt(0.18, 0.02, 0.16, 0.005), 0, 0.026, 0), Os));
    for (let i of [1, -1])
      (t("shell", "turret", Xe(Tt(0.028, 0.115, 0.15, 0.012), i * 0.078, 0.085, 0.005), Bs),
        t("metal", "turret", Xe(Uo(0.022, 0.022, 0.008, 10), i * 0.094, 0.095, 0.02), Bn));
    (t("shell", "gun", Xe(Tt(0.108, 0.086, 0.21, 0.016), 0, 0, -0.012), Bs),
      t("shell", "gun", Xe(Tt(0.11, 0.02, 0.212, 0.006), 0, -0.022, -0.012), Hs),
      t("metal", "gun", Xe(ki(0.035, 0.035, 0.11, 12), 0, 0, 0.145), k0));
    for (let i = 0; i < 4; i++) t("metal", "gun", Xe(ki(0.039, 0.039, 0.008, 12), 0, 0, 0.105 + i * 0.026), Os);
    (t("metal", "gun", Xe(ki(0.022, 0.024, 0.3, 12), 0, 0, 0.25), Os),
      t("metal", "gun", Xe(ki(0.036, 0.036, 0.06, 10), 0, 0, 0.395), k0),
      t("metal", "gun", Xe(Tt(0.08, 0.012, 0.025, 0.003), 0, 0, 0.395), [0.15, 0.15, 0.15]),
      t("metal", "gun", Xe(Uo(0.056, 0.056, 0.06, 14), 0.084, -0.004, -0.045), k0),
      t("metal", "gun", Xe(Uo(0.02, 0.02, 0.066, 8), 0.084, -0.004, -0.045), OD),
      t("metal", "gun", Xe(Tt(0.036, 0.036, 0.095, 0.008), -0.03, 0.06, 0), k0),
      t("glow", "gun", Xe(ki(0.011, 0.011, 0.003, 8), -0.03, 0.06, 0.049), [1.6, 0.12, 0.05], !1),
      t(
        "shell",
        "gun",
        bn(
          [
            [0.05, -0.03, -0.11],
            [0.06, -0.07, -0.13],
            [0.04, -0.09, -0.1],
          ],
          0.008,
          5,
        ),
        rl,
      ),
      t("metal", "body", Xe(Ms(0.022, 0.026, 0.05, 10), 0.105, 0.175, -0.455), k0),
      t("glow", "beacon", Xe(ua(0.02, 10, 6, 1, 1.25, 1), 0, 0.012, 0), [14, 5.5, 0.5], !1),
      t("metal", "antenna", Xe(Ms(0.011, 0.014, 0.05, 8), 0, 0.025, 0), k0),
      t("metal", "antenna", Xe(Ms(0.0028, 0.005, 0.62, 5), 0, 0.36, 0), k0),
      t("shell", "antenna", Xe(ua(0.009, 6, 4), 0, 0.67, 0), Hs));
    for (let i = 0; i < 4; i++) {
      let s = n.legs[i],
        o = n.side[i],
        r = "abd" + s,
        a = "thigh" + s,
        l = "shin" + s;
      (t("metal", r, Xe(ki(0.06, 0.06, 0.17, 14), -o * 0.02, 0, 0), k0),
        t("shell", r, Xe(Tt(0.11, 0.05, 0.155, 0.014), o * 0, 0.058, 0), Bs),
        t("metal", r, Xe(ki(0.03, 0.03, 0.18, 8), -o * 0.02, 0, 0), Bn),
        t("shell", a, Xe(Uo(0.078, 0.078, 0.07, 18), 0, 0, 0), Bs),
        t("shell", a, Xe(Uo(0.081, 0.081, 0.016, 18), o * 0.012, 0, 0), Hs),
        t("metal", a, Xe(Uo(0.048, 0.048, 0.082, 12), 0, 0, 0), k0));
      for (let c = 0; c < 5; c++) {
        let u = c * 1.2566;
        t("metal", a, OS(o * 0.039, Math.cos(u) * 0.062, Math.sin(u) * 0.062), Bn);
      }
      (t("shell", a, Xe(Tt(0.062, n.L1 - 0.07, 0.1, 0.022), 0, -n.L1 * 0.5 - 0.005, 0.004), Bs),
        t("metal", a, Xe(Tt(0.044, n.L1 - 0.04, 0.06, 0.012), 0, -n.L1 * 0.5, -0.035), k0),
        t("shell", a, Xe(Tt(0.065, 0.045, 0.103, 0.01), 0, -0.145, 0.004), Hs),
        t("shell", a, Xe(Tt(0.064, 0.012, 0.102, 0.004), 0, -0.26, 0.004), oc),
        t("metal", a, Vh([0, -0.06, -0.082], [0, -n.L1 * 0.62, -0.078], 0.021, 0.021, 10), Bn),
        t("metal", a, Vh([0, -n.L1 * 0.62, -0.078], [0, -n.L1 + 0.025, -0.058], 0.009, 0.009, 6), HD),
        t("metal", a, Xe(Tt(0.05, 0.03, 0.035, 0.006), 0, -0.055, -0.07), Os),
        t(
          "shell",
          a,
          bn(
            [
              [o * 0.036, -0.02, 0.05],
              [o * 0.044, -0.13, 0.062],
              [o * 0.042, -0.28, 0.058],
              [o * 0.034, -n.L1 + 0.03, 0.035],
            ],
            0.0065,
            5,
          ),
          rl,
        ),
        t("metal", a, Xe(Uo(0.05, 0.05, 0.086, 14), 0, -n.L1, 0), k0),
        t("shell", a, Xe(Uo(0.036, 0.036, 0.092, 12), 0, -n.L1, 0), F5),
        t("metal", l, Xe(Ms(0.03, 0.021, n.L2 - 0.08, 10), 0, -(n.L2 - 0.08) / 2 - 0.01, 0), k0),
        t("shell", l, Xe(Tt(0.052, 0.21, 0.04, 0.014), 0, -0.14, 0.02), Bs),
        t("shell", l, Xe(Tt(0.054, 0.02, 0.042, 0.006), 0, -0.215, 0.02), Hs),
        t("metal", l, Xe(Tt(0.03, 0.06, 0.05, 0.008), 0, -0.02, -0.03), Os),
        t("metal", l, Xe(Ms(0.024, 0.03, 0.03, 10), 0, -n.L2 + 0.085, 0), Bn),
        t("shell", l, Xe(ua(n.footR + 0.002, 12, 8, 1, 0.86, 1.08), 0, -n.L2 + n.footR * 0.86, 0.004), rl));
    }
    return e.build(["shell", "metal", "glow", "lens"]);
  }
  export var N5 = {
    rotors: [
      [0.33, 0.035, 0.3],
      [-0.33, 0.035, 0.3],
      [0.33, 0.035, -0.3],
      [-0.33, 0.035, -0.3],
    ],
    gimbal: [0, -0.095, 0.275],
    ball: [0, -0.072, 0],
    gun: [0, -0.085, -0.1],
    muzzle: [0, -0.032, 0.27],
    lamp: [0, -0.066, 0.025],
  };
  export function qD() {
    let n = [
      [0.176, -0.036],
      [0.196, -0.032],
      [0.206, 0],
      [0.202, 0.03],
      [0.19, 0.04],
      [0.178, 0.032],
      [0.173, 0],
      [0.176, -0.036],
    ].map((e) => new We(e[0], e[1]));
    return new yr(n, 28);
  }
  export function WS() {
    let n = N5,
      e = new Oh(),
      t = new Oh(),
      i = (l, c, u, f, h) => {
        (e.bone(l, c, u, f, h), t.bone(l, c, u, f, h));
      };
    (i("root", null, 0, 0, 0), i("body", "root", 0, 0, 0));
    for (let l = 0; l < 4; l++) i("rotor" + l, "body", n.rotors[l][0], n.rotors[l][1], n.rotors[l][2]);
    (i("gimbalYaw", "body", n.gimbal[0], n.gimbal[1], n.gimbal[2]),
      i("ball", "gimbalYaw", n.ball[0], n.ball[1], n.ball[2]),
      i("lamp", "ball", n.lamp[0], n.lamp[1], n.lamp[2]),
      i("gun", "body", n.gun[0], n.gun[1], n.gun[2]),
      i("strobeG", "body", 0, 0, 0),
      i("strobeR", "body", 0, 0, 0),
      i("strobeW", "body", 0, 0, 0));
    let s = (l, c, u, f, h) => e.add(l, c, u, f, h);
    (s("shell", "body", Xe(ua(1, 20, 12, 0.118, 0.074, 0.27), 0, 0.02, 0), Bs),
      s("shell", "body", Xe(vt(1, 0.9, 1, 20), 0, 0.02, 0.165, al, 0, 0, [0.094, 0.05, 0.06]), Hs),
      s("shell", "body", Xe(vt(1, 1, 1, 20), 0, 0.02, -0.02, al, 0, 0, [0.121, 0.012, 0.0765]), oc),
      s("shell", "body", Xe(Tt(0.118, 0.014, 0.2, 0.005), 0, 0.089, -0.03), F5),
      s("shell", "body", Xe(Tt(0.03, 0.006, 0.2, 0.002), 0, 0.0975, -0.03), Hs));
    for (let l of [-0.05, 0.05]) for (let c of [-0.12, 0.06]) s("metal", "body", jy(l, 0.097, c), Bn);
    (s("metal", "body", Xe(Tt(0.175, 0.06, 0.37, 0.016), 0, -0.035, -0.005), k0),
      s("metal", "body", Xe(Tt(0.12, 0.075, 0.11, 0.014), 0, 0.005, -0.265), Os),
      s("shell", "body", Xe(Tt(0.124, 0.02, 0.03, 0.005), 0, 0.03, -0.3), Hs),
      s("glow", "body", Xe(Tt(0.05, 0.006, 0.003, 0.001), 0, 0, -0.321), [0.3, 1.6, 0.4], !1));
    for (let l of [1, -1]) {
      for (let c = 0; c < 4; c++)
        s("metal", "body", Xe(Tt(0.004, 0.01, 0.06, 0.001), l * 0.0885, -0.045 + c * 0.016, -0.06), [0.2, 0.2, 0.2]);
      s(
        "metal",
        "body",
        bn(
          [
            [l * 0.075, -0.055, 0.13],
            [l * 0.135, -0.175, 0.16],
            [l * 0.135, -0.192, 0.11],
            [l * 0.135, -0.192, -0.14],
            [l * 0.135, -0.175, -0.19],
            [l * 0.075, -0.055, -0.15],
          ],
          0.0085,
          6,
          !1,
          0.5,
        ),
        Bn,
      );
      for (let c of [0.07, -0.1]) s("shell", "body", Xe(ki(0.0135, 0.0135, 0.07, 8), l * 0.135, -0.192, c), rl);
      (s("metal", "body", Vh([l * 0.04, 0.07, -0.17], [l * 0.085, 0.37, -0.27], 0.004, 0.002, 5), k0),
        s("metal", "body", Xe(Ms(0.008, 0.01, 0.025, 6), l * 0.04, 0.078, -0.17), Bn));
    }
    (s("metal", "body", Xe(Ms(0.007, 0.007, 0.04, 6), 0, 0.105, 0.1), Bn),
      s("shell", "body", Xe(Ms(0.034, 0.036, 0.018, 14), 0, 0.132, 0.1), Bs),
      s("metal", "body", Xe(Tt(0.07, 0.03, 0.09, 0.008), 0, -0.075, 0.235), Os));
    let o = qD();
    for (let l = 0; l < 4; l++) {
      let [c, u, f] = n.rotors[l],
        h = Math.sign(c),
        p = Math.sign(f);
      (s("metal", "body", Vh([h * 0.07, 0, p * 0.09], [c, u - 0.05, f], 0.017, 0.015, 8), k0),
        s("shell", "body", Xe(Tt(0.07, 0.045, 0.07, 0.014), h * 0.085, 0, p * 0.1, 0, h * p * 0.74, 0), Bs),
        s(
          "shell",
          "body",
          bn(
            [
              [h * 0.09, 0.02, p * 0.12],
              [h * 0.18, 0.012, p * 0.19],
              [c - h * 0.05, u - 0.03, f - p * 0.04],
            ],
            0.005,
            5,
          ),
          rl,
        ),
        s("metal", "body", Xe(Ms(0.04, 0.03, 0.075, 12), c, u - 0.05, f), k0),
        s("metal", "body", Xe(Ms(0.042, 0.042, 0.012, 12), c, u - 0.02, f), Bn),
        s("shell", "body", Xe(o.clone(), c, u, f), Bs),
        s("shell", "body", Xe(new jn(0.196, 0.0085, 6, 28), c, u + 0.036, f, al, 0, 0), Hs));
      for (let m = 0; m < 3; m++) {
        let x = m * 2.094 + 0.5 + l;
        s("metal", "body", Xe(Tt(0.145, 0.007, 0.016, 0.002), c + Math.cos(x) * 0.105, u - 0.022, f - Math.sin(x) * 0.105, 0, x, 0), k0);
      }
      for (let m = -1; m <= 1; m++) {
        let x = Math.atan2(p, h) + m * 0.2;
        s(
          "shell",
          "body",
          Xe(Tt(0.012, 0.05, 0.036, 0.003), c + Math.cos(x) * 0.205, u, f + Math.sin(x) * 0.205, 0, -x, 0),
          m === 0 ? oc : V1,
        );
      }
      (s("metal", "rotor" + l, Xe(Ms(0.017, 0.02, 0.03, 8), 0, -0.002, 0), Bn),
        s("metal", "rotor" + l, Xe(Tt(0.158, 0.0035, 0.03, 0.001), 0.088, 0.008, 0, 0.22, 0, 0), k0),
        s("metal", "rotor" + l, Xe(Tt(0.158, 0.0035, 0.03, 0.001), -0.088, 0.008, 0, -0.22, 0, 0), k0),
        s("shell", "rotor" + l, Xe(Tt(0.02, 0.004, 0.031, 0.001), 0.158, 0.008, 0, 0.22, 0, 0), V1),
        s("shell", "rotor" + l, Xe(Tt(0.02, 0.004, 0.031, 0.001), -0.158, 0.008, 0, -0.22, 0, 0), V1));
      let d = new Vc(0.03, 0.168, 24, 1);
      (d.rotateX(-al), t.add("disc", "body", Xe(d, c, u + 0.008, f), [1, 1, 1], !1));
    }
    (s("glow", "strobeR", Xe(ua(0.012, 8, 6), 0.33 + 0.215, 0.035, 0.3), [10, 0.4, 0.2], !1),
      s("glow", "strobeR", Xe(ua(0.012, 8, 6), 0.33 + 0.215, 0.035, -0.3), [10, 0.4, 0.2], !1),
      s("glow", "strobeG", Xe(ua(0.012, 8, 6), -0.33 - 0.215, 0.035, 0.3), [0.3, 9, 1], !1),
      s("glow", "strobeG", Xe(ua(0.012, 8, 6), -0.33 - 0.215, 0.035, -0.3), [0.3, 9, 1], !1),
      s("glow", "strobeW", Xe(ua(0.011, 8, 6), 0, 0.05, -0.325), [9, 9, 9], !1),
      s("metal", "gimbalYaw", Xe(Ms(0.036, 0.036, 0.014, 12), 0, -0.004, 0), k0),
      s("metal", "gimbalYaw", Xe(Tt(0.156, 0.01, 0.03, 0.003), 0, -0.014, 0), Os));
    for (let l of [1, -1]) s("metal", "gimbalYaw", Xe(Tt(0.009, 0.075, 0.03, 0.003), l * 0.0735, -0.05, 0), Os);
    (s("metal", "ball", Xe(ua(0.06, 18, 12), 0, 0, 0), k0),
      s("metal", "ball", Xe(Uo(0.013, 0.013, 0.142, 8), 0, 0, 0), Bn),
      s("metal", "ball", Xe(ki(0.031, 0.036, 0.03, 14), 0, 0.004, 0.048), Os),
      s("lens", "ball", Xe(ki(0.025, 0.025, 0.004, 14), 0, 0.004, 0.0645), [1, 1, 1], !1),
      s("metal", "ball", Xe(ki(0.012, 0.012, 0.01, 8), 0.03, 0.036, 0.04), [0.1, 0.12, 0.2]),
      s("metal", "ball", Xe(ki(0.019, 0.023, 0.045, 10), n.lamp[0], n.lamp[1], n.lamp[2] - 0.022), k0),
      s("glow", "lamp", Xe(ki(0.016, 0.016, 0.003, 10), 0, 0, 0.001), [11, 9.8, 7.6], !1));
    {
      let u = new El(1.25, 9, 20, 6, !0);
      (u.translate(0, -9 / 2, 0), u.rotateX(-al), t.add("cone", "lamp", u, [1, 1, 1], !1));
    }
    (s("metal", "gun", Xe(Tt(0.05, 0.03, 0.05, 0.006), 0, 0.012, 0), Os),
      s("metal", "gun", Xe(Uo(0.012, 0.012, 0.07, 8), 0, -0.005, 0), Bn),
      s("metal", "gun", Xe(Tt(0.052, 0.046, 0.13, 0.008), 0, -0.032, 0), Os),
      s("shell", "gun", Xe(Tt(0.054, 0.012, 0.05, 0.003), 0, -0.02, -0.03), Hs));
    for (let l of [-0.014, 0.014])
      (s("metal", "gun", Xe(ki(0.0085, 0.0085, 0.2, 8), l, -0.032, 0.16), k0),
        s("metal", "gun", Xe(ki(0.012, 0.012, 0.03, 8), l, -0.032, 0.255), Os));
    (s("metal", "gun", Xe(Tt(0.045, 0.012, 0.012, 0.002), 0, -0.032, 0.2), Bn),
      s("metal", "gun", Xe(Tt(0.03, 0.05, 0.05, 0.006), 0.04, -0.035, -0.02), k0));
    let r = e.build(["shell", "metal", "glow", "lens"]),
      a = t.build(["disc", "cone"]);
    return ((r.extra = a), r);
  }
  export var Jy = {
      hp: 45,
      boltDamage: 7,
      boltSpeed: 70,
      burst: 3,
      burstGap: 0.12,
      telegraph: 0.55,
      cooldown: [1.9, 3.3],
      rangeMin: 12,
      rangeMax: 25,
      altMin: 4,
      altMax: 8,
      maxSpeed: 8,
      patrolSpeed: 3,
      accel: 11,
      spreadFar: 0.065,
      spreadNear: 0.018,
      fireRange: 42,
      explodeRadius: 3,
      explodeDamage: 30,
    },
    gn = Jy,
    rr = new K(),
    yB = new K(),
    Qs = new K(),
    Bo = new K(),
    bB = new K(),
    Wh = new K(),
    W1 = new K(0, 1, 0),
    GS = new K(0, -1, 0),
    U5 = [8, 4, 0.7],
    XD = [14, 1, 0.35],
    qS = (n, e) => {
      let t = (n - e) % (Math.PI * 2);
      return (t > Math.PI ? (t -= Math.PI * 2) : t < -Math.PI && (t += Math.PI * 2), t);
    },
    Ou = (n, e, t) => (n < e ? e : n > t ? t : n);
  export function XS(n, e, t, i) {
    let s = n.G,
      o = n.rng,
      r = t.lensBase.clone(),
      a = z5(
        e,
        { shell: t.shell, metal: t.metal, glow: t.glow, lens: r, disc: t.disc, cone: t.cone },
        { radius: 0.9, center: [0, 0, 0], extra: { def: e.extra, radius: 10 } },
      ),
      l = a.bones;
    ((a.group.rotation.order = "YXZ"), (a.group.visible = !1));
    let c = s.mats.label("G-" + String(i + 11), { color: "black", font: "stencil", distress: 0.35 }),
      u = 0.105,
      f = Math.min(0.045, u / (c.aspect || 3)),
      h = new w0(u, f);
    (h.rotateX(-Math.PI / 2), h.rotateY(Math.PI));
    let p = new ht(h, c.material);
    (p.position.set(0, 0.0985, -0.085), (p.castShadow = !1), (p.receiveShadow = !0), l.body.add(p));
    let d = {
      id: 0,
      type: "gull",
      pos: a.group.position,
      alive: !1,
      hp: gn.hp,
      active: !1,
      rig: a,
      lens: r,
      vel: new K(),
      yaw: 0,
      pitch: 0,
      roll: 0,
      home: new K(),
      lastKnown: new K(),
      sensor: new K(),
      fwd: new K(0, 0, 1),
      muzzle: new K(),
      mode: "patrol",
      los: !1,
      seeT: 0,
      noSeeT: 0,
      senseT: 0,
      exposure: 0,
      modeT: 0,
      passive: !1,
      hasToken: !1,
      orbitA: 0,
      orbitDir: 1,
      orbitR: 16,
      alt: 6,
      hoverY: 0,
      phase: 0,
      ceil: 1e9,
      ceilT: 0,
      flipT: 0,
      avoid: new K(),
      atk: "idle",
      atkT: 0,
      cool: 1,
      shots: 0,
      smokeT: 0,
      feeler: 0,
      strobeT: 0,
      flare: 0,
      lensC: [U5[0], U5[1], U5[2]],
      dieT: 0,
      spin: 0,
      lostRotor: 0,
      gy: 0,
      gp: 0,
      loop: null,
      sweep: 0,
      thr: 1,
      damage(y, b, g, E) {
        return d.alive
          ? ((d.hp -= y),
            s.events.emit("enemy:hit", { enemy: d, point: b, part: E || "body" }),
            g && (d.vel.addScaledVector(g, Math.min(3, y * 0.09)), (d.roll += (o() - 0.5) * 0.5), (d.pitch += (o() - 0.5) * 0.4)),
            n.provoke(d),
            d.hp <= 0 ? (m(g), !0) : !1)
          : !1;
      },
      _activate(y, b = {}) {
        ((d.active = !0),
          (d.alive = !0),
          (d.hp = gn.hp),
          (d.passive = !!b.passive),
          d.pos.copy(y),
          d.home.copy(y),
          d.vel.set(0, 0, 0),
          (d.yaw = b.yaw ?? o() * 6.283),
          (d.pitch = d.roll = 0),
          (d.mode = b.state === "alert" ? "investigate" : "patrol"),
          (d.modeT = 8),
          d.lastKnown.copy(b.target || (s.player ? s.player.pos : y)),
          (d.los = !1),
          (d.seeT = d.noSeeT = 0),
          (d.exposure = 0),
          (d.senseT = o() * 0.2),
          (d.hasToken = !1),
          (d.orbitDir = o() < 0.5 ? 1 : -1),
          (d.orbitR = gn.rangeMin + 2 + o() * (gn.rangeMax - gn.rangeMin - 5)),
          (d.alt = b.hover ?? gn.altMin + 0.8 + o() * (gn.altMax - gn.altMin - 1.6)),
          (d.hoverFixed = b.hover != null),
          (d.patrolR = b.patrolRadius ?? 4 + o() * 5),
          (d.phase = o() * 6.283),
          (d.orbitA = o() * 6.283),
          (d.ceil = 1e9),
          (d.flipT = 3 + o() * 4),
          (d.atk = "idle"),
          (d.cool = 1 + o() * 1.5),
          (d.dieT = 0),
          (d.spin = 0),
          (d.lostRotor = -1),
          (d.flare = 0),
          (d.thr = 1));
        for (let g = 0; g < 4; g++) l["rotor" + g].scale.setScalar(1);
        if (
          (l.lamp.scale.setScalar(1),
          l.body.rotation.set(0, 0, 0),
          (a.group.visible = !0),
          a.group.rotation.set(0, d.yaw, 0),
          s.audio && s.audio.loop && !d.loop)
        )
          try {
            d.loop = s.audio.loop("gull_rotor", { pos: d.pos, gain: 0.5 });
          } catch {
            d.loop = null;
          }
      },
      _deactivate() {
        if (((d.active = !1), (d.alive = !1), (a.group.visible = !1), n.releaseToken(d), d.loop)) {
          try {
            d.loop.stop();
          } catch {}
          d.loop = null;
        }
      },
      _raycast(y, b, g, E) {
        let T = y.x - d.pos.x,
          w = (y.y - d.pos.y + 0.03) * 2.3,
          S = y.z - d.pos.z,
          R = b.x,
          z = b.y * 2.3,
          I = b.z,
          L = R * R + z * z + I * I,
          U = T * R + w * z + S * I,
          k = T * T + w * w + S * S - 0.5 * 0.5,
          C = U * U - L * k;
        if (C < 0) return !1;
        let A = (-U - Math.sqrt(C)) / L;
        return A < 0 || A > g || A >= E.dist
          ? !1
          : ((E.dist = A),
            (E.part = "body"),
            (E.enemy = d),
            E.point.copy(y).addScaledVector(b, A),
            E.normal.copy(E.point).sub(d.pos),
            (E.normal.y *= 2.3),
            E.normal.normalize(),
            !0);
      },
      _update(y) {
        d.alive ? v(y) : x(y);
      },
    };
    function m(y) {
      ((d.alive = !1),
        n.releaseToken(d),
        (d.dieT = 0),
        (d.lostRotor = Math.floor(o() * 4)),
        l["rotor" + d.lostRotor].scale.setScalar(1e-4),
        rr.set(N5.rotors[d.lostRotor][0], 0.05, N5.rotors[d.lostRotor][2]).applyAxisAngle(W1, d.yaw).add(d.pos),
        s.fx.sparks(rr, W1, 14),
        s.fx.debris(rr, { count: 3 }),
        s.fx.smoke(rr, { size: 0.5, life: 1 }),
        (d.spin = (o() < 0.5 ? -1 : 1) * (5 + o() * 3)),
        (d.vel.y += 1.5),
        y && d.vel.addScaledVector(y, 2.5),
        l.lamp.scale.setScalar(1e-4),
        l.strobeG.scale.setScalar(1e-4),
        l.strobeR.scale.setScalar(1e-4),
        l.strobeW.scale.setScalar(1e-4),
        r.color.setRGB(0.3, 0.05, 0.02),
        s.events.emit("enemy:killed", { enemy: d, pos: d.pos, type: "gull" }));
    }
    function x(y) {
      ((d.dieT += y),
        (d.vel.y -= 9.5 * y),
        (d.vel.x *= 1 - 0.4 * y),
        (d.vel.z *= 1 - 0.4 * y),
        (d.spin += Math.sign(d.spin) * 7 * y),
        (d.yaw += d.spin * y),
        (d.roll += d.spin * 0.35 * y),
        (d.pitch += 0.9 * y));
      let b = d.vel.length(),
        g = b * y,
        E = d.dieT > 5 || d.pos.y < -3;
      if (!E && b > 0.01) {
        Qs.copy(d.vel).multiplyScalar(1 / b);
        let M = s.physics.raycast(d.pos, Qs, g + 0.3);
        M && (d.pos.copy(M.point).addScaledVector(M.normal, 0.2), (E = !0));
      }
      (E || d.pos.addScaledVector(d.vel, y), a.group.rotation.set(d.pitch, d.yaw, d.roll));
      for (let M = 0; M < 4; M++)
        M !== d.lostRotor && (l["rotor" + M].rotation.y += (M % 3 === 0 ? 1 : -1) * 30 * Math.max(0.2, 1 - d.dieT * 0.5) * y);
      ((d.smokeT -= y),
        d.smokeT <= 0 &&
          ((d.smokeT = 0.045),
          s.fx.smoke(d.pos, { size: 0.45, life: 1.3, color: 1381914, rise: 0.6 }),
          o() < 0.5 && (rr.set(o() - 0.5, o(), o() - 0.5).normalize(), s.fx.sparks(d.pos, rr, 3))),
        d.loop && (d.loop.setPos(d.pos), d.loop.setPitch(Math.max(0.4, 1.25 - d.dieT * 0.4)), d.loop.setGain(0.5)),
        E &&
          (s.fx.explosion(d.pos, 1.2),
          s.combat && s.combat.explode && s.combat.explode(d.pos, gn.explodeRadius, gn.explodeDamage, "enemy"),
          n.retire(d)));
    }
    function v(y) {
      let b = s.player,
        g = n.t;
      (d.fwd.set(Math.sin(d.yaw), 0, Math.cos(d.yaw)),
        d.sensor.set(0, -0.17, 0.27).applyAxisAngle(W1, d.yaw).add(d.pos),
        n.think(d, y, 0.4));
      let E = d.mode === "engage",
        M = d.hp < gn.hp * 0.5,
        _ = gn.patrolSpeed,
        T,
        w,
        S;
      if (E && b) {
        _ = gn.maxSpeed;
        let q = d.atk !== "idle";
        ((d.flipT -= y),
          d.flipT <= 0 &&
            ((d.flipT = 3 + o() * 5),
            o() < 0.6 && (d.orbitDir = -d.orbitDir),
            (d.orbitR = Ou(d.orbitR + (o() - 0.5) * 6, gn.rangeMin + 1, gn.rangeMax - 2))),
          d.noSeeT > 1.5
            ? ((T = d.lastKnown.x),
              (S = d.lastKnown.z),
              (w = d.lastKnown.y + d.alt + 1),
              (d.orbitA = Math.atan2(d.pos.z - d.lastKnown.z, d.pos.x - d.lastKnown.x)))
            : ((d.orbitA += ((d.orbitDir * (q ? 0.9 : 3.6)) / d.orbitR) * y),
              (T = b.pos.x + Math.cos(d.orbitA) * d.orbitR),
              (S = b.pos.z + Math.sin(d.orbitA) * d.orbitR),
              (w = b.pos.y + d.alt)));
      } else
        d.mode === "investigate" || d.mode === "search"
          ? ((_ = 5.5),
            (d.orbitA += 0.5 * y),
            (T = d.lastKnown.x + Math.cos(d.orbitA) * 4.5),
            (S = d.lastKnown.z + Math.sin(d.orbitA) * 4.5),
            (w = d.lastKnown.y + Math.min(d.alt, 5.5)))
          : ((d.orbitA += 0.28 * y * d.orbitDir),
            (T = d.home.x + Math.cos(d.orbitA) * d.patrolR),
            (S = d.home.z + Math.sin(d.orbitA) * d.patrolR),
            (w = d.hoverFixed ? d.alt : d.home.y));
      (w > d.ceil && (w = d.ceil),
        !d.hoverFixed && w < 2.2 && (w = 2.2),
        Bo.set((T - d.pos.x) * 2.2 - d.vel.x * 2.4, (w - d.pos.y) * 5 - d.vel.y * 3.6, (S - d.pos.z) * 2.2 - d.vel.z * 2.4),
        (d.feeler = (d.feeler + 1) % 3));
      let R = Math.hypot(d.vel.x, d.vel.z);
      if (d.feeler === 0 && R > 0.6) {
        Qs.set(d.vel.x / R, 0, d.vel.z / R);
        let q = 2.2 + R * 0.5,
          ue = s.physics.raycast(d.pos, Qs, q);
        if (ue) {
          let de = 1 - ue.dist / q;
          (d.avoid.copy(ue.normal).multiplyScalar(26 * de),
            (d.avoid.y += 9 * de),
            de > 0.5 && ((d.orbitDir = -d.orbitDir), (d.flipT = 2.5)));
        }
      } else if (d.feeler === 1) {
        let q = s.physics.raycast(d.pos, GS, 2.4);
        q && !d.hoverFixed && (d.avoid.y += (2.4 - q.dist) * 10);
      } else if (d.feeler === 2 && ((d.ceilT -= y * 3), d.ceilT <= 0)) {
        d.ceilT = 0.35;
        let q = s.physics.raycast(d.pos, W1, 4);
        d.ceil = q ? d.pos.y + q.dist - 1.3 : 1e9;
      }
      (Bo.add(d.avoid),
        d.avoid.multiplyScalar(Math.exp(-6 * y)),
        M && ((Bo.x += Math.sin(g * 7.3 + d.phase) * 5), (Bo.z += Math.cos(g * 6.1 + d.phase) * 5), (Bo.y += Math.sin(g * 9.7) * 3)));
      let z = Bo.length();
      (z > gn.accel && Bo.multiplyScalar(gn.accel / z), d.vel.addScaledVector(Bo, y));
      let I = d.vel.length();
      I > _ && (d.vel.multiplyScalar(_ / I), (I = _));
      for (let q = 0; q < 3; q++) {
        let ue = q === 0 ? d.vel.x : q === 1 ? d.vel.y : d.vel.z;
        if (Math.abs(ue) < 0.02) continue;
        let de = ue > 0 ? 1 : -1,
          $ = q === 1 ? 0.35 : 0.62;
        Qs.set(q === 0 ? de : 0, q === 1 ? de : 0, q === 2 ? de : 0);
        let se = s.physics.raycast(d.pos, Qs, Math.abs(ue) * y + $);
        se &&
          (d.vel.setComponent(q, -ue * 0.25),
          d.avoid.setComponent(q, d.avoid.getComponent(q) - de * 8),
          se.dist < $ && d.pos.setComponent(q, d.pos.getComponent(q) - de * ($ - se.dist)));
      }
      if ((d.pos.addScaledVector(d.vel, y), !d.hoverFixed)) {
        let q = s.physics.groundHeight(d.pos.x, d.pos.z, d.pos.y + 0.5) + 1.1;
        d.pos.y < q && ((d.pos.y = q), d.vel.y < 0 && (d.vel.y = 0));
      }
      let L = d.yaw;
      if ((E || d.mode === "search" || d.mode === "investigate") && b) {
        let q = E && d.noSeeT < 1.5 ? b.pos : d.lastKnown;
        L = Math.atan2(q.x - d.pos.x, q.z - d.pos.z);
      } else R > 0.4 && (L = Math.atan2(d.vel.x, d.vel.z));
      let U = qS(L, d.yaw);
      d.yaw += Ou(U, -3.2 * y, 3.2 * y);
      let k = Math.cos(d.yaw),
        C = Math.sin(d.yaw),
        A = Bo.x * C + Bo.z * k,
        F = Bo.x * k - Bo.z * C,
        H = Ou(A * 0.04, -0.42, 0.42),
        N = Ou(-F * 0.04, -0.42, 0.42);
      M && ((H += Math.sin(g * 11 + d.phase) * 0.1), (N += Math.cos(g * 8.7 + d.phase * 2) * 0.13));
      let Z = 1 - Math.exp(-7 * y);
      ((d.pitch += (H - d.pitch) * Z),
        (d.roll += (N - d.roll) * Z),
        a.group.rotation.set(d.pitch, d.yaw, d.roll),
        (l.body.position.y = Math.sin(g * 2.1 + d.phase) * 0.045 + Math.sin(g * 3.7 + d.phase * 1.7) * 0.018),
        (d.thr += (1 + Ou(Bo.y * 0.03, -0.25, 0.4) + R * 0.02 - d.thr) * Z));
      let Q = 41 * d.thr * y;
      ((l.rotor0.rotation.y += Q), (l.rotor1.rotation.y -= Q * 1.03), (l.rotor2.rotation.y -= Q * 0.98), (l.rotor3.rotation.y += Q * 1.01));
      let W = (g * 0.9 + d.phase * 0.1) % 1,
        J = W < 0.05 || (W > 0.13 && W < 0.18) ? 1 : 1e-4;
      if ((l.strobeR.scale.setScalar(J), l.strobeG.scale.setScalar(J), l.strobeW.scale.setScalar(W > 0.5 && W < 0.56 ? 1 : 1e-4), E && b))
        Wh.set(b.pos.x, b.pos.y + 1.1, b.pos.z);
      else if (d.mode !== "patrol")
        ((d.sweep += y), Wh.set(d.lastKnown.x + Math.sin(d.sweep * 0.9) * 3, d.lastKnown.y, d.lastKnown.z + Math.cos(d.sweep * 0.7) * 3));
      else {
        d.sweep += y;
        let q = d.yaw + Math.sin(d.sweep * 0.5 + d.phase) * 0.9;
        Wh.set(d.pos.x + Math.sin(q) * 5, d.pos.y - (d.hoverFixed ? 1.6 : 5), d.pos.z + Math.cos(q) * 5);
      }
      rr.copy(Wh).sub(d.sensor);
      let G = rr.x * k - rr.z * C,
        te = rr.x * C + rr.z * k,
        oe = rr.y,
        ee = Math.atan2(G, te),
        le = Ou(Math.atan2(-oe, Math.hypot(G, te)), -0.5, 1.5),
        xe = 1 - Math.exp(-9 * y);
      ((d.gy += qS(ee, d.gy) * xe),
        (d.gp += (le - d.gp) * xe),
        (l.gimbalYaw.rotation.y = d.gy),
        (l.ball.rotation.x = d.gp - d.pitch),
        (l.gun.rotation.x = Ou(d.gp, -0.2, 1.3) - d.pitch));
      let j = E ? XD : U5,
        O = 1 + d.flare * 3.2 + (E ? 0 : Math.sin(g * 3 + d.phase) * 0.15);
      for (let q = 0; q < 3; q++) d.lensC[q] += (j[q] - d.lensC[q]) * (1 - Math.exp(-8 * y));
      if (
        (r.color.setRGB(d.lensC[0] * O, d.lensC[1] * O, d.lensC[2] * O),
        (d.flare = Math.max(0, d.flare - y * 1.5)),
        d.muzzle.set(0, -0.12, 0.17).applyAxisAngle(W1, d.yaw).add(d.pos),
        (d.cool -= y),
        d.atk === "idle")
      )
        E &&
          d.los &&
          d.cool <= 0 &&
          b &&
          b.alive &&
          Math.abs(U) < 0.35 &&
          d.pos.distanceTo(b.pos) < gn.fireRange &&
          n.requestToken(d) &&
          ((d.atk = "tele"),
          (d.atkT = gn.telegraph),
          s.events.emit("enemy:telegraph", { enemy: d, type: "gull", time: gn.telegraph, pos: d.pos }));
      else if (d.atk === "tele")
        ((d.atkT -= y),
          (d.flare = Math.min(1, d.flare + y * 4.5)),
          E
            ? d.atkT <= 0 && ((d.atk = "burst"), (d.shots = gn.burst), (d.atkT = 0), (d.lead = 0.2 + o() * 0.65))
            : ((d.atk = "idle"), n.releaseToken(d)));
      else if (d.atk === "burst" && ((d.atkT -= y), (d.flare = 1), d.atkT <= 0)) {
        if (((d.atkT = gn.burstGap), d.shots--, b)) {
          let q = d.muzzle.distanceTo(b.pos),
            ue = q / gn.boltSpeed;
          (Wh.set(b.pos.x + b.vel.x * ue * d.lead, b.pos.y + 1.05, b.pos.z + b.vel.z * ue * d.lead), Qs.copy(Wh).sub(d.muzzle).normalize());
          let de = (gn.spreadFar + (gn.spreadNear - gn.spreadFar) * d.exposure) * (1 + n.playerSpeed * 0.45) * (M ? 1.5 : 1);
          ((Qs.x += (o() - 0.5) * 2 * de),
            (Qs.y += (o() - 0.5) * 2 * de),
            (Qs.z += (o() - 0.5) * 2 * de),
            Qs.normalize(),
            n.fireBolt(d.muzzle, Qs, d),
            s.fx.muzzleFlash(d.muzzle, Qs, { scale: 0.55 }),
            s.events.emit("enemy:fire", { enemy: d, pos: d.muzzle, dir: Qs, type: "gull" }),
            d.vel.addScaledVector(Qs, -0.35));
        }
        d.shots <= 0 && ((d.atk = "idle"), (d.cool = gn.cooldown[0] + o() * (gn.cooldown[1] - gn.cooldown[0])), n.releaseToken(d));
      }
      (M &&
        ((d.smokeT -= y),
        d.smokeT <= 0 &&
          ((d.smokeT = 0.16),
          s.fx.smoke(d.pos, { size: 0.3, life: 1.1, color: 2500652, rise: 0.8 }),
          o() < 0.15 && s.fx.sparks(d.pos, GS, 2))),
        d.loop && (d.loop.setPos(d.pos), d.loop.setPitch(0.85 + d.thr * 0.2 + (M ? Math.sin(g * 13) * 0.05 : 0))));
    }
    return d;
  }
  export var tb = {
      hp: 140,
      shotDamage: 5,
      burst: 4,
      burstGap: 0.11,
      telegraph: 0.5,
      cooldown: [1.8, 3],
      runSpeed: 4.5,
      stalkSpeed: 2,
      patrolSpeed: 1.5,
      accel: 7,
      turnRate: 2.5,
      rangeMin: 8,
      rangeMax: 18,
      spreadFar: 0.12,
      spreadNear: 0.045,
      lungeRange: 3,
      lungeDamage: 15,
      lungeCooldown: 3.5,
      lungeSpeed: 9.5,
      replan: 0.6,
      smokeBelow: 0.4,
    },
    c0 = tb,
    Yn = Ky,
    _s = new K(),
    Gh = new K(),
    Ho = new K(),
    Oo = new K(),
    YS = new K(),
    G1 = new K(),
    Qy = new K(0, 1, 0),
    B5 = { abd: 0, hip: 0, knee: 0, reach: 0 },
    H5 = [8, 4, 0.7],
    YD = [14, 1, 0.35],
    O5 = (n, e) => {
      let t = (n - e) % (Math.PI * 2);
      return (t > Math.PI ? (t -= Math.PI * 2) : t < -Math.PI && (t += Math.PI * 2), t);
    },
    bo = (n, e, t) => (n < e ? e : n > t ? t : n),
    V5 = [
      [0, 3],
      [1, 2],
    ];
__late_weapon.tb(tb);
  export function ll(n, e, t, i, s) {
    return ((n.v += ((e - n.x) * t - n.v * i) * s), (n.x += n.v * s), n.x);
  }
  export function jS(n, e, t, i) {
    let s = n.G,
      o = n.rng,
      r = t.lensBase.clone(),
      a = z5(e, { shell: t.shell, metal: t.metal, glow: t.glow, lens: r }, { radius: 1.5, center: [0, 0.6, 0] }),
      l = a.bones;
    a.group.visible = !1;
    let c = [],
      u = [],
      f = [];
    for (let k = 0; k < 4; k++) (c.push(l["abd" + Yn.legs[k]]), u.push(l["thigh" + Yn.legs[k]]), f.push(l["shin" + Yn.legs[k]]));
    let h = s.mats.label("H-" + String(i + 3).padStart(2, "0"), { color: "black", font: "stencil", distress: 0.3 }),
      p = 0.2,
      d = Math.min(0.085, p / (h.aspect || 3)),
      m = new w0(p, d);
    (m.rotateY(Math.PI / 2), m.translate(0.1675, 0.03, -0.085));
    let x = new w0(p, d);
    (x.rotateY(-Math.PI / 2), x.translate(-0.1675, 0.03, -0.085));
    let v = n.mergeSimple([m, x]),
      y = new ht(v, h.material);
    ((y.castShadow = !1), (y.receiveShadow = !0), l.body.add(y));
    let b = [0, 1, 2, 3].map(() => ({ p: new K(), from: new K(), to: new K(), slide: new K() })),
      g = {
        id: 0,
        type: "hound",
        pos: a.group.position,
        alive: !1,
        hp: c0.hp,
        active: !1,
        rig: a,
        lens: r,
        feet: b,
        yaw: 0,
        speed: 0,
        yawRate: 0,
        home: new K(),
        lastKnown: new K(),
        goal: new K(),
        firePos: new K(),
        firePlayer: new K(),
        sensor: new K(),
        fwd: new K(0, 0, 1),
        muzzle: new K(),
        headPos: new K(),
        push: new K(),
        mode: "patrol",
        los: !1,
        seeT: 0,
        noSeeT: 0,
        senseT: 0,
        exposure: 0,
        modeT: 0,
        passive: !1,
        hasToken: !1,
        es: "move",
        esT: 0,
        cool: 1,
        shots: 0,
        bursts: 0,
        lungeCd: 0,
        path: null,
        wp: 0,
        planT: 0,
        hasGoal: !1,
        waitT: 0,
        moveT: 0,
        stuckT: 0,
        sw: -1,
        swT: 0,
        swDur: 0.2,
        lastPair: 1,
        idleT: 0,
        lift: 0.08,
        sY: { x: 0, v: 0 },
        sP: { x: 0, v: 0 },
        sR: { x: 0, v: 0 },
        sL: { x: 0, v: 0 },
        sA: { x: 0, v: 0 },
        sA2: { x: 0, v: 0 },
        crouch: 0,
        tyaw: 0,
        tpitch: 0,
        hyaw: 0,
        hpitch: 0,
        flare: 0,
        lensC: [H5[0], H5[1], H5[2]],
        smokeT: 0,
        phase: 0,
        scan: 0,
        dieT: 0,
        vy: 0,
        dieRoll: 0,
        diePitch: 0,
        wreck: !1,
        sink: 0,
        loop: null,
        prevSpeed: 0,
        maxSpeed: c0.patrolSpeed,
        damage(k, C, A, F) {
          if (!g.alive) return !1;
          if (((g.hp -= k), s.events.emit("enemy:hit", { enemy: g, point: C, part: F || "body" }), A)) {
            let H = Math.cos(g.yaw),
              N = Math.sin(g.yaw),
              Z = Math.min(1.6, k / 28),
              Q = A.x * N + A.z * H,
              W = A.x * H - A.z * N;
            ((g.sL.v += W * 1.4 * Z), (g.sR.v += -W * 3.2 * Z), (g.sP.v += Q * 2.4 * Z * (F === "weak" ? 1.6 : 1)), (g.sY.v -= 0.5 * Z));
          }
          return (n.provoke(g), g.hp <= 0 ? (L(A), !0) : !1);
        },
        _activate(k, C = {}) {
          ((g.active = !0),
            (g.alive = !0),
            (g.wreck = !1),
            (g.hp = c0.hp),
            (g.passive = !!C.passive),
            (g.sink = 0),
            g.pos.copy(k),
            (g.pos.y = s.physics.groundHeight(k.x, k.z, k.y + 1)),
            g.home.copy(g.pos),
            (g.yaw = C.yaw ?? o() * 6.283),
            (g.speed = 0),
            (g.yawRate = 0),
            g.push.set(0, 0, 0),
            (g.mode = C.state === "alert" ? "investigate" : "patrol"),
            (g.modeT = 10),
            (g.modeSeen = g.mode),
            g.lastKnown.copy(C.target || (s.player ? s.player.pos : k)),
            (g.los = !1),
            (g.seeT = g.noSeeT = 0),
            (g.exposure = 0),
            (g.senseT = o() * 0.2),
            (g.hasToken = !1),
            (g.patrolR = C.patrolRadius ?? 7),
            (g.patrolLine = C.patrolLine || null),
            (g.patrolI = 0),
            (g.es = "move"),
            (g.cool = 0.6 + o()),
            (g.lungeCd = 0.3),
            (g.path = null),
            (g.hasGoal = !1),
            (g.waitT = o() * 1.5),
            (g.planT = 0),
            (g.sw = -1),
            (g.idleT = 0),
            (g.crouch = 0),
            (g.feelT = 0),
            (g.blocked = !1),
            (g.flare = 0),
            (g.phase = o() * 6.283),
            (g.dieT = 0),
            (g.tyaw = g.hyaw = 0),
            (g.tpitch = g.hpitch = 0));
          for (let A of [g.sY, g.sP, g.sR, g.sL, g.sA, g.sA2]) ((A.x = 0), (A.v = 0));
          for (let A = 0; A < 4; A++) E(b[A].p, A, g.pos.x, g.pos.z, g.yaw);
          if (
            (l.neck.rotation.set(0, 0, 0),
            l.gun.rotation.set(0, 0, 0),
            (a.group.visible = !0),
            I(0.016),
            s.audio && s.audio.loop && !g.loop)
          )
            try {
              g.loop = s.audio.loop("hound_servo", { pos: g.pos, gain: 0 });
            } catch {
              g.loop = null;
            }
        },
        _deactivate() {
          if (((g.active = !1), (g.alive = !1), (g.wreck = !1), (a.group.visible = !1), n.releaseToken(g), g.loop)) {
            try {
              g.loop.stop();
            } catch {}
            g.loop = null;
          }
        },
        _raycast(k, C, A, F) {
          let H = !1;
          KS(k, C, g.headPos, 0.155, A, F) && ((F.part = "weak"), (F.enemy = g), (H = !0));
          let N = Math.cos(g.yaw),
            Z = Math.sin(g.yaw),
            Q = g.pos.y + Yn.stand + g.sY.x - g.crouch;
          return (
            _s.set(g.pos.x - Z * 0.45, Q + 0.03, g.pos.z - N * 0.45),
            Gh.set(g.pos.x + Z * 0.47, Q + 0.03, g.pos.z + N * 0.47),
            ZS(k, C, _s, Gh, 0.27, A, F) && ((F.part = "body"), (F.enemy = g), (H = !0)),
            (_s.y = Gh.y = g.pos.y + (Q - g.pos.y) * 0.45),
            ZS(k, C, _s, Gh, 0.25, A, F) && ((F.part = "body"), (F.enemy = g), (H = !0)),
            H
          );
        },
        _update(k) {
          g.alive ? S(k) : U(k);
        },
      };
    function E(k, C, A, F, H) {
      let N = Yn.side[C] * Yn.footX,
        Z = Yn.footZ[C],
        Q = Math.cos(H),
        W = Math.sin(H);
      return (k.set(A + N * Q + Z * W, 0, F - N * W + Z * Q), k);
    }
    function M(k, C) {
      (!C && g.hasGoal && g.goal.distanceToSquared(k) < 0.25) || (g.goal.copy(k), (g.hasGoal = !0), (g.planT = 0), (g.stuckT = 0));
    }
    function _() {
      g.planT = c0.replan + o() * 0.15;
      let k = null;
      try {
        k = s.physics.nav.findPath(g.pos, g.goal);
      } catch {
        k = null;
      }
      ((g.path = k && k.length ? k : null),
        (g.wp = 0),
        g.path && g.path.length > 1 && g.path[0].distanceToSquared(g.pos) < 0.36 && (g.wp = 1));
    }
    function T(k, C) {
      if (!g.hasGoal) return ((g.maxSpeed = 0), !0);
      ((g.planT -= k), g.planT <= 0 && _());
      let A = g.goal;
      if (g.path) {
        for (; g.wp < g.path.length - 1 && Math.hypot(g.path[g.wp].x - g.pos.x, g.path[g.wp].z - g.pos.z) < 0.55;) g.wp++;
        A = g.path[Math.min(g.wp, g.path.length - 1)];
      }
      let F = g.goal.x - g.pos.x,
        H = g.goal.z - g.pos.z,
        N = Math.hypot(F, H);
      if (N < 0.45) return ((g.hasGoal = !1), (g.maxSpeed = 0), !0);
      let Z = A.x - g.pos.x,
        Q = A.z - g.pos.z;
      g.wantYaw = Math.atan2(Z, Q);
      let W = Math.abs(O5(g.wantYaw, g.yaw));
      return ((g.maxSpeed = W > 1.1 ? 0 : Math.min(C * (1 - W * 0.5), 0.4 + N * 2.6)), !1);
    }
    function w() {
      let k = s.player;
      if (!k) return;
      let C = 1 / 0,
        A = k.eye || k.pos,
        F = (Z, Q) => {
          let W = Math.hypot(Z.x - k.pos.x, Z.z - k.pos.z);
          if (W < c0.rangeMin || W > c0.rangeMax || (s.physics.nav.isWalkable && !s.physics.nav.isWalkable(Z.x, Z.z))) return;
          let J = Math.hypot(Z.x - g.pos.x, Z.z - g.pos.z) * 0.9 + Q + o() * 3,
            G = Z.x - k.pos.x,
            te = Z.z - k.pos.z;
          for (let oe of n.list) {
            if (oe === g || !oe.alive || oe.type !== "hound" || oe.mode !== "engage") continue;
            let ee = oe.es === "move" ? oe.firePos : oe.pos,
              le = ee.x - k.pos.x,
              xe = ee.z - k.pos.z,
              j = (G * le + te * xe) / (Math.hypot(G, te) * Math.hypot(le, xe) + 1e-4);
            (j > 0.86 && (J += (14 * (j - 0.86)) / 0.14), Math.hypot(Z.x - ee.x, Z.z - ee.z) < 3 && (J += 16));
          }
          J >= C ||
            (G1.set(Z.x, Z.y + 0.95, Z.z), s.physics.lineOfSight(G1, A) || (J += 22), J < C && ((C = J), g.firePos.set(Z.x, Z.y, Z.z)));
        },
        H = s.level && s.level.coverPoints;
      if (H) for (let Z = 0; Z < H.length; Z++) F(H[Z], -2);
      for (let Z = 0; Z < 7; Z++) {
        let Q = s.physics.nav.randomPoint(k.pos, c0.rangeMax);
        Q && F(Q, 0);
      }
      let N = Math.atan2(g.pos.z - k.pos.z, g.pos.x - k.pos.x);
      for (let Z = 0; Z < 5; Z++) {
        let Q = N + (o() - 0.5) * 2.6,
          W = c0.rangeMin + 1 + o() * (c0.rangeMax - c0.rangeMin - 2);
        (Oo.set(k.pos.x + Math.cos(Q) * W, k.pos.y, k.pos.z + Math.sin(Q) * W),
          (Oo.y = s.physics.groundHeight(Oo.x, Oo.z, k.pos.y + 1)),
          F(Oo, 1));
      }
      (C === 1 / 0 && g.firePos.copy(g.pos),
        g.firePlayer.copy(k.pos),
        M(g.firePos, !0),
        (g.es = "move"),
        (g.esT = 0),
        (g.moveT = 0),
        (g.bursts = 0));
    }
    function S(k) {
      let C = s.player,
        A = n.t;
      (g.fwd.set(Math.sin(g.yaw), 0, Math.cos(g.yaw)),
        g.sensor.copy(g.headPos),
        n.think(g, k, 0.55),
        g.mode !== g.modeSeen &&
          ((g.modeSeen = g.mode),
          (g.hasGoal = !1),
          (g.path = null),
          (g.waitT = 0),
          g.mode === "engage" ? w() : (g.es === "tele" || g.es === "burst") && (n.releaseToken(g), (g.es = "move"))),
        (g.wantYaw = g.yaw),
        (g.maxSpeed = 0),
        (g.cool -= k),
        (g.lungeCd -= k));
      let F = null,
        H = null,
        N = 0,
        Z = !1,
        Q = C ? Math.hypot(C.pos.x - g.pos.x, C.pos.z - g.pos.z) : 1e9;
      if (g.mode === "patrol") {
        if (g.hasGoal) T(k, c0.patrolSpeed) && (g.waitT = 1.5 + o() * 3);
        else if (((g.waitT -= k), g.waitT <= 0))
          if (g.patrolLine) ((g.patrolI = (g.patrolI + 1) % g.patrolLine.length), M(g.patrolLine[g.patrolI], !0));
          else {
            let D = s.physics.nav.randomPoint(g.home, g.patrolR);
            D ? M(D, !0) : (g.waitT = 1);
          }
      } else if (g.mode === "investigate" || g.mode === "search") {
        H = g.lastKnown;
        let D = Math.hypot(g.lastKnown.x - g.pos.x, g.lastKnown.z - g.pos.z);
        D > 2.2
          ? (M(g.lastKnown), T(k, D < 8 ? c0.stalkSpeed : c0.runSpeed))
          : ((g.hasGoal = !1), (g.scan += k), (g.wantYaw = g.yaw + Math.sin(g.scan * 0.8) * 0.9), (H = null));
      } else if (C) {
        ((F = C.pos), (H = C.pos));
        let D = Math.atan2(C.pos.x - g.pos.x, C.pos.z - g.pos.z);
        switch (
          ((g.es === "move" || g.es === "aim" || g.es === "cool") &&
            Q < c0.lungeRange &&
            g.lungeCd <= 0 &&
            C.alive &&
            ((g.es = "wind"),
            (g.esT = 0.28),
            n.releaseToken(g),
            s.events.emit("enemy:telegraph", { enemy: g, type: "hound", time: 0.28, pos: g.pos, melee: !0 })),
          g.es)
        ) {
          case "move": {
            g.moveT += k;
            let B = T(k, c0.runSpeed),
              X = Q > c0.rangeMin - 1 && Q < c0.rangeMax + 2;
            B || (g.moveT > 1.4 && g.los && X && o() < k * 0.7) || g.moveT > 7
              ? ((g.es = "aim"), (g.esT = 0), (g.hasGoal = !1))
              : C.pos.distanceToSquared(g.firePlayer) > 49 && w();
            break;
          }
          case "aim":
          case "cool": {
            ((g.wantYaw = D),
              (g.esT += k),
              g.los
                ? Q < c0.rangeMin - 3 && g.esT > 0.8
                  ? w()
                  : g.cool <= 0 &&
                    C.alive &&
                    Math.abs(O5(D - g.yaw, g.tyaw)) < 0.14 &&
                    n.requestToken(g) &&
                    ((g.es = "tele"),
                    (g.esT = c0.telegraph),
                    s.events.emit("enemy:telegraph", { enemy: g, type: "hound", time: c0.telegraph, pos: g.pos }))
                : (g.noSeeT > 1.1 || g.esT > 3) && w());
            break;
          }
          case "tele": {
            ((g.wantYaw = D),
              (g.esT -= k),
              (g.flare = Math.min(1, g.flare + k * 5)),
              (N = 0.05),
              g.esT <= 0 && ((g.es = "burst"), (g.shots = c0.burst), (g.esT = 0)));
            break;
          }
          case "burst": {
            ((g.wantYaw = D),
              (g.esT -= k),
              (g.flare = 1),
              (N = 0.05),
              g.esT <= 0 && ((g.esT = c0.burstGap), g.shots--, R(C)),
              g.shots <= 0 &&
                (n.releaseToken(g),
                (g.cool = c0.cooldown[0] + o() * (c0.cooldown[1] - c0.cooldown[0])),
                g.bursts++,
                g.bursts >= 1 + (o() < 0.4 ? 1 : 0) ? w() : ((g.es = "cool"), (g.esT = 0))));
            break;
          }
          case "wind": {
            ((g.wantYaw = D),
              (g.esT -= k),
              (N = 0.16),
              (g.sP.v += 3 * k),
              g.esT <= 0 && ((g.es = "lunge"), (g.esT = 0.36), (g.speed = c0.lungeSpeed), (g.yaw = D)));
            break;
          }
          case "lunge": {
            ((Z = !0),
              (g.esT -= k),
              (g.wantYaw = D),
              (g.maxSpeed = c0.lungeSpeed),
              (g.speed = c0.lungeSpeed),
              Q < 1.35 &&
                C.alive &&
                (C.damage(c0.lungeDamage, g.pos), s.events.emit("enemy:melee", { enemy: g, pos: g.pos }), (g.esT = 0), (g.sP.v -= 4)),
              g.esT <= 0 && ((g.es = "recover"), (g.esT = 0.55), (g.lungeCd = c0.lungeCooldown), (g.speed *= 0.3)));
            break;
          }
          case "recover": {
            ((g.esT -= k), (g.wantYaw = D), g.esT <= 0 && w());
            break;
          }
        }
      }
      let W = O5(g.wantYaw, g.yaw),
        J = bo(W * 6, -c0.turnRate, c0.turnRate) * (Z ? 2 : 1);
      ((g.yawRate += (J - g.yawRate) * (1 - Math.exp(-10 * k))), (g.yaw += g.yawRate * k));
      let G = g.maxSpeed > g.speed ? c0.accel : -c0.accel * 1.4;
      ((g.prevSpeed = g.speed),
        (g.speed = Z ? g.speed : bo(g.speed + G * k, 0, Math.max(g.maxSpeed, 0))),
        !Z && G < 0 && g.speed < g.maxSpeed && (g.speed = g.maxSpeed));
      let te = Math.sin(g.yaw),
        oe = Math.cos(g.yaw);
      for (let D of n.list) {
        if (D === g || D.type !== "hound" || !D.active) continue;
        let B = g.pos.x - D.pos.x,
          X = g.pos.z - D.pos.z,
          re = Math.hypot(B, X);
        if (re < 1.7 && re > 0.001) {
          let Y = ((1.7 - re) * 2.2) / re;
          ((g.push.x += B * Y * k * 6), (g.push.z += X * Y * k * 6));
        }
      }
      if (C && !Z && Q < 1.25 && Q > 0.001) {
        let D = ((1.25 - Q) * 3) / Q;
        ((g.push.x += (g.pos.x - C.pos.x) * D * k * 6), (g.push.z += (g.pos.z - C.pos.z) * D * k * 6));
      }
      g.push.multiplyScalar(Math.exp(-5 * k));
      let ee = g.pos.x + (te * g.speed + g.push.x) * k,
        le = g.pos.z + (oe * g.speed + g.push.z) * k,
        xe = s.physics.nav;
      if (((g.feelT -= k), g.feelT <= 0 && g.speed > 0.3)) {
        ((g.feelT = 0.12), Oo.set(g.pos.x, g.pos.y + 0.55, g.pos.z), Ho.set(te, 0, oe));
        let D = s.physics.raycast(Oo, Ho, 0.75 + g.speed * 0.12);
        g.blocked = !!D;
      } else g.speed <= 0.3 && (g.blocked = !1);
      (((xe.isWalkable && !xe.isWalkable(ee, le)) || (g.blocked && !Z) || (g.blocked && Z && g.esT < 0.3)) &&
        (g.blocked
          ? ((ee = g.pos.x + g.push.x * k), (le = g.pos.z + g.push.z * k), (g.yawRate += (g.phase > 3.14 ? 1 : -1) * 4 * k))
          : xe.isWalkable(ee, g.pos.z)
            ? (le = g.pos.z)
            : xe.isWalkable(g.pos.x, le)
              ? (ee = g.pos.x)
              : ((ee = g.pos.x), (le = g.pos.z)),
        (g.speed *= 0.6),
        (g.stuckT += k),
        g.stuckT > 0.5 &&
          ((g.stuckT = 0), (g.planT = 0), g.mode === "engage" && g.es === "move" ? w() : g.mode === "patrol" && (g.hasGoal = !1))),
        (g.pos.x = ee),
        (g.pos.z = le),
        (g.pos.y += (s.physics.groundHeight(ee, le, g.pos.y + 0.6) - g.pos.y) * (1 - Math.exp(-12 * k))),
        z(k),
        (g.crouch += (N - g.crouch) * (1 - Math.exp(-12 * k))));
      let j = Math.cos(g.yaw),
        O = Math.sin(g.yaw),
        q = 0,
        ue = 0,
        de = 0,
        $ = 0.05,
        se = g.pos.y + Yn.stand + g.sY.x - g.crouch;
      if (F) {
        let D = F.x - g.pos.x,
          B = F.z - g.pos.z,
          X = F.y + 1 - (se + 0.25);
        ((q = Math.atan2(D * j - B * O, D * O + B * j)), (ue = bo(Math.atan2(-X, Math.hypot(D, B)), -0.9, 0.35)));
      } else ((g.scan += k * 0.5), (q = Math.sin(g.scan * 0.9 + g.phase) * 1.1));
      if (H) {
        let D = H.x - g.pos.x,
          B = H.z - g.pos.z,
          X = H.y + 1.2 - (se + 0.2);
        ((de = bo(Math.atan2(D * j - B * O, D * O + B * j), -1.2, 1.2)), ($ = bo(Math.atan2(-X, Math.hypot(D, B)), -0.6, 0.5)));
      } else de = Math.sin(n.t * 0.7 + g.phase) * 0.5 + bo(g.yawRate * 0.25, -0.6, 0.6);
      let fe = bo(4.5 * k, 0, 1);
      ((g.tyaw += bo(O5(q, g.tyaw), -fe, fe)), (g.tpitch += (ue - g.tpitch) * (1 - Math.exp(-10 * k))));
      let me = 1 - Math.exp(-7 * k);
      ((g.hyaw += (de - g.hyaw) * me), (g.hpitch += ($ - g.hpitch) * me), I(k));
      let ge = (n.t * (g.mode === "patrol" ? 0.8 : 2.2) + g.phase) % 1;
      l.beacon.scale.setScalar(ge < 0.12 || (ge > 0.22 && ge < 0.3) ? 1 : 1e-4);
      let ce = g.mode === "engage" ? YD : H5,
        P = 1 + g.flare * 3.5;
      for (let D = 0; D < 3; D++) g.lensC[D] += (ce[D] - g.lensC[D]) * (1 - Math.exp(-8 * k));
      (r.color.setRGB(g.lensC[0] * P, g.lensC[1] * P, g.lensC[2] * P),
        (g.flare = Math.max(0, g.flare - k * 2)),
        g.hp < c0.hp * c0.smokeBelow &&
          ((g.smokeT -= k),
          g.smokeT <= 0 &&
            ((g.smokeT = 0.2),
            _s.set(g.pos.x - te * 0.3, se + 0.2, g.pos.z - oe * 0.3),
            s.fx.smoke(_s, { size: 0.35, life: 1.3, color: 2303272, rise: 0.9 }),
            o() < 0.2 && s.fx.sparks(_s, Qy, 3))),
        g.loop &&
          (g.loop.setPos(g.pos),
          g.loop.setGain(bo(0.12 + g.speed * 0.12 + Math.abs(g.yawRate) * 0.1, 0, 0.8)),
          g.loop.setPitch(0.8 + g.speed * 0.08)));
    }
    function R(k) {
      let C = Math.cos(g.yaw + g.tyaw),
        A = Math.sin(g.yaw + g.tyaw);
      (Oo.setFromMatrixPosition(l.gun.matrixWorld),
        (Oo.lengthSq() < 1e-6 || Math.abs(Oo.x - g.pos.x) > 2) && Oo.set(g.pos.x, g.pos.y + Yn.stand + 0.25, g.pos.z),
        G1.set(k.pos.x, k.pos.y + 1, k.pos.z),
        Ho.copy(G1).sub(Oo).normalize(),
        g.muzzle.copy(Oo).addScaledVector(Ho, 0.43));
      let F = (c0.spreadFar + (c0.spreadNear - c0.spreadFar) * g.exposure) * (1 + n.playerSpeed * 0.3);
      ((Ho.x += (o() - 0.5) * 2 * F), (Ho.y += (o() - 0.5) * 2 * F), (Ho.z += (o() - 0.5) * 2 * F), Ho.normalize());
      let H = s.physics.raycast(g.muzzle, Ho, 200),
        Z = s.combat.enemyShot(g.muzzle, Ho, { damage: c0.shotDamage, range: 200 }) ? g.muzzle.distanceTo(G1) : H ? H.dist : 90;
      (YS.copy(g.muzzle).addScaledVector(Ho, Z),
        s.fx.tracer(g.muzzle, YS, { color: 16760944, speed: 260, width: 0.035 }),
        s.fx.muzzleFlash(g.muzzle, Ho, { scale: 0.9 }),
        s.render && s.render.lightPool && s.render.lightPool.flash(g.muzzle, 16756832, 22, 7, 0.05),
        s.events.emit("enemy:fire", { enemy: g, pos: g.muzzle, dir: Ho, type: "hound" }),
        (g.sP.v += 1.1),
        (g.sY.v -= 0.25));
    }
    function z(k) {
      let C = Math.sin(g.yaw) * g.speed + g.push.x,
        A = Math.cos(g.yaw) * g.speed + g.push.z,
        F = g.speed > 0.15 || Math.abs(g.yawRate) > 0.25;
      if (g.sw < 0) {
        g.idleT = F ? 0 : g.idleT + k;
        let H = g.speed + Math.abs(g.yawRate) * 0.5,
          N = bo(0.27 - H * 0.026, 0.14, 0.27),
          Z = -1,
          Q = 0;
        for (let J = 0; J < 2; J++) {
          let G = 0;
          for (let te of V5[J]) {
            E(_s, te, g.pos.x + C * N, g.pos.z + A * N, g.yaw + g.yawRate * N);
            let oe = Math.hypot(_s.x - b[te].p.x, _s.z - b[te].p.z);
            oe > G && (G = oe);
          }
          (J !== g.lastPair && (G *= 1.25), G > Q && ((Q = G), (Z = J)));
        }
        let W = F ? 0.09 : g.idleT > 0.25 ? 0.035 : 1e9;
        if (Z >= 0 && Q > W) {
          ((g.sw = Z), (g.swT = 0), (g.swDur = N), (g.lift = 0.065 + Math.min(0.09, H * 0.02)));
          for (let J of V5[Z]) {
            let G = b[J];
            (G.from.copy(G.p),
              E(G.to, J, g.pos.x + C * N * 1.5, g.pos.z + A * N * 1.5, g.yaw + g.yawRate * N * 1.5),
              (G.to.y = s.physics.groundHeight(G.to.x, G.to.z, g.pos.y + 0.6)));
          }
        }
      } else {
        g.swT += k / g.swDur;
        let H = g.swT >= 1 ? 1 : g.swT,
          N = H * H * (3 - 2 * H);
        for (let Z of V5[g.sw]) {
          let Q = b[Z];
          (Q.p.lerpVectors(Q.from, Q.to, N), (Q.p.y += Math.sin(Math.PI * H) * g.lift));
        }
        if (g.swT >= 1) {
          let Z = b[V5[g.sw][0]];
          (s.events.emit("enemy:step", { pos: Z.p, type: "hound", enemy: g, speed: g.speed }),
            (g.sY.v -= 0.12 + g.speed * 0.03),
            (g.lastPair = g.sw),
            (g.sw = -1));
        }
      }
    }
    function I(k) {
      let C = Math.cos(g.yaw),
        A = Math.sin(g.yaw),
        F = (b[0].p.y + b[1].p.y) * 0.5,
        H = (b[2].p.y + b[3].p.y) * 0.5,
        N = (b[0].p.y + b[2].p.y) * 0.5,
        Z = (b[1].p.y + b[3].p.y) * 0.5,
        Q = (F + H) * 0.5 - g.pos.y,
        W = k > 0 ? (g.speed - g.prevSpeed) / k : 0,
        J = Math.atan2(H - F, 0.8) * 0.6 + bo(W * 0.006, -0.07, 0.07),
        G = Math.atan2(N - Z, 0.55) * 0.6 + bo(g.yawRate * g.speed * 0.02, -0.12, 0.12),
        te = Q * 0.45 - Math.min(0.05, g.speed * 0.011);
      (g.alive || ((J = g.diePitch), (G = g.dieRoll), (te = 0)),
        g.alive && (ll(g.sY, te, 160, 17, k), ll(g.sP, J, 130, 15, k), ll(g.sR, G, 130, 15, k), ll(g.sL, 0, 110, 13, k)));
      let oe = g.alive ? Math.sin(n.t * 1.7 + g.phase) * 0.004 : 0,
        ee = g.sL.x,
        le = Yn.stand + g.sY.x - g.crouch + oe,
        xe = g.sP.x,
        j = g.sR.x;
      ((a.group.rotation.y = g.yaw),
        l.body.position.set(ee, le, 0),
        l.body.rotation.set(xe, 0, j),
        (l.turret.rotation.y = g.tyaw),
        (l.gun.rotation.x = g.tpitch - xe * 0.5),
        l.head.rotation.set(g.hpitch, g.hyaw, 0),
        ll(g.sA, bo(-W * 0.03 - xe, -0.6, 0.6), 60, 5, k),
        ll(g.sA2, bo(g.yawRate * 0.12 - j, -0.6, 0.6), 60, 5, k),
        l.antenna.rotation.set(g.sA.x, 0, g.sA2.x));
      let O = Math.cos(xe),
        q = Math.sin(xe),
        ue = Math.cos(j),
        de = Math.sin(j);
      for (let $ = 0; $ < 4; $++) {
        let se = b[$].p,
          fe = se.x - g.pos.x,
          me = se.y + Yn.footR * 0.6 - g.pos.y,
          ge = se.z - g.pos.z,
          ce = fe * C - ge * A - ee,
          P = me - le,
          D = fe * A + ge * C,
          B = P * O + D * q,
          X = -P * q + D * O,
          re = ce * ue + B * de,
          Y = -ce * de + B * ue;
        (US(B5, re - Yn.side[$] * Yn.hipX, Y - Yn.hipY, X - Yn.fore[$] * Yn.hipZ, Yn.side[$], Yn.l0, Yn.L1, Yn.L2 - Yn.footR * 0.6),
          (c[$].rotation.z = B5.abd),
          (u[$].rotation.x = B5.hip),
          (f[$].rotation.x = B5.knee));
      }
      (a.group.updateMatrixWorld(!0), g.headPos.setFromMatrixPosition(l.head.matrixWorld));
    }
    function L(k) {
      ((g.alive = !1),
        n.releaseToken(g),
        (g.dieT = 0),
        (g.vy = 0),
        (g.es = "move"),
        l.beacon.scale.setScalar(1e-4),
        (g.dieRoll = (o() < 0.5 ? -1 : 1) * (0.25 + o() * 0.3)),
        (g.diePitch = (o() - 0.5) * 0.25),
        (g.sR.v += g.dieRoll * 3),
        (g.sP.v += (o() - 0.5) * 2));
      for (let C = 0; C < 4; C++) {
        let A = b[C];
        g.sw >= 0 && (A.p.y = g.pos.y);
        let F = g.yaw,
          H = Yn.side[C] * (0.16 + o() * 0.2),
          N = Yn.fore[C] * (0.05 + o() * 0.22) + (o() - 0.5) * 0.1;
        A.slide.set(H * Math.cos(F) + N * Math.sin(F), 0, -H * Math.sin(F) + N * Math.cos(F));
      }
      ((g.sw = -1),
        (g.speed *= 0.3),
        _s.copy(g.headPos),
        s.fx.sparks(_s, Qy, 16),
        s.fx.debris(_s, { count: 4 }),
        s.events.emit("enemy:killed", { enemy: g, pos: g.pos, type: "hound" }),
        n.addWreck(g));
    }
    function U(k) {
      if (g.sink > 0) {
        ((g.sink += k), (g.pos.y -= 0.22 * k), g.sink > 3.2 && n.retire(g));
        return;
      }
      g.dieT += k;
      let C = g.dieT;
      if (C < 2.2) {
        let A = 0.215 - Yn.stand;
        ((g.vy -= 9.8 * k * (C < 0.12 ? 0.3 : 1)),
          (g.sY.x += g.vy * k),
          g.sY.x < A &&
            ((g.sY.x = A),
            g.vy < -1.2 &&
              (s.events.emit("enemy:step", { pos: g.pos, type: "hound", enemy: g, speed: 5, crash: !0 }), s.fx.dust(g.pos, Qy)),
            (g.vy = -g.vy * 0.22)),
          ll(g.sP, g.diePitch, 60, 9, k),
          ll(g.sR, g.dieRoll, 60, 9, k),
          ll(g.sL, 0, 40, 8, k));
        let F = Math.exp(-3.2 * k);
        for (let N = 0; N < 4; N++) {
          let Z = b[N];
          ((Z.p.x += Z.slide.x * (1 - F)), (Z.p.z += Z.slide.z * (1 - F)), Z.slide.multiplyScalar(F));
        }
        ((g.pos.x += Math.sin(g.yaw) * g.speed * k),
          (g.pos.z += Math.cos(g.yaw) * g.speed * k),
          (g.speed *= Math.exp(-5 * k)),
          (g.hpitch += (0.55 - g.hpitch) * (1 - Math.exp(-5 * k))),
          (g.hyaw += (g.dieRoll - g.hyaw) * (1 - Math.exp(-3 * k))),
          (g.tpitch += (0.3 - g.tpitch) * (1 - Math.exp(-4 * k))));
        let H = C < 1.2 ? (Math.sin(C * 60) > 0.2 ? 1 - C / 1.2 : 0.05) : 0.02;
        (r.color.setRGB(6 * H + 0.05, 0.6 * H + 0.01, 0.2 * H), I(k));
      }
      if (C < 6.5)
        ((g.smokeT -= k),
          g.smokeT <= 0 &&
            ((g.smokeT = C < 2 ? 0.09 : 0.2),
            _s.set(g.pos.x + (o() - 0.5) * 0.4, g.pos.y + 0.42, g.pos.z + (o() - 0.5) * 0.4),
            s.fx.smoke(_s, { size: 0.5 + o() * 0.3, life: 1.8, color: 1513499, rise: 1.1 }),
            C < 4 && o() < 0.55 && (Gh.set(o() - 0.5, 1, o() - 0.5).normalize(), s.fx.sparks(_s, Gh, C < 1 ? 8 : 3)),
            C < 3.5 && o() < 0.4 && s.fx.smoke(_s, { size: 0.22, life: 0.45, color: 16742946, rise: 1.6 })));
      else if (!g.wreck && ((g.wreck = !0), g.loop)) {
        try {
          g.loop.stop();
        } catch {}
        g.loop = null;
      }
      g.loop && g.loop.setGain(Math.max(0, 0.4 - C * 0.3));
    }
    return g;
  }
  export function KS(n, e, t, i, s, o) {
    let r = n.x - t.x,
      a = n.y - t.y,
      l = n.z - t.z,
      c = r * e.x + a * e.y + l * e.z,
      u = r * r + a * a + l * l - i * i,
      f = c * c - u;
    if (f < 0) return !1;
    let h = -c - Math.sqrt(f);
    return h < 0 || h > s || h >= o.dist
      ? !1
      : ((o.dist = h), o.point.copy(n).addScaledVector(e, h), o.normal.copy(o.point).sub(t).normalize(), !0);
  }
  export var qh = new K(),
    eb = new K(),
    $S = new K();
  export function ZS(n, e, t, i, s, o, r) {
    (qh.copy(i).sub(t), eb.copy(n).sub(t));
    let a = qh.dot(qh),
      l = qh.dot(e),
      c = qh.dot(eb),
      u = e.dot(eb),
      f = a - l * l,
      h = f > 1e-8 ? (c - l * u) / f : 0;
    return ((h = h < 0 ? 0 : h > 1 ? 1 : h), $S.copy(t).addScaledVector(qh, h), KS(n, e, $S, s, o, r));
  }
  export var Bi = {
      gull: Jy,
      hound: tb,
      sightRange: 45,
      sightCone: 200,
      loseSight: 4,
      searchTime: 8,
      hearRadius: 45,
      maxTokens: 2,
      maxTokensCrowd: 3,
      tokenGap: 1.25,
      exposureUp: 0.1,
      exposureDown: 0.45,
      poolGulls: 10,
      poolHounds: 8,
      maxWrecks: 5,
      maxBolts: 32,
    },
    $D = Math.cos(((Bi.sightCone / 2) * Math.PI) / 180),
    JS = new K(),
    kB = new K(),
    nb = new K(),
    QS = new St(),
    eT = new Je(),
    tT = new K(1, 1, 1),
    ZD = new K(0, 0, 1),
    PB = new K(0, -1, 0),
    nT = new K(),
    iT = new K();
  export async function W5(n) {
    let e = su(+((n.params && n.params.eseed) || 9001)),
      t = [],
      i = [],
      s = new At();
    ((s.name = "enemies"), n.scene.add(s));
    let o = n.mats.emissive(16777215, 1),
      r = o && o.isMeshBasicMaterial ? o.clone() : new An();
    (r.color.setRGB(1, 1, 1), (r.vertexColors = !0), (r.needsUpdate = !0));
    let a = n.mats.emissive(16752704, 6),
      l = a && a.isMeshBasicMaterial ? a : new An({ color: 16752704 }),
      c = o && o.toneMapped !== void 0 ? o.toneMapped : !0,
      u = {
        shell: n.mats.get("armor_white", { triplanar: !0, vertexColors: !0 }),
        metal: n.mats.get("gunmetal", { triplanar: !0, vertexColors: !0 }),
        glow: r,
        lensBase: l,
        disc: new An({ color: 789775, transparent: !0, opacity: 0.42, depthWrite: !1, side: ln, toneMapped: c }),
        cone: new vn({
          uniforms: { uColor: { value: new Qe(1, 0.9, 0.74) }, uGain: { value: 0.085 } },
          vertexShader: `
        #include <common>
        #include <skinning_pars_vertex>
        varying float vT; varying vec3 vN; varying vec3 vV;
        void main() {
          #include <beginnormal_vertex>
          #include <skinbase_vertex>
          #include <skinnormal_vertex>
          #include <begin_vertex>
          #include <skinning_vertex>
          vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
          vN = normalMatrix * objectNormal; vV = -mv.xyz; vT = 1.0 - uv.y;
          gl_Position = projectionMatrix * mv;
        }`,
          fragmentShader: `
        uniform vec3 uColor; uniform float uGain;
        varying float vT; varying vec3 vN; varying vec3 vV;
        void main() {
          float f = abs(dot(normalize(vN), normalize(vV)));
          f = f * f * (3.0 - 2.0 * f);
          float t = clamp(vT, 0.0, 1.0);
          float k = pow(1.0 - t, 1.7) * (0.35 + 0.65 * smoothstep(0.0, 0.06, t));
          gl_FragColor = vec4(uColor * (uGain * f * k), 1.0);
        }`,
          transparent: !0,
          blending: wr,
          depthWrite: !1,
          side: ln,
          fog: !1,
        }),
      },
      f = {
        G: n,
        rng: e,
        list: t,
        t: 0,
        playerSpeed: 0,
        tokens: 0,
        tokenT: -9,
        lastType: "",
        wantT: { gull: -9, hound: -9 },
        mergeSimple: (k) => Tr(k, !1),
        requestToken(k) {
          if (k.hasToken) return !0;
          let C = 0;
          for (let Z of t) Z.alive && C++;
          let A = C > 5 ? Bi.maxTokensCrowd : Bi.maxTokens,
            F = f.t - f.tokenT,
            H = k.type === "gull" ? "hound" : "gull",
            N = f.lastType === k.type && f.t - f.wantT[H] < 0.5 && F < Bi.tokenGap * 2.2;
          return f.tokens >= A || F < Bi.tokenGap || N
            ? ((f.wantT[k.type] = f.t), !1)
            : (f.tokens++, (f.tokenT = f.t), (f.lastType = k.type), (k.hasToken = !0), !0);
        },
        releaseToken(k) {
          k.hasToken && ((k.hasToken = !1), (f.tokens = Math.max(0, f.tokens - 1)));
        },
        think(k, C, A) {
          let F = n.player;
          if (k.passive || !F) {
            k.los = !1;
            return;
          }
          if (((k.senseT -= C), k.senseT <= 0)) {
            k.senseT = 0.11 + e() * 0.08;
            let H = !1;
            if (F.alive !== !1) {
              let N = F.eye || F.pos,
                Z = N.x - k.sensor.x,
                Q = N.y - k.sensor.y,
                W = N.z - k.sensor.z,
                J = Math.hypot(Z, Q, W);
              if (J < Bi.sightRange) {
                let G = Math.hypot(Z, W) || 1e-4,
                  te = (Z * k.fwd.x + W * k.fwd.z) / G;
                (k.mode === "engage" || te > $D || J < 3.5) && (H = n.physics.lineOfSight(k.sensor, N));
              }
            }
            k.los = H;
          }
          (k.los
            ? ((k.seeT += C), (k.noSeeT = 0), k.lastKnown.copy(F.pos), (k.exposure = Math.min(1, k.exposure + C * Bi.exposureUp)))
            : ((k.noSeeT += C), (k.seeT = Math.max(0, k.seeT - C * 0.6)), (k.exposure = Math.max(0, k.exposure - C * Bi.exposureDown))),
            k.mode === "engage"
              ? (k.noSeeT > Bi.loseSight || F.alive === !1) && ((k.mode = "search"), (k.modeT = Bi.searchTime + e() * 3), f.releaseToken(k))
              : k.los && k.seeT > (k.mode === "patrol" ? A : A * 0.45)
                ? ((k.mode = "engage"), (k.noSeeT = 0), n.events.emit("enemy:alert", { enemy: k }), f.rally(k.pos, 18, F.pos, k))
                : k.mode !== "patrol" &&
                  ((k.modeT -= C), k.modeT <= 0 && ((k.mode = "patrol"), (k.home.x = k.pos.x), (k.home.z = k.pos.z))));
        },
        rally(k, C, A, F) {
          for (let H of t)
            H === F ||
              !H.alive ||
              H.passive ||
              H.mode === "engage" ||
              H.pos.distanceToSquared(k) > C * C ||
              (H.lastKnown.copy(A), (H.mode = "investigate"), (H.modeT = 9 + e() * 4));
        },
        provoke(k) {
          let C = n.player;
          !C ||
            k.passive ||
            !k.alive ||
            (k.mode !== "engage" && (k.lastKnown.copy(C.pos), (k.mode = "investigate"), (k.modeT = 10), (k.seeT = 1), (k.senseT = 0)),
            f.rally(k.pos, 20, C.pos, k));
        },
        fireBolt(k, C, A) {
          let F = null;
          for (let H = 0; H < x.length; H++)
            if (!x[H].on) {
              F = x[H];
              break;
            }
          F && ((F.on = !0), (F.life = 1.3), F.pos.copy(k), F.dir.copy(C), F.from.copy(k), (F.len = 0));
        },
        addWreck(k) {
          for (i.push(k); i.length > Bi.maxWrecks;) {
            let C = i.shift();
            C.active && (C.sink = 0.001);
          }
        },
        retire(k) {
          k._deactivate();
          let C = t.indexOf(k);
          (C >= 0 && t.splice(C, 1), (C = i.indexOf(k)), C >= 0 && i.splice(C, 1));
        },
      },
      h = WS(),
      p = VS(),
      d = [],
      m = [];
    for (let k = 0; k < Bi.poolGulls; k++) {
      let C = XS(f, h, u, k);
      (d.push(C), s.add(C.rig.group));
    }
    for (let k = 0; k < Bi.poolHounds; k++) {
      let C = jS(f, p, u, k);
      (m.push(C), s.add(C.rig.group));
    }
    let x = [];
    for (let k = 0; k < Bi.maxBolts; k++) x.push({ on: !1, life: 0, len: 0, pos: new K(), dir: new K(), from: new K() });
    let v = new io(0.016, 0.03, 1, 6, 1);
    (v.rotateX(Math.PI / 2), v.translate(0, 0, -0.5));
    let y = n.mats.emissive(16738858, 14),
      b = y && y.isMeshBasicMaterial ? y : new An({ color: new Qe(16738858).multiplyScalar(14) }),
      g = new Wo(v, b, Bi.maxBolts);
    ((g.frustumCulled = !1), (g.castShadow = !1), (g.receiveShadow = !1), (g.count = 0), g.instanceMatrix.setUsage(Ao), s.add(g));
    let E = { point: new K(), normal: new K(), dist: 0, surface: "concrete", enemy: null, part: null, dir: new K(), from: "enemy" };
    function M(k) {
      let C = n.player,
        A = 0;
      for (let F = 0; F < x.length; F++) {
        let H = x[F];
        if (!H.on) continue;
        let N = Bi.gull.boltSpeed * k;
        H.life -= k;
        let Z = n.physics.raycast(H.pos, H.dir, N),
          Q = Z ? Z.dist : N,
          W = !1;
        if (
          (C &&
            C.alive !== !1 &&
            (JS.copy(H.pos).addScaledVector(H.dir, Q),
            nT.set(C.pos.x, C.pos.y + 0.35, C.pos.z),
            iT.set(C.pos.x, C.pos.y + (C.crouching ? 1 : 1.5), C.pos.z),
            jD(H.pos, JS, nT, iT) < 0.36 * 0.36 && (W = !0)),
          W)
        ) {
          (C.damage(Bi.gull.boltDamage, H.from), (H.on = !1));
          continue;
        }
        if (Z) {
          (E.point.copy(Z.point),
            E.normal.copy(Z.normal),
            (E.dist = Z.dist),
            (E.surface = Z.surface),
            E.dir.copy(H.dir),
            n.events.emit("impact", E),
            (H.on = !1));
          continue;
        }
        if (H.life <= 0) {
          H.on = !1;
          continue;
        }
        (H.pos.addScaledVector(H.dir, N),
          (H.len = Math.min(1.5, H.len + N)),
          QS.setFromUnitVectors(ZD, H.dir),
          tT.set(1, 1, Math.max(0.2, H.len)),
          eT.compose(H.pos, QS, tT),
          g.setMatrixAt(A++, eT));
      }
      (A || g.count) && ((g.count = A), (g.instanceMatrix.needsUpdate = !0));
    }
    let _ = null,
      T = !1,
      w = 0,
      S = new K(),
      R = 0;
    function z(k) {
      if (!T) {
        T = !0;
        try {
          _ = n.render && n.render.lightPool && n.render.lightPool.acquire ? n.render.lightPool.acquire() : null;
        } catch {
          _ = null;
        }
        _ && _.light && (_.light.color.setRGB(1, 0.9, 0.75), (_.light.distance = 9));
      }
      if (!_ || !_.light) return;
      let C = null,
        A = 3600,
        F = n.camera ? n.camera.position : null;
      for (let N of t) {
        if (N.type !== "gull" || !N.alive) continue;
        let Z = F ? N.pos.distanceToSquared(F) : 0;
        Z < A && ((A = Z), (C = N));
      }
      let H = 0;
      if (C) {
        if (((w -= k), w <= 0)) {
          w = 0.1;
          let N = C.yaw + C.gy,
            Z = Math.cos(C.gp);
          nb.set(Math.sin(N) * Z, -Math.sin(C.gp), Math.cos(N) * Z).normalize();
          let Q = n.physics.raycast(C.sensor, nb, 14);
          (S.copy(C.sensor).addScaledVector(nb, (Q ? Q.dist : 8) - 0.6), (R = Q ? 1 : 0.3));
        }
        ((H = 26 * R), _.light.position.lerp(S, 1 - Math.exp(-12 * k)));
      }
      _.light.intensity += (H - _.light.intensity) * (1 - Math.exp(-8 * k));
    }
    let I = 1,
      L = 0,
      U = {
        list: t,
        TUNE: Bi,
        spawn(k, C, A = {}) {
          let F = k === "gull" ? d : k === "hound" ? m : null;
          if (!F) return null;
          let H = null;
          for (let N of F)
            if (!N.active) {
              H = N;
              break;
            }
          if (!H && k === "hound" && i.length) {
            let N = i[0];
            (f.retire(N), (H = N));
          }
          return H ? ((H.id = I++), t.push(H), H._activate(C, A), n.events.emit("enemy:spawn", { enemy: H }), H) : null;
        },
        raycast(k, C, A = 300) {
          let F = null;
          for (let H = 0; H < t.length; H++) {
            let N = t[H];
            if (!N.alive) continue;
            let Z = N.pos.x - k.x,
              Q = N.pos.y + (N.type === "hound" ? 0.6 : 0) - k.y,
              W = N.pos.z - k.z,
              J = Z * C.x + Q * C.y + W * C.z;
            J < -1.5 ||
              J > A + 1.5 ||
              Z * Z + Q * Q + W * W - J * J > 1.7 ||
              (F || (F = { dist: 1 / 0, point: new K(), normal: new K(), enemy: null, part: "body" }), N._raycast(k, C, A, F));
          }
          return F && F.enemy ? F : null;
        },
        aliveCount() {
          let k = 0;
          for (let C of t) C.alive && k++;
          return k;
        },
        clear() {
          for (let k of d) k.active && k._deactivate();
          for (let k of m) k.active && k._deactivate();
          ((t.length = 0), (i.length = 0), (f.tokens = 0));
          for (let k of x) k.on = !1;
          ((g.count = 0), _ && _.light && (_.light.intensity = 0));
        },
        alert(k, C = 40) {
          for (let A of t)
            !A.alive ||
              A.passive ||
              A.mode === "engage" ||
              A.pos.distanceToSquared(k) > C * C ||
              (A.lastKnown.copy(k),
              (A.lastKnown.y = Math.max(0, k.y - 1.6)),
              A.mode === "patrol" && n.events.emit("enemy:alert", { enemy: A, noise: !0 }),
              (A.mode = "investigate"),
              (A.modeT = 9 + e() * 4));
        },
        update(k) {
          if (k <= 0) return;
          (k > 0.05 && (k = 0.05), (f.t += k), (L -= k));
          let C = n.player;
          if (C) {
            let A = C.vel ? Math.hypot(C.vel.x, C.vel.z) : C.speed || 0;
            f.playerSpeed += (A - f.playerSpeed) * (1 - Math.exp(-6 * k));
          }
          for (let A = t.length - 1; A >= 0; A--) t[A]._update(k);
          (M(k), z(k));
        },
        debug: { ctx: f, gulls: d, hounds: m, wrecks: i, bolts: x, mats: u, tris: { gull: h.tris + h.extra.tris, hound: p.tris } },
      };
    return (
      n.events.on("weapon:fire", (k) => {
        if (L > 0) return;
        L = 0.3;
        let C = (k && (k.origin || k.muzzle)) || (n.player && n.player.pos);
        C && U.alert(C, Bi.hearRadius);
      }),
      n.events.on("explosion", (k) => {
        k && k.pos && U.alert(k.pos, 30);
      }),
      n.events.on("game:state", (k) => {
        k && k.state === "title" && U.clear();
      }),
      U
    );
  }
  export var rc = new K(),
    ac = new K(),
    lc = new K();
  export function jD(n, e, t, i) {
    (rc.copy(e).sub(n), ac.copy(i).sub(t), lc.copy(n).sub(t));
    let s = rc.dot(rc),
      o = ac.dot(ac),
      r = ac.dot(lc),
      a,
      l;
    if (s <= 1e-9 && o <= 1e-9) return lc.dot(lc);
    if (s <= 1e-9) ((a = 0), (l = Math.min(1, Math.max(0, r / o))));
    else {
      let h = rc.dot(lc);
      if (o <= 1e-9) ((l = 0), (a = Math.min(1, Math.max(0, -h / s))));
      else {
        let p = rc.dot(ac),
          d = s * o - p * p;
        ((a = d > 1e-9 ? Math.min(1, Math.max(0, (p * r - h * o) / d)) : 0),
          (l = (p * a + r) / o),
          l < 0 ? ((l = 0), (a = Math.min(1, Math.max(0, -h / s)))) : l > 1 && ((l = 1), (a = Math.min(1, Math.max(0, (p - h) / s)))));
      }
    }
    let c = lc.x + rc.x * a - ac.x * l,
      u = lc.y + rc.y * a - ac.y * l,
      f = lc.z + rc.z * a - ac.z * l;
    return c * c + u * u + f * f;
  }
  export async function KD(n) {
    let e = await W5(n);
    n.enemies = e;
    let t = (l, c, u) => new K(l, c, u),
      i = n.params.eshow || "both",
      s = [3, 1.45, 3.9],
      o = [0.5, 0.95, 0],
      r = 2.6;
    if (i === "gull")
      (e.spawn("gull", t(0, 1.6, 0), { passive: !0, hover: 1.6, patrolRadius: 0.02, yaw: 0.7 }),
        (s = [1.25, 1.95, 1.45]),
        (o = [0, 1.52, 0]),
        (r = 1.2));
    else if (i === "hound")
      (e.spawn("hound", t(0, 0, 0), { passive: !0, yaw: 0.9, patrolLine: [t(1.6, 0, 1.3), t(-1.6, 0, -1.3)] }),
        (s = [2.1, 1, 2.3]),
        (o = [0.5, 0.62, 0.4]),
        (r = 1.25));
    else if (i === "fight")
      (e.spawn("hound", t(-7, 0, -9), { state: "alert" }),
        e.spawn("hound", t(8, 0, -7), { state: "alert" }),
        e.spawn("hound", t(0, 0, -14), { state: "alert" }),
        e.spawn("gull", t(-5, 6, -13), { state: "alert" }),
        e.spawn("gull", t(9, 6, -11), { state: "alert" }),
        (s = [5, 2.6, 10]),
        (o = [0, 2.2, -5]),
        (r = 7));
    else if (i === "dead") {
      let l = e.spawn("hound", t(0, 0, 0), { passive: !0, yaw: 0.8 }),
        c = e.spawn("gull", t(-1.6, 3.4, -0.5), { passive: !0, hover: 3.4, patrolRadius: 0.02 });
      e.spawn("hound", t(2.2, 0, -1.6), { passive: !0, yaw: -0.6, patrolLine: [t(2.2, 0, -1.6), t(3.4, 0, -3)] });
      for (let u = 0; u < 30; u++) e.update(1 / 60);
      l.damage(999, l.pos, t(0.6, 0, -0.8), "body");
      for (let u = 0; u < 110; u++) e.update(1 / 60);
      (c.damage(999, c.pos, t(0, 0, 1), "body"), (s = [2.6, 1.3, 3.2]), (o = [0, 0.5, 0]), (r = 0.42));
    } else
      (e.spawn("gull", t(-0.9, 2.2, -0.2), { passive: !0, hover: 2.2, patrolRadius: 0.25, yaw: 0.5 }),
        e.spawn("hound", t(0.2, 0, 0.6), { passive: !0, yaw: 1.2, patrolLine: [t(2.6, 0, 1.2), t(-1.8, 0, 0.2)] }));
    n.params.epre != null && (r = +n.params.epre);
    for (let l = 0, c = Math.round(r * 60); l < c; l++) e.update(1 / 60);
    let a = !!n.params.efreeze;
    return {
      cam: s,
      target: o,
      update(l) {
        a || e.update(l);
      },
    };
  }
