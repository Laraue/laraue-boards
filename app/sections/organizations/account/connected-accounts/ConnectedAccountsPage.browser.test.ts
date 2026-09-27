import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'

import type { ConnectedAccountsPageDeps } from './ConnectedAccountsPage.deps'
import ConnectedAccountsPage from './ConnectedAccountsPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const googleSignInButtonDeps = (code = 'google-code'): GoogleSignInButtonDeps => ({
  loadGoogleSignIn: async () => ({ open: async () => code }),
})

const telegramSignInButtonDeps = (user?: TelegramUser): TelegramSignInButtonDeps => ({
  loadTelegramSignIn: async () => ({ open: async () => user }),
})

const depsOf = (overrides: Partial<ConnectedAccountsPageDeps> = {}): ConnectedAccountsPageDeps => ({
  connectGoogle: vi.fn<ConnectedAccountsPageDeps['connectGoogle']>(),
  connectTelegram: vi.fn<ConnectedAccountsPageDeps['connectTelegram']>(),
  googleSignInButton: googleSignInButtonDeps(),
  telegramSignInButton: telegramSignInButtonDeps(),
  view: vi.fn<ConnectedAccountsPageDeps['view']>(async () => ({
    data: { google: false, telegram: true },
    status: 'success',
  })),
  ...overrides,
})

const mount = async (deps: ConnectedAccountsPageDeps) => {
  currentWrapper = await mountSuspended(ConnectedAccountsPage, {
    attachTo: document.body,
    props: {
      deps,
      googleClientId: 'test-client-id.apps.googleusercontent.com',
      telegramBotId: '123456',
    },
    route: '/organizations/acme-ab12/account/connected-accounts',
  })
}

it('connects Google and shows it as connected', async () => {
  const view = vi
    .fn<ConnectedAccountsPageDeps['view']>()
    .mockResolvedValueOnce({ data: { google: false, telegram: true }, status: 'success' })
    .mockResolvedValueOnce({ data: { google: true, telegram: true }, status: 'success' })
  const connectGoogle = vi.fn<ConnectedAccountsPageDeps['connectGoogle']>(async () => ({
    data: 'linked',
    status: 'success',
  }))

  await mount(depsOf({ connectGoogle, view }))
  await page.getByRole('button', { name: 'Connect Google' }).click()

  await vi.waitFor(() => expect(connectGoogle).toHaveBeenCalledWith({ code: 'google-code' }))
  await expect
    .element(page.getByText('Google is connected. You can now sign in with it.'))
    .toBeVisible()
  await vi.waitFor(() => expect(view).toHaveBeenCalledTimes(2))
})

it('explains why an account used by another Laraue Boards account was not connected', async () => {
  const connectGoogle = vi.fn<ConnectedAccountsPageDeps['connectGoogle']>(async () => ({
    data: 'owner-has-data',
    status: 'success',
  }))

  await mount(depsOf({ connectGoogle }))
  await page.getByRole('button', { name: 'Connect Google' }).click()

  await expect
    .element(
      page.getByText('This Google account is already used by another Laraue Boards account', {
        exact: false,
      }),
    )
    .toBeVisible()
})

it('sends the user returned by the Telegram popup', async () => {
  const connectTelegram = vi.fn<ConnectedAccountsPageDeps['connectTelegram']>(async () => ({
    data: 'linked',
    status: 'success',
  }))
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  await mount(
    depsOf({
      connectTelegram,
      googleSignInButton: googleSignInButtonDeps(),
      telegramSignInButton: telegramSignInButtonDeps(user),
      view: vi.fn<ConnectedAccountsPageDeps['view']>(async () => ({
        data: { google: true, telegram: false },
        status: 'success',
      })),
    }),
  )
  await page.getByRole('button', { name: 'Connect Telegram' }).click()

  await vi.waitFor(() => expect(connectTelegram).toHaveBeenCalledWith(user))
  await expect
    .element(page.getByText('Telegram is connected. The bot now recognizes your account.'))
    .toBeVisible()
})
