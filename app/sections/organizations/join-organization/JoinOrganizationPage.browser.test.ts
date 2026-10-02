import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { GoogleSignInButtonDeps } from '~/components/google-sign-in-button/GoogleSignInButton.deps'
import type { TelegramSignInButtonDeps } from '~/components/telegram-sign-in-button/TelegramSignInButton.deps'
import type { TelegramUser } from '~/components/telegram-sign-in-button/TelegramSignInButton.types'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'
import JoinOrganizationPage from './JoinOrganizationPage.vue'

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

const depsOf = (overrides: Partial<JoinOrganizationPageDeps> = {}): JoinOrganizationPageDeps => ({
  googleSignInButton: googleSignInButtonDeps(),
  join: vi.fn<JoinOrganizationPageDeps['join']>(),
  loginViaGoogle: vi.fn<JoinOrganizationPageDeps['loginViaGoogle']>(),
  loginViaTelegramMiniApp: vi.fn<JoinOrganizationPageDeps['loginViaTelegramMiniApp']>(
    async () => false,
  ),
  loginViaTelegramWidget: vi.fn<JoinOrganizationPageDeps['loginViaTelegramWidget']>(),
  telegramSignInButton: telegramSignInButtonDeps(),
  ...overrides,
})

const mount = async (
  deps: JoinOrganizationPageDeps,
  onJoined = vi.fn<() => void>(),
  googleClientId = '',
) => {
  currentWrapper = await mountSuspended(JoinOrganizationPage, {
    attachTo: document.body,
    props: { code: 'invite-123', deps, googleClientId, onJoined, telegramBotId: '123456' },
    route: '/join/invite-123',
  })
}

it('accepts the invitation code and continues to the organization picker', async () => {
  const join = vi.fn<JoinOrganizationPageDeps['join']>(async () => 'joined')
  const onJoined = vi.fn<() => void>()

  await mount(depsOf({ join }), onJoined)

  expect(join).not.toHaveBeenCalled()
  await page.getByRole('button', { name: 'Accept invitation' }).click()

  expect(join).toHaveBeenCalledWith({ code: 'invite-123' })
  expect(onJoined).toHaveBeenCalledOnce()
})

it('signs in inside a Telegram Mini App and retries the invitation', async () => {
  const join = vi
    .fn<JoinOrganizationPageDeps['join']>()
    .mockResolvedValueOnce('sign-in-required')
    .mockResolvedValueOnce('joined')
  const loginViaTelegramMiniApp = vi.fn<JoinOrganizationPageDeps['loginViaTelegramMiniApp']>(
    async () => true,
  )
  const onJoined = vi.fn<() => void>()

  await mount(depsOf({ join, loginViaTelegramMiniApp }), onJoined)
  await page.getByRole('button', { name: 'Accept invitation' }).click()

  await vi.waitFor(() => expect(join).toHaveBeenCalledTimes(2))
  expect(loginViaTelegramMiniApp).toHaveBeenCalledOnce()
  expect(onJoined).toHaveBeenCalledOnce()
})

it('shows the Telegram widget in a regular browser and retries after login', async () => {
  const join = vi
    .fn<JoinOrganizationPageDeps['join']>()
    .mockResolvedValueOnce('sign-in-required')
    .mockResolvedValueOnce('joined')
  const loginViaTelegramWidget = vi.fn<JoinOrganizationPageDeps['loginViaTelegramWidget']>(
    async () => {},
  )
  const onJoined = vi.fn<() => void>()
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  await mount(
    depsOf({ join, loginViaTelegramWidget, telegramSignInButton: telegramSignInButtonDeps(user) }),
    onJoined,
  )
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await expect.element(page.getByText('Sign in with Telegram')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Continue with Telegram' }).click()

  await vi.waitFor(() => expect(loginViaTelegramWidget).toHaveBeenCalledWith(user))
  await vi.waitFor(() => expect(join).toHaveBeenCalledTimes(2))
  expect(onJoined).toHaveBeenCalledOnce()
})

it('signs in with Google in a regular browser and retries the invitation', async () => {
  const join = vi
    .fn<JoinOrganizationPageDeps['join']>()
    .mockResolvedValueOnce('sign-in-required')
    .mockResolvedValueOnce('joined')
  const loginViaGoogle = vi.fn<JoinOrganizationPageDeps['loginViaGoogle']>(async () => {})
  const onJoined = vi.fn<() => void>()

  await mount(
    depsOf({ join, loginViaGoogle }),
    onJoined,
    'test-client-id.apps.googleusercontent.com',
  )
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()

  await vi.waitFor(() =>
    expect(loginViaGoogle).toHaveBeenCalledWith({
      code: 'google-code',
      languageCode: navigator.language,
    }),
  )
  await vi.waitFor(() => expect(join).toHaveBeenCalledTimes(2))
  expect(onJoined).toHaveBeenCalledOnce()
})
