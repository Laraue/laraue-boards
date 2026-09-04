import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ActionResult } from '#infrastructure/api/apiResult'
import { COLORS } from '~/constants/colors'

import type { AttributePageDeps } from './AttributePage.deps'
import type { Attribute } from './AttributePage.types'
import AttributePage from './AttributePage.vue'

const textAttribute: Attribute = {
  color: COLORS.blue,
  data: { type: 'text' },
  id: '7',
  name: 'Priority',
}

const listAttribute: Attribute = {
  color: COLORS.amber,
  data: {
    listValues: [
      { id: '1', name: 'Low' },
      { id: '2', name: 'High' },
    ],
    type: 'list',
  },
  id: '7',
  name: 'Severity',
}

const createDeps = (
  overrides: Partial<AttributePageDeps> = {},
  attribute: Attribute = textAttribute,
): AttributePageDeps => ({
  delete: vi.fn<AttributePageDeps['delete']>(async () => ({ data: true, status: 'success' })),
  update: vi.fn<AttributePageDeps['update']>(async () => ({ data: true, status: 'success' })),
  view: vi.fn<AttributePageDeps['view']>(async () => ({ data: attribute, status: 'success' })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: AttributePageDeps, onFinished: () => void) => {
  currentWrapper = await mountSuspended(AttributePage, {
    attachTo: document.body,
    props: { attributeId: '7', deps, onFinished },
    route: '/organizations/acme-ab12/settings/attributes/7',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the loaded text attribute without an options editor', async () => {
  await mount(createDeps(), vi.fn<() => void>())

  await expect.element(page.getByLabelText('Name')).toHaveValue('Priority')
  await expect.element(page.getByRole('button', { name: 'Blue' })).toBeInTheDocument()
  await expect.element(page.getByRole('group', { name: 'Options' })).not.toBeInTheDocument()
})

it('shows the options of the loaded list attribute', async () => {
  await mount(createDeps({}, listAttribute), vi.fn<() => void>())

  await expect.element(page.getByLabelText('Name')).toHaveValue('Severity')
  await expect.element(page.getByRole('button', { name: 'Amber' })).toBeInTheDocument()
  await expect.element(page.getByRole('textbox', { name: 'Option 1' })).toHaveValue('Low')
  await expect.element(page.getByRole('textbox', { name: 'Option 2' })).toHaveValue('High')
})

it('submits the edited name and color', async () => {
  const update = vi.fn<AttributePageDeps['update']>(async () => ({ data: true, status: 'success' }))
  const onFinished = vi.fn<() => void>()

  await mount(createDeps({ update }), onFinished)

  await page.getByLabelText('Name').fill('Severity')
  await page.getByRole('button', { name: 'Blue' }).click()
  await page.getByRole('option', { name: 'Teal' }).click()
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(update).toHaveBeenCalledWith({
    color: COLORS.teal,
    data: { type: 'text' },
    id: '7',
    name: 'Severity',
  })
  expect(onFinished).toHaveBeenCalledTimes(1)
})

it('submits edited options keeping the id of the existing ones', async () => {
  const update = vi.fn<AttributePageDeps['update']>(async () => ({ data: true, status: 'success' }))

  await mount(createDeps({ update }, listAttribute), vi.fn<() => void>())

  await page.getByRole('textbox', { name: 'Option 1' }).fill('Lowest')
  await page.getByRole('button', { name: 'Add option' }).click()
  await page.getByRole('textbox', { name: 'Option 3' }).fill('Critical')
  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(update).toHaveBeenCalledWith({
    color: COLORS.amber,
    data: {
      listValues: [
        { id: '1', name: 'Lowest' },
        { id: '2', name: 'High' },
        { id: null, name: 'Critical' },
      ],
      type: 'list',
    },
    id: '7',
    name: 'Severity',
  })
})

it('removes an option and keeps the last one undeletable', async () => {
  const update = vi.fn<AttributePageDeps['update']>(async () => ({ data: true, status: 'success' }))

  await mount(createDeps({ update }, listAttribute), vi.fn<() => void>())

  await page.getByRole('button', { name: 'Remove option 2' }).click()

  await expect.element(page.getByRole('textbox', { name: 'Option 2' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Remove option 1' })).toBeDisabled()

  await page.getByRole('button', { name: 'Save changes' }).click()

  expect(update).toHaveBeenCalledWith({
    color: COLORS.amber,
    data: { listValues: [{ id: '1', name: 'Low' }], type: 'list' },
    id: '7',
    name: 'Severity',
  })
})

it('offers one blank option for a list attribute without values', async () => {
  const attribute: Attribute = {
    ...listAttribute,
    data: { listValues: [], type: 'list' },
  }

  await mount(createDeps({}, attribute), vi.fn<() => void>())

  await expect.element(page.getByRole('textbox', { name: 'Option 1' })).toHaveValue('')
  await expect.element(page.getByRole('button', { name: 'Remove option 1' })).toBeDisabled()
})

it('keeps the form open and shows the validation message returned by the backend', async () => {
  const update = vi.fn<AttributePageDeps['update']>(async (): Promise<ActionResult<true>> => ({
    message: 'Name is already taken.',
    status: 'validation-error',
  }))
  const onFinished = vi.fn<() => void>()

  await mount(createDeps({ update }), onFinished)

  await page.getByRole('button', { name: 'Save changes' }).click()

  await expect.element(page.getByText('Name is already taken.')).toBeInTheDocument()
  expect(onFinished).not.toHaveBeenCalled()
})

it('deletes the attribute after confirmation', async () => {
  const deleteAttribute = vi.fn<AttributePageDeps['delete']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onFinished = vi.fn<() => void>()
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount(createDeps({ delete: deleteAttribute }), onFinished)

  await page.getByRole('button', { name: 'Delete attribute' }).click()

  expect(deleteAttribute).toHaveBeenCalledWith({ id: '7' })
  expect(onFinished).toHaveBeenCalledTimes(1)
})

it('does not delete the attribute when confirmation is dismissed', async () => {
  const deleteAttribute = vi.fn<AttributePageDeps['delete']>(async () => ({
    data: true,
    status: 'success',
  }))
  vi.spyOn(window, 'confirm').mockReturnValue(false)

  await mount(createDeps({ delete: deleteAttribute }), vi.fn<() => void>())

  await page.getByRole('button', { name: 'Delete attribute' }).click()

  expect(deleteAttribute).not.toHaveBeenCalled()
})
