'use client'

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { APP_BRANDING } from '@/lib/auth/branding'

export default function FitterForgotPasswordPage() {
  return <ForgotPasswordForm app={APP_BRANDING.fitter} />
}
