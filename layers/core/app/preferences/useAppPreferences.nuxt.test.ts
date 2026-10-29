import { afterEach, expect, test, vi } from 'vitest'

import { reloadNuxtApp, useNuxtApp, useRouter } from '#app'

import { useAppPreferences } from './useAppPreferences'

vi.mock('#app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#app')>()),
  reloadNuxtApp: vi.fn<typeof import('#app').reloadNuxtApp>(),
}))

afterEach(async () => {
  await useNuxtApp().$i18n.setLocale('en')
  vi.clearAllMocks()
})

test('switches the workspace locale and module cookie before reloading its unprefixed URL', async () => {
  const router = useRouter()
  await router.push('/login')
  const preferences = useAppPreferences()

  await preferences.setLocale('ru')

  expect(preferences.locale.value).toBe('ru')
  expect(useNuxtApp().$i18n.getLocaleCookie()).toBe('ru')
  expect(router.currentRoute.value.path).toBe('/login')
  expect(reloadNuxtApp).toHaveBeenCalledWith({ force: true })
})

test.each([
  ['/login', 'ru'],
  ['/terms', 'en'],
])('uses the locale cookie on workspace pages only: %s', async (path, expected) => {
  const nuxt = useNuxtApp()
  await useRouter().push(path)
  nuxt.$i18n.setLocaleCookie('ru')
  const options = {
    context: nuxt,
    initialSetup: true,
    newLocale: nuxt.$i18n.locale.value,
    oldLocale: nuxt.$i18n.locale.value,
  }

  await nuxt.runWithContext(() => nuxt.callHook('i18n:beforeLocaleSwitch', options))

  expect(options.newLocale).toBe(expected)
})
