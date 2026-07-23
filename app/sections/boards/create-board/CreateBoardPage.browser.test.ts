import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { CreateBoardPageDeps } from './CreateBoardPage.deps'
import CreateBoardPage from './CreateBoardPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  create: CreateBoardPageDeps['create'],
  onCreated: (boardId: string) => void,
) => {
  currentWrapper = await mountSuspended(CreateBoardPage, {
    attachTo: document.body,
    props: { deps: { create }, onCreated, spaceKey: 'product-AB12' },
    route: '/organizations/acme-ab12/spaces/product-AB12/boards/new',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('creates a board from the entered name', async () => {
  const create = vi.fn<CreateBoardPageDeps['create']>(async () => ({
    data: { boardId: '12' },
    status: 'success',
  }))
  const onCreated = vi.fn<(boardId: string) => void>()

  await mount(create, onCreated)
  await page.getByLabelText('Name').fill('Roadmap')
  await page.getByRole('button', { name: 'Create board' }).click()

  expect(create).toHaveBeenCalledWith({
    color: '#4774d4',
    name: 'Roadmap',
    spaceKey: 'product-AB12',
  })
  expect(onCreated).toHaveBeenCalledWith('12')
})
