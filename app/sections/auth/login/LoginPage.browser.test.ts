import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

import type { LoginPageDeps } from './LoginPage.deps'
import LoginPage from './LoginPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const googleSignInButtonDeps = (code = 'google-code'): GoogleSignInButtonDeps => ({
  loadGoogleSignIn: async () => ({ open: async () => code }),
})

const telegramSignInButtonDeps = (user?: TelegramUser): TelegramSignInButtonDeps => ({
  loadTelegramSignIn: async () => ({ open: async () => user }),
})

const mount = async (deps: LoginPageDeps, onLoggedIn: () => void, googleClientId = '') => {
  currentWrapper = await mountSuspended(LoginPage, {
    attachTo: document.body,
    props: { deps, googleClientId, onLoggedIn, telegramBotId: '123456' },
    route: '/login',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('continues automatically after a Telegram mini app sign-in', async () => {
  const onLoggedIn = vi.fn<() => void>()

  await mount(
    {
      googleSignInButton: googleSignInButtonDeps(),
      loginViaGoogle: vi.fn<LoginPageDeps['loginViaGoogle']>(),
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: true },
        status: 'success',
      })),
      loginViaTelegramWidget: vi.fn<LoginPageDeps['loginViaTelegramWidget']>(),
      telegramSignInButton: telegramSignInButtonDeps(),
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
      googleSignInButton: googleSignInButtonDeps(),
      loginViaGoogle: vi.fn<LoginPageDeps['loginViaGoogle']>(),
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: false },
        status: 'success',
      })),
      loginViaTelegramWidget,
      telegramSignInButton: telegramSignInButtonDeps(user),
    },
    onLoggedIn,
  )
  await page.getByRole('button', { name: 'Continue with Telegram' }).click()

  await vi.waitFor(() => expect(loginViaTelegramWidget).toHaveBeenCalledWith(user))
  expect(onLoggedIn).toHaveBeenCalledOnce()
})

it('signs in with the authorization code returned by Google', async () => {
  const loginViaGoogle = vi.fn<LoginPageDeps['loginViaGoogle']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onLoggedIn = vi.fn<() => void>()

  await mount(
    {
      googleSignInButton: googleSignInButtonDeps(),
      loginViaGoogle,
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: false },
        status: 'success',
      })),
      loginViaTelegramWidget: vi.fn<LoginPageDeps['loginViaTelegramWidget']>(),
      telegramSignInButton: telegramSignInButtonDeps(),
    },
    onLoggedIn,
    'test-client-id.apps.googleusercontent.com',
  )
  await page.getByRole('button', { name: 'Continue with Google' }).click()

  await vi.waitFor(() =>
    expect(loginViaGoogle).toHaveBeenCalledWith({
      code: 'google-code',
      languageCode: navigator.language,
    }),
  )
  expect(onLoggedIn).toHaveBeenCalledOnce()
})

it('links the privacy policy under the sign-in buttons', async () => {
  await mount(
    {
      googleSignInButton: googleSignInButtonDeps(),
      loginViaGoogle: vi.fn<LoginPageDeps['loginViaGoogle']>(),
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: false },
        status: 'success',
      })),
      loginViaTelegramWidget: vi.fn<LoginPageDeps['loginViaTelegramWidget']>(),
      telegramSignInButton: telegramSignInButtonDeps(),
    },
    vi.fn<() => void>(),
  )

  await expect
    .element(page.getByText('By logging in, you confirm that you have read the'))
    .toBeInTheDocument()
  await expect
    .element(page.getByRole('link', { name: 'Privacy policy' }))
    .toHaveAttribute('href', 'https://laraue.com/privacy')
})
