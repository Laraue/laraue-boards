import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { SpaceAboutSettingsDeps } from './SpaceAboutSettings.deps'
import SpaceAboutSettings from './SpaceAboutSettings.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const docs = { description: 'Product docs', id: '1', url: 'https://example.com/docs' }

const depsOf = (overrides: Partial<SpaceAboutSettingsDeps> = {}): SpaceAboutSettingsDeps => ({
  createLink: vi.fn<SpaceAboutSettingsDeps['createLink']>(async (input) => ({ ...input, id: '2' })),
  deleteLink: vi.fn<SpaceAboutSettingsDeps['deleteLink']>(async () => {}),
  saveDescription: vi.fn<SpaceAboutSettingsDeps['saveDescription']>(async () => {}),
  updateLink: vi.fn<SpaceAboutSettingsDeps['updateLink']>(async () => {}),
  view: vi.fn<SpaceAboutSettingsDeps['view']>(async () => ({
    canEdit: true,
    description: '',
    links: [docs],
  })),
  ...overrides,
})

const mount = async (deps: SpaceAboutSettingsDeps) => {
  currentWrapper = await mountSuspended(SpaceAboutSettings, {
    attachTo: document.body,
    props: { deps, spaceKey: 'WEB' },
  })
}

it('adds a link with what it is', async () => {
  const deps = depsOf()

  await mount(deps)
  await page.getByRole('textbox', { name: 'URL' }).last().fill('https://github.com/Laraue/laraue-boards')
  await page.getByRole('textbox', { name: 'What it is' }).last().fill('Nuxt web app')
  await page.getByRole('button', { name: 'Add link' }).click()

  expect(deps.createLink).toHaveBeenCalledWith({
    description: 'Nuxt web app',
    spaceKey: 'WEB',
    url: 'https://github.com/Laraue/laraue-boards',
  })
  await vi.waitFor(() => expect(deps.view).toHaveBeenCalledTimes(2))
})

it('changes a link', async () => {
  const deps = depsOf()

  await mount(deps)
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByRole('textbox', { name: 'What it is' }).first().fill('Docs for users')
  await page.getByRole('button', { exact: true, name: 'Save' }).click()

  expect(deps.updateLink).toHaveBeenCalledWith({
    description: 'Docs for users',
    id: '1',
    spaceKey: 'WEB',
    url: 'https://example.com/docs',
  })
})

it('shows the links without editing for a member who can only read', async () => {
  await mount(
    depsOf({
      view: async () => ({ canEdit: false, description: 'About', links: [docs] }),
    }),
  )

  await expect.element(page.getByText('Product docs')).toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Add link' })).not.toBeInTheDocument()
})
