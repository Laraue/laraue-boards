import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSpaceSettingsPageDeps } from './SpaceSettingsPage.deps.impl'

const respond =
  (spaceKey = 'product') =>
  (_request: Request, path: string) => {
    if (path === '/api/spaces') {
      return [{ color: '#fff', isDefault: false, key: spaceKey, name: 'Product' }]
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

test('saves only what changed, links before the space whose key may change', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null))

  await createSpaceSettingsPageDeps(client).save({
    color: '#000',
    description: 'Same',
    links: [
      { description: 'Docs v2', id: '1', url: 'https://example.com/docs' },
      { description: 'Kept', id: '2', url: 'https://example.com/kept' },
      { description: 'New', url: 'https://example.com/new' },
    ],
    name: 'Product',
    newKey: 'PRD',
    oldKey: 'product',
    saved: {
      description: 'Same',
      links: [
        { description: 'Docs', id: '1', url: 'https://example.com/docs' },
        { description: 'Kept', id: '2', url: 'https://example.com/kept' },
        { description: 'Gone', id: '9', url: 'https://example.com/gone' },
      ],
    },
  })

  assert.deepEqual(
    requests.map((request) => `${request.method} ${new URL(request.url).pathname}`),
    [
      'DELETE /api/spaces/product/links/9',
      'PUT /api/spaces/product/links/1',
      'POST /api/spaces/product/links',
      'PUT /api/spaces/product',
    ],
  )
})
