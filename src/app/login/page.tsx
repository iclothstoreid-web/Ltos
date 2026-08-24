import { redirect } from 'next/navigation'

// Legacy unprefixed /login page is deprecated. Redirecting to the
// public homepage root so each host's brand-resolved homepage is used.
export default function LoginPage() {
  // Redirect to the site root; middleware and locale routing will handle
  // localization and brand resolution per the incoming host.
  redirect('/')
}
