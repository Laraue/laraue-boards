import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { GoogleSignInButtonDeps } from './GoogleSignInButton.deps'
import GoogleSignInButton from './GoogleSignInButton.vue'

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await wrapper?.unmount()
  wrapper = undefined
})

it('lets the user retry a failed Google SDK load and then sign in', async () => {
  const loadGoogleSignIn = vi
    .fn<GoogleSignInButtonDeps['loadGoogleSignIn']>()
    .mockRejectedValueOnce(new Error('network error'))
    .mockResolvedValue({ open: async () => 'auth-code' })
  const onSignIn = vi.fn<(code: string) => void>()

  wrapper = await mountSuspended(GoogleSignInButton, {
    attachTo: document.body,
    props: { clientId: 'client-id', deps: { loadGoogleSignIn }, onSignIn },
  })

  await page.getByRole('button', { name: 'Google unavailable — retry' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()

  expect(loadGoogleSignIn).toHaveBeenCalledTimes(2)
  await vi.waitFor(() => expect(onSignIn).toHaveBeenCalledWith('auth-code'))
})
