import { MeshStandardMaterial } from 'three';

const ROOM = /* glsl */ `
varying vec3 vWp; varying vec3 vWn; varying vec2 vGuv;
float h1(float x){return fract(sin(x*127.1)*43758.5453);}
// Ray-cast a box room behind the pane. vGuv: metres, x centred on the pane, y up from the sill.
vec3 room(float seed){
  vec3 N=normalize(vWn); vec3 T=normalize(cross(vec3(0.,1.,0.),N));
  vec3 vd=normalize(vWp-cameraPosition);
  vec3 d=vec3(dot(vd,T),vd.y,-dot(vd,N)); d=vec3(d.x+1e-5,d.y+1e-5,max(d.z,1e-3));
  vec3 o=vec3(vGuv.x,vGuv.y,0.);
  vec3 lo=vec3(-2.,-0.95,0.), hi=vec3(2.,2.0,4.5);
  vec3 tb=mix((lo-o)/d,(hi-o)/d,step(0.,d));
  float t=min(min(tb.x,tb.y),tb.z); vec3 p=o+d*t;
  vec3 tint=vec3(.55+.35*h1(seed),.5+.3*h1(seed+1.),.45+.3*h1(seed+2.));
  vec3 c=t==tb.z?tint:(t==tb.y?(d.y<0.?vec3(.25,.2,.17):vec3(.8)):tint*.7);
  float lit=step(.78,h1(seed+3.));
  float k=mix(.03,1.,lit)*(1.-p.z/7.);
  return c*k*mix(vec3(1.),vec3(1.,.78,.5),lit);
}`;

/**
 * Glass with a fake room behind each pane (some lit). Needs vertex colour r = per-window seed
 * (Batch.shade) and uv in metres centred on the pane; the facade generator provides both.
 */
export function glassMaterial() {
  const m = new MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.05,
    metalness: 0,
    vertexColors: true,
  });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = `varying vec3 vWp; varying vec3 vWn; varying vec2 vGuv;\n${sh.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz; vWn=mat3(modelMatrix)*normal; vGuv=uv;',
    )}`;
    sh.fragmentShader = `${ROOM}\n${sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\ntotalEmissiveRadiance+=room(vColor.r*97.)*1.6;',
    )}`;
  };
  m.customProgramCacheKey = () => 'ftfacadeglass';
  return m;
}
