import { redirect } from 'next/navigation'

// Route retired — Service Rules now nests under the Business Rules hub.
// Redirect rather than 404 for any stale bookmark/link.
export default function ServiceRulesLegacyRedirect() {
  redirect('/owner/business-rules/service')
}
