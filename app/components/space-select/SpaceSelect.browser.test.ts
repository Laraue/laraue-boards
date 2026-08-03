import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import type { SpaceSelectDeps } from './SpaceSelect.deps'
import SpaceSelect from './SpaceSelect.vue'

const perOrganization = () =>
  vi.fn<SpaceSelectDeps['loadSpaces']>(async ({ organizationId }) => ({
    data:
      organizationId === '2'
        ? [{ label: 'Marketing', value: '30' }]
        : [{ label: 'Development', value: '10' }],
    status: 'success',
  }))

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: SpaceSelectDeps, organizationId?: string) => {
  currentWrapper = await mountSuspended(SpaceSelect, {
    attachTo: document.body,
    props: { 'aria-label': 'Space', deps, modelValue: '', organizationId },
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('loads the options of the given organization once focused', async () => {
  const loadSpaces = perOrganization()

  await mount({ loadSpaces }, '2')
  await page.getByLabelText('Space').click()

  await expect.element(page.getByRole('option', { name: 'Marketing' })).toBeInTheDocument()
})

it('reloads and clears the selection when the organization changes', async () => {
  const loadSpaces = perOrganization()

  await mount({ loadSpaces }, '1')
  await page.getByLabelText('Space').click()
  await expect.element(page.getByRole('option', { name: 'Development' })).toBeInTheDocument()
  await page.getByLabelText('Space').selectOptions('10')

  await userEvent.click(document.body)
  await currentWrapper!.setProps({ organizationId: '2' })
  await page.getByLabelText('Space').click()

  await expect.element(page.getByRole('option', { name: 'Marketing' })).toBeInTheDocument()
  await expect.element(page.getByLabelText('Space')).toHaveValue('')
})

it('shows an error when loading fails', async () => {
  const loadSpaces = vi.fn<SpaceSelectDeps['loadSpaces']>(async () => ({
    code: 500,
    status: 'error',
  }))

  await mount({ loadSpaces })
  await page.getByLabelText('Space').click()

  await expect.element(page.getByText('Could not load spaces.')).toBeInTheDocument()
})
