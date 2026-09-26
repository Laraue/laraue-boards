import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { LoginPageDeps } from './LoginPage.deps'
import type { TelegramUser } from './LoginPage.types'
import LoginPage from './LoginPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

type GoogleWindow = typeof globalThis & {
  google?: {
    accounts: {
      id: {
        initialize: (config: { callback: (response: { credential: string }) => void }) => void
        renderButton: () => void
      }
    }
  }
}

const mount = async (deps: LoginPageDeps, onLoggedIn: () => void, googleClientId = '') => {
  currentWrapper = await mountSuspended(LoginPage, {
    attachTo: document.body,
    props: { botName: 'laraue_boards_bot', deps, googleClientId, onLoggedIn },
    route: '/',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  delete (globalThis as GoogleWindow).google
})

it('continues automatically after a Telegram mini app sign-in', async () => {
  const onLoggedIn = vi.fn<() => void>()

  await mount(
    {
      loginViaGoogle: vi.fn<LoginPageDeps['loginViaGoogle']>(),
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: true },
        status: 'success',
      })),
      loginViaTelegramWidget: vi.fn<LoginPageDeps['loginViaTelegramWidget']>(),
    },
    onLoggedIn,
  )

  await vi.waitFor(() => expect(onLoggedIn).toHaveBeenCalledOnce())
})

it('sends the user returned by the Telegram widget', async () => {
  const loginViaTelegramWidget = vi.fn<LoginPageDeps['loginViaTelegramWidget']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onLoggedIn = vi.fn<() => void>()
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  await mount(
    {
      loginViaGoogle: vi.fn<LoginPageDeps['loginViaGoogle']>(),
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: false },
        status: 'success',
      })),
      loginViaTelegramWidget,
    },
    onLoggedIn,
  )
  ;(
    globalThis as typeof globalThis & { onTelegramAuth?: (value: TelegramUser) => void }
  ).onTelegramAuth?.(user)

  await vi.waitFor(() => expect(loginViaTelegramWidget).toHaveBeenCalledWith(user))
  expect(onLoggedIn).toHaveBeenCalledOnce()
})

it('signs in with the ID token returned by Google', async () => {
  let googleCallback: ((response: { credential: string }) => void) | undefined
  ;(globalThis as GoogleWindow).google = {
    accounts: {
      id: {
        initialize: (config) => {
          googleCallback = config.callback
        },
        renderButton: () => {},
      },
    },
  }
  const loginViaGoogle = vi.fn<LoginPageDeps['loginViaGoogle']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onLoggedIn = vi.fn<() => void>()

  await mount(
    {
      loginViaGoogle,
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: false },
        status: 'success',
      })),
      loginViaTelegramWidget: vi.fn<LoginPageDeps['loginViaTelegramWidget']>(),
    },
    onLoggedIn,
    'test-client-id.apps.googleusercontent.com',
  )
  await vi.waitFor(() => expect(googleCallback).toBeDefined())
  await expect
    .element(page.getByText('work only when you sign in with Telegram', { exact: false }))
    .toBeInTheDocument()
  googleCallback?.({ credential: 'google-id-token' })

  await vi.waitFor(() =>
    expect(loginViaGoogle).toHaveBeenCalledWith({
      idToken: 'google-id-token',
      languageCode: navigator.language,
    }),
  )
  expect(onLoggedIn).toHaveBeenCalledOnce()
})
