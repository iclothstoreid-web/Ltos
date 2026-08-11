'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useReducedMotion, animate } from 'framer-motion'

export function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(0)

  useEffect(() => {
    if (!inView || !ref.current) return
    if (reduceMotion) {
      ref.current.textContent = `${value}${suffix}`
      return
    }
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = `${Math.round(latest)}${suffix}`
      },
    })
    return () => controls.stop()
  }, [inView, value, suffix, reduceMotion, motionValue])

  return (
    <span ref={ref} className="font-fraunces text-5xl text-luxury-ivory">
      0{suffix}
    </span>
  )
}
