'use client'

import { useEffect, useState } from 'react'

// SSR-safe media query hook. Returns `undefined` on the server and the
// first client render (so callers can render a neutral state and avoid a
// hydration mismatch), then the real boolean once mounted.
export function useMediaQuery(query: string): boolean | undefined {
  const [matches, setMatches] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
