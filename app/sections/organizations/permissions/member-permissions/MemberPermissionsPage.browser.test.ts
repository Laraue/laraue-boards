import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { ActionResult } from '#infrastructure/api/apiResult'

import type { MemberPermissionsPageDeps } from './MemberPermissionsPage.deps'
import type { MemberPermissionsPageData } from './MemberPermissionsPage.types'
import MemberPermissionsPage from './MemberPermissionsPage.vue'

const pageData: MemberPermissionsPageData = {
  member: {
    color: '#4774d4',
    id: '5',
    initials: 'AL',
    isAdmin: false,
    isOwner: false,
    name: 'Ada Lovelace',
  },
  permissions: {
    admin: {
      canDeleteOrganization: false,
      canManageAttributes: false,
      canManageMembers: false,
      canMoveData: false,
      canUpdateOrganization: false,
    },
    direct: {
      '10': {
        canCreateBoards: false,
        canCreateIssues: false,
        canDelete: false,
        canDeleteBoards: false,
        canDeleteIssues: false,
        canRead: false,
        canUpdate: false,
        canUpdateBoards: false,
        canUpdateIssues: false,
      },
    },
    global: {
      canCreateBoards: false,
      canCreateIssues: false,
      canCreateSpaces: false,
      canDeleteBoards: false,
      canDeleteIssues: false,
      canDeleteSpaces: false,
      canRead: false,
      canUpdateBoards: false,
      canUpdateIssues: false,
      canUpdateSpaces: false,
    },
  },
  spaces: [{ color: '#000', id: '10', isDefault: true, name: 'Backlog' }],
}

const ownerPageData: MemberPermissionsPageData = {
  ...pageData,
  member: { ...pageData.member, isOwner: true },
}

const createDeps = (
  overrides: Partial<MemberPermissionsPageDeps> = {},
): MemberPermissionsPageDeps => ({
  update: vi.fn<MemberPermissionsPageDeps['update']>(async () => ({
    data: true,
    status: 'success',
  })),
  view: vi.fn<MemberPermissionsPageDeps['view']>(async () => ({
    data: pageData,
    status: 'success',
  })),
  ...overrides,
})

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: MemberPermissionsPageDeps, onSaved: () => void) => {
  currentWrapper = await mountSuspended(MemberPermissionsPage, {
    attachTo: document.body,
    props: { deps, memberId: '5', onSaved },
    route: '/organizations/acme-ab12/settings/permissions/5',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('shows the member and their current permissions', async () => {
  await mount(createDeps(), vi.fn<() => void>())

  await expect.element(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
  await expect.element(page.getByLabelText('Manage members and permissions')).not.toBeChecked()
})

it('submits updated permissions and reports success', async () => {
  const update = vi.fn<MemberPermissionsPageDeps['update']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onSaved = vi.fn<() => void>()

  await mount(createDeps({ update }), onSaved)

  await page.getByLabelText('Manage members and permissions').click()
  await page.getByRole('button', { name: 'Save permissions' }).click()

  expect(update).toHaveBeenCalledWith({
    memberId: '5',
    permissions: {
      ...pageData.permissions,
      admin: { ...pageData.permissions.admin, canManageMembers: true },
    },
  })
  expect(onSaved).toHaveBeenCalledTimes(1)
  await expect.element(page.getByText('Permissions saved.')).toBeInTheDocument()
})

it('keeps the form open and shows the message when saving fails', async () => {
  const update = vi.fn<MemberPermissionsPageDeps['update']>(
    async (): Promise<ActionResult<true>> => ({
      message: 'This member is no longer in the organization.',
      status: 'validation-error',
    }),
  )
  const onSaved = vi.fn<() => void>()

  await mount(createDeps({ update }), onSaved)

  await page.getByRole('button', { name: 'Save permissions' }).click()

  await expect
    .element(page.getByText('This member is no longer in the organization.'))
    .toBeInTheDocument()
  expect(onSaved).not.toHaveBeenCalled()
})

it('reloads the member when the failed request is retried', async () => {
  const view = vi
    .fn<MemberPermissionsPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: pageData, status: 'success' })

  await mount(createDeps({ view }), vi.fn<() => void>())

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
})

it('disables the form for the organization owner', async () => {
  const view = vi.fn<MemberPermissionsPageDeps['view']>(async () => ({
    data: ownerPageData,
    status: 'success',
  }))

  await mount(createDeps({ view }), vi.fn<() => void>())

  await expect.element(page.getByText('Owner permissions are read-only.')).toBeInTheDocument()
  await expect
    .element(page.getByRole('button', { name: 'Save permissions' }))
    .not.toBeInTheDocument()
})
