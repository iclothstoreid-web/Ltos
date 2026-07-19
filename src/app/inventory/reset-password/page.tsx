'use client'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { APP_BRANDING } from '@/lib/auth/branding'

export default function InventoryResetPasswordPage() {
  return <ResetPasswordForm app={APP_BRANDING.inventory} />
}
