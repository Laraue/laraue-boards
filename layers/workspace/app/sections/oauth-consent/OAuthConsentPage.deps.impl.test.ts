import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createOAuthConsentPageDeps } from './OAuthConsentPage.deps.impl'

const requestId = '0193a5b2-0000-7000-8000-000000000001'

const consent = {
  clientHost: 'chatgpt.com',
  clientName: 'ChatGPT',
  expiresAt: '2026-11-20T10:10:00Z',
  keyName: 'ChatGPT (chatgpt.com)',
}

const redirectUrl =
  'https://chatgpt.com/connector_platform_oauth_redirect?code=abc&state=xyz&iss=https%3A%2F%2Fboards.laraue.com'

test('loads the request with the organizations to allow it for', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/organizations' ? [{ id: 7, isPersonal: false, name: 'Laraue' }] : consent,
  )

  assert.deepEqual(await createOAuthConsentPageDeps(client).view({ requestId }), {
    consent: {
      clientHost: 'chatgpt.com',
      clientName: 'ChatGPT',
      keyName: 'ChatGPT (chatgpt.com)',
    },
    organizations: [{ id: '7', name: 'Laraue' }],
    status: 'ready',
  })
})

test('asks a signed-out visitor to sign in instead of failing', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createOAuthConsentPageDeps(client).view({ requestId }), {
    status: 'sign-in-required',
  })
})

test('reports an expired or used request as not found', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/organizations' ? [] : new Response(null, { status: 404 }),
  )

  assert.deepEqual(await createOAuthConsentPageDeps(client).view({ requestId }), {
    status: 'not-found',
  })
})

test('allows the request for the chosen organization and returns where to go back to', async () => {
  const { client, requests } = createTestApiClient(() => ({ redirectUrl }))

  assert.deepEqual(
    await createOAuthConsentPageDeps(client).approve({ organizationId: '7', requestId }),
    { redirectUrl, status: 'answered' },
  )
  assert.equal(new URL(requests[0]!.url).pathname, `/api/oauth/requests/${requestId}/approve`)
  assert.deepEqual(await requests[0]!.json(), { organizationId: 7 })
})

test('reports a request that expired before the answer', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 404 }))

  assert.deepEqual(await createOAuthConsentPageDeps(client).deny({ requestId }), {
    status: 'expired',
  })
})
