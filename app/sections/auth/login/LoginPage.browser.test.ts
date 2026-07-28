import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'

import type { LoginPageDeps } from './LoginPage.deps'
import type { TelegramUser } from './LoginPage.types'
import LoginPage from './LoginPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

const mount = async (deps: LoginPageDeps, onLoggedIn: () => void) => {
  currentWrapper = await mountSuspended(LoginPage, {
    attachTo: document.body,
    props: { botName: 'laraue_boards_bot', deps, onLoggedIn },
    route: '/',
  })
}

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

it('continues automatically after a Telegram mini app sign-in', async () => {
  const onLoggedIn = vi.fn<() => void>()

  await mount(
    {
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: true },
        status: 'success',
      })),
      loginViaTelegramWidget: vi.fn<LoginPageDeps['loginViaTelegramWidget']>(),
    },
    onLoggedIn,
  )

  await vi.waitFor(() => expect(onLoggedIn).toHaveBeenCalledOnce())
})

it('sends the user returned by the Telegram widget', async () => {
  const loginViaTelegramWidget = vi.fn<LoginPageDeps['loginViaTelegramWidget']>(async () => ({
    data: true,
    status: 'success',
  }))
  const onLoggedIn = vi.fn<() => void>()
  const user: TelegramUser = { auth_date: 123, first_name: 'Ada', hash: 'signed', id: 42 }

  await mount(
    {
      loginViaTelegramMiniApp: vi.fn<LoginPageDeps['loginViaTelegramMiniApp']>(async () => ({
        data: { authenticated: false },
        status: 'success',
      })),
      loginViaTelegramWidget,
    },
    onLoggedIn,
  )
  ;(
    globalThis as typeof globalThis & { onTelegramAuth?: (value: TelegramUser) => void }
  ).onTelegramAuth?.(user)

  await vi.waitFor(() => expect(loginViaTelegramWidget).toHaveBeenCalledWith(user))
  expect(onLoggedIn).toHaveBeenCalledOnce()
})
