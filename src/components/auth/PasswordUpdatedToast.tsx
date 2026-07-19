'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Toast } from '@/components/ui/Toast'

function PasswordUpdatedToastInner({ loginPath }: { loginPath: string }) {
  const [show, setShow] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('toast') === 'password-updated') {
      setShow(true)
      router.replace(loginPath)
    }
  }, [searchParams, router, loginPath])

  if (!show) return null
  return <Toast message="Password berhasil diperbarui." />
}

// useSearchParams requires a Suspense boundary — wrapped here so login pages
// can drop this in without restructuring their own component tree.
export function PasswordUpdatedToast({ loginPath }: { loginPath: string }) {
  return (
    <Suspense fallback={null}>
      <PasswordUpdatedToastInner loginPath={loginPath} />
    </Suspense>
  )
}
