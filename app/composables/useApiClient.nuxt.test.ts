import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const { navigateTo } = vi.hoisted(() => ({ navigateTo: vi.fn<(to: unknown) => void>() }))

mockNuxtImport('navigateTo', () => navigateTo)

const { useApiClient } = await import('~/composables/useApiClient')

beforeEach(() => {
  vi.stubGlobal('fetch', async () => new Response(null, { status: 401 }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  navigateTo.mockReset()
})

test('sends a lost session to sign in and back', async () => {
  await useRouter().push('/organizations/acme-ab12/history')

  await useApiClient().GET('/api/spaces')

  expect(navigateTo).toHaveBeenCalledWith({
    path: '/login',
    query: { redirect: '/organizations/acme-ab12/history' },
  })
})

test('keeps a missing organization selection for the layout to settle', async () => {
  await useRouter().push('/organizations/acme-ab12/history')

  await useApiClient().GET('/api/organizations/current')

  expect(navigateTo).not.toHaveBeenCalled()
})

test('leaves public pages alone', async () => {
  await useRouter().push('/login')

  await useApiClient().GET('/api/spaces')

  expect(navigateTo).not.toHaveBeenCalled()
})
