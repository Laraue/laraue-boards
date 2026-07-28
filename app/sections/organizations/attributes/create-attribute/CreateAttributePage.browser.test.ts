import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ActionResult } from '#infrastructure/api/apiResult'
import { COLORS, DEFAULT_COLOR } from '~/constants/colors'

import type { CreateAttributePageDeps } from './CreateAttributePage.deps'
import CreateAttributePage from './CreateAttributePage.vue'

const succeeds = () =>
  vi.fn<CreateAttributePageDeps['create']>(async () => ({
    data: { id: '9' },
    status: 'success',
  }))

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  create: CreateAttributePageDeps['create'],
  onCreated: () => void = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(CreateAttributePage, {
    attachTo: document.body,
    props: { deps: { create }, onCreated },
    route: '/organizations/acme-ab12/settings/attributes/new',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('starts as a text attribute without an options editor', async () => {
  await mount(succeeds())

  await expect.element(page.getByLabelText('Type')).toHaveValue('text')
  await expect.element(page.getByRole('button', { name: 'Blue' })).toBeInTheDocument()
  await expect.element(page.getByRole('group', { name: 'Options' })).not.toBeInTheDocument()
})

it('submits a text attribute with the default color', async () => {
  const create = succeeds()
  const onCreated = vi.fn<() => void>()

  await mount(create, onCreated)

  await page.getByLabelText('Name').fill('Priority')
  await page.getByRole('button', { name: 'Create attribute' }).click()

  expect(create).toHaveBeenCalledWith({
    color: DEFAULT_COLOR,
    data: { type: 'text' },
    name: 'Priority',
  })
  expect(onCreated).toHaveBeenCalledTimes(1)
})

it('submits the color picked from the palette', async () => {
  const create = succeeds()

  await mount(create)

  await page.getByLabelText('Name').fill('Priority')
  await page.getByRole('button', { name: 'Blue' }).click()
  await page.getByRole('option', { name: 'Teal' }).click()
  await page.getByRole('button', { name: 'Create attribute' }).click()

  expect(create).toHaveBeenCalledWith({
    color: COLORS.teal,
    data: { type: 'text' },
    name: 'Priority',
  })
})

it('submits a list attribute with its options', async () => {
  const create = succeeds()

  await mount(create)

  await page.getByLabelText('Name').fill('Severity')
  await page.getByLabelText('Type').selectOptions('list')
  await page.getByRole('textbox', { name: 'Option 1' }).fill('Low')
  await page.getByRole('button', { name: 'Add option' }).click()
  await page.getByRole('textbox', { name: 'Option 2' }).fill('High')
  await page.getByRole('button', { name: 'Create attribute' }).click()

  expect(create).toHaveBeenCalledWith({
    color: DEFAULT_COLOR,
    data: { listValues: ['Low', 'High'], type: 'list' },
    name: 'Severity',
  })
})

it('removes an option and keeps the last one undeletable', async () => {
  const create = succeeds()

  await mount(create)

  await page.getByLabelText('Name').fill('Severity')
  await page.getByLabelText('Type').selectOptions('list')
  await page.getByRole('textbox', { name: 'Option 1' }).fill('Low')
  await page.getByRole('button', { name: 'Add option' }).click()
  await page.getByRole('textbox', { name: 'Option 2' }).fill('High')
  await page.getByRole('button', { name: 'Remove option 1' }).click()

  await expect.element(page.getByRole('textbox', { name: 'Option 1' })).toHaveValue('High')
  await expect.element(page.getByRole('textbox', { name: 'Option 2' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Remove option 1' })).toBeDisabled()

  await page.getByRole('button', { name: 'Create attribute' }).click()

  expect(create).toHaveBeenCalledWith({
    color: DEFAULT_COLOR,
    data: { listValues: ['High'], type: 'list' },
    name: 'Severity',
  })
})

it('drops the options when switching back to a text attribute', async () => {
  const create = succeeds()

  await mount(create)

  await page.getByLabelText('Name').fill('Severity')
  await page.getByLabelText('Type').selectOptions('list')
  await page.getByRole('textbox', { name: 'Option 1' }).fill('Low')
  await page.getByLabelText('Type').selectOptions('text')

  await expect.element(page.getByRole('group', { name: 'Options' })).not.toBeInTheDocument()

  await page.getByRole('button', { name: 'Create attribute' }).click()

  expect(create).toHaveBeenCalledWith({
    color: DEFAULT_COLOR,
    data: { type: 'text' },
    name: 'Severity',
  })
})

it('keeps the form open and shows the validation message returned by the backend', async () => {
  const create = vi.fn<CreateAttributePageDeps['create']>(
    async (): Promise<ActionResult<{ id: string }>> => ({
      message: 'Name is already taken.',
      status: 'validation-error',
    }),
  )
  const onCreated = vi.fn<() => void>()

  await mount(create, onCreated)

  await page.getByLabelText('Name').fill('Priority')
  await page.getByRole('button', { name: 'Create attribute' }).click()

  await expect.element(page.getByText('Name is already taken.')).toBeInTheDocument()
  expect(onCreated).not.toHaveBeenCalled()
})
