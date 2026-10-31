import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { AppLayoutData } from '#layers/workspace/app/shells/organization/AppLayout.deps'

import type { OrganizationSetupDialogDeps } from './OrganizationSetupDialog.deps'
import OrganizationSetupDialog from './OrganizationSetupDialog.vue'

const spaces: AppLayoutData['spaces'] = [{ color: '#4774d4', key: 'DEF', name: 'Default Space' }]

const createDeps = (
  overrides: Partial<OrganizationSetupDialogDeps> = {},
): OrganizationSetupDialogDeps => ({
  addDemoData: vi.fn<OrganizationSetupDialogDeps['addDemoData']>(async () => undefined),
  complete: vi.fn<OrganizationSetupDialogDeps['complete']>(async () => undefined),
  renameSpace: vi.fn<OrganizationSetupDialogDeps['renameSpace']>(async () => undefined),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  deps: OrganizationSetupDialogDeps,
  onCompleted: () => void = vi.fn<() => void>(),
  issueCount = 0,
) => {
  currentWrapper = await mountSuspended(OrganizationSetupDialog, {
    attachTo: document.body,
    props: {
      deps,
      onCompleted,
      onSpaceRenamed: vi.fn<() => void>(),
      setup: { space: { color: '#4774d4', issueCount, key: 'DEF', name: 'Default Space' } },
      spaces,
    },
    route: '/organizations/acme-ab12/issues',
  })
}

const dialog = () => page.getByRole('dialog')

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('renames the space, then adds the demo issues to a new board in it', async () => {
  const deps = createDeps()
  const onCompleted = vi.fn<() => void>()
  await mount(deps, onCompleted)

  await dialog().getByLabelText('Space name').fill('Marketing')
  await expect.element(dialog().getByLabelText('Key')).toHaveValue('MAR')
  await dialog().getByRole('button', { name: 'Next' }).click()

  await expect.element(dialog().getByRole('heading', { name: 'Almost done' })).toBeInTheDocument()
  await dialog().getByRole('button', { name: 'Add demo data' }).click()
  await dialog().getByRole('button', { name: 'Finish' }).click()

  expect(deps.renameSpace).toHaveBeenCalledWith({
    color: '#4774d4',
    key: 'DEF',
    name: 'Marketing',
    newKey: 'MAR',
  })
  expect(deps.addDemoData).toHaveBeenCalledWith(
    expect.objectContaining({
      boardName: 'Getting started',
      spaceKey: 'MAR',
      statuses: [
        { category: 'Created', name: 'To Do' },
        { category: 'InProgress', name: 'In Progress' },
        { category: 'Review', name: 'Review' },
        { category: 'Completed', name: 'Done' },
      ],
      target: 'board',
    }),
  )
  expect(vi.mocked(deps.addDemoData).mock.calls[0]![0].issues).toHaveLength(5)
  expect(deps.complete).toHaveBeenCalledWith({ demoDataAdded: true })
  expect(onCompleted).toHaveBeenCalledTimes(1)
})

it('starts empty by default, showing no demo fields', async () => {
  const deps = createDeps()
  await mount(deps)

  await dialog().getByRole('button', { name: 'Next' }).click()
  await expect
    .element(dialog().getByRole('button', { name: 'No data' }))
    .toHaveAttribute('aria-pressed', 'true')
  await expect.element(dialog().getByLabelText('Board name')).not.toBeInTheDocument()
  await dialog().getByRole('button', { name: 'Finish' }).click()

  expect(deps.renameSpace).not.toHaveBeenCalled()
  expect(deps.addDemoData).not.toHaveBeenCalled()
  expect(deps.complete).toHaveBeenCalledWith({ demoDataAdded: false })
})

it('adds only the issues left in the list, to the backlog', async () => {
  const deps = createDeps()
  await mount(deps)

  await dialog().getByRole('button', { name: 'Next' }).click()
  await dialog().getByRole('button', { name: 'Add demo data' }).click()
  await dialog().getByRole('button', { name: 'Backlog' }).click()
  await dialog().getByRole('button', { name: 'Delete issue' }).first().click()
  await dialog().getByRole('button', { name: 'Finish' }).click()

  const input = vi.mocked(deps.addDemoData).mock.calls[0]![0]
  expect(input.target).toBe('backlog')
  expect(input.issues).toHaveLength(4)
})

it('warns that a new key changes the keys of the issues already in the space', async () => {
  await mount(createDeps(), vi.fn<() => void>(), 2)

  await expect.element(dialog().getByText(/The space has 2 issues already/)).toBeInTheDocument()
})
