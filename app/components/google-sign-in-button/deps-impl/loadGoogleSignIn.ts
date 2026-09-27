import { loadScript } from '~/utils/loadScript'

import type { LoadGoogleSignIn } from '../GoogleSignInButton.deps'

type GoogleCodeClientConfig = {
  callback: (response: { code?: string }) => void
  client_id: string
  error_callback: () => void
  scope: string
  select_account: boolean
  ux_mode: 'popup'
}

export type GoogleOAuthWindow = typeof globalThis & {
  google?: {
    accounts?: {
      oauth2?: { initCodeClient: (config: GoogleCodeClientConfig) => { requestCode: () => void } }
    }
  }
}

export const createLoadGoogleSignIn =
  (): LoadGoogleSignIn =>
  async ({ clientId }) => {
    const googleWindow = globalThis as GoogleOAuthWindow
    if (!googleWindow.google?.accounts?.oauth2) {
      await loadScript('https://accounts.google.com/gsi/client').catch(() => undefined)
    }
    const oauth2 = googleWindow.google?.accounts?.oauth2
    if (!oauth2) {
      return undefined
    }

    // The code client takes its callbacks once, at creation - route them to the open() in flight.
    let settle: ((code?: string) => void) | undefined
    const finish = (code?: string) => {
      settle?.(code)
      settle = undefined
    }
    const client = oauth2.initCodeClient({
      callback: ({ code }) => finish(code || undefined),
      client_id: clientId,
      // Fires when the popup is closed or blocked.
      error_callback: () => finish(),
      scope: 'openid email profile',
      select_account: true,
      ux_mode: 'popup',
    })

    return {
      open: () => {
        finish()
        const result = new Promise<string | undefined>((resolve) => (settle = resolve))
        client.requestCode()
        return result
      },
    }
  }
