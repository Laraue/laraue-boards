import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import PageHeader from '~/components/PageHeader.vue'
import type { TourStateDeps } from '~/composables/useTour'

import type { AppLayoutData, AppLayoutDeps, RoutableProblem } from './AppLayout.deps'
import AppLayout from './AppLayout.vue'

const data: AppLayoutData = {
  organization: {
    canCreateSpaces: true,
    canManage: true,
    canManageAttributes: false,
    canMassMove: false,
    canUpdate: true,
    canViewBilling: true,
    color: '#4774d4',
    id: '1',
    initial: 'A',
    name: 'Acme',
  },
  spaces: [{ color: '#4774d4', key: 'product', name: 'Product' }],
  user: { color: '#4774d4', initials: 'AL', name: 'Ada Lovelace', tariffName: 'Free' },
}

const createTourDeps = () => ({
  loadStatus: vi.fn<TourStateDeps['loadStatus']>(async () => 'completed'),
  saveStatus: vi.fn<TourStateDeps['saveStatus']>(async () => undefined),
})

const createDeps = (overrides: Partial<AppLayoutDeps> = {}): AppLayoutDeps => ({
  tour: createTourDeps(),
  view: vi.fn<AppLayoutDeps['view']>(async () => ({ data, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: AppLayoutDeps, content: () => unknown = () => h('p', 'Issues page')) => {
  currentWrapper = await mountSuspended(AppLayout, {
    attachTo: document.body,
    props: {
      deps,
      onOrganizationSwitched: vi.fn<() => void>(),
      onViewProblem: vi.fn<(problem: RoutableProblem) => void>(),
      organizationKey: 'acme-ab12',
    },
    route: '/organizations/acme-ab12/issues',
    slots: { default: content },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows desktop navigation', async () => {
  await page.viewport(1280, 800)
  await mount(createDeps())

  await expect.element(page.getByRole('link', { name: 'All issues' })).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: 'Create space' })).toBeInTheDocument()
  await expect.element(page.getByText('Free')).toBeInTheDocument()
})

it("opens the navigation from the page header's menu button", async () => {
  await page.viewport(390, 844)
  await mount(createDeps(), () => h(PageHeader, { title: 'All issues' }))

  await page.getByRole('button', { name: 'Open menu' }).click()

  await expect.element(page.getByRole('link', { name: 'All issues' })).toBeVisible()
})

it('links the member to the account in the organization', async () => {
  await page.viewport(1280, 800)
  await mount(createDeps())

  await expect
    .element(page.getByRole('link', { name: /Ada Lovelace Free/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/account')
})

it('hides admin settings without any admin access', async () => {
  await page.viewport(1280, 800)
  await mount(
    createDeps({
      view: vi.fn<AppLayoutDeps['view']>(async () => ({
        data: {
          ...data,
          organization: {
            ...data.organization,
            canManage: false,
            canManageAttributes: false,
            canMassMove: false,
            canUpdate: false,
            canViewBilling: false,
          },
        },
        status: 'success',
      })),
    }),
  )

  await expect.element(page.getByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
})

it('routes admin link to the highest-priority accessible admin tab', async () => {
  await page.viewport(1280, 800)
  await mount(
    createDeps({
      view: vi.fn<AppLayoutDeps['view']>(async () => ({
        data: {
          ...data,
          organization: {
            ...data.organization,
            canManage: true,
            canUpdate: false,
          },
        },
        status: 'success',
      })),
    }),
  )

  await expect
    .element(page.getByRole('link', { name: 'Admin' }))
    .toHaveAttribute('href', expect.stringContaining('permissions'))
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
