import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useRouter } from '#app'

const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn<(to: unknown) => void>() }))

vi.mock('#app', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#app')>()),
  navigateTo,
}))

const { useApiClient } = await import('#layers/workspace/app/shared/composables/useApiClient')
const { useSignInRedirect } =
  await import('#layers/workspace/app/shared/composables/useSignInRedirect')

beforeEach(() => {
  vi.stubGlobal('fetch', async () => new Response(null, { status: 401 }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  navigateTo.mockReset()
})

test('sends a lost session to sign in and back', async () => {
  await useRouter().push('/organizations/acme-ab12/history')

  await useApiClient({ onUnauthorized: useSignInRedirect() }).GET('/api/spaces')

  expect(navigateTo).toHaveBeenCalledWith({
    path: '/login',
    query: { redirect: '/organizations/acme-ab12/history' },
  })
})

test('keeps a missing organization selection for the layout to settle', async () => {
  await useRouter().push('/organizations/acme-ab12/history')

  await useApiClient({ onUnauthorized: useSignInRedirect() }).GET('/api/organizations/current')

  expect(navigateTo).not.toHaveBeenCalled()
})

test('a client without a redirect policy stays on the page, regardless of layout', async () => {
  await useRouter().push('/organizations/acme-ab12/history')

  await useApiClient({}).GET('/api/spaces')

  expect(navigateTo).not.toHaveBeenCalled()
})

test('the explicit policy redirects even when a page uses a public layout', async () => {
  await useRouter().push('/login')

  await useApiClient({ onUnauthorized: useSignInRedirect() }).GET('/api/spaces')

  expect(navigateTo).toHaveBeenCalledWith({ path: '/login', query: { redirect: '/login' } })
})
