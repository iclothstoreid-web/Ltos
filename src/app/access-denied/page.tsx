import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '403 — Access Denied',
}

// Rendered in place (via middleware rewrite) when a logged-in user's role
// doesn't match the route's allowed roles. Deliberately plain — no design
// pass this sprint.
export default function AccessDeniedPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        gap: '8px',
      }}
    >
      <h1>403 — Access Denied</h1>
      <p>Akun Anda tidak memiliki akses ke halaman ini.</p>
    </div>
  )
}
