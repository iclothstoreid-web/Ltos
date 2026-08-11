'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
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
// with a two-color diagonal gradient per this revision's palette spec.
const FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;

  uniform vec3 uColorNavy;
  uniform vec3 uColorCharcoal;
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
    // One continuous cinematic gradient, no panels: navy dominant at the
    // top/right (~60% of the frame), flowing down into warm charcoal at
    // the bottom (~30%) so the transition into the next section on scroll
    // reads as continuous rather than a cut — "jangan ada garis batas
    // antar warna."
    float diag = clamp(vUv.y * 0.65 + vUv.x * 0.35, 0.0, 1.0);
    vec3 color = mix(uColorCharcoal, uColorNavy, smoothstep(0.22, 0.85, diag));

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
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const smoothedVelocity = useRef(0)
  const clock = useRef(0)
  const texture = useLoader(THREE.TextureLoader, '/hero/indonesia-map-glow.webp')

  useEffect(() => {
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.minFilter = THREE.LinearFilter
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
      uColorNavy: { value: new THREE.Color('#07111D') },
      uColorCharcoal: { value: new THREE.Color('#0A0A0B') },
      uColorGold: { value: new THREE.Color('#C9A876') },
      uMapTexture: { value: texture },
      uMapStrength: { value: 0.16 },
      uTime: { value: 0 },
      uVelocityIntensity: { value: 0 },
      uParallax: { value: new THREE.Vector2(0, 0) },
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
    smoothedVelocity.current = THREE.MathUtils.lerp(smoothedVelocity.current, Math.min(Math.abs(rawVelocity), 2.5) / 2.5, 0.05)

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
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'low-power' }}
      className="!absolute inset-0"
    >
      <DepthPlane scrollProgress={scrollProgress} scrollVelocity={scrollVelocity} />
    </Canvas>
  )
}
