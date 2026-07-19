'use client'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { APP_BRANDING } from '@/lib/auth/branding'

export default function OwnerResetPasswordPage() {
  return <ResetPasswordForm app={APP_BRANDING.owner} />
}
