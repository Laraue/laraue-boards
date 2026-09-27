import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'
import { ref } from 'vue'

import type { InterfaceSectionDeps } from './components/InterfaceSection/InterfaceSection.deps'
import type { UserAccountPageDeps } from './UserAccountPage.deps'
import UserAccountPage from './UserAccountPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  clearNuxtData()
})

const createPreferences = (): InterfaceSectionDeps => ({
  locale: ref<'en' | 'ru'>('en'),
  setLocale: vi.fn<InterfaceSectionDeps['setLocale']>(),
  setTheme: vi.fn<InterfaceSectionDeps['setTheme']>(),
  theme: ref<'dark' | 'light'>('light'),
})

const depsOf = (overrides: Partial<UserAccountPageDeps> = {}): UserAccountPageDeps => ({
  connectedAccounts: {
    connectGoogle: vi.fn<UserAccountPageDeps['connectedAccounts']['connectGoogle']>(),
    connectTelegram: vi.fn<UserAccountPageDeps['connectedAccounts']['connectTelegram']>(),
    googleSignInButton: { loadGoogleSignIn: async () => undefined },
    telegramSignInButton: { loadTelegramSignIn: async () => undefined },
    view: async () => ({ data: { google: true, telegram: true }, status: 'success' }),
  },
  interface: createPreferences(),
  logout: vi.fn<UserAccountPageDeps['logout']>(async () => ({ data: true, status: 'success' })),
  view: async () => ({
    data: {
      kind: 'signed-in',
      user: { color: '#3568d4', initials: 'AL', name: 'Ada Lovelace' },
    },
    status: 'success',
  }),
  ...overrides,
})

const mount = async (
  deps: UserAccountPageDeps,
  onSignedOut = vi.fn<() => void>(),
  backPath?: string,
  onLoggedOut = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(UserAccountPage, {
    attachTo: document.body,
    props: { backPath, deps, googleClientId: '', onLoggedOut, onSignedOut, telegramBotId: '' },
    route: '/account',
  })
  return onSignedOut
}

it('leads back to the page the user came from', async () => {
  await mount(depsOf(), undefined, '/organizations')

  await expect
    .element(page.getByRole('link', { name: 'Back' }))
    .toHaveAttribute('href', '/organizations')
})

it('leads to the organization list when opened directly', async () => {
  await mount(depsOf())

  await expect.element(page.getByRole('heading', { name: 'Your account' })).toBeVisible()
  await expect
    .element(page.getByRole('link', { name: 'Back to organizations' }))
    .toHaveAttribute('href', '/organizations')
})

it('changes the theme and the language for the whole account', async () => {
  const preferences = createPreferences()
  await mount(depsOf({ interface: preferences }))

  await page.getByRole('button', { name: 'Dark' }).click()
  await page.getByLabelText('Language').selectOptions('ru')

  expect(preferences.setTheme).toHaveBeenCalledWith('dark')
  expect(preferences.setLocale).toHaveBeenCalledWith('ru')
})

it('sends a signed-out visitor to sign in', async () => {
  const onSignedOut = await mount(
    depsOf({ view: async () => ({ data: { kind: 'signed-out' }, status: 'success' }) }),
  )

  await vi.waitFor(() => expect(onSignedOut).toHaveBeenCalledOnce())
})

it('logs out from the account page', async () => {
  const deps = depsOf()
  const onLoggedOut = vi.fn<() => void>()
  await mount(deps, undefined, undefined, onLoggedOut)

  await page.getByRole('button', { name: 'Log out' }).click()

  await vi.waitFor(() => expect(onLoggedOut).toHaveBeenCalledOnce())
  expect(deps.logout).toHaveBeenCalledOnce()
})
