'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { heroCopy } from '@/lib/marketing/copy'

// Appears only on mobile, only after the Hero has scrolled out of view —
// thumb-friendly, safe-area aware.
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-luxury-gold/20 bg-luxury-navy-deep/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
          <a
            href="/#configurator"
            className="block cursor-pointer rounded-full bg-luxury-gold py-3 text-center font-luxury-sans text-sm uppercase tracking-[0.14em] text-luxury-black"
          >
            {heroCopy.primaryCta}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
