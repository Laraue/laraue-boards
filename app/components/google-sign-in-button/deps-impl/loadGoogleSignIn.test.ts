import { afterEach, assert, test } from 'vitest'

import type { GoogleOAuthWindow } from './loadGoogleSignIn'
import { createLoadGoogleSignIn } from './loadGoogleSignIn'

const googleWindow = globalThis as GoogleOAuthWindow

const fakeCodeClient = (
  respond: (config: { close: () => void; code: (value: string) => void }) => void,
) => {
  googleWindow.google = {
    accounts: {
      oauth2: {
        initCodeClient: ({ callback, error_callback }) => ({
          requestCode: () => respond({ close: error_callback, code: (code) => callback({ code }) }),
        }),
      },
    },
  }
}

afterEach(() => {
  delete googleWindow.google
})

test('resolves with the authorization code from the popup', async () => {
  fakeCodeClient(({ code }) => code('auth-code'))

  const popup = await createLoadGoogleSignIn()({ clientId: 'client-id' })

  assert.equal(await popup?.open(), 'auth-code')
})

test('resolves with undefined when the popup is closed', async () => {
  fakeCodeClient(({ close }) => close())

  const popup = await createLoadGoogleSignIn()({ clientId: 'client-id' })

  assert.isUndefined(await popup?.open())
})
