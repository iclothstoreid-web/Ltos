export interface AppBranding {
  name: string
  subtitle: string
  description: string
  loginPath: string
  forgotPasswordPath: string
  resetPasswordPath: string
  browserTitle: string
}

// Single source of truth for the three LTOS auth surfaces (Owner OS, Fitter
// App, Inventory Hub) — Forgot/Reset Password forms and login-page metadata
// all read from here instead of duplicating branding strings per app.
export const APP_BRANDING = {
  owner: {
    name: 'Owner OS',
    subtitle: 'Tarda Operating System',
    description: 'Secure access for Tarda management.',
    loginPath: '/owner/login',
    forgotPasswordPath: '/owner/forgot-password',
    resetPasswordPath: '/owner/reset-password',
    browserTitle: 'Owner OS | Tarda',
  },
  fitter: {
    name: 'Fitter App',
    subtitle: 'Tarda Operating System',
    description: 'Professional measurement and customer fitting workspace.',
    loginPath: '/fitter/login',
    forgotPasswordPath: '/fitter/forgot-password',
    resetPasswordPath: '/fitter/reset-password',
    browserTitle: 'Fitter App | Tarda',
  },
  inventory: {
    name: 'Inventory Hub',
    subtitle: 'Tarda Operating System',
    description: 'Material, inventory, stock, and estimation management.',
    loginPath: '/inventory/login',
    forgotPasswordPath: '/inventory/forgot-password',
    resetPasswordPath: '/inventory/reset-password',
    browserTitle: 'Inventory Hub | Tarda',
  },
} as const satisfies Record<string, AppBranding>

export type AppKey = keyof typeof APP_BRANDING
