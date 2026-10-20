import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { AgentSignInPageDeps, AgentSignInView } from './AgentSignInPage.deps'
import AgentSignInPage from './AgentSignInPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const signIn = {
  keyName: 'Claude Code agent (dev-laptop)',
  machineName: 'dev-laptop',
  userCode: 'WXYZ-2345',
}

const readyView = (organizations = [{ id: '7', name: 'Laraue' }]): AgentSignInView => ({
  organizations,
  signIn,
  status: 'ready',
})

const depsOf = (overrides: Partial<AgentSignInPageDeps> = {}): AgentSignInPageDeps => ({
  approve: vi.fn<AgentSignInPageDeps['approve']>(async () => 'answered'),
  deny: vi.fn<AgentSignInPageDeps['deny']>(async () => 'answered'),
  view: vi.fn<AgentSignInPageDeps['view']>(async () => readyView()),
  ...overrides,
})

const mount = async (deps: AgentSignInPageDeps, onSignInRequired = vi.fn<() => void>()) => {
  currentWrapper = await mountSuspended(AgentSignInPage, {
    attachTo: document.body,
    props: { code: 'WXYZ-2345', deps, onSignInRequired },
    route: '/agent-sign-in?code=WXYZ-2345',
  })
}

it('allows the agent for the only organization and tells the user to return to the terminal', async () => {
  const deps = depsOf()

  await mount(deps)
  await expect.element(page.getByText('WXYZ-2345')).toBeInTheDocument()
  await expect.element(page.getByText(/dev-laptop wants to work/)).toBeInTheDocument()
  await page.getByRole('button', { name: 'Allow' }).click()

  expect(deps.approve).toHaveBeenCalledWith({ code: 'WXYZ-2345', organizationId: '7' })
  await expect.element(page.getByRole('heading', { name: 'Agent connected' })).toBeInTheDocument()
})

it('asks which organization when the user is in several', async () => {
  const deps = depsOf({
    view: async () =>
      readyView([
        { id: '1', name: 'Personal' },
        { id: '7', name: 'Laraue' },
      ]),
  })

  await mount(deps)
  await expect.element(page.getByRole('button', { name: 'Allow' })).toBeDisabled()
  await page.getByLabelText('Organization').click()
  await page.getByRole('option', { name: 'Laraue' }).click()
  await page.getByRole('button', { name: 'Allow' }).click()

  expect(deps.approve).toHaveBeenCalledWith({ code: 'WXYZ-2345', organizationId: '7' })
})

it('denies the agent', async () => {
  const deps = depsOf()

  await mount(deps)
  await page.getByRole('button', { name: 'Deny' }).click()

  expect(deps.deny).toHaveBeenCalledWith({ code: 'WXYZ-2345' })
  expect(deps.approve).not.toHaveBeenCalled()
  await expect.element(page.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument()
})

it('asks to run setup again when the link expired', async () => {
  await mount(depsOf({ view: async () => ({ status: 'not-found' }) }))

  await expect
    .element(page.getByRole('heading', { name: 'This sign-in link has expired' }))
    .toBeInTheDocument()
  await expect.element(page.getByText('boards-agent setup')).toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Allow' })).not.toBeInTheDocument()
})

it('asks to run setup again when the sign-in expired before Allow', async () => {
  await mount(depsOf({ approve: async () => 'expired' }))

  await page.getByRole('button', { name: 'Allow' }).click()

  await expect
    .element(page.getByRole('heading', { name: 'This sign-in link has expired' }))
    .toBeInTheDocument()
})

it('sends a signed-out visitor to sign in', async () => {
  const onSignInRequired = vi.fn<() => void>()

  await mount(depsOf({ view: async () => ({ status: 'sign-in-required' }) }), onSignInRequired)

  await vi.waitFor(() => expect(onSignInRequired).toHaveBeenCalledOnce())
})
