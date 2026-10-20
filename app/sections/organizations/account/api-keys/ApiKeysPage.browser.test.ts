import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ApiKeysPageDeps, ApiKeyViewModel } from './ApiKeysPage.deps'
import ApiKeysPage from './ApiKeysPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const key = (overrides: Partial<ApiKeyViewModel>): ApiKeyViewModel => ({
  createdAt: '2026-10-19T10:00:00Z',
  id: 'key-1',
  keyPrefix: 'brdk_abcdefg',
  lastUsedAt: null,
  name: 'Claude Code agent (MacBook)',
  revokedAt: null,
  ...overrides,
})

it('shows revoked keys only when asked to', async () => {
  const view = vi.fn<ApiKeysPageDeps['view']>(async ({ includeRevoked }) => ({
    hasNextPage: false,
    keys: [
      key({ id: 'active', name: 'Active key' }),
      ...(includeRevoked
        ? [key({ id: 'old', name: 'Old key', revokedAt: '2026-10-19T11:00:00Z' })]
        : []),
    ],
  }))

  currentWrapper = await mountSuspended(ApiKeysPage, {
    attachTo: document.body,
    props: {
      deps: {
        create: vi.fn<ApiKeysPageDeps['create']>(),
        revoke: vi.fn<ApiKeysPageDeps['revoke']>(),
        view,
      },
    },
  })

  await expect.element(page.getByText('Active key')).toBeInTheDocument()
  await expect.element(page.getByText('Old key')).not.toBeInTheDocument()

  await page.getByLabelText('Show revoked keys').click()

  await expect.element(page.getByText('Old key')).toBeInTheDocument()
  await expect.element(page.getByText('Revoked', { exact: true })).toBeInTheDocument()
  expect(view).toHaveBeenLastCalledWith(expect.objectContaining({ includeRevoked: true, page: 1 }))
})
