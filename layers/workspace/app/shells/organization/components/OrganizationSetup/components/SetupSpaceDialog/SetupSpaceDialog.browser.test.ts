import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { SetupSpaceDialogDeps } from './SetupSpaceDialog.deps'
import SetupSpaceDialog from './SetupSpaceDialog.vue'

type OnNext = (space: { key: string; renamed: boolean }) => void

const createDeps = (): SetupSpaceDialogDeps => ({
  renameSpace: vi.fn<SetupSpaceDialogDeps['renameSpace']>(async () => undefined),
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: SetupSpaceDialogDeps, onNext: OnNext, issueCount = 0) => {
  currentWrapper = await mountSuspended(SetupSpaceDialog, {
    attachTo: document.body,
    props: {
      deps,
      onNext,
      space: { color: '#4774d4', issueCount, key: 'DEF', name: 'Default Space' },
    },
    route: '/organizations/acme-ab12/issues',
  })
}

const dialog = () => page.getByRole('dialog')

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('renames the space with a key that follows the name', async () => {
  const deps = createDeps()
  const onNext = vi.fn<OnNext>()
  await mount(deps, onNext)

  await dialog().getByLabelText('Space name').fill('Marketing')
  await expect.element(dialog().getByLabelText('Key')).toHaveValue('MAR')
  await dialog().getByRole('button', { name: 'Next' }).click()

  expect(deps.renameSpace).toHaveBeenCalledWith({
    color: '#4774d4',
    key: 'DEF',
    name: 'Marketing',
    newKey: 'MAR',
  })
  expect(onNext).toHaveBeenCalledWith({ key: 'MAR', renamed: true })
})

it('goes on without a request when the name and key are kept', async () => {
  const deps = createDeps()
  const onNext = vi.fn<OnNext>()
  await mount(deps, onNext)

  await dialog().getByRole('button', { name: 'Next' }).click()

  expect(deps.renameSpace).not.toHaveBeenCalled()
  expect(onNext).toHaveBeenCalledWith({ key: 'DEF', renamed: false })
})

it('warns that a new key changes the keys of the issues already in the space', async () => {
  await mount(createDeps(), vi.fn<OnNext>(), 2)

  await expect.element(dialog().getByText(/The space has 2 issues already/)).toBeInTheDocument()
})
