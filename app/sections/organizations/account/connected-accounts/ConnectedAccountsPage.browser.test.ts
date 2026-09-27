import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'

import type { ConnectedAccountsPageDeps } from './ConnectedAccountsPage.deps'
import ConnectedAccountsPage from './ConnectedAccountsPage.vue'

type TestWindow = typeof globalThis & {
  google?: {
    accounts: {
      id: {
        initialize: (config: { callback: (response: { credential: string }) => void }) => void
        renderButton: () => void
      }
    }
  }
  onTelegramConnect?: (user: TelegramUser) => void
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined
let googleCallback: ((response: { credential: string }) => void) | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  googleCallback = undefined
  delete (globalThis as TestWindow).google
})

const fakeGoogle = () => {
  ;(globalThis as TestWindow).google = {
    accounts: {
      id: {
        initialize: (config) => {
          googleCallback = config.callback
        },
        renderButton: () => {},
      },
    },
  }
}

const depsOf = (overrides: Partial<ConnectedAccountsPageDeps> = {}): ConnectedAccountsPageDeps => ({
  connectGoogle: vi.fn<ConnectedAccountsPageDeps['connectGoogle']>(),
  connectTelegram: vi.fn<ConnectedAccountsPageDeps['connectTelegram']>(),
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
      botName: 'laraue_boards_bot',
      deps,
      googleClientId: 'test-client-id.apps.googleusercontent.com',
    },
    route: '/organizations/acme-ab12/account/connected-accounts',
  })
}

it('connects Google and shows it as connected', async () => {
  fakeGoogle()
  const view = vi
    .fn<ConnectedAccountsPageDeps['view']>()
    .mockResolvedValueOnce({ data: { google: false, telegram: true }, status: 'success' })
    .mockResolvedValueOnce({ data: { google: true, telegram: true }, status: 'success' })
  const connectGoogle = vi.fn<ConnectedAccountsPageDeps['connectGoogle']>(async () => ({
    data: 'linked',
    status: 'success',
  }))

  await mount(depsOf({ connectGoogle, view }))
  await vi.waitFor(() => expect(googleCallback).toBeDefined())
  googleCallback?.({ credential: 'google-id-token' })

  await vi.waitFor(() => expect(connectGoogle).toHaveBeenCalledWith({ idToken: 'google-id-token' }))
  await expect
    .element(page.getByText('Google is connected. You can now sign in with it.'))
    .toBeVisible()
  await vi.waitFor(() => expect(view).toHaveBeenCalledTimes(2))
})

it('explains why an account used by another Laraue Boards account was not connected', async () => {
  fakeGoogle()
  const connectGoogle = vi.fn<ConnectedAccountsPageDeps['connectGoogle']>(async () => ({
    data: 'owner-has-data',
    status: 'success',
  }))

  await mount(depsOf({ connectGoogle }))
  await vi.waitFor(() => expect(googleCallback).toBeDefined())
  googleCallback?.({ credential: 'google-id-token' })

  await expect
    .element(
      page.getByText('This Google account is already used by another Laraue Boards account', {
        exact: false,
      }),
    )
    .toBeVisible()
})

it('sends the user returned by the Telegram widget', async () => {
  const connectTelegram = vi.fn<ConnectedAccountsPageDeps['connectTelegram']>(async () => ({
    data: 'linked',
    status: 'success',
  }))
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  await mount(
    depsOf({
      connectTelegram,
      view: vi.fn<ConnectedAccountsPageDeps['view']>(async () => ({
        data: { google: true, telegram: false },
        status: 'success',
      })),
    }),
  )
  ;(globalThis as TestWindow).onTelegramConnect?.(user)

  await vi.waitFor(() => expect(connectTelegram).toHaveBeenCalledWith(user))
  await expect
    .element(page.getByText('Telegram is connected. The bot now recognizes your account.'))
    .toBeVisible()
})
