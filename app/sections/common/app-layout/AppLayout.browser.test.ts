import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { TourStateDeps } from '~/composables/useTour'

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

const createTourDeps = () => ({
  loadStatus: vi.fn<TourStateDeps['loadStatus']>(async () => 'completed'),
  saveStatus: vi.fn<TourStateDeps['saveStatus']>(async () => undefined),
})

const createDeps = (overrides: Partial<AppLayoutDeps> = {}): AppLayoutDeps => ({
  logout: vi.fn<AppLayoutDeps['logout']>(),
  tour: createTourDeps(),
  view: vi.fn<AppLayoutDeps['view']>(async () => ({ data, status: 'success' })),
  ...overrides,
})

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
  const onLoggedOut = await mount(createDeps({ logout }))

  await expect.element(page.getByRole('link', { name: 'All issues' })).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: 'Create space' })).toBeInTheDocument()
  await page.getByRole('button', { name: 'Log out' }).click()

  await vi.waitFor(() => expect(logout).toHaveBeenCalledOnce())
  expect(onLoggedOut).toHaveBeenCalledOnce()
})

it('opens the navigation from the mobile menu button', async () => {
  await page.viewport(390, 844)
  await mount(createDeps())

  await page.getByRole('button', { name: 'Open menu' }).click()

  await expect.element(page.getByRole('link', { name: 'All issues' })).toBeVisible()
})

it('introduces the workspace navigation once', async () => {
  const tour = createTourDeps()
  tour.loadStatus.mockResolvedValue(undefined)
  await page.viewport(1280, 800)

  await mount(createDeps({ tour }))

  await expect.element(page.getByText('Your organization')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect.element(page.getByText('Issues are your tasks')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect.element(page.getByText('Spaces, backlog, and boards')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Next' }).click()
  await expect.element(page.getByText('Workspace settings')).toBeInTheDocument()
  await page.getByRole('button', { name: 'Start working' }).click()

  await vi.waitFor(() => expect(tour.saveStatus).toHaveBeenCalledWith('completed'))
})

it('finishes the tour before unavailable settings', async () => {
  const tour = createTourDeps()
  tour.loadStatus.mockResolvedValue(undefined)
  await page.viewport(1280, 800)
  await mount(
    createDeps({
      tour,
      view: vi.fn<AppLayoutDeps['view']>(async () => ({
        data: {
          ...data,
          organization: {
            ...data.organization,
            canManage: false,
            canUpdate: false,
          },
        },
        status: 'success',
      })),
    }),
  )

  await page.getByRole('button', { name: 'Next' }).click()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect.element(page.getByText('Spaces, backlog, and boards')).toBeInTheDocument()
  await expect.element(page.getByText('3 of 3')).toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Start working' })).toBeInTheDocument()
})
