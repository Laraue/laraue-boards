import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { COLORS } from '~/constants/colors'

import type { AttributesPageDeps } from './AttributesPage.deps'
import type { AttributeListItem } from './AttributesPage.types'
import AttributesPage from './AttributesPage.vue'

const attributes: AttributeListItem[] = [
  { color: COLORS.blue, id: '7', name: 'Priority', type: 'text' },
  { color: COLORS.amber, id: '8', name: 'Severity', type: 'list' },
]

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (view: AttributesPageDeps['view']) => {
  currentWrapper = await mountSuspended(AttributesPage, {
    attachTo: document.body,
    props: { deps: { view } },
    route: '/organizations/acme-ab12/settings/attributes',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('links every attribute to its page and labels its type', async () => {
  const view = vi.fn<AttributesPageDeps['view']>(async () => ({
    data: attributes,
    status: 'success',
  }))

  await mount(view)

  await expect
    .element(page.getByRole('link', { name: /Priority/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/settings/attributes/7')
  await expect.element(page.getByRole('link', { name: /Priority/ })).toHaveTextContent('Text')
  await expect
    .element(page.getByRole('link', { name: /Severity/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/settings/attributes/8')
  await expect.element(page.getByRole('link', { name: /Severity/ })).toHaveTextContent('List')
})

it('links to the attribute creation page', async () => {
  const view = vi.fn<AttributesPageDeps['view']>(async () => ({
    data: attributes,
    status: 'success',
  }))

  await mount(view)

  await expect
    .element(page.getByRole('link', { name: 'New attribute' }))
    .toHaveAttribute('href', '/organizations/acme-ab12/settings/attributes/new')
})

it('shows no attribute links when the list is empty', async () => {
  const view = vi.fn<AttributesPageDeps['view']>(async () => ({ data: [], status: 'success' }))

  await mount(view)

  await expect.element(page.getByText('No attributes yet')).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: /Priority/ })).not.toBeInTheDocument()
})

it('reloads the attributes when the failed request is retried', async () => {
  const view = vi
    .fn<AttributesPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: attributes, status: 'success' })

  await mount(view)

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('link', { name: /Priority/ })).toBeInTheDocument()
})
