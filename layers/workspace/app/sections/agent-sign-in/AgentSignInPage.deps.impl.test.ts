import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createAgentSignInPageDeps } from './AgentSignInPage.deps.impl'

const signIn = {
  clientName: 'Claude Code agent',
  createdAt: '2026-10-19T10:00:00Z',
  expiresAt: '2026-10-19T10:10:00Z',
  keyName: 'Claude Code agent (dev-laptop)',
  machineName: 'dev-laptop',
  userCode: 'WXYZ-2345',
}

test('loads the sign-in with the organizations to allow it for', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/organizations' ? [{ id: 7, isPersonal: false, name: 'Laraue' }] : signIn,
  )

  assert.deepEqual(await createAgentSignInPageDeps(client).view({ code: 'WXYZ-2345' }), {
    organizations: [{ id: '7', name: 'Laraue' }],
    signIn: {
      clientName: 'Claude Code agent',
      keyName: 'Claude Code agent (dev-laptop)',
      machineName: 'dev-laptop',
      userCode: 'WXYZ-2345',
    },
    status: 'ready',
  })
})

test('asks a signed-out visitor to sign in instead of failing', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createAgentSignInPageDeps(client).view({ code: 'WXYZ-2345' }), {
    status: 'sign-in-required',
  })
})

test('reports an expired or used sign-in link as not found', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/organizations' ? [] : new Response(null, { status: 404 }),
  )

  assert.deepEqual(await createAgentSignInPageDeps(client).view({ code: 'WXYZ-2345' }), {
    status: 'not-found',
  })
})

test('allows the sign-in for the chosen organization', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null))

  assert.equal(
    await createAgentSignInPageDeps(client).approve({ code: 'WXYZ-2345', organizationId: '7' }),
    'answered',
  )
  assert.equal(new URL(requests[0]!.url).pathname, '/api/agent-sign-in/WXYZ-2345/approve')
  assert.deepEqual(await requests[0]!.json(), { organizationId: 7 })
})

test('reports a sign-in that expired before the answer', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 404 }))

  assert.equal(await createAgentSignInPageDeps(client).deny({ code: 'WXYZ-2345' }), 'expired')
})
