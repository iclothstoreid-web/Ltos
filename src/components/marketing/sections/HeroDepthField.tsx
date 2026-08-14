'use client'

import { useEffect, useMemo, useRef } from 'react'
// W1P — named imports instead of `import * as THREE` so webpack can
// tree-shake the rest of the three.js namespace (geometries, materials,
// loaders, animation/audio systems, etc.) that this file never touches.
import { Color, Vector2, TextureLoader, ClampToEdgeWrapping, LinearFilter, MathUtils } from 'three'
import type { ShaderMaterial } from 'three'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'

// Sprint W1 revision — "Enzo Custom layout + Tympanus depth engine." Full
// rebuild on top of a real reference implementation rather than a fresh
// particle system: adapted directly from the Background class in
// houmahani/codrops-depth-gallery (the official Tympanus tutorial repo for
// https://tympanus.net/Tutorials/DepthGallery/) — a full-screen
// ShaderMaterial plane rendered with a vertex shader that ignores the
// camera entirely (`gl_Position = vec4(position.xy, 0.0, 1.0)`), driven by
// a velocity-reactive uniform. See the bottom of this file for exactly
// what was reused vs. changed.
//
// This is NOT the same shape as the earlier "bright particle map"
// revision — that one made the archipelago the thing you look at,  which
// this brief explicitly rules out ("Jangan membuat peta terlihat jelas...
// bukan ditonton"). Here the same real archipelago geometry (the point
// data generated for the previous revision) was pre-rendered once, offline,
// into a small blurred grayscale texture (public/hero/indonesia-map-glow
// .webp) and is sampled in the shader as a soft luminance mask — a hint of
// shape tinting the gradient, not a legible map.

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Reused verbatim from Background/shaders/vertex.glsl in the Tympanus
    // repo — clip-space position directly from the quad's own xy, so this
    // plane always exactly fills the viewport regardless of camera state.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// Adapted from Background/shaders/fragment.glsl in the Tympanus repo. Kept:
// the overall structure (flat base -> soft mask blend -> velocity lift ->
// grain -> clamp) and the exact random() hash for grain. Changed: their two
// procedural circular "blob" masks (smoothstep against a distance field)
// are replaced by one texture-sampled mask (the real archipelago silhouette)
// with its own slow drift; their single flat background color is replaced
// with a two-stop gradient, primarily vertical. W1R — the gradient's two
// colors now grade Smoked Walnut -> Deep Espresso (was Midnight Navy ->
// Deep Navy); uniform names kept as-is to minimize diff, see the comment
// at their declaration below.
const FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;

  uniform vec3 uColorMidnightNavy;
  uniform vec3 uColorTransitionNavy;
  uniform vec3 uColorGold;
  uniform sampler2D uMapTexture;
  uniform float uMapStrength;
  uniform float uTime;
  uniform float uVelocityIntensity;
  uniform vec2 uParallax;
  uniform float uGrainStrength;

  float random(vec2 coord) {
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // Walnut Atelier grading: two-tone warm wood, vertical-biased: top-left
    // #8B6245 (Warm Walnut) blended across x into #6A4A34 (Walnut Brown),
    // settling into flat Walnut Brown for the lower ~60% — matching the
    // brief's "Walnut Brown + Warm Walnut = 60% dominant" rule and handing
    // off seamlessly into the next section's own luxury-navy-deep
    // background. Deep Espresso only appears via Hero.tsx's separate CSS
    // legibility scrim layered on top of this canvas, never as this
    // shader's own base fill.
    float b = clamp(1.0 - vUv.y, 0.0, 1.0);
    vec3 topBlend = mix(uColorMidnightNavy, uColorTransitionNavy, clamp(vUv.x, 0.0, 1.0));
    vec3 color = mix(topBlend, uColorTransitionNavy, smoothstep(0.0, 0.4, b));

    // The archipelago silhouette — pre-blurred offline, sampled here as a
    // soft luminance mask, drifting very slowly (idle + scroll + pointer,
    // all folded into uParallax upstream) and biased toward the right half.
    vec2 mapUv = vUv * vec2(1.05, 1.35) - vec2(0.02, 0.16) + uParallax;
    float mapMask = texture2D(uMapTexture, mapUv).r;
    vec3 goldTint = mix(color, uColorGold, 0.55);
    color = mix(color, goldTint, mapMask * uMapStrength);

    // A very faint traveling diagonal highlight — this revision's
    // stand-in for Layer 3's "light streak," folded into the same pass
    // rather than a separate mesh.
    float sweep = 1.0 - smoothstep(0.0, 0.06, abs(fract(vUv.x - vUv.y * 0.3 - uTime * 0.015) - 0.5));
    color += sweep * uColorGold * 0.035;

    // Velocity-reactive luminance lift — directly ported from the
    // Tympanus shader's velocity term, tuned down since this is an
    // ambient backdrop, not a full-bleed gallery.
    color += uVelocityIntensity * 0.045;

    // Film grain — identical hash/blend to the Tympanus shader.
    float grain = random(vUv * vec2(1387.13, 947.91)) - 0.5;
    color += grain * uGrainStrength;

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`

function DepthPlane({
  scrollProgress,
  scrollVelocity,
}: {
  scrollProgress: MotionValue<number>
  scrollVelocity: MotionValue<number>
}) {
  const materialRef = useRef<ShaderMaterial>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const smoothedVelocity = useRef(0)
  const clock = useRef(0)
  const texture = useLoader(TextureLoader, '/hero/indonesia-map-glow.webp')

  useEffect(() => {
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.minFilter = LinearFilter
  }, [texture])

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  const uniforms = useMemo(
    () => ({
      // Names kept from the original navy grading to minimize diff — values
      // are now Warm Walnut / Walnut Brown, see comment above.
      uColorMidnightNavy: { value: new Color('#8B6245') },
      uColorTransitionNavy: { value: new Color('#6A4A34') },
      uColorGold: { value: new Color('#C8A24A') },
      uMapTexture: { value: texture },
      uMapStrength: { value: 0.16 },
      uTime: { value: 0 },
      uVelocityIntensity: { value: 0 },
      uParallax: { value: new Vector2(0, 0) },
      uGrainStrength: { value: 0.018 },
    }),
    [texture],
  )

  useFrame((_, delta) => {
    clock.current += delta
    // Raw velocity (units/sec of scroll progress, roughly -3..3 in
    // practice) smoothed hard — this is meant to register as a slow mood
    // shift while scrolling fast, never a per-frame flicker.
    const rawVelocity = scrollVelocity.get()
    smoothedVelocity.current = MathUtils.lerp(smoothedVelocity.current, Math.min(Math.abs(rawVelocity), 2.5) / 2.5, 0.05)

    const scroll = scrollProgress.get()
    // Idle drift (always alive) + scroll-linked drift, at a "far/mid"
    // depth speed (~0.15-0.35x territory from earlier revisions, folded
    // into one continuous offset here since the whole background is one
    // shader pass now) + pointer parallax capped small — "maksimum sekitar
    // 8-12px," approximated in UV space rather than literal screen pixels
    // since this is a shader-space effect.
    const idleX = Math.sin(clock.current * 0.025) * 0.012
    const idleY = Math.cos(clock.current * 0.018) * 0.008
    const px = pointer.current.x * 0.01
    const py = pointer.current.y * 0.008

    if (materialRef.current) {
      const u = materialRef.current.uniforms
      u.uTime.value = clock.current
      u.uVelocityIntensity.value = smoothedVelocity.current
      u.uParallax.value.set(idleX + px - scroll * 0.05, idleY - py + scroll * 0.03)
    }
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export function HeroDepthField({
  scrollProgress,
  scrollVelocity,
}: {
  scrollProgress: MotionValue<number>
  scrollVelocity: MotionValue<number>
}) {
  return (
    <Canvas
      // W1P — reduced from [1, 1.5]: fewer pixels rendered on high-DPI
      // (2x/3x) laptop/mobile screens, meaningfully cheaper GPU fill-rate
      // for an ambient full-screen backdrop where the extra sharpness
      // isn't perceptible.
      dpr={[1, 1.25]}
      gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
      className="!absolute inset-0"
    >
      <DepthPlane scrollProgress={scrollProgress} scrollVelocity={scrollVelocity} />
    </Canvas>
  )
}
