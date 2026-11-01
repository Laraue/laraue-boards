import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { AppLayoutData } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { OrganizationSetupDeps } from './OrganizationSetup.deps'
import OrganizationSetup from './OrganizationSetup.vue'

const createDeps = (): OrganizationSetupDeps => ({
  demoDataDialog: {
    addDemoData: vi.fn<OrganizationSetupDeps['demoDataDialog']['addDemoData']>(
      async () => undefined,
    ),
    complete: vi.fn<OrganizationSetupDeps['demoDataDialog']['complete']>(async () => undefined),
  },
  spaceDialog: {
    renameSpace: vi.fn<OrganizationSetupDeps['spaceDialog']['renameSpace']>(async () => undefined),
  },
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: OrganizationSetupDeps,
  setup: NonNullable<AppLayoutData['setup']>,
  onSpaceRenamed = vi.fn<() => void>(),
) => {
  currentWrapper = await mountSuspended(OrganizationSetup, {
    attachTo: document.body,
    props: {
      deps,
      onCompleted: vi.fn<() => void>(),
      onSpaceRenamed,
      setup,
      spaces: [{ color: '#4774d4', key: 'DEF', name: 'Default Space' }],
    },
    route: '/organizations/acme-ab12/issues',
  })
}

const dialog = () => page.getByRole('dialog')

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('reloads the layout after a rename, then opens the demo data window', async () => {
  const onSpaceRenamed = vi.fn<() => void>()
  await mount(
    createDeps(),
    { space: { color: '#4774d4', issueCount: 0, key: 'DEF', name: 'Default Space' } },
    onSpaceRenamed,
  )

  await dialog().getByLabelText('Space name').fill('Marketing')
  await dialog().getByRole('button', { name: 'Next' }).click()

  await expect.element(dialog().getByRole('heading', { name: 'Almost done' })).toBeInTheDocument()
  expect(onSpaceRenamed).toHaveBeenCalledTimes(1)
})

it('starts at the demo data window when there is no space to name', async () => {
  await mount(createDeps(), {})

  await expect.element(dialog().getByRole('heading', { name: 'Almost done' })).toBeInTheDocument()
})
