import { LOCAL_TAILOR_CONFIG } from './config'

// LTOS is single-brand (Local Tailor). This module used to resolve a
// server-injected brand id / hostname to choose between Tarda and Local
// Tailor; that layer was removed. Only the login-shell helper remains.
//
// Login-shell chrome (Owner OS / Fitter App / Inventory Hub / legacy
// /login). `isLocalTailor` is retained (always true) for the call sites
// that still read it.
export function getLoginBrandMeta() {
  const brand = LOCAL_TAILOR_CONFIG

  const shellStyle = {
    backgroundImage:
      'radial-gradient(circle at 15% 20%, rgba(200,162,74,0.13), transparent 18%), radial-gradient(circle at 80% 15%, rgba(91,70,54,0.22), transparent 28%), linear-gradient(135deg, #151210 0%, #2A1F1A 40%, #151210 100%)',
    backgroundColor: '#151210',
  }

  return {
    brand,
    isLocalTailor: true,
    footerLabel: `v1.0 · ${brand.footerLabel ?? brand.displayName}`,
    shellBaseClassName: 'min-h-screen flex items-center justify-center px-6 py-10 text-luxury-ivory',
    shellStyle,
  }
}
