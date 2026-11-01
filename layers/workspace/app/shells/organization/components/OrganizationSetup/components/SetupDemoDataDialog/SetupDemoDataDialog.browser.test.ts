import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { SetupDemoDataDialogDeps } from './SetupDemoDataDialog.deps'
import SetupDemoDataDialog from './SetupDemoDataDialog.vue'

const createDeps = (): SetupDemoDataDialogDeps => ({
  addDemoData: vi.fn<SetupDemoDataDialogDeps['addDemoData']>(async () => undefined),
  complete: vi.fn<SetupDemoDataDialogDeps['complete']>(async () => undefined),
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: SetupDemoDataDialogDeps, onCompleted = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(SetupDemoDataDialog, {
    attachTo: document.body,
    props: {
      defaultSpaceKey: 'MAR',
      deps,
      onCompleted,
      spaces: [
        { key: 'DEV', name: 'Development' },
        { key: 'MAR', name: 'Marketing' },
      ],
    },
    route: '/organizations/acme-ab12/issues',
  })
}

const dialog = () => page.getByRole('dialog')

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('finishes empty by default, showing no demo fields', async () => {
  const deps = createDeps()
  const onCompleted = vi.fn<() => void>()
  await mount(deps, onCompleted)

  await expect
    .element(dialog().getByRole('button', { name: 'No data' }))
    .toHaveAttribute('aria-pressed', 'true')
  await expect.element(dialog().getByLabelText('Board name')).not.toBeInTheDocument()
  await dialog().getByRole('button', { name: 'Finish' }).click()

  expect(deps.addDemoData).not.toHaveBeenCalled()
  expect(deps.complete).toHaveBeenCalledWith({ demoDataAdded: false })
  expect(onCompleted).toHaveBeenCalledTimes(1)
})

it('adds the demo issues to a new board in the given space', async () => {
  const deps = createDeps()
  await mount(deps)

  await dialog().getByRole('button', { name: 'Add demo data' }).click()
  await dialog().getByRole('button', { name: 'Finish' }).click()

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
})

it('adds only the issues left in the list, to the backlog', async () => {
  const deps = createDeps()
  await mount(deps)

  await dialog().getByRole('button', { name: 'Add demo data' }).click()
  await dialog().getByRole('button', { name: 'Backlog' }).click()
  await dialog().getByRole('button', { name: 'Delete issue' }).first().click()
  await dialog().getByRole('button', { name: 'Finish' }).click()

  const input = vi.mocked(deps.addDemoData).mock.calls[0]![0]
  expect(input.target).toBe('backlog')
  expect(input.issues).toHaveLength(4)
})
