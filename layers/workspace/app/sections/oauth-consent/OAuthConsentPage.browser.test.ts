import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import type { OAuthConsentPageDeps, OAuthConsentView } from './OAuthConsentPage.deps'
import OAuthConsentPage from './OAuthConsentPage.vue'

let currentWrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(async () => {
  await currentWrapper?.unmount()
  currentWrapper = undefined
})

const requestId = '0193a5b2-0000-7000-8000-000000000001'
const allowedUrl = 'https://chatgpt.com/callback?code=abc&state=xyz'
const deniedUrl = 'https://chatgpt.com/callback?error=access_denied&state=xyz'

const consent = {
  clientHost: 'chatgpt.com',
  clientName: 'ChatGPT',
  keyName: 'ChatGPT (chatgpt.com)',
}

const readyView = (organizations = [{ id: '7', name: 'Laraue' }]): OAuthConsentView => ({
  consent,
  organizations,
  status: 'ready',
})

const depsOf = (overrides: Partial<OAuthConsentPageDeps> = {}): OAuthConsentPageDeps => ({
  approve: vi.fn<OAuthConsentPageDeps['approve']>(async () => ({
    redirectUrl: allowedUrl,
    status: 'answered',
  })),
  deny: vi.fn<OAuthConsentPageDeps['deny']>(async () => ({
    redirectUrl: deniedUrl,
    status: 'answered',
  })),
  view: vi.fn<OAuthConsentPageDeps['view']>(async () => readyView()),
  ...overrides,
})

const mount = async (
  deps: OAuthConsentPageDeps,
  {
    error = '',
    onRedirect = vi.fn<(url: string) => void>(),
    onSignInRequired = vi.fn<() => void>(),
  } = {},
) => {
  currentWrapper = await mountSuspended(OAuthConsentPage, {
    attachTo: document.body,
    props: { deps, error, onRedirect, onSignInRequired, requestId: error ? '' : requestId },
    route: error ? `/oauth/consent?error=${error}` : `/oauth/consent?request=${requestId}`,
  })
}

it('allows the app for the only organization and sends the browser back to it', async () => {
  const deps = depsOf()
  const onRedirect = vi.fn<(url: string) => void>()

  await mount(deps, { onRedirect })
  await expect.element(page.getByRole('heading', { name: 'Connect ChatGPT' })).toBeInTheDocument()
  await expect
    .element(page.getByText(/ChatGPT \(chatgpt.com\) wants to work with your Boards issues/))
    .toBeInTheDocument()
  await expect
    .element(page.getByText(/API key named “ChatGPT \(chatgpt.com\)”/))
    .toBeInTheDocument()
  await page.getByRole('button', { name: 'Allow' }).click()

  expect(deps.approve).toHaveBeenCalledWith({ organizationId: '7', requestId })
  await vi.waitFor(() => expect(onRedirect).toHaveBeenCalledWith(allowedUrl))
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

  expect(deps.approve).toHaveBeenCalledWith({ organizationId: '7', requestId })
})

it('denies the app and sends the browser back to it', async () => {
  const deps = depsOf()
  const onRedirect = vi.fn<(url: string) => void>()

  await mount(deps, { onRedirect })
  await page.getByRole('button', { name: 'Deny' }).click()

  expect(deps.deny).toHaveBeenCalledWith({ requestId })
  expect(deps.approve).not.toHaveBeenCalled()
  await vi.waitFor(() => expect(onRedirect).toHaveBeenCalledWith(deniedUrl))
})

it('asks to start again when the link expired', async () => {
  await mount(depsOf({ view: async () => ({ status: 'not-found' }) }))

  await expect
    .element(page.getByRole('heading', { name: 'This sign-in link has expired' }))
    .toBeInTheDocument()
  await expect.element(page.getByRole('button', { name: 'Allow' })).not.toBeInTheDocument()
})

it('asks to start again when the request expired before Allow', async () => {
  const onRedirect = vi.fn<(url: string) => void>()

  await mount(depsOf({ approve: async () => ({ status: 'expired' }) }), { onRedirect })
  await page.getByRole('button', { name: 'Allow' }).click()

  await expect
    .element(page.getByRole('heading', { name: 'This sign-in link has expired' }))
    .toBeInTheDocument()
  expect(onRedirect).not.toHaveBeenCalled()
})

it('explains an app Boards does not connect, without asking the API', async () => {
  const deps = depsOf()

  await mount(deps, { error: 'unknown_client' })

  await expect
    .element(page.getByRole('heading', { name: 'This app can’t connect to Boards' }))
    .toBeInTheDocument()
  expect(deps.view).not.toHaveBeenCalled()
})

it('sends a signed-out visitor to sign in', async () => {
  const onSignInRequired = vi.fn<() => void>()

  await mount(depsOf({ view: async () => ({ status: 'sign-in-required' }) }), { onSignInRequired })

  await vi.waitFor(() => expect(onSignInRequired).toHaveBeenCalledOnce())
})
