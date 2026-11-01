import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSpaceSettingsPageDeps } from './SpaceSettingsPage.deps.impl'

const respond =
  (spaceKey = 'product') =>
  (_request: Request, path: string) => {
    if (path === '/api/spaces') {
      return [{ color: '#fff', key: spaceKey, name: 'Product' }]
    }
    if (path.endsWith('/about')) {
      return {
        canEdit: false,
        description: null,
        links: [{ description: 'Docs', id: 3, url: 'https://example.com/docs' }],
      }
    }
    return { canDelete: true, canUpdate: false }
  }

test('maps space settings data', async () => {
  const { client } = createTestApiClient(respond())

  assert.deepEqual(await createSpaceSettingsPageDeps(client).view({ spaceKey: 'product' }), {
    canDelete: true,
    canUpdate: false,
    color: '#fff',
    description: '',
    links: [{ description: 'Docs', id: '3', url: 'https://example.com/docs' }],
    name: 'Product',
  })
})

test('fails with 404 when the space is not in the list', async () => {
  const { client } = createTestApiClient(respond('other'))

  await expect(
    createSpaceSettingsPageDeps(client).view({ spaceKey: 'product' }),
  ).rejects.toMatchObject({ status: 404 })
})

test('saves the settings, description and links in one request', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null))

  await createSpaceSettingsPageDeps(client).save({
    color: '#000',
    description: 'About',
    links: [
      { description: 'Docs', id: '1', url: 'https://example.com/docs' },
      { description: 'New', url: 'https://example.com/new' },
    ],
    name: 'Product',
    newKey: 'PRD',
    oldKey: 'product',
  })

  assert.equal(requests.length, 1)
  assert.equal(
    `${requests[0]!.method} ${new URL(requests[0]!.url).pathname}`,
    'PUT /api/spaces/product',
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#000',
    description: 'About',
    links: [
      { description: 'Docs', url: 'https://example.com/docs' },
      { description: 'New', url: 'https://example.com/new' },
    ],
    name: 'Product',
    newKey: 'PRD',
    oldKey: 'product',
  })
})
