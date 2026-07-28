import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { AppLayoutDeps } from './AppLayout.deps'
import type { AppLayoutData } from './AppLayout.types'
import AppLayout from './AppLayout.vue'

const data: AppLayoutData = {
  organization: {
    canCreateSpaces: true,
    canManage: true,
    canManageAttributes: false,
    canMassMove: false,
    canUpdate: true,
    color: '#4774d4',
    id: '1',
    initial: 'A',
    name: 'Acme',
  },
  spaces: [{ color: '#4774d4', key: 'product', name: 'Product' }],
  user: { color: '#4774d4', initials: 'AL', name: 'Ada Lovelace' },
}

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: AppLayoutDeps, onLoggedOut = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(AppLayout, {
    attachTo: document.body,
    props: { deps, onLoggedOut, organizationKey: 'acme-ab12' },
    route: '/organizations/acme-ab12/issues',
    slots: { default: '<p>Issues page</p>' },
  })
  return onLoggedOut
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows desktop navigation and logs out on request', async () => {
  const logout = vi.fn<AppLayoutDeps['logout']>(async () => ({ data: true, status: 'success' }))
  await page.viewport(1280, 800)
  const onLoggedOut = await mount({
    logout,
    view: vi.fn<AppLayoutDeps['view']>(async () => ({ data, status: 'success' })),
  })

  await expect.element(page.getByRole('link', { name: 'All issues' })).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: 'Create space' })).toBeInTheDocument()
  await page.getByRole('button', { name: 'Log out' }).click()

  await vi.waitFor(() => expect(logout).toHaveBeenCalledOnce())
  expect(onLoggedOut).toHaveBeenCalledOnce()
})

it('opens the navigation from the mobile menu button', async () => {
  await page.viewport(390, 844)
  await mount({
    logout: vi.fn<AppLayoutDeps['logout']>(),
    view: vi.fn<AppLayoutDeps['view']>(async () => ({ data, status: 'success' })),
  })

  await page.getByRole('button', { name: 'Open menu' }).click()

  await expect.element(page.getByRole('link', { name: 'All issues' })).toBeVisible()
})
