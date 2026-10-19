export type AgentSignInOrganization = {
  id: string
  name: string
}

export type AgentSignIn = {
  keyName: string
  machineName: string
  userCode: string
}

// What the page can show for a sign-in link: the request and the organizations to allow it for, a
// link that expired or was already answered, or a visitor who has to sign in first.
export type AgentSignInView =
  | { organizations: AgentSignInOrganization[]; signIn: AgentSignIn; status: 'ready' }
  | { status: 'not-found' }
  | { status: 'sign-in-required' }

// 'expired' when the sign-in timed out or was answered meanwhile (e.g. in another tab).
export type AgentSignInAnswer = 'answered' | 'expired'

export type AgentSignInPageDeps = {
  approve: (input: { code: string; organizationId: string }) => Promise<AgentSignInAnswer>
  deny: (input: { code: string }) => Promise<AgentSignInAnswer>
  view: (input: { code: string; signal?: AbortSignal }) => Promise<AgentSignInView>
}
