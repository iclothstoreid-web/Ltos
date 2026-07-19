'use client'

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { APP_BRANDING } from '@/lib/auth/branding'

export default function OwnerForgotPasswordPage() {
  return <ForgotPasswordForm app={APP_BRANDING.owner} />
}
