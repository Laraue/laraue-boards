import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { TelegramUser } from '~/sections/auth/login/LoginPage.types'

import type { JoinOrganizationPageDeps } from './JoinOrganizationPage.deps'
import JoinOrganizationPage from './JoinOrganizationPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const depsOf = (overrides: Partial<JoinOrganizationPageDeps> = {}): JoinOrganizationPageDeps => ({
  join: vi.fn<JoinOrganizationPageDeps['join']>(),
  loginViaTelegramMiniApp: vi.fn<JoinOrganizationPageDeps['loginViaTelegramMiniApp']>(async () => ({
    data: { authenticated: false },
    status: 'success',
  })),
  loginViaTelegramWidget: vi.fn<JoinOrganizationPageDeps['loginViaTelegramWidget']>(),
  ...overrides,
})

const mount = async (deps: JoinOrganizationPageDeps, onJoined = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(JoinOrganizationPage, {
    attachTo: document.body,
    props: { botName: 'laraue_boards_bot', code: 'invite-123', deps, onJoined },
    route: '/join/invite-123',
  })
}

it('accepts the invitation code and continues to the organization picker', async () => {
  const join = vi.fn<JoinOrganizationPageDeps['join']>(async () => ({
    data: 'joined',
    status: 'success',
  }))
  const onJoined = vi.fn<() => void>()

  await mount(depsOf({ join }), onJoined)

  expect(join).not.toHaveBeenCalled()
  await page.getByRole('button', { name: 'Accept invitation' }).click()

  expect(join).toHaveBeenCalledWith({ code: 'invite-123' })
  expect(onJoined).toHaveBeenCalledOnce()
})

it('signs in inside a Telegram Mini App and retries the invitation', async () => {
  const join = vi
    .fn<JoinOrganizationPageDeps['join']>()
    .mockResolvedValueOnce({ data: 'sign-in-required', status: 'success' })
    .mockResolvedValueOnce({ data: 'joined', status: 'success' })
  const loginViaTelegramMiniApp = vi.fn<JoinOrganizationPageDeps['loginViaTelegramMiniApp']>(
    async () => ({ data: { authenticated: true }, status: 'success' }),
  )
  const onJoined = vi.fn<() => void>()

  await mount(depsOf({ join, loginViaTelegramMiniApp }), onJoined)
  await page.getByRole('button', { name: 'Accept invitation' }).click()

  await vi.waitFor(() => expect(join).toHaveBeenCalledTimes(2))
  expect(loginViaTelegramMiniApp).toHaveBeenCalledOnce()
  expect(onJoined).toHaveBeenCalledOnce()
})

it('shows the Telegram widget in a regular browser and retries after login', async () => {
  const join = vi
    .fn<JoinOrganizationPageDeps['join']>()
    .mockResolvedValueOnce({ data: 'sign-in-required', status: 'success' })
    .mockResolvedValueOnce({ data: 'joined', status: 'success' })
  const loginViaTelegramWidget = vi.fn<JoinOrganizationPageDeps['loginViaTelegramWidget']>(
    async () => ({ data: true, status: 'success' }),
  )
  const onJoined = vi.fn<() => void>()
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  await mount(depsOf({ join, loginViaTelegramWidget }), onJoined)
  await page.getByRole('button', { name: 'Accept invitation' }).click()
  await expect.element(page.getByText('Sign in with Telegram')).toBeInTheDocument()
  ;(
    globalThis as typeof globalThis & { onTelegramJoinAuth?: (value: TelegramUser) => void }
  ).onTelegramJoinAuth?.(user)

  await vi.waitFor(() => expect(loginViaTelegramWidget).toHaveBeenCalledWith(user))
  await vi.waitFor(() => expect(join).toHaveBeenCalledTimes(2))
  expect(onJoined).toHaveBeenCalledOnce()
})
