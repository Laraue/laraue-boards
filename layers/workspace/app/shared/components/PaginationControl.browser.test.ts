import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import PaginationControl from './PaginationControl.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (onUpdatePage: (page: number) => void, pageNumber = 1) => {
  currentWrapper = await mountSuspended(PaginationControl, {
    attachTo: document.body,
    props: { hasNextPage: true, 'onUpdate:page': onUpdatePage, page: pageNumber },
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('moves to the next page when the user presses Next page', async () => {
  const onUpdatePage = vi.fn<(page: number) => void>()

  await mount(onUpdatePage)
  await page.getByRole('button', { name: 'Next page' }).click()

  expect(onUpdatePage).toHaveBeenCalledWith(2)
})

it('keeps the page number at one when the user enters an invalid value', async () => {
  const onUpdatePage = vi.fn<(page: number) => void>()

  await mount(onUpdatePage, 2)
  await page.getByLabelText('Page number').fill('0')
  await userEvent.keyboard('{Enter}')

  expect(onUpdatePage).toHaveBeenCalledWith(1)
})
