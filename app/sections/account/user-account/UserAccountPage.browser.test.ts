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
    view: async () => ({ google: true, telegram: true }),
  },
  interface: createPreferences(),
  logout: vi.fn<UserAccountPageDeps['logout']>(async () => {}),
  profile: {
    update: vi.fn<UserAccountPageDeps['profile']['update']>(),
    view: async () => ({ displayName: 'Ada Lovelace', familyName: 'Lovelace', givenName: 'Ada' }),
  },
  view: async () => ({ initials: 'AL' }),
  ...overrides,
})

const mount = async (
  deps: UserAccountPageDeps,
  backPath?: string,
  onLoggedOut = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(UserAccountPage, {
    attachTo: document.body,
    props: { backPath, deps, googleClientId: '', onLoggedOut, telegramBotId: '' },
    route: '/account',
  })
}

it('leads back to the page the user came from', async () => {
  await mount(depsOf(), '/organizations')

  await expect
    .element(page.getByRole('link', { name: 'Back' }))
    .toHaveAttribute('href', '/organizations')
})

it('leads to the organization list when opened directly', async () => {
  await mount(depsOf())

  await expect.element(page.getByRole('heading', { name: 'Your Laraue account' })).toBeVisible()
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

it('logs out from the account page', async () => {
  const deps = depsOf()
  const onLoggedOut = vi.fn<() => void>()
  await mount(deps, undefined, onLoggedOut)

  await page.getByRole('button', { name: 'Log out' }).click()

  await vi.waitFor(() => expect(onLoggedOut).toHaveBeenCalledOnce())
  expect(deps.logout).toHaveBeenCalledOnce()
})
