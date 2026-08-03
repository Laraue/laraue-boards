import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { PermissionsPageDeps } from './PermissionsPage.deps'
import type { PermissionsPageMember } from './PermissionsPage.types'
import PermissionsPage from './PermissionsPage.vue'

const members: PermissionsPageMember[] = [
  {
    color: '#4774d4',
    id: '5',
    initials: 'AL',
    isAdmin: true,
    isOwner: false,
    name: 'Ada Lovelace',
  },
  {
    color: '#e5484d',
    id: '6',
    initials: 'GH',
    isAdmin: false,
    isOwner: true,
    name: 'Grace Hopper',
  },
  {
    color: '#489c61',
    id: '7',
    initials: 'AT',
    isAdmin: false,
    isOwner: false,
    name: 'Alan Turing',
  },
]

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (
  view: PermissionsPageDeps['view'],
  regenerateJoinCode = vi.fn<PermissionsPageDeps['regenerateJoinCode']>(),
) => {
  currentWrapper = await mountSuspended(PermissionsPage, {
    attachTo: document.body,
    props: {
      deps: {
        regenerateJoinCode,
        view,
      },
    },
    route: '/organizations/acme-ab12/settings/permissions',
  })
  return currentWrapper
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
  vi.restoreAllMocks()
})

it('links every member to their permissions and labels their role', async () => {
  const view = vi.fn<PermissionsPageDeps['view']>(async () => ({
    data: { joinCode: 'invite-123', members },
    status: 'success',
  }))

  await mount(view)

  await expect
    .element(page.getByLabelText('Invitation link'))
    .toHaveValue(`${window.location.origin}/join/invite-123`)
  await expect
    .element(page.getByRole('link', { name: /Ada Lovelace/ }))
    .toHaveAttribute('href', '/organizations/acme-ab12/settings/permissions/5')
  await expect.element(page.getByRole('link', { name: /Ada Lovelace/ })).toHaveTextContent('Admin')
  await expect.element(page.getByRole('link', { name: /Grace Hopper/ })).toHaveTextContent('Owner')
  await expect.element(page.getByRole('link', { name: /Alan Turing/ })).toHaveTextContent('Member')
})

it('replaces the invitation link after confirmation', async () => {
  const view = vi.fn<PermissionsPageDeps['view']>(async () => ({
    data: { joinCode: 'invite-123', members },
    status: 'success',
  }))
  const regenerateJoinCode = vi.fn<PermissionsPageDeps['regenerateJoinCode']>(async () => ({
    data: 'invite-456',
    status: 'success',
  }))
  vi.spyOn(window, 'confirm').mockReturnValue(true)

  await mount(view, regenerateJoinCode)
  await page.getByRole('button', { name: 'Create a new link' }).click()

  expect(regenerateJoinCode).toHaveBeenCalledOnce()
  await expect
    .element(page.getByLabelText('Invitation link'))
    .toHaveValue(`${window.location.origin}/join/invite-456`)
})

it('shows no member links when the list is empty', async () => {
  const view = vi.fn<PermissionsPageDeps['view']>(async () => ({
    data: { joinCode: 'invite-123', members: [] },
    status: 'success',
  }))

  await mount(view)

  await expect.element(page.getByText('No organization members found.')).toBeInTheDocument()
  await expect.element(page.getByRole('link', { name: /Ada Lovelace/ })).not.toBeInTheDocument()
})

it('reloads the members when the failed request is retried', async () => {
  const view = vi
    .fn<PermissionsPageDeps['view']>()
    .mockResolvedValueOnce({ code: 403, status: 'error' })
    .mockResolvedValue({ data: { joinCode: 'invite-123', members }, status: 'success' })

  await mount(view)

  await page.getByRole('button', { name: 'Try again' }).click()

  await expect.element(page.getByRole('link', { name: /Ada Lovelace/ })).toBeInTheDocument()
})
