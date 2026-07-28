import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OrganizationSelectDeps } from './OrganizationSelect.deps'
import OrganizationSelect from './OrganizationSelect.vue'

const createDeps = (
  loadOrganizations: OrganizationSelectDeps['loadOrganizations'],
): OrganizationSelectDeps => ({ loadOrganizations })

const loadTwo = () =>
  vi.fn<OrganizationSelectDeps['loadOrganizations']>(async () => ({
    data: [
      { label: 'Acme', value: '1' },
      { label: 'Globex', value: '2' },
    ],
    status: 'success',
  }))

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: OrganizationSelectDeps, modelValue = '') => {
  currentWrapper = await mountSuspended(OrganizationSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Organization', deps, modelValue },
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads the options once the select is focused', async () => {
  const loadOrganizations = loadTwo()

  await mount(createDeps(loadOrganizations))
  await page.getByLabelText('Organization').click()

  await expect.element(page.getByRole('option', { name: 'Acme' })).toBeInTheDocument()
  await expect.element(page.getByRole('option', { name: 'Globex' })).toBeInTheDocument()
})

it('shows the empty state when there are no organizations', async () => {
  const loadOrganizations = vi.fn<OrganizationSelectDeps['loadOrganizations']>(async () => ({
    data: [],
    status: 'success',
  }))

  await mount(createDeps(loadOrganizations))
  await page.getByLabelText('Organization').click()

  await expect
    .element(page.getByRole('option', { name: 'No organizations available' }))
    .toBeInTheDocument()
})

it('shows an error when loading fails', async () => {
  const loadOrganizations = vi.fn<OrganizationSelectDeps['loadOrganizations']>(async () => ({
    code: 500,
    status: 'error',
  }))

  await mount(createDeps(loadOrganizations))
  await page.getByLabelText('Organization').click()

  await expect.element(page.getByText('Could not load organizations.')).toBeInTheDocument()
})

it('keeps the initial option visible before the options are loaded', async () => {
  currentWrapper = await mountSuspended(OrganizationSelect, {
    attachTo: document.body,
    props: {
      'aria-label': 'Organization',
      deps: createDeps(loadTwo()),
      initialOption: { label: 'Current', value: '7' },
      modelValue: '7',
    },
  })

  await expect.element(page.getByLabelText('Organization')).toHaveValue('7')
  await expect.element(page.getByRole('option', { name: 'Current' })).toBeInTheDocument()
})
