import { ShaderChunk } from 'three';

// Contact-hardening sun shadows, adapted from Saltline: blocker search, then a penumbra that widens
// with distance from the caster, on a rotated Vogel disc, with a receiver-plane slope bias.
// Replaces the BASIC branch of three's getShadow (depth in .r, no packing).

let original: string | null = null;

const fn = (
  width: number,
  depth: number,
) => /* glsl */ `#else // SHADOWMAP_TYPE_BASIC (FolkTown soft shadows)
	const vec2 SL_FRUSTUM = vec2( ${width.toFixed(3)} );
	const float SL_DEPTH = ${depth.toFixed(3)};
	float slIGN( vec2 p ) { return fract( 52.9829189 * fract( dot( p, vec2( 0.06711056, 0.00583715 ) ) ) ); }
	vec2 slVogel( int i, int n, float phi ) {
		float r = sqrt( ( float( i ) + 0.5 ) / float( n ) );
		float th = float( i ) * 2.39996323 + phi;
		return r * vec2( cos( th ), sin( th ) );
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		shadowCoord.xyz /= shadowCoord.w;
		vec3 sc = shadowCoord.xyz;
		vec3 dx = dFdx( sc ), dy = dFdy( sc );
		bool inFrustum = sc.x >= 0.0 && sc.x <= 1.0 && sc.y >= 0.0 && sc.y <= 1.0;
		if ( ! ( inFrustum && sc.z <= 1.0 ) ) return 1.0;
		float det = dx.x * dy.y - dx.y * dy.x;
		vec2 dz = vec2( 0.0 );
		if ( abs( det ) > 1e-12 ) dz = vec2( dy.y * dx.z - dx.y * dy.z, dx.x * dy.z - dy.x * dx.z ) / det;
		vec2 texel = 1.0 / shadowMapSize;
		float maxSlope = 0.0030 / max( texel.x, texel.y );
		dz = clamp( dz, vec2( - maxSlope ), vec2( maxSlope ) );
		float zr = sc.z + shadowBias - ( abs( dz.x ) * texel.x + abs( dz.y ) * texel.y ) * 0.35;
		float phi = slIGN( gl_FragCoord.xy ) * 6.2831853;
		vec2 searchR = ( 0.55 * shadowRadius ) / SL_FRUSTUM;
		float blk = 0.0, nb = 0.0;
		for ( int i = 0; i < 8; i ++ ) {
			vec2 o = slVogel( i, 8, phi ) * searchR;
			float d = texture2D( shadowMap, sc.xy + o ).r;
			if ( d < zr + dot( o, dz ) ) { blk += d; nb += 1.0; }
		}
		if ( nb < 0.5 ) return 1.0;
		float distM = max( zr - blk / nb, 0.0 ) * SL_DEPTH;
		float penM = clamp( distM * 0.022 * shadowRadius, 0.012 * shadowRadius, 0.60 * shadowRadius );
		vec2 filtR = max( vec2( penM ) / SL_FRUSTUM, texel * 1.25 );
		float lit = 0.0;
		for ( int i = 0; i < 12; i ++ ) {
			vec2 o = slVogel( i, 12, phi + 1.7 ) * filtR;
			lit += step( zr + dot( o, dz ), texture2D( shadowMap, sc.xy + o ).r );
		}
		lit /= 12.0;
		vec2 e = min( sc.xy, 1.0 - sc.xy );
		lit = mix( 1.0, lit, smoothstep( 0.0, 0.02, min( e.x, e.y ) ) );
		return mix( 1.0, lit, shadowIntensity );
	}
`;

/** Patch the global shader chunk. Call before any material compiles. Returns false if three's source moved. */
export function installSoftShadows(width: number, depth: number): boolean {
  original ??= ShaderChunk.shadowmap_pars_fragment;
  const start = original.indexOf('#else // SHADOWMAP_TYPE_BASIC');
  const end = original.indexOf('\n\t#endif', start);
  if (start < 0 || end < 0) return false;
  ShaderChunk.shadowmap_pars_fragment =
    original.slice(0, start) + fn(width, depth) + original.slice(end + 1);
  return true;
}

/** Back to three's stock filter (self-test fallback). */
export function uninstallSoftShadows() {
  if (original) ShaderChunk.shadowmap_pars_fragment = original;
}
