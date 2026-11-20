export type OAuthConsentOrganization = {
  id: string
  name: string
}

export type OAuthConsent = {
  // The app's own name, e.g. "ChatGPT".
  clientName: string
  // The host the app's identity comes from, e.g. "chatgpt.com" - its name can't fake it.
  clientHost: string
  keyName: string
}

// What the page can show for a consent link: the request and the organizations to allow it for, a
// link that expired or was already answered, or a visitor who has to sign in first.
export type OAuthConsentView =
  | { consent: OAuthConsent; organizations: OAuthConsentOrganization[]; status: 'ready' }
  | { status: 'not-found' }
  | { status: 'sign-in-required' }

// 'answered' carries where to send the browser back to the app; 'expired' when the request timed out
// or was answered meanwhile (e.g. in another tab).
export type OAuthConsentAnswer = { redirectUrl: string; status: 'answered' } | { status: 'expired' }

export type OAuthConsentPageDeps = {
  approve: (input: { organizationId: string; requestId: string }) => Promise<OAuthConsentAnswer>
  deny: (input: { requestId: string }) => Promise<OAuthConsentAnswer>
  view: (input: { requestId: string; signal?: AbortSignal }) => Promise<OAuthConsentView>
}
