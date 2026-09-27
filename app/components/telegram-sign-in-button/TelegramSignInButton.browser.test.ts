import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { TelegramSignInButtonDeps } from './TelegramSignInButton.deps'
import type { TelegramUser } from './TelegramSignInButton.types'
import TelegramSignInButton from './TelegramSignInButton.vue'

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await wrapper?.unmount()
  wrapper = undefined
})

it('lets the user retry a failed Telegram SDK load and then sign in', async () => {
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }
  const loadTelegramSignIn = vi
    .fn<TelegramSignInButtonDeps['loadTelegramSignIn']>()
    .mockResolvedValueOnce(undefined)
    .mockResolvedValue({ open: async () => user })
  const onSignIn = vi.fn<(user: TelegramUser) => void>()

  wrapper = await mountSuspended(TelegramSignInButton, {
    attachTo: document.body,
    props: { botId: '123456', deps: { loadTelegramSignIn }, onSignIn },
  })

  await page.getByRole('button', { name: 'Telegram unavailable — retry' }).click()
  await page.getByRole('button', { name: 'Continue with Telegram' }).click()

  expect(loadTelegramSignIn).toHaveBeenCalledTimes(2)
  await vi.waitFor(() => expect(onSignIn).toHaveBeenCalledWith(user))
})
