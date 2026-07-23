import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { CreateSpacePageDeps } from './CreateSpacePage.deps'
import CreateSpacePage from './CreateSpacePage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  create: CreateSpacePageDeps['create'],
  onCreated: (spaceKey: string) => void,
) => {
  currentWrapper = await mountSuspended(CreateSpacePage, {
    attachTo: document.body,
    props: { deps: { create }, onCreated },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('submits the entered space and reports its key', async () => {
  const create = vi.fn<CreateSpacePageDeps['create']>(async () => ({
    data: { spaceKey: 'product' },
    status: 'success',
  }))
  const onCreated = vi.fn<(spaceKey: string) => void>()

  await mount(create, onCreated)
  await page.getByLabelText('Name').fill('Product')
  await page.getByLabelText('Key').fill(' product ')
  await page.getByRole('button', { name: 'Create space' }).click()

  expect(create).toHaveBeenCalledWith({
    color: '#4774d4',
    key: 'product',
    name: 'Product',
  })
  expect(onCreated).toHaveBeenCalledWith('product')
})

it('keeps the form open and shows a backend validation message', async () => {
  const create = vi.fn<CreateSpacePageDeps['create']>(async () => ({
    message: 'Key is already taken.',
    status: 'validation-error',
  }))
  const onCreated = vi.fn<(spaceKey: string) => void>()

  await mount(create, onCreated)
  await page.getByLabelText('Name').fill('Product')
  await page.getByLabelText('Key').fill('product')
  await page.getByRole('button', { name: 'Create space' }).click()

  await expect.element(page.getByText('Key is already taken.')).toBeInTheDocument()
  expect(onCreated).not.toHaveBeenCalled()
})
