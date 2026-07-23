import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ActionResult } from '#infrastructure/api/apiResult'
import { COLORS, DEFAULT_COLOR } from '~/constants/colors'

import type { CreateOrganizationPageDeps } from './CreateOrganizationPage.deps'
import CreateOrganizationPage from './CreateOrganizationPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  create: CreateOrganizationPageDeps['create'],
  onCreated: () => void = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(CreateOrganizationPage, {
    attachTo: document.body,
    props: { deps: { create }, onCreated },
  })
  return currentWrapper
}

const fillAndSubmit = async () => {
  await page.getByLabelText('Name').fill('Acme')
  await page.getByLabelText('Slug').fill('acme-studio')
  await page.getByRole('button', { name: 'Create organization' }).click()
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('submits the entered organization with the default color and reports success', async () => {
  const create = vi.fn<CreateOrganizationPageDeps['create']>(async () => ({
    data: { organizationId: 'org-1' },
    status: 'success',
  }))
  const onCreated = vi.fn<() => void>()

  await mount(create, onCreated)

  await fillAndSubmit()

  expect(create).toHaveBeenCalledWith({
    color: DEFAULT_COLOR,
    name: 'Acme',
    slug: 'acme-studio',
  })
  expect(onCreated).toHaveBeenCalledTimes(1)
})

it('submits the color picked from the palette', async () => {
  const create = vi.fn<CreateOrganizationPageDeps['create']>(async () => ({
    data: { organizationId: 'org-1' },
    status: 'success',
  }))

  await mount(create)

  await page.getByRole('button', { name: 'Blue' }).click()
  await page.getByRole('option', { name: 'Teal' }).click()
  await fillAndSubmit()

  expect(create).toHaveBeenCalledWith({
    color: COLORS.teal,
    name: 'Acme',
    slug: 'acme-studio',
  })
})

it('keeps the form open and shows the validation message returned by the backend', async () => {
  const create = vi.fn<CreateOrganizationPageDeps['create']>(
    async (): Promise<ActionResult<{ organizationId: string }>> => ({
      message: 'Slug is already taken.',
      status: 'validation-error',
    }),
  )
  const onCreated = vi.fn<() => void>()

  await mount(create, onCreated)

  await fillAndSubmit()

  await expect.element(page.getByText('Slug is already taken.')).toBeInTheDocument()
  expect(onCreated).not.toHaveBeenCalled()
})
